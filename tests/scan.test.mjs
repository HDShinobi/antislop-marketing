import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { scan, splitBlocks } from "../bin/scan.mjs"

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8")
const VI = JSON.parse(read("./fixtures/packs/vi-min.json"))
const EN = JSON.parse(read("./fixtures/packs/en-min.json"))
const packs = { vi: VI, en: EN }

const TEN_KEYS = [
  "banlist", "colon_outside_list", "comparative", "dash", "eval_candidate",
  "mt_artifacts", "puffery", "same_shape_run", "short_paragraph_ratio", "superlative",
]

test("counted has exactly the ten keys", () => {
  const r = scan("Một đoạn văn.\n", { tier: "P", lang: "vi", packs })
  assert.deepEqual(Object.keys(r.counted).sort(), TEN_KEYS)
})

test("every finding text equals source.slice(span)", () => {
  const src = "Đội ngũ tận tâm — CPA 31 đô.\n\nSản phẩm vượt trội.\n\nThương hiệu số một.\n"
  const r = scan(src, { tier: "R", lang: "vi", packs })
  assert.ok(r.findings.length > 0)
  for (const f of r.findings) assert.equal(src.slice(...f.span), f.text)
})

test("eval_candidate is not filtered by the presence of a data token", () => {
  const r = scan("Đội ngũ tận tâm, CPA tháng này 31 đô.\n", { tier: "R", lang: "vi", packs })
  const c = r.findings.filter((f) => f.rule === "VI-EVAL-CANDIDATE")
  assert.equal(c.length, 1)
  assert.equal(c[0].block_has_data, true)
})

test("superlative gets its own rule code, separate from puffery", () => {
  const r = scan("Thương hiệu số một, sản phẩm vượt trội.\n", { tier: "C", lang: "vi", packs })
  const codes = r.findings.map((f) => f.rule)
  assert.ok(codes.includes("VI-SUPERLATIVE"))
  assert.ok(codes.includes("VI-PUFFERY"))
  assert.equal(r.counted.superlative, 1)
  assert.equal(r.counted.puffery, 1)
})

test("an unregistered language nulls the lexical counters but keeps the mechanical ones", () => {
  const r = scan("Một — hai.\n", { tier: "P", lang: "th", packs })
  assert.equal(r.counted.dash, 1)
  assert.equal(r.counted.banlist, null)
  assert.equal(r.counted.superlative, null)
  assert.equal(r.counted.same_shape_run, null)
  assert.deepEqual(r.counted.short_paragraph_ratio, [1, 1])
})

test("same_shape_run is a max across blocks, never a sum", () => {
  const two =
    "Chúng tôi làm A, mang lại X. Chúng tôi làm B, mang lại Y.\n\n" +
    "Chúng tôi làm C, mang lại Z. Chúng tôi làm D, mang lại W.\n"
  const r = scan(two, { tier: "P", lang: "vi", packs })
  assert.equal(r.counted.same_shape_run, 2)
})

test("langMap selects a pack per block", () => {
  const r = scan("Sản phẩm vượt trội.\n\nAn amazing product.\n", {
    tier: "C", lang: "vi", langMap: [{ block: 1, lang: "en" }], packs,
  })
  assert.equal(r.blocks[1].lang, "en")
  assert.ok(r.findings.some((f) => f.rule === "VI-PUFFERY"))
  assert.ok(r.findings.some((f) => f.rule === "EN-PUFFERY"))
})

test("blocks report effective tier and source", () => {
  // Three columns so the body is [Search, 12400, 31]: 2 of 3 numeric clears the
  // strict-majority threshold. A two-column table would be exactly 1 of 2.
  const r = scan("| Kênh | Chi phí | CPA |\n|---|---|---|\n| Search | 12400 | 31 |\n",
                 { tier: "C", lang: "vi", packs })
  const parent = r.blocks.find((b) => b.kind === "table")
  assert.equal(parent.tier, "R")
  assert.equal(parent.tier_source, "data_table")
})

test("the table parent is not scanned, so nothing is double counted", () => {
  const r = scan("| A | B |\n|---|---|\n| vượt trội | tốt |\n", { tier: "C", lang: "vi", packs })
  assert.equal(r.counted.puffery, 1)
  assert.equal(r.counted.eval_candidate, 1)
})

test("findings come back sorted by position", () => {
  const src = "Sản phẩm vượt trội. Thương hiệu số một. Đội ngũ tận tâm.\n"
  const r = scan(src, { tier: "C", lang: "vi", packs })
  const starts = r.findings.map((f) => f.span[0])
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b))
})

test("splitBlocks is re-exported so there is one block splitter", () => {
  assert.equal(typeof splitBlocks, "function")
  assert.equal(splitBlocks("Một đoạn.\n").length, 1)
})

test("every mechanical fixture matches its expectation", () => {
  const dir = new URL("./fixtures/mechanical/", import.meta.url)
  const files = readdirSync(dir).filter((n) => n.endsWith(".md"))
  assert.ok(files.length > 0, "no mechanical fixtures found")
  for (const f of files) {
    const src = readFileSync(new URL(f, dir), "utf8")
    const exp = JSON.parse(readFileSync(new URL(f.replace(/\.md$/, ".expect.json"), dir), "utf8"))
    const r = scan(src, { tier: exp.tier, lang: exp.lang, packs })
    assert.deepEqual(r.counted, exp.counted, `counted mismatch in ${f}`)
    assert.deepEqual(
      [...new Set(r.findings.map((x) => x.rule))].sort(),
      [...exp.rules].sort(),
      `rules mismatch in ${f}`
    )
    // Spans are pinned too: an offset convention change must break a fixture,
    // not slip through. emoji-diacritics.md carries a surrogate pair for this.
    assert.deepEqual(
      r.findings.map((x) => ({ rule: x.rule, span: x.span, text: x.text })),
      exp.spans,
      `spans mismatch in ${f}`
    )
    for (const s of exp.spans) {
      assert.equal(src.slice(...s.span), s.text, `span does not slice back in ${f}`)
    }
  }
})
