// Effective tier per block. Spec sections 3.1 and 3.2.
//
// Three sources feed a block's tier: the document tier, an explicit tierMap
// entry, and automatic detection of a data table. R for data regions is a
// FLOOR: tierMap may raise a block, never lower it below the floor. Spec 3.2
// says the rule "must not be overridable", and a proposal carrying last
// month's results table is exactly why.

const RANK = { C: 0, P: 1, R: 2 }

// blocks.mjs stamps `row` on every table cell, so there is no offset
// arithmetic here. Row 0 is the header and never counts toward the criterion.
export function bodyCells(parent, blocks) {
  return (parent.children ?? [])
    .map((i) => blocks[i])
    .filter((c) => c && c.row > 0 && c.text.trim() !== "")
}

/**
 * More than half the non-empty body cells carry a digit. Strict majority:
 * exactly half does not qualify. A feature comparison table in a landing page
 * draft is prose, and lifting it to R would ban legitimate marketing language.
 */
export function isDataTable(parent, blocks) {
  if (!parent || parent.kind !== "table") return false
  const body = bodyCells(parent, blocks)
  if (body.length === 0) return false
  const numeric = body.filter((c) => /\d/.test(c.text)).length
  return numeric * 2 > body.length
}

/**
 * @returns {Map<number, {tier: "R"|"P"|"C", tier_source: "document"|"data_table"|"tier_map"}>}
 */
export function resolveTiers(blocks, { tier, tierMap = [] }) {
  const forced = new Map(tierMap.map((e) => [e.block, e.tier]))
  const result = new Map()

  // A data table lifts itself and every one of its cells.
  const dataTableBlocks = new Set()
  for (const b of blocks) {
    if (b.kind === "table" && isDataTable(b, blocks)) {
      dataTableBlocks.add(b.index)
      for (const c of b.children ?? []) dataTableBlocks.add(c)
    }
  }

  for (const b of blocks) {
    let effective = tier
    let origin = "document"

    if (forced.has(b.index) && RANK[forced.get(b.index)] > RANK[effective]) {
      effective = forced.get(b.index)
      origin = "tier_map"
    }

    if (dataTableBlocks.has(b.index)) {
      if (RANK[effective] < RANK.R) { effective = "R"; origin = "data_table" }
      else if (origin === "document") origin = "data_table"
    }

    result.set(b.index, { tier: effective, tier_source: origin })
  }

  return result
}
