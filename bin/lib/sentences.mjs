// Sentence splitting and the three-part shape signature. Spec section 9.
//
// Hand-rolled, no dependency: the result must not shift when a library version
// does, because fixtures assert exact counts.

const TERMINATORS = new Set([".", "!", "?", "…"])

// Regions where a period never ends a sentence.
function maskedRegions(text) {
  const spans = []
  for (const re of [/`[^`]*`/g, /\]\([^)]*\)/g, /https?:\/\/\S+/g]) {
    for (const m of text.matchAll(re)) spans.push([m.index, m.index + m[0].length])
  }
  return spans
}

const inSpans = (i, spans) => spans.some(([a, b]) => i >= a && i < b)

/**
 * End of block is always a boundary, checked before anything else, because
 * headings, list items and table cells rarely end in punctuation.
 *
 * Inside a block a terminator ends a sentence when it is followed by
 * whitespace, the next token opens with a letter, digit or bracket, and the
 * position is not excluded. No uppercase requirement: Vietnamese does not
 * demand a capital after a full stop in casual registers, and demanding one
 * drops real boundaries.
 */
export function splitSentences(blockText, abbreviations = []) {
  const text = blockText.trim()
  if (text === "") return []

  const masked = maskedRegions(text)
  const out = []
  let start = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (!TERMINATORS.has(ch)) continue
    if (inSpans(i, masked)) continue

    const next = text[i + 1]
    if (next === undefined) break          // terminator at end of block
    if (!/\s/.test(next)) continue          // TP.HCM, example.com

    // 3.4 and 1.250.000: a period between two digits is not a boundary.
    if (ch === "." && /\d/.test(text[i - 1] ?? "") && /\d/.test(text[i + 2] ?? "")) continue

    const after = text.slice(i + 1).replace(/^\s+/, "")
    if (after === "") break
    if (!/^[\p{L}\p{N}([{"'“‘]/u.test(after)) continue

    const head = text.slice(start, i + 1)
    if (abbreviations.some((a) => head.endsWith(a))) continue

    out.push(head.trim())
    start = i + 1
  }

  const tail = text.slice(start).trim()
  if (tail !== "") out.push(tail)
  return out
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim()

function startsWithToken(sentence, list) {
  const s = norm(sentence)
  return (list ?? []).some((t) => {
    const n = norm(t)
    return s === n || s.startsWith(n + " ") || s.startsWith(n + ",")
  })
}

// Commas at bracket depth zero, ignoring the thousands separator.
export function topLevelCommas(sentence) {
  let depth = 0
  let count = 0
  for (let i = 0; i < sentence.length; i++) {
    const c = sentence[i]
    if (c === "(" || c === "[") depth++
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1)
    else if (c === "," && depth === 0) {
      if (/\d/.test(sentence[i - 1] ?? "") && /\d/.test(sentence[i + 1] ?? "")) continue
      count++
    }
  }
  return count
}

/**
 * Five opener classes. Only closed classes are detectable: Vietnamese has no
 * inflection and does not capitalise common nouns, so telling a noun from a
 * verb at the first token needs a POS tagger, and adding one to satisfy a
 * heuristic counter is the wrong trade.
 */
export function signature(sentence, pack) {
  const o = pack.openers ?? {}
  let opener = "khac"
  if (/^\s*\d/.test(sentence)) opener = "so"
  else if (startsWithToken(sentence, o.dai_tu)) opener = "dai_tu"
  else if (startsWithToken(sentence, o.lien_tu)) opener = "lien_tu"
  else if (startsWithToken(sentence, o.trang_ngu)) opener = "trang_ngu"

  const clauses = topLevelCommas(sentence) + 1

  const parts = sentence.split(",")
  const last = parts[parts.length - 1] ?? ""
  const tackon = clauses > 1 && startsWithToken(last, pack.tackon)

  return { opener, clauses, tackon }
}

// Two `khac` openers are never the same shape. `khac` is the catch-all, so two
// sentences there may open with completely unrelated words; without this guard
// three ordinary declaratives would be flagged as a run.
const sameShape = (a, b) =>
  a.opener !== "khac" && a.opener === b.opener && a.clauses === b.clauses && a.tackon === b.tackon

export function sameShapeRun(sentences, pack) {
  if (sentences.length === 0) return 0
  const sigs = sentences.map((s) => signature(s, pack))
  let best = 1
  let run = 1
  for (let i = 1; i < sigs.length; i++) {
    run = sameShape(sigs[i - 1], sigs[i]) ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}
