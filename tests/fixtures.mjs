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

import { readFileSync, readdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { scan, loadPacks } from "../bin/scan.mjs"

const RUNNER = process.env.ANTISLOP_RUNNER ?? "claude"
const REPO = new URL("..", import.meta.url).pathname.replace(/\/$/, "")
const CANARY = /\[\s*[RPC]\s*·/
const PLUGIN = "antislop-marketing@antislop-marketing"

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts })

const INSTALL = {
  claude: [
    ["claude", ["plugin", "marketplace", "add", REPO]],
    ["claude", ["plugin", "install", PLUGIN]],
  ],
  codex: [
    ["codex", ["plugin", "marketplace", "add", REPO]],
    ["codex", ["plugin", "add", PLUGIN]],
  ],
}

const UNINSTALL = {
  claude: [
    ["claude", ["plugin", "uninstall", PLUGIN]],
    ["claude", ["plugin", "marketplace", "remove", "antislop-marketing"]],
  ],
  codex: [
    ["codex", ["plugin", "remove", PLUGIN]],
    ["codex", ["plugin", "marketplace", "remove", "antislop-marketing"]],
  ],
}

// codex exec hangs waiting on stdin without the redirect, and refuses to run
// outside a git repo without the flag.
function ask(prompt) {
  if (RUNNER === "codex") {
    return run("codex", ["exec", "--skip-git-repo-check", prompt], { stdio: ["ignore", "pipe", "pipe"] })
  }
  return run("claude", ["-p", prompt], { stdio: ["ignore", "pipe", "pipe"] })
}

function lastJsonBlock(out) {
  const blocks = [...out.matchAll(/```json\s*([\s\S]*?)```/g)]
  if (blocks.length === 0) throw new Error("no fenced json block in agent output")
  return JSON.parse(blocks[blocks.length - 1][1])
}

console.log(`runner: ${RUNNER}`)
console.log(`repo:   ${REPO}`)

console.log("install: putting this checkout into the local registry")
for (const [c, a] of INSTALL[RUNNER]) {
  try { run(c, a) } catch (e) { console.error(`install step failed: ${c} ${a.join(" ")}`); throw e }
}

// Uninstall on every exit path, including a thrown error or a failed fixture.
process.on("exit", () => {
  for (const [c, a] of UNINSTALL[RUNNER]) {
    try { run(c, a) } catch { /* best effort */ }
  }
})

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
  const fixture = new URL("./fixtures/mechanical/outside-cwd.md", import.meta.url).pathname
  const scanner = new URL("../bin/scan.mjs", import.meta.url).pathname
  const out = run("node", [scanner, "--tier", "R", "--lang", "vi", fixture], { cwd: "/tmp" })
  const parsed = JSON.parse(out)
  if (typeof parsed.counted?.dash !== "number" || parsed.counted.banlist === null) {
    console.error("OUTSIDE-CWD FAILED: the scanner could not resolve its packs from /tmp")
    process.exit(2)
  }
  console.log("outside-cwd: ok")
}

const packs = loadPacks()
let failed = 0
const dir = new URL("./fixtures/judged/", import.meta.url)

for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
  const path = new URL(name, dir).pathname
  const exp = JSON.parse(readFileSync(new URL(name.replace(/\.md$/, ".expect.json"), dir), "utf8"))
  const src = readFileSync(path, "utf8")

  const local = scan(src, { tier: exp.tier, lang: exp.lang, packs })
  const got = lastJsonBlock(ask(`Dùng antislop-check trên file ${path}. Xuất json.`))

  const problems = []

  for (const k of ["tier", "lang", "counted_source", "counted", "findings_mechanical", "findings_judged"]) {
    if (!(k in got)) problems.push(`json block is missing required key: ${k}`)
  }
  if (got.counted_source !== "scan") problems.push(`counted_source=${got.counted_source}, expected "scan"`)
  if (got.tier !== exp.tier) problems.push(`tier=${got.tier}, fixture declares ${exp.tier}`)

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

  if (problems.length) {
    failed++
    console.error(`FAIL ${name}`)
    for (const p of problems) console.error(`  ${p}`)
  } else {
    console.log(`PASS ${name}`)
  }
}

process.exit(failed ? 1 : 0)
