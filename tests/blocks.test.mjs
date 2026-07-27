import { test } from "node:test"
import assert from "node:assert/strict"
import { splitBlocks } from "../bin/lib/blocks.mjs"

test("paragraphs split on blank lines", () => {
  const b = splitBlocks("First para.\nStill first.\n\nSecond para.\n")
  assert.equal(b.length, 2)
  assert.equal(b[0].kind, "paragraph")
  assert.equal(b[0].text, "First para.\nStill first.")
  assert.equal(b[1].text, "Second para.")
})

test("span slices back to the exact text", () => {
  const src = "Alpha para.\n\n- một mục\n\n# Tiêu đề\n\n| A | 1 |\n|---|---|\n| B | 2 |\n"
  for (const blk of splitBlocks(src)) {
    if (blk.kind === "table") continue
    assert.equal(src.slice(...blk.span), blk.text, `span mismatch on ${blk.kind}`)
  }
})

test("each list item is its own block, including nested", () => {
  const b = splitBlocks("- one\n- two\n  - nested\n")
  assert.equal(b.length, 3)
  assert.ok(b.every((x) => x.kind === "list_item"))
  assert.equal(b[2].text, "nested")
})

test("a heading is its own block and does not absorb the next paragraph", () => {
  const b = splitBlocks("# Title\n\nBody text.\n")
  assert.equal(b.length, 2)
  assert.equal(b[0].kind, "heading")
  assert.equal(b[0].text, "Title")
  assert.equal(b[1].kind, "paragraph")
})

test("a table produces one parent plus one block per non-empty cell", () => {
  const b = splitBlocks("| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n")
  const parent = b.find((x) => x.kind === "table")
  const cells = b.filter((x) => x.kind === "table_cell")
  assert.ok(parent)
  assert.equal(parent.text, "")
  assert.equal(cells.length, 6)
  assert.deepEqual(parent.children, cells.map((c) => c.index))
  assert.ok(cells.every((c) => c.parent === parent.index))
  assert.equal(cells[0].text, "A")
  assert.equal(cells[2].text, "1")
})

test("table cells carry their row index, header row is 0", () => {
  const b = splitBlocks("| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n")
  const cells = b.filter((x) => x.kind === "table_cell")
  assert.deepEqual(cells.map((c) => c.row), [0, 0, 1, 1, 2, 2])
})

test("code fences produce no blocks", () => {
  const b = splitBlocks("Before.\n\n```js\nconst x = 1\n```\n\nAfter.\n")
  assert.equal(b.length, 2)
  assert.equal(b[0].text, "Before.")
  assert.equal(b[1].text, "After.")
})

test("blank input yields no blocks", () => {
  assert.deepEqual(splitBlocks("\n\n   \n"), [])
})

test("offsets are UTF-16 code units, so diacritics and emoji stay aligned", () => {
  const src = "Chiến dịch 🚀 vượt kế hoạch.\n\nĐoạn hai.\n"
  for (const blk of splitBlocks(src)) {
    assert.equal(src.slice(...blk.span), blk.text)
  }
})
