#!/usr/bin/env node
// The deterministic half of the system. Everything countable lives here;
// everything requiring judgement belongs to antislop-check.
//
//   import { splitBlocks, scan, loadPacks } from "<plugin>/bin/scan.mjs"
//   node bin/scan.mjs --tier R --lang vi file.md
//   node bin/scan.mjs --tier P --lang-map map.json file.md

import { readFileSync } from "node:fs"
import { splitBlocks } from "./lib/blocks.mjs"
import { splitSentences, sameShapeRun } from "./lib/sentences.mjs"
import { matchLists, hasDataToken, LIST_PRIORITY } from "./lib/lexicon.mjs"
import { countDashes, countColonsOutsideList, shortParagraphRatio } from "./lib/counters.mjs"
import { resolveTiers } from "./lib/tiers.mjs"
import { parsePack } from "./lib/pack.mjs"

export { splitBlocks }

const RULE_OF_LIST = {
  banlist: "BANLIST",
  mt_artifacts: "MT-ARTIFACT",
  superlative: "SUPERLATIVE",
  puffery: "PUFFERY",
  comparative: "COMPARATIVE",
  evaluative: "EVAL-CANDIDATE",
}

// A table parent holds no text of its own: it exists for the data-table test
// and for its children list. Scanning it too would double every count.
const SCANNABLE = new Set(["paragraph", "list_item", "heading", "table_cell"])

/**
 * @param {string} text
 * @param {object} opts
 * @param {"R"|"P"|"C"} opts.tier
 * @param {string} [opts.lang]
 * @param {Array<{block:number, lang:string}>} [opts.langMap]
 * @param {Array<{block:number, tier:string}>} [opts.tierMap]
 * @param {Record<string, object>} [opts.packs]
 *
 * Unregistered language: the lexical counters and same_shape_run come back
 * null rather than 0. Zero means measured and clean; null means not measured.
 */
export function scan(text, { tier, lang, langMap = [], tierMap = [], packs = {} }) {
  const blocks = splitBlocks(text)
  const tiers = resolveTiers(blocks, { tier, tierMap })
  const langOf = new Map(langMap.map((e) => [e.block, e.lang]))

  const blockInfo = blocks.map((b) => {
    const t = tiers.get(b.index)
    const info = {
      index: b.index,
      tier: t.tier,
      lang: langOf.get(b.index) ?? lang ?? null,
      kind: b.kind,
      tier_source: t.tier_source,
    }
    if (b.children) info.children = b.children
    if (b.parent !== undefined) info.parent = b.parent
    return info
  })

  const findings = []
  const perList = Object.fromEntries(LIST_PRIORITY.map((k) => [k, 0]))
  // One flag: the spec nulls the lexical counters and same_shape_run under the
  // same condition, so they cannot diverge.
  let lexicalRan = false
  let runMax = 0

  for (const b of blocks) {
    if (!SCANNABLE.has(b.kind) || b.text === "") continue
    const info = blockInfo[b.index]
    const pack = info.lang ? packs[info.lang] : undefined
    if (!pack) continue
    lexicalRan = true

    const blockHasData = hasDataToken(b.text, pack)

    for (const m of matchLists(b.text, pack, b.span[0])) {
      perList[m.list]++
      const f = {
        rule: `${info.lang.toUpperCase()}-${RULE_OF_LIST[m.list]}`,
        span: m.span,
        text: m.text,
        lang: info.lang,
        block: b.index,
        tier: info.tier,
      }
      if (m.list === "evaluative") f.block_has_data = blockHasData
      findings.push(f)
    }

    // A run never crosses a block boundary, so this is a max and not a sum.
    const run = sameShapeRun(splitSentences(b.text, pack.abbreviations ?? []), pack)
    if (run > runMax) runMax = run
  }

  const dashes = countDashes(blocks)
  for (const d of dashes.findings) {
    findings.push({
      rule: "CORE-DASH",
      span: d.span,
      text: d.text,
      lang: blockInfo[d.block]?.lang ?? null,
      block: d.block,
      tier: tiers.get(d.block).tier,
    })
  }

  findings.sort((a, b) => a.span[0] - b.span[0])

  const primaryAbbr = (lang && packs[lang]?.abbreviations) ?? []

  return {
    counted: {
      dash: dashes.count,
      banlist: lexicalRan ? perList.banlist : null,
      mt_artifacts: lexicalRan ? perList.mt_artifacts : null,
      superlative: lexicalRan ? perList.superlative : null,
      puffery: lexicalRan ? perList.puffery : null,
      comparative: lexicalRan ? perList.comparative : null,
      eval_candidate: lexicalRan ? perList.evaluative : null,
      same_shape_run: lexicalRan ? runMax : null,
      colon_outside_list: countColonsOutsideList(text, blocks),
      short_paragraph_ratio: shortParagraphRatio(blocks, primaryAbbr),
    },
    findings,
    blocks: blockInfo,
  }
}

export function loadPacks() {
  const base = new URL("../references/", import.meta.url)
  const registry = JSON.parse(readFileSync(new URL("languages.json", base), "utf8"))
  const out = {}
  for (const [code, file] of Object.entries(registry)) {
    try {
      const r = parsePack(readFileSync(new URL(file, base), "utf8"), code)
      if (r.ok) out[code] = r.pack
    } catch { /* pack not written yet; scan degrades to unregistered */ }
  }
  return out
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2)
  const flagValue = (f) => { const i = argv.indexOf(f); return i === -1 ? undefined : argv[i + 1] }

  // A positional is any token that is not a flag and does not follow one.
  const file = argv.filter((a, i) => !a.startsWith("--") && !(argv[i - 1] ?? "").startsWith("--"))[0]
  if (!file) {
    console.error("usage: scan.mjs [--tier R|P|C] [--lang xx] [--lang-map map.json] <file.md>")
    process.exit(2)
  }

  const langMapPath = flagValue("--lang-map")
  const result = scan(readFileSync(file, "utf8"), {
    tier: flagValue("--tier") ?? "P",
    lang: flagValue("--lang"),
    langMap: langMapPath ? JSON.parse(readFileSync(langMapPath, "utf8")) : [],
    packs: loadPacks(),
  })
  console.log(JSON.stringify(result, null, 2))
}
