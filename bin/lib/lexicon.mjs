// Matches block text against the six vocabulary lists a language pack carries.
// Spec section 6.2.
//
// Boundary is a character boundary plus a per-pack exceptions map. The spec
// used to say "syllable boundary" and give "hàng đầu" must not match inside
// "hàng đầu tiên" as its example, but the position after "đầu" IS a syllable
// boundary, so that rule contradicted its own example and needed a tokenizer
// to satisfy. Do not reintroduce it.

export const LIST_PRIORITY = [
  "banlist",
  "mt_artifacts",
  "superlative",
  "puffery",
  "comparative",
  "evaluative",
]

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Case insensitive, diacritics significant, runs of whitespace collapsed.
function termRegex(term) {
  const pattern = escape(term.trim()).replace(/\s+/g, "\\s+")
  return new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, "giu")
}

// A hit is dropped when it sits wholly inside one of that term's exception
// phrases at the same position. Containment is positional, so the same term
// can be suppressed in one place and kept in another within one block.
function suppressedByException(blockText, term, start, end, exceptions) {
  for (const phrase of exceptions?.[term] ?? []) {
    for (const e of blockText.matchAll(termRegex(phrase))) {
      if (start >= e.index && end <= e.index + e[0].length) return true
    }
  }
  return false
}

/**
 * @param {string} blockText
 * @param {object} pack
 * @param {number} offset absolute start of the block, so spans come back absolute
 * @returns {Array<{list:string, term:string, span:[number,number], text:string}>}
 *   One position is reported once, by the first list in LIST_PRIORITY order.
 */
export function matchLists(blockText, pack, offset = 0) {
  const taken = []
  const out = []
  const overlaps = (a, b) => taken.some(([x, y]) => a < y && b > x)

  for (const list of LIST_PRIORITY) {
    for (const term of pack[list] ?? []) {
      for (const m of blockText.matchAll(termRegex(term))) {
        const start = m.index
        const end = start + m[0].length
        if (overlaps(start, end)) continue
        if (suppressedByException(blockText, term, start, end, pack.exceptions)) continue
        taken.push([start, end])
        out.push({ list, term, span: [start + offset, end + offset], text: m[0] })
      }
    }
  }
  return out.sort((a, b) => a.span[0] - b.span[0])
}

// Spec section 9: the number pattern is a digit appearing OUTSIDE a code span.
const stripCodeSpans = (t) => t.replace(/`[^`]*`/g, " ")

const NUMBER_RE = /\d/
const DATE_RE = /\d{1,4}[/-]\d{1,2}([/-]\d{1,4})?|tháng\s+\d/iu
const URL_RE = /https?:\/\/|[\w-]+\.(com|vn|net|org|io)\b/i

/**
 * Four exact patterns, not a description: digits, dates, urls, and the pack's
 * config_tokens. Units get no pattern of their own because a unit always
 * travels with a number, and an exhaustive unit list has no stopping point.
 *
 * This is an advisory signal attached to a finding, never a filter. Filtering
 * evaluative candidates on it would defeat the evidence rule: "Đội ngũ tận
 * tâm, CPA 31$" has a digit in the block and is exactly the case the rule
 * exists to catch.
 */
export function hasDataToken(blockText, pack) {
  const text = stripCodeSpans(blockText)
  if (NUMBER_RE.test(text)) return true
  if (DATE_RE.test(text)) return true
  if (URL_RE.test(text)) return true
  return (pack.config_tokens ?? []).some((t) => termRegex(t).test(text))
}
