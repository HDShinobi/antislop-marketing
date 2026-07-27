// Tier 3: the repo scans its own prose. A repo that bans em dashes and then
// ships a README full of them loses the argument on line one.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { scan, loadPacks } from "../bin/scan.mjs"

const root = new URL("../", import.meta.url)
const packs = loadPacks()
const manifest = JSON.parse(readFileSync(new URL("tests/scan-manifest.json", root), "utf8"))

test("every file in examples/ is listed in the manifest", () => {
  const listed = new Set(manifest.map((m) => m.file))
  for (const f of readdirSync(new URL("examples/", root))) {
    assert.ok(listed.has(`examples/${f}`), `examples/${f} is missing from scan-manifest.json`)
  }
})

test("every manifest entry points at a file that exists", () => {
  for (const e of manifest) {
    assert.ok(existsSync(new URL(e.file, root)), `${e.file} is in the manifest but does not exist`)
  }
})

for (const entry of manifest) {
  test(`self-scan: ${entry.file}`, () => {
    const src = readFileSync(new URL(entry.file, root), "utf8")
    const r = scan(src, { tier: entry.tier, lang: entry.lang, packs })
    assert.equal(r.counted.dash, 0, `${entry.file} contains em or en dashes`)
    assert.equal(r.counted.banlist, 0, `${entry.file} contains banlist phrases`)
    assert.equal(r.counted.superlative, 0, `${entry.file} contains unbacked superlatives`)
    assert.equal(r.counted.puffery, 0, `${entry.file} contains puffery`)
  })
}

// The rule files are not in the manifest because they are single-language by
// design, but they still must not violate the rules they describe.
for (const f of ["references/core.md", "references/evidence.md", "references/false-positives.md"]) {
  for (const lang of ["vi", "en"]) {
    test(`self-scan: ${f} against ${lang}`, () => {
      const src = readFileSync(new URL(f, root), "utf8")
      const r = scan(src, { tier: "P", lang, packs })
      assert.equal(r.counted.dash, 0, `${f} contains em or en dashes`)
      assert.equal(r.counted.banlist, 0, `${f} contains banlist phrases`)
      assert.equal(r.counted.superlative, 0, `${f} contains unbacked superlatives`)
      assert.equal(r.counted.puffery, 0, `${f} contains puffery`)
    })
  }
}
