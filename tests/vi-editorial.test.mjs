// The Vietnamese editorial layer is judged, not counted. These tests cannot
// decide whether prose is natural, but they can stop either skill from quietly
// dropping the shared reference or losing the stable rule vocabulary.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { listFixtures } from "./fixture-list.mjs"

const root = new URL("../", import.meta.url)
const read = (p) => readFileSync(new URL(p, root), "utf8")

const CHECK = read("skills/antislop-check/SKILL.md")
const WRITE = read("skills/antislop-write/SKILL.md")
const EDITORIAL = read("references/vi-editorial.md")
const CORE = read("references/core.md")
const OUTPUT_SCHEMA = JSON.parse(read("schema/check-output.schema.json"))
const MANIFEST = JSON.parse(read("tests/scan-manifest.json"))

const RULES = [
  "VI-INFORMATION-ARCHITECTURE",
  "VI-HEADING-CLARITY",
  "VI-SENTENCE-COMPLETENESS",
  "VI-REFERENT-CLARITY",
  "VI-CODE-SWITCH",
  "VI-EDITORIAL-TONE",
]

test("both skills load the same Vietnamese editorial reference", () => {
  assert.match(CHECK, /references\/vi-editorial\.md/)
  assert.match(WRITE, /references\/vi-editorial\.md/)
})

test("both skill descriptions trigger on README and human-facing documentation", () => {
  for (const [name, skill] of [["check", CHECK], ["write", WRITE]]) {
    const frontmatter = skill.split("---")[1]
    assert.match(frontmatter, /README/i, `${name} skill description does not mention README`)
    assert.match(frontmatter, /product documentation/i, `${name} skill description does not mention product documentation`)
  }
})

// Defining a rule is not covering it. VI-INFORMATION-ARCHITECTURE shipped with
// a definition, a mention in both skills and a place in the clean fixture's
// must_not_flag, and no fixture anywhere required it. A model could ignore the
// longest rule in the reference and the whole suite stayed green.
test("every stable Vietnamese review code is required by some fixture", () => {
  const required = new Set(listFixtures().flatMap((f) => f.exp.must_flag))
  for (const rule of RULES) {
    assert.ok(
      required.has(rule),
      `${rule} is defined but no fixture lists it in must_flag, so nothing forces the model to ever emit it`,
    )
  }
})

test("the editorial reference defines every stable Vietnamese review code", () => {
  for (const rule of RULES) {
    assert.match(EDITORIAL, new RegExp(`### \\\`${rule}\\\``), `${rule} has no definition`)
  }
})

test("core keeps document profile separate from tier", () => {
  assert.match(CORE, /Document profile is separate from tier/)
  assert.match(CORE, /A README normally remains P/)
})

test("the editorial reference participates in repository self-scan", () => {
  assert.ok(
    MANIFEST.every_language.includes("references/vi-editorial.md"),
    "references/vi-editorial.md is not covered by self-scan",
  )
})

test("legacy judged keys are presented as broad editorial aggregates", () => {
  assert.match(CHECK, /câu chữ và giọng biên tập/)
  assert.match(CHECK, /cấu trúc và hướng tới người đọc/)
  assert.match(
    OUTPUT_SCHEMA.$defs.judgedSummary.properties.register_uniform.description,
    /sentence completeness, code-switching and editorial tone/,
  )
  assert.match(
    OUTPUT_SCHEMA.$defs.judgedSummary.properties.reader_addressed.description,
    /information architecture, heading clarity and referent clarity/,
  )
})
