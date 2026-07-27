#!/usr/bin/env node
// Tier 2: run antislop-check through a real agent and check the contract holds.
//
// Not wired into CI: it calls a model, costs money, and is not deterministic.
//   ANTISLOP_RUNNER=claude node tests/fixtures.mjs
//   ANTISLOP_RUNNER=codex  node tests/fixtures.mjs
//
// Spec section 9 requires three ordered steps: install, canary, uninstall.
// Codex copies the plugin into its cache at install time, so a source edit has
// no effect there until reinstall. That is why this reinstalls every run
// instead of trusting whatever is already installed.
//
// This runner touches the real plugin registry, because that is the only place
// a skill can actually be loaded from. Three rules keep it from damaging what
// the developer already has installed:
//
//   1. Probe first. Whatever was installed before this run is left installed.
//   2. Register the undo handler BEFORE the first install, so a crash halfway
//      through still cleans up the half that succeeded.
//   3. Refuse to run when a marketplace of the same name points somewhere else.
//      Replacing it is destructive and this runner cannot restore it faithfully.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import { scan, loadPacks } from "../bin/scan.mjs"
import { validateCheckOutput } from "../bin/lib/output-schema.mjs"
import { listFixtures } from "./fixture-list.mjs"

const RUNNER = process.env.ANTISLOP_RUNNER ?? "claude"
const FORCE = process.env.ANTISLOP_FIXTURE_FORCE === "1"

// fileURLToPath, not .pathname: a URL path is percent-encoded, so a checkout
// under a directory with a space in its name comes back with %20 in it and
// every exec below gets a path that does not exist.
const REPO = fileURLToPath(new URL("../", import.meta.url)).replace(/[/\\]$/, "")
const CANARY = /\[\s*[RPC]\s*·/
const MARKET = "antislop-marketing"
const PLUGIN = `antislop-marketing@${MARKET}`

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts })

// Each runner reports its state differently, so the shapes are normalised here
// and nothing below this object parses CLI output.
const CLI = {
  claude: {
    installed: () =>
      JSON.parse(run("claude", ["plugin", "list", "--json"])).map((p) => p.id),
    marketplaces: () =>
      JSON.parse(run("claude", ["plugin", "marketplace", "list", "--json"])).map((m) => ({
        name: m.name,
        local: m.source === "directory" ? m.path : null,
        origin: m.source === "github" ? `github ${m.repo}` : `${m.source} ${m.path ?? ""}`.trim(),
      })),
    addMarket: ["claude", ["plugin", "marketplace", "add", REPO]],
    syncMarket: ["claude", ["plugin", "marketplace", "update", MARKET]],
    rmMarket: ["claude", ["plugin", "marketplace", "remove", MARKET]],
    addPlugin: ["claude", ["plugin", "install", PLUGIN]],
    rmPlugin: ["claude", ["plugin", "uninstall", PLUGIN]],
    ask: (prompt) => run("claude", ["-p", prompt], { stdio: ["ignore", "pipe", "pipe"] }),
  },
  codex: {
    installed: () =>
      (JSON.parse(run("codex", ["plugin", "list", "--json"])).installed ?? [])
        .filter((p) => p.installed)
        .map((p) => p.pluginId),
    marketplaces: () =>
      (JSON.parse(run("codex", ["plugin", "marketplace", "list", "--json"])).marketplaces ?? []).map((m) => ({
        name: m.name,
        local: m.marketplaceSource?.sourceType === "local" ? m.marketplaceSource.source : null,
        origin: `${m.marketplaceSource?.sourceType ?? "unknown"} ${m.marketplaceSource?.source ?? m.root ?? ""}`.trim(),
      })),
    addMarket: ["codex", ["plugin", "marketplace", "add", REPO]],
    syncMarket: ["codex", ["plugin", "marketplace", "upgrade", MARKET]],
    rmMarket: ["codex", ["plugin", "marketplace", "remove", MARKET]],
    addPlugin: ["codex", ["plugin", "add", PLUGIN]],
    rmPlugin: ["codex", ["plugin", "remove", PLUGIN]],
    // codex exec hangs waiting on stdin without the redirect, and refuses to
    // run outside a git repo without the flag.
    ask: (prompt) =>
      run("codex", ["exec", "--skip-git-repo-check", prompt], { stdio: ["ignore", "pipe", "pipe"] }),
  },
}

