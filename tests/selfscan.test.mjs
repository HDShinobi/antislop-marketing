// Tier 3: the repo scans its own prose. A repo that bans em dashes and then
// ships a README full of them loses the argument on line one.
//
// Two lists, because documents come in two kinds. A README is written in one
// language and gets that language's pack. A rule file, a skill and a language
// pack all have to survive every pack at once, because a Vietnamese pack
// describing an English tell must not trip the English rules or the reverse.
//
// The third list is the honest part. Some documents cannot pass, and saying so
// in the manifest beats leaving them silently unlisted: the coverage test at
// the bottom makes every markdown file in the repo choose one of the three.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { scan, loadPacks } from "../bin/scan.mjs"

const root = new URL("../", import.meta.url)
const packs = loadPacks()
const LANGS = Object.keys(packs).sort()
const manifest = JSON.parse(readFileSync(new URL("tests/scan-manifest.json", root), "utf8"))

// Counters with a documented threshold. `colon_outside_list` is deliberately
// absent: core.md gives it a reference density rather than a limit, and a test
// cannot assert a reference. `eval_candidate` is absent because it is a list of
// places for the model to look, not a verdict.
function assertClean(file, lang, tier) {
  const r = scan(readFileSync(new URL(file, root), "utf8"), { tier, lang, packs })
  const where = `${file} against ${lang}`

  assert.equal(r.counted.dash, 0, `${where}: em or en dashes`)
  assert.equal(r.counted.banlist, 0, `${where}: banlist phrases`)
  assert.equal(r.counted.mt_artifacts, 0, `${where}: machine translation artifacts`)
  assert.equal(r.counted.superlative, 0, `${where}: unbacked superlatives`)
  assert.equal(r.counted.puffery, 0, `${where}: puffery`)

  // CORE-CADENCE: three consecutive sentences sharing a shape is the tell, so
  // a run of three already fails.
  assert.ok(
    r.counted.same_shape_run < 3,
    `${where}: ${r.counted.same_shape_run} consecutive sentences share a shape, threshold is 3`,
  )
}

test("both language packs loaded, or the scans below prove nothing", () => {
  assert.deepEqual(LANGS, ["en", "vi"])
})

test("every file in examples/ is listed in the manifest", () => {
  const listed = new Set(manifest.single_language.map((m) => m.file))
  for (const f of readdirSync(new URL("examples/", root))) {
    assert.ok(listed.has(`examples/${f}`), `examples/${f} is missing from scan-manifest.json`)
  }
})

test("every manifest entry points at a file that exists", () => {
  for (const e of manifest.single_language) {
    assert.ok(existsSync(new URL(e.file, root)), `${e.file} is in the manifest but does not exist`)
  }
  for (const f of manifest.every_language) {
    assert.ok(existsSync(new URL(f, root)), `${f} is in the manifest but does not exist`)
  }
})

test("every exclusion carries a reason", () => {
  for (const e of manifest.not_scanned) {
    assert.ok(e.path, "an entry in not_scanned has no path")
    assert.ok(e.why?.length > 20, `not_scanned ${e.path} needs a real reason, not ${JSON.stringify(e.why)}`)
  }
})

for (const entry of manifest.single_language) {
  test(`self-scan: ${entry.file}`, () => {
    assertClean(entry.file, entry.lang, entry.tier)
  })
}

for (const file of manifest.every_language) {
  for (const lang of LANGS) {
    test(`self-scan: ${file} against ${lang}`, () => {
      assertClean(file, lang, "P")
    })
  }
}

// Both READMEs claim that a file breaking the rules it documents fails CI. That
// claim was false while the language packs, both skills and half the rule files
// sat outside the manifest. This test is what makes it true: a new markdown file
// is either scanned or explicitly excused, and there is no third option.
test("every markdown file in the repo is scanned or explicitly excused", () => {
  const SKIP_DIRS = new Set([".git", "node_modules", ".remember"])
  const found = []

  const walk = (dir) => {
    for (const e of readdirSync(new URL(dir, root), { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(`${dir}${e.name}/`)
      } else if (e.name.endsWith(".md")) {
        found.push(`${dir}${e.name}`)
      }
    }
  }
  walk("")

  const scanned = new Set([
    ...manifest.single_language.map((m) => m.file),
    ...manifest.every_language,
  ])
  const excused = (f) => manifest.not_scanned.some((e) => f === e.path || f.startsWith(e.path))

  assert.deepEqual(
    found.filter((f) => !scanned.has(f) && !excused(f)),
    [],
    "these markdown files are neither scanned nor listed in not_scanned. Add each " +
      "to single_language, to every_language, or to not_scanned with a reason.",
  )
})
