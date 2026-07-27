import { test } from "node:test"
import assert from "node:assert/strict"
import { splitBlocks } from "../bin/lib/blocks.mjs"
import { isDataTable, resolveTiers, bodyCells } from "../bin/lib/tiers.mjs"

const DATA = "| Kênh | Chi phí | CPA |\n|---|---|---|\n| Search | 12400 | 31 |\n| Meta | 8100 | 47 |\n"
const PROSE = "| Tính năng | Mô tả |\n|---|---|\n| Lọc RO | Loại bỏ kim loại nặng |\n| Bảo hành | Tận nơi trong 24h |\n"

const tableOf = (src) => {
  const b = splitBlocks(src)
  return [b, b.find((x) => x.kind === "table")]
}

test("body cells exclude the header row", () => {
  const [b, t] = tableOf(DATA)
  assert.deepEqual(bodyCells(t, b).map((c) => c.text), ["Search", "12400", "31", "Meta", "8100", "47"])
})

test("a numeric table is a data table at 4 of 6", () => {
  const [b, t] = tableOf(DATA)
  assert.equal(isDataTable(t, b), true)
})

test("a prose table is not a data table at 1 of 4", () => {
  const [b, t] = tableOf(PROSE)
  assert.equal(isDataTable(t, b), false)
})

test("exactly half does not qualify, strict majority is required", () => {
  const [b, t] = tableOf("| Kênh | CPA |\n|---|---|\n| Search | 31 |\n")
  assert.equal(bodyCells(t, b).length, 2)
  assert.equal(isDataTable(t, b), false)
})

test("column count comes from the row index, not offsets", () => {
  const [b2, t2] = tableOf("| A | B |\n|---|---|\n| 1 | 2 |\n")
  const [b4, t4] = tableOf("| A | B | C | D |\n|---|---|---|---|\n| 1 | 2 | 3 | 4 |\n")
  assert.equal(isDataTable(t2, b2), true)
  assert.equal(isDataTable(t4, b4), true)
})

test("a data table forces tier R inside a P document, cells included", () => {
  const [b, t] = tableOf(DATA)
  const tiers = resolveTiers(b, { tier: "P" })
  assert.equal(tiers.get(t.index).tier, "R")
  assert.equal(tiers.get(t.index).tier_source, "data_table")
  for (const c of t.children) assert.equal(tiers.get(c).tier, "R")
})

test("tierMap can raise a paragraph from C to R", () => {
  const tiers = resolveTiers(splitBlocks("Một đoạn văn.\n"), {
    tier: "C",
    tierMap: [{ block: 0, tier: "R" }],
  })
  assert.equal(tiers.get(0).tier, "R")
  assert.equal(tiers.get(0).tier_source, "tier_map")
})

test("tierMap cannot lower a data table below R", () => {
  const [b, t] = tableOf(DATA)
  const tiers = resolveTiers(b, { tier: "P", tierMap: [{ block: t.index, tier: "C" }] })
  assert.equal(tiers.get(t.index).tier, "R")
  assert.equal(tiers.get(t.index).tier_source, "data_table")
})

test("tierMap cannot lower the document tier either", () => {
  const tiers = resolveTiers(splitBlocks("Một đoạn văn.\n"), {
    tier: "R",
    tierMap: [{ block: 0, tier: "C" }],
  })
  assert.equal(tiers.get(0).tier, "R")
  assert.equal(tiers.get(0).tier_source, "document")
})

test("a plain paragraph inherits the document tier", () => {
  const tiers = resolveTiers(splitBlocks("Một đoạn văn.\n"), { tier: "P" })
  assert.equal(tiers.get(0).tier, "P")
  assert.equal(tiers.get(0).tier_source, "document")
})