const cli = CLI[RUNNER]
if (!cli) {
  console.error(`unknown ANTISLOP_RUNNER: ${RUNNER}. Use claude or codex.`)
  process.exit(2)
}

const ask = cli.ask
const samePath = (a, b) => a?.replace(/[/\\]$/, "") === b?.replace(/[/\\]$/, "")

console.log(`runner: ${RUNNER}`)
console.log(`repo:   ${REPO}`)

// ---------------------------------------------------------------- preflight

console.log("preflight: reading the registry before touching it")
const marketBefore = cli.marketplaces().find((m) => m.name === MARKET)
const pluginBefore = cli.installed().includes(PLUGIN)
const marketIsThisCheckout = marketBefore !== undefined && samePath(marketBefore.local, REPO)

if (marketBefore && !marketIsThisCheckout && !FORCE) {
  console.error(`ABORT: a marketplace named "${MARKET}" is already configured, from:`)
  console.error(`  ${marketBefore.origin}`)
  console.error("")
  console.error("Installing this checkout would replace it, and this runner cannot put the")
  console.error("original back afterwards. Remove it yourself first:")
  console.error(`  ${RUNNER} plugin marketplace remove ${MARKET}`)
  console.error("or accept the loss with ANTISLOP_FIXTURE_FORCE=1.")
  process.exit(2)
}

// ------------------------------------------------------------------- undo

// Filled as each step succeeds, drained in reverse on the way out. Registered
// before the first install on purpose: a crash between adding the marketplace
// and installing the plugin used to leave the marketplace behind.
const undo = []
let cleaned = false

function cleanup() {
  if (cleaned) return
  cleaned = true
  for (const [cmd, args] of undo.reverse()) {
    try { run(cmd, args) } catch { /* best effort, the run is already over */ }
  }
}
process.on("exit", cleanup)

// --------------------------------------------------------------- install

if (marketBefore && !marketIsThisCheckout) {
  console.error(`FORCE: replacing marketplace ${MARKET}, previously ${marketBefore.origin}`)
  console.error(`       restore it afterwards with: ${RUNNER} plugin marketplace add <source>`)
  run(...cli.rmMarket)
}

if (marketIsThisCheckout) {
  console.log(`install: marketplace ${MARKET} already points here, refreshing its snapshot`)
  try { run(...cli.syncMarket) } catch { /* older CLIs have no update verb */ }
} else {
  console.log("install: adding this checkout to the local registry")
  run(...cli.addMarket)
  undo.push(cli.rmMarket)
}

// Reinstalling a plugin that was already there ends in the same state it
// started in, so it records no undo. Reinstalling is still necessary: codex
// serves the plugin from a cache copy taken at install time.
if (pluginBefore) {
  console.log("install: plugin already installed, reinstalling to pick up source edits")
  try { run(...cli.rmPlugin) } catch { /* fall through, install will report */ }
  run(...cli.addPlugin)
} else {
  console.log("install: installing the plugin")
  run(...cli.addPlugin)
  undo.push(cli.rmPlugin)
}

// ---------------------------------------------------------------- canary

console.log("canary: checking the skill is actually loaded")
const canary = ask("Dùng antislop-write. Viết đúng một câu về CPA tháng này là 31 đô. In dòng khai báo tier.")
if (!CANARY.test(canary)) {
  console.error("CANARY FAILED. The skill is not loaded in this harness. Not running fixtures.")
  console.error(canary.slice(0, 600))
  process.exit(2)
}
console.log("canary: ok")

