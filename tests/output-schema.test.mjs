// Tier 1: the published output contract, and the documentation of it.
//
// Three things have to stay in step, and before this test none of them did:
// the schema, the example in the skill, and what scan.mjs actually emits. The
// skill used to document `"verdict": "không chống lưng"` while the same file
// declared a three value enum that did not include it.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { scan, loadPacks } from "../bin/scan.mjs"
import {
  SCHEMA,
  VERDICTS,
  JUDGED_KEYS,
  assertSchemaIsSupported,
  validateCheckOutput,
} from "../bin/lib/output-schema.mjs"

const root = new URL("../", import.meta.url)
const read = (p) => readFileSync(new URL(p, root), "utf8")

const SKILL = "skills/antislop-check/SKILL.md"

function lastJsonBlock(markdown) {
  const blocks = [...markdown.matchAll(/```json\s*\n([\s\S]*?)```/g)]
  assert.ok(blocks.length > 0, "no fenced json block found")
  return blocks[blocks.length - 1][1]
}

// A valid document, kept minimal, so a failure points at the one field a test
// changed rather than at forty fields at once.
const MINIMAL = {
  tier: "R",
  lang: "vi",
  counted_source: "scan",
  counted: {
    dash: 0, banlist: 0, mt_artifacts: 0, superlative: 0, puffery: 0,
    comparative: 0, eval_candidate: 0, same_shape_run: 1,
    colon_outside_list: 0, short_paragraph_ratio: [1, 1],
  },
  findings_mechanical: [],
  findings_judged: [],
  judged: Object.fromEntries(JUDGED_KEYS.map((k) => [k, "đạt"])),
}

const withJudged = (extra) => ({ ...MINIMAL, findings_judged: [{
  rule: "EVID-UNBACKED", span: [0, 5], text: "tốt", lang: "vi", block: 0, ...extra,
}] })

test("the validator understands every keyword the schema uses", () => {
  assertSchemaIsSupported()
})

test("a minimal well formed output validates", () => {
  const r = validateCheckOutput(MINIMAL)
  assert.deepEqual(r.errors, [])
})

test("the verdict enum is exactly the three the skill documents", () => {
  assert.deepEqual(VERDICTS, ["đạt", "vi phạm", "chưa xác định"])
})

test("a verdict outside the enum is rejected", () => {
  // The exact bug this contract was written to close.
  const r = validateCheckOutput(withJudged({ verdict: "không chống lưng" }))
  assert.equal(r.ok, false)
  assert.ok(
    r.errors.some((e) => e.includes("verdict") && e.includes("không chống lưng")),
    `expected a verdict enum error, got: ${r.errors.join(" | ")}`,
  )
})

test("a reason is free text and does not have to be an enum value", () => {
  const r = validateCheckOutput(withJudged({ verdict: "vi phạm", reason: "không chống lưng" }))
  assert.deepEqual(r.errors, [])
})

test("a judged finding without a verdict is rejected", () => {
  const r = validateCheckOutput(withJudged({ reason: "no verdict here" }))
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes('missing required key "verdict"')), r.errors.join(" | "))
})

test("every one of the six judged keys is required", () => {
  for (const key of JUDGED_KEYS) {
    const judged = { ...MINIMAL.judged }
    delete judged[key]
    const r = validateCheckOutput({ ...MINIMAL, judged })
    assert.equal(r.ok, false, `dropping judged.${key} should fail`)
    assert.ok(r.errors.some((e) => e.includes(`missing required key "${key}"`)), r.errors.join(" | "))
  }
})

test("an unregistered language nulls the lexical counters and still validates", () => {
  const counted = { ...MINIMAL.counted }
  for (const k of ["banlist", "mt_artifacts", "superlative", "puffery", "comparative", "eval_candidate", "same_shape_run"]) {
    counted[k] = null
  }
  const r = validateCheckOutput({ ...MINIMAL, lang: "th", counted })
  assert.deepEqual(r.errors, [])
})

test("dash and colon_outside_list are always measured, so null is rejected", () => {
  for (const k of ["dash", "colon_outside_list"]) {
    const r = validateCheckOutput({ ...MINIMAL, counted: { ...MINIMAL.counted, [k]: null } })
    assert.equal(r.ok, false, `counted.${k} = null should fail`)
  }
})

test("a bilingual lang code is accepted and a sentence is not", () => {
  assert.equal(validateCheckOutput({ ...MINIMAL, lang: "vi+en" }).ok, true)
  assert.equal(validateCheckOutput({ ...MINIMAL, lang: "Vietnamese" }).ok, false)
})

test("an unknown top level key is rejected rather than ignored", () => {
  const r = validateCheckOutput({ ...MINIMAL, summary: "extra" })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes('unknown key "summary"')), r.errors.join(" | "))
})

test("the json example in the check skill parses and validates", () => {
  const example = JSON.parse(lastJsonBlock(read(SKILL)))
  const r = validateCheckOutput(example)
  assert.deepEqual(r.errors, [], `${SKILL} example does not match the schema`)
})

test("the json example in the check skill matches what scan.mjs really emits", () => {
  const example = JSON.parse(lastJsonBlock(read(SKILL)))
  const fixture = "tests/fixtures/judged/unbacked-vi.md"
  const real = scan(read(fixture), { tier: example.tier, lang: example.lang, packs: loadPacks() })

  assert.deepEqual(example.counted, real.counted, `${SKILL} documents counted values ${fixture} does not produce`)
  assert.deepEqual(example.findings_mechanical, real.findings, `${SKILL} documents findings ${fixture} does not produce`)
})

test("real scanner findings satisfy the finding shape the schema declares", () => {
  const real = scan(read("tests/fixtures/judged/unbacked-vi.md"), { tier: "R", lang: "vi", packs: loadPacks() })
  const r = validateCheckOutput({
    ...MINIMAL,
    counted: real.counted,
    findings_mechanical: real.findings,
  })
  assert.deepEqual(r.errors, [], "scan.mjs emits a finding the published schema rejects")
})

test("the skill names the schema file, so a reader can find the contract", () => {
  assert.match(read(SKILL), /schema\/check-output\.schema\.json/)
  assert.ok(SCHEMA.$id.endsWith("check-output.schema.json"))
})
