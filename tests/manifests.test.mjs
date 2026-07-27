// Tier 1: the four manifests and the CI matrix must agree with each other.
//
// None of this breaks the scanner, which is why it drifted: package.json sat
// at 0.1.0 while all three plugin manifests said 1.0.0, and engines.node said
// 18 while CI tested 20 and 22. Both are the kind of thing nobody notices
// until a release or a bug report on an untested runtime.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const root = new URL("../", import.meta.url)
const read = (p) => readFileSync(new URL(p, root), "utf8")
const readJson = (p) => JSON.parse(read(p))

const pkg = readJson("package.json")

test("package.json is the source of truth for the version, and everything follows it", () => {
  const codex = readJson(".codex-plugin/plugin.json")
  const claude = readJson(".claude-plugin/plugin.json")
  const market = readJson(".claude-plugin/marketplace.json")

  assert.equal(codex.version, pkg.version, ".codex-plugin/plugin.json version")
  assert.equal(claude.version, pkg.version, ".claude-plugin/plugin.json version")
  assert.equal(market.metadata.version, pkg.version, "marketplace.json metadata.version")

  const entry = market.plugins.find((p) => p.name === pkg.name)
  assert.ok(entry, `marketplace.json lists no plugin named ${pkg.name}`)
  assert.equal(entry.version, pkg.version, "marketplace.json plugins[].version")
})

test("every manifest agrees on the plugin name", () => {
  assert.equal(readJson(".codex-plugin/plugin.json").name, pkg.name)
  assert.equal(readJson(".claude-plugin/plugin.json").name, pkg.name)
  assert.equal(readJson(".claude-plugin/marketplace.json").name, pkg.name)
})

test("the CI matrix floor is the version engines.node declares", () => {
  const floor = pkg.engines.node.match(/(\d+)/)?.[1]
  assert.ok(floor, `engines.node "${pkg.engines.node}" carries no version number`)

  const ci = read(".github/workflows/ci.yml")
  const line = ci.match(/^\s*node:\s*\[(.+)\]\s*$/m)
  assert.ok(line, "ci.yml has no node version matrix")

  const versions = line[1].split(",").map((v) => v.trim().replace(/["']/g, ""))
  assert.ok(
    versions.includes(floor),
    `engines.node declares >=${floor} but CI tests ${versions.join(", ")}. ` +
      "Either test the floor or stop declaring it.",
  )
})

test("both READMEs state the same Node floor as engines.node", () => {
  const floor = pkg.engines.node.match(/(\d+)/)[1]
  assert.match(read("README.md"), new RegExp(`Node ${floor} or later`))
  assert.match(read("README.vi.md"), new RegExp(`Node ${floor} trở lên`))
})
