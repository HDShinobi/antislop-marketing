import { test } from "node:test"
import assert from "node:assert/strict"
import { matchLists, hasDataToken, LIST_PRIORITY } from "../bin/lib/lexicon.mjs"

const PACK = {
  banlist: ["đóng vai trò quan trọng"],
  mt_artifacts: ["được thực hiện bởi"],
  superlative: ["hàng đầu", "số một"],
  puffery: ["vượt trội"],
  comparative: ["hơn", "gấp"],
  evaluative: ["tốt", "hiệu quả"],
  config_tokens: ["campaign", "pixel"],
  exceptions: { "hàng đầu": ["hàng đầu tiên"] },
}

test("matches are case insensitive", () => {
  const m = matchLists("Sản phẩm VƯỢT TRỘI.", PACK, 0)
  assert.equal(m.length, 1)
  assert.equal(m[0].list, "puffery")
})

test("diacritics are significant", () => {
  assert.equal(matchLists("San pham vuot troi.", PACK, 0).length, 0)
})

test("boundaries reject a term glued to another word", () => {
  assert.equal(matchLists("Thương hiệu hàng đầu.", PACK, 0).length, 1)
  assert.equal(matchLists("Sản phẩm vượttrội.", PACK, 0).length, 0)
})

test("exceptions suppress a match inside a longer listed phrase", () => {
  assert.equal(matchLists("Là hàng đầu tiên trong kho.", PACK, 0).length, 0)
})

test("exceptions suppress by position, not by presence", () => {
  const m = matchLists("Vừa hàng đầu tiên vừa hàng đầu thị trường.", PACK, 0)
  assert.equal(m.length, 1)
  assert.equal(m[0].span[0], 22)
})

test("collapsed whitespace still matches", () => {
  assert.equal(matchLists("Nó  vượt   trội.", PACK, 0).length, 1)
})

test("one position is reported once, by the highest priority list", () => {
  const pack = { ...PACK, evaluative: ["vượt trội", "tốt"] }
  const m = matchLists("Sản phẩm vượt trội.", pack, 0)
  assert.equal(m.length, 1)
  assert.equal(m[0].list, "puffery")
})

test("superlative outranks puffery in priority order", () => {
  assert.ok(LIST_PRIORITY.indexOf("superlative") < LIST_PRIORITY.indexOf("puffery"))
  const m = matchLists("Thương hiệu số một.", PACK, 0)
  assert.equal(m[0].list, "superlative")
})

test("span is absolute and slices back to the term", () => {
  const src = "AAAA Sản phẩm vượt trội."
  const m = matchLists(src.slice(5), PACK, 5)
  assert.equal(src.slice(...m[0].span), "vượt trội")
})

test("findings come back sorted by position", () => {
  const m = matchLists("Hiệu quả tốt, sản phẩm vượt trội.", PACK, 0)
  const starts = m.map((x) => x.span[0])
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b))
})

test("hasDataToken finds numbers, dates, urls and config tokens", () => {
  assert.equal(hasDataToken("CPA 47 đô", PACK), true)
  assert.equal(hasDataToken("đổi ngày 12/6", PACK), true)
  assert.equal(hasDataToken("xem example.com", PACK), true)
  assert.equal(hasDataToken("sửa campaign này", PACK), true)
  assert.equal(hasDataToken("đội ngũ tận tâm", PACK), false)
})

test("hasDataToken ignores digits inside a code span", () => {
  assert.equal(hasDataToken("Đội ngũ tận tâm, xem `run(3)`.", PACK), false)
})
