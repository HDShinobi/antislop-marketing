// Tier 1: check the tier 2 fixture set without calling a model.
//
// The judged fixtures are the only thing standing between this repo and a
// skill that quietly stops working, and they cost money to run. A typo in an
// expect file used to surface halfway through a paid run, or not at all: an
// expectation naming a rule code that nothing can ever emit passes forever.
//
// This also pins the coverage. Two Vietnamese tier R fixtures were the whole
// suite at one point, which left tier C, tier P, English, unregistered
// languages and provenance completely untested.

import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { scan, loadPacks } from "../bin/scan.mjs"
import { listFixtures } from "./fixture-list.mjs"
import { TIERS, VERDICTS, JUDGED_KEYS } from "../bin/lib/output-schema.mjs"

const fixtures = listFixtures()
const packs = loadPacks()
const REGISTERED = Object.keys(packs)

// Codes a judged finding may carry. Anything else in a must_flag is a typo:
// the model has no way to produce it, so the expectation can never be met.
const CORE_JUDGED = [
  "CORE-READER-VOCAB", "CORE-RULE-RESTATE", "CORE-NOUN-STACK",
  "CORE-ARGUMENT-ARC", "CORE-CADENCE", "CORE-RULE-OF-THREE", "CORE-NEG-PARALLEL",
  "CORE-FALSE-RANGE", "CORE-TACKON", "CORE-FORMULAIC-END", "CORE-PARA-RHYTHM",
  "CORE-FRAGMENTED-PARA", "CORE-BOLD-LIST", "CORE-COLON-DENSITY", "CORE-SENT-TYPE",
  "CORE-PARA-PREDICT", "CORE-SYNTAX-DEPTH", "CORE-FUNCTION-WORDS",
  "CORE-LEXICAL-DIVERSITY", "CORE-BIMODAL",
]
const EVID_JUDGED = ["EVID-UNBACKED", "EVID-PROVENANCE-UNKNOWN"]
const UNLISTED_SUFFIX = ["PUFFERY-UNLISTED", "COMPARATIVE-UNLISTED", "SUPERLATIVE-UNLISTED"]
const VI_ONLY = [
  "VI-NOMINALIZATION",
  "VI-ADDRESS-CONSISTENCY",
  "VI-INFORMATION-ARCHITECTURE",
  "VI-HEADING-CLARITY",
  "VI-SENTENCE-COMPLETENESS",
  "VI-REFERENT-CLARITY",
  "VI-CODE-SWITCH",
  "VI-EDITORIAL-TONE",
]

function isJudgeableCode(code) {
  if (CORE_JUDGED.includes(code) || EVID_JUDGED.includes(code) || VI_ONLY.includes(code)) return true
  const m = code.match(/^([A-Z]{2,3})-(.+)$/)
  return m !== null && REGISTERED.includes(m[1].toLowerCase()) && UNLISTED_SUFFIX.includes(m[2])
}

test("there is at least one fixture", () => {
  assert.ok(fixtures.length > 0, "no judged fixtures found")
})