// Spec section 9: at least one scan must run with CWD outside the repo, or the
// path-resolution bug never surfaces.
console.log("outside-cwd: running the scanner from /tmp")
{
  const fixture = fileURLToPath(new URL("./fixtures/mechanical/outside-cwd.md", import.meta.url))
  const scanner = fileURLToPath(new URL("../bin/scan.mjs", import.meta.url))
  const out = run("node", [scanner, "--tier", "R", "--lang", "vi", fixture], { cwd: "/tmp" })
  const parsed = JSON.parse(out)
  if (typeof parsed.counted?.dash !== "number" || parsed.counted.banlist === null) {
    console.error("OUTSIDE-CWD FAILED: the scanner could not resolve its packs from /tmp")
    process.exit(2)
  }
  console.log("outside-cwd: ok")
}

// --------------------------------------------------------------- fixtures

const packs = loadPacks()
let failed = 0

for (const { name, path, exp } of listFixtures()) {
  const src = readFileSync(path, "utf8")

  const local = scan(src, { tier: exp.tier, lang: exp.lang, packs })
  const got = lastJsonBlock(ask(`Dùng antislop-check trên file ${path}. Xuất json.`))

  const problems = validate(got, exp, local)

  if (problems.length) {
    failed++
    console.error(`FAIL ${name}`)
    for (const p of problems) console.error(`  ${p}`)
  } else {
    console.log(`PASS ${name}`)
  }
}

cleanup()
process.exit(failed ? 1 : 0)

// ---------------------------------------------------------------- helpers

function lastJsonBlock(out) {
  const blocks = [...out.matchAll(/```json\s*([\s\S]*?)```/g)]
  if (blocks.length === 0) throw new Error("no fenced json block in agent output")
  return JSON.parse(blocks[blocks.length - 1][1])
}

function validate(got, exp, local) {
  // Shape first, against the published schema. Everything after this line is
  // about THIS fixture; the schema covers what every output must satisfy.
  const problems = validateCheckOutput(got).errors.slice()

  if (got.counted_source !== "scan") problems.push(`counted_source=${got.counted_source}, expected "scan"`)
  if (got.tier !== exp.tier) problems.push(`tier=${got.tier}, fixture declares ${exp.tier}`)
  if (exp.lang_declared && got.lang !== exp.lang_declared) {
    problems.push(`lang=${got.lang}, fixture declares ${exp.lang_declared}`)
  }

  for (const k of Object.keys(local.counted)) {
    if (JSON.stringify(got.counted?.[k]) !== JSON.stringify(local.counted[k])) {
      problems.push(`counted.${k}: agent ${JSON.stringify(got.counted?.[k])} vs scan ${JSON.stringify(local.counted[k])}`)
    }
  }

  // findings_mechanical is a verbatim copy, so compare the whole array.
  // A set comparison would miss a dropped duplicate or an edited span.
  if (JSON.stringify(got.findings_mechanical) !== JSON.stringify(local.findings)) {
    problems.push("findings_mechanical is not a verbatim copy of the scanner output")
  }

  // findings_judged is model output, so only set membership is stable.
  const judged = new Set((got.findings_judged ?? []).map((f) => f.rule))
  for (const r of exp.must_flag) if (!judged.has(r)) problems.push(`must_flag missing: ${r}`)
  for (const r of exp.must_not_flag) if (judged.has(r)) problems.push(`must_not_flag present: ${r}`)

  // Rule codes alone cannot express "flag the claim about reality but not the
  // statement of intent in the same document", which is the whole tier P
  // distinction. This matches on the reported span text instead.
  for (const phrase of exp.must_not_flag_text ?? []) {
    const hit = (got.findings_judged ?? []).find((f) => (f.text ?? "").includes(phrase))
    if (hit) problems.push(`must_not_flag_text "${phrase}" was flagged as ${hit.rule}`)
  }

  // Per-fixture expectations on the summary block, for the cases where the
  // right answer is a specific verdict rather than merely a legal one.
  for (const [key, want] of Object.entries(exp.judged ?? {})) {
    if (got.judged?.[key] !== want) {
      problems.push(`judged.${key}=${JSON.stringify(got.judged?.[key])}, fixture expects ${JSON.stringify(want)}`)
    }
  }

  return problems
}
