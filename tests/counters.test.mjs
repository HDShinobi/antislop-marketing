import { test } from "node:test"
import assert from "node:assert/strict"
import { splitBlocks } from "../bin/lib/blocks.mjs"
import { countDashes, countColonsOutsideList, shortParagraphRatio } from "../bin/lib/counters.mjs"

test("counts em and en dashes, not hyphens", () => {
  const src = "Một \u2014 hai \u2013 ba - bốn.\n"
  const r = countDashes(splitBlocks(src))
  assert.equal(r.count, 2)
  assert.equal(src.slice(...r.findings[0].span), "\u2014")
  assert.equal(src.slice(...r.findings[1].span), "\u2013")
})

test("dashes inside a code fence are not counted", () => {
  const src = "Text.\n\n```\na \u2014 b\n```\n"
  assert.equal(countDashes(splitBlocks(src)).count, 0)
})

test("a colon introducing a list is not counted, even across a blank line", () => {
  const src = "Ba việc:\n\n- một\n- hai\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 0)
})

test("a colon introducing a numbered line is not counted", () => {
  const src = "Ba bước:\n\n1 chuẩn bị\n2 chạy\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 0)
})

test("a colon introducing a table is not counted", () => {
  const src = "Kết quả:\n\n| A | 1 |\n|---|---|\n| B | 2 |\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 0)
})

test("a mid sentence colon is counted", () => {
  const src = "Kết quả rõ: CPA giảm 26 phần trăm.\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 1)
})

test("a colon inside a url is not counted", () => {
  const src = "Xem https://a.com/b nhé.\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 0)
})

test("a colon inside a code span is not counted", () => {
  const src = "Chạy `a: b` rồi dừng.\n"
  assert.equal(countColonsOutsideList(src, splitBlocks(src)), 0)
})

test("short paragraph ratio counts only prose paragraphs", () => {
  const src = "Một câu.\n\nCâu một. Câu hai. Câu ba.\n\n- mục danh sách\n\n# Tiêu đề\n"
  assert.deepEqual(shortParagraphRatio(splitBlocks(src), []), [1, 2])
})

test("short paragraph ratio is a pair, and is [0,0] with no prose", () => {
  assert.deepEqual(shortParagraphRatio(splitBlocks("# Chỉ tiêu đề\n"), []), [0, 0])
})