for (const f of fixtures) {
  test(`fixture ${f.name}: the expect file is well formed`, () => {
    const { exp } = f

    assert.ok(existsSync(f.path), `${f.name} has no markdown file`)
    assert.ok(TIERS.includes(exp.tier), `tier ${JSON.stringify(exp.tier)} is not one of ${TIERS.join(", ")}`)
    assert.match(exp.lang, /^[a-z]{2,3}$/, `lang ${JSON.stringify(exp.lang)} is not a language code`)
    assert.ok(Array.isArray(exp.must_flag), "must_flag must be an array")
    assert.ok(Array.isArray(exp.must_not_flag), "must_not_flag must be an array")

    // A fixture that explains itself survives the next person to read it.
    assert.ok(exp.note?.length > 40, `${f.name} needs a note saying what it is testing`)

    for (const code of [...exp.must_flag, ...exp.must_not_flag]) {
      assert.ok(isJudgeableCode(code), `${code} is not a code any judged finding can carry`)
    }
    for (const [key, want] of Object.entries(exp.judged ?? {})) {
      assert.ok(JUDGED_KEYS.includes(key), `judged.${key} is not one of ${JUDGED_KEYS.join(", ")}`)
      assert.ok(VERDICTS.includes(want), `judged.${key} expects ${JSON.stringify(want)}, not a verdict`)
    }
    for (const phrase of exp.must_not_flag_text ?? []) {
      assert.ok(
        readFileSync(f.path, "utf8").includes(phrase),
        `must_not_flag_text ${JSON.stringify(phrase)} does not appear in ${f.name}`,
      )
    }
  })

  test(`fixture ${f.name}: the scanner runs on it and the null contract holds`, () => {
    const r = scan(readFileSync(f.path, "utf8"), { tier: f.exp.tier, lang: f.exp.lang, packs })
    const lexical = ["banlist", "mt_artifacts", "superlative", "puffery", "comparative", "eval_candidate", "same_shape_run"]

    if (REGISTERED.includes(f.exp.lang)) {
      for (const k of lexical) assert.equal(typeof r.counted[k], "number", `counted.${k} should be measured for ${f.exp.lang}`)
    } else {
      for (const k of lexical) assert.equal(r.counted[k], null, `counted.${k} should be null for unregistered ${f.exp.lang}`)
    }

    // These two need no pack, so an unregistered language does not excuse them.
    assert.equal(typeof r.counted.dash, "number")
    assert.equal(typeof r.counted.colon_outside_list, "number")
  })
}

test("the fixture set covers every tier", () => {
  const seen = new Set(fixtures.map((f) => f.exp.tier))
  for (const t of TIERS) assert.ok(seen.has(t), `no judged fixture at tier ${t}`)
})

test("the fixture set covers every registered language, plus an unregistered one", () => {
  const seen = new Set(fixtures.map((f) => f.exp.lang))
  for (const l of REGISTERED) assert.ok(seen.has(l), `no judged fixture in ${l}`)
  assert.ok(
    [...seen].some((l) => !REGISTERED.includes(l)),
    "no judged fixture in an unregistered language, so the null contract is never exercised",
  )
})

test("the unregistered-language fixture preserves the JSON output condition", () => {
  const fixture = fixtures.find((f) => !REGISTERED.includes(f.exp.lang))
  assert.match(fixture.exp.note, /JSON block still appears because the request asked for it/)
})

test("the fixture set covers both sides of provenance", () => {
  const wants = fixtures.map((f) => f.exp.judged?.provenance).filter(Boolean)
  assert.ok(wants.includes("đạt"), "no fixture with an approved claim file")
  assert.ok(wants.includes("chưa xác định"), "no fixture missing an approved claim file")
})

test("the approved claim fixture really has a claims file beside it, quoting the document", () => {
  const f = fixtures.find((x) => x.exp.judged?.provenance === "đạt")
  const claims = f.path.replace(/[^/]+$/, ".antislop-claims.txt")
  assert.ok(existsSync(claims), `${f.name} expects provenance đạt but has no .antislop-claims.txt beside it`)

  const doc = readFileSync(f.path, "utf8")
  const lines = readFileSync(claims, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#"))
  assert.ok(lines.length > 0, "the claims file has no claims in it")
  for (const line of lines) {
    assert.ok(doc.includes(line.trim()), `claims file line is not in the document verbatim: ${line}`)
  }
})

test("a fixture that expects a judged finding is not one the scanner already reports", () => {
  // The point of a judged fixture is the model's own reading. If the scanner
  // already emits the same span, the fixture proves nothing about judgement.
  const f = fixtures.find((x) => x.name === "caption-unlisted-vi.md")
  assert.ok(f, "the unlisted superlative fixture is missing")

  const r = scan(readFileSync(f.path, "utf8"), { tier: f.exp.tier, lang: f.exp.lang, packs })
  assert.equal(r.counted.superlative, 0, "the pack now lists this term, so the fixture no longer tests the floor")
  assert.deepEqual(r.findings, [], "the scanner reports something here, so this is not a pure judgement test")
})
