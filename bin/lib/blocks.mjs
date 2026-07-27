// Splits Markdown into the block model the whole system shares. Spec 3.0.
//
// A block is a paragraph, a list item, a heading, a table, or a table cell.
// Tables have two levels: one parent that carries `children` and no scannable
// text, plus one child per cell. The parent exists so the data-table criterion
// can look at the whole table; the cells exist because a fact in one cell does
// not back an adjective in another.
//
// Code fences produce no blocks at all: reports carry config dumps and logs,
// and scanning those is pure noise.

const FENCE_RE = /^(```|~~~)/
const HEADING_RE = /^#{1,6}\s+/
const LIST_RE = /^\s*([-*+]|\d+\.)\s+/
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/
const TABLE_SEP_RE = /^\s*\|[\s:|-]+\|\s*$/

function lineSpans(text) {
  const out = []
  let at = 0
  for (const line of text.split("\n")) {
    out.push({ text: line, start: at, end: at + line.length })
    at += line.length + 1
  }
  return out
}

/**
 * @param {string} text
 * @returns {Array<{index:number, kind:string, span:[number,number], text:string,
 *                  parent?:number, children?:number[], row?:number}>}
 *   Offsets are UTF-16 code units into `text`, half open. For every block that
 *   is not a table parent, `text === source.slice(...span)`.
 */
export function splitBlocks(text) {
  const lines = lineSpans(text)
  const blocks = []
  let i = 0
  let inFence = false

  const push = (b) => {
    b.index = blocks.length
    blocks.push(b)
    return b.index
  }

  while (i < lines.length) {
    const line = lines[i]

    if (FENCE_RE.test(line.text.trim())) { inFence = !inFence; i++; continue }
    if (inFence) { i++; continue }
    if (line.text.trim() === "") { i++; continue }

    if (HEADING_RE.test(line.text)) {
      const body = line.text.replace(HEADING_RE, "")
      const offset = line.text.length - body.length
      push({ kind: "heading", span: [line.start + offset, line.end], text: body })
      i++
      continue
    }

    if (LIST_RE.test(line.text)) {
      const body = line.text.replace(LIST_RE, "")
      const offset = line.text.length - body.length
      push({ kind: "list_item", span: [line.start + offset, line.end], text: body })
      i++
      continue
    }

    if (TABLE_ROW_RE.test(line.text)) {
      const rows = []
      while (i < lines.length && TABLE_ROW_RE.test(lines[i].text)) { rows.push(lines[i]); i++ }

      const parentIndex = push({
        kind: "table",
        span: [rows[0].start, rows[rows.length - 1].end],
        text: "",
        children: [],
      })

      const children = []
      let rowNo = 0
      for (const row of rows) {
        if (TABLE_SEP_RE.test(row.text)) continue
        let cursor = row.start
        const parts = row.text.split("|")
        for (let p = 0; p < parts.length; p++) {
          const part = parts[p]
          // parts[0] and the last part are the text outside the outer pipes.
          if (p > 0 && p < parts.length - 1) {
            const lead = part.length - part.trimStart().length
            const body = part.trim()
            if (body !== "") {
              children.push(push({
                kind: "table_cell",
                span: [cursor + lead, cursor + lead + body.length],
                text: body,
                parent: parentIndex,
                row: rowNo,   // 0 is the header row
              }))
            }
          }
          cursor += part.length + 1
        }
        rowNo++
      }
      blocks[parentIndex].children = children
      continue
    }

    const start = i
    while (
      i < lines.length &&
      lines[i].text.trim() !== "" &&
      !HEADING_RE.test(lines[i].text) &&
      !LIST_RE.test(lines[i].text) &&
      !TABLE_ROW_RE.test(lines[i].text) &&
      !FENCE_RE.test(lines[i].text.trim())
    ) i++

    const from = lines[start].start
    const to = lines[i - 1].end
    push({ kind: "paragraph", span: [from, to], text: text.slice(from, to) })
  }

  return blocks
}
