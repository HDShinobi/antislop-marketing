// The three counters that need no language pack. Spec section 9.
//
// shortParagraphRatio needs sentence counts, so this module depends on
// sentences.mjs. That is the one cross-module edge inside bin/lib/ and it is
// deliberate: the alternative is a second sentence splitter.

import { splitSentences } from "./sentences.mjs"

const DASH_RE = /[\u2014\u2013]/g   // em dash, en dash. Plain hyphen is fine.

/**
 * The tell is a dash used as sentence punctuation, attaching a qualifier
 * clause mid-sentence. Two other uses are ordinary typography and get skipped,
 * both learned from scanning a real roadmap where 28 of 28 dashes were
 * legitimate and the rule as written would have made the tool unusable.
 *
 *   tight, no space either side   T9–T10, 01–08/08, top 10–20, Cuối T10–đầu T11
 *                                 a range or a compound, never punctuation
 *
 *   first character of a cell     | — (chuẩn bị BM) |
 *                                 the spreadsheet convention for "nothing yet"
 *
 * A spaced dash anywhere else is counted, including a title separator. Prose
 * would use a colon there.
 */
export function countDashes(blocks) {
  const findings = []
  for (const b of blocks) {
    if (b.kind === "table" || b.text === "") continue

    for (const m of b.text.matchAll(DASH_RE)) {
      const i = m.index
      const before = b.text[i - 1]
      const after = b.text[i + 1]

      const tight = before !== undefined && after !== undefined &&
                    !/\s/.test(before) && !/\s/.test(after)
      if (tight) continue

      if (b.kind === "table_cell" && b.text.slice(0, i).trim() === "") continue

      findings.push({
        span: [b.span[0] + i, b.span[0] + i + 1],
        text: m[0],
        block: b.index,
      })
    }
  }
  return { count: findings.length, findings }
}

/**
 * Counts mid-sentence colons: the ones Claude reaches for to introduce almost
 * any follow-on idea. A colon that introduces a list or a table is exempt,
 * including across a blank line, and a colon inside a url or a code span does
 * not count.
 */
export function countColonsOutsideList(source, blocks) {
  const lines = source.split("\n")
  let count = 0

  for (const b of blocks) {
    if (b.kind === "table" || b.text === "") continue

    for (let i = 0; i < b.text.length; i++) {
      if (b.text[i] !== ":") continue

      const abs = b.span[0] + i
      if (/https?$/.test(source.slice(Math.max(0, abs - 8), abs))) continue

      // Inside an inline code span?
      if ((b.text.slice(0, i).match(/`/g) ?? []).length % 2 === 1) continue

      const lineIndex = source.slice(0, abs).split("\n").length - 1
      const colOnLine = abs - (source.lastIndexOf("\n", abs - 1) + 1)
      const rest = lines[lineIndex].slice(colOnLine + 1)

      if (rest.trim() === "") {
        // Look past blank lines: "Ba việc:\n\n- một" still introduces a list.
        let n = lineIndex + 1
        while (n < lines.length && lines[n].trim() === "") n++
        if (/^([-*+]|\||\d)/.test((lines[n] ?? "").trim())) continue
      }

      count++
    }
  }
  return count
}

/**
 * A pair [short, total] over prose paragraphs only. A pair of integers rather
 * than a ratio, because integers compare exactly in a fixture and floats do
 * not.
 */
export function shortParagraphRatio(blocks, abbreviations = []) {
  const paras = blocks.filter((b) => b.kind === "paragraph")
  let short = 0
  for (const p of paras) {
    if (splitSentences(p.text, abbreviations).length <= 2) short++
  }
  return [short, paras.length]
}
