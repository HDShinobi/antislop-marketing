# antislop-marketing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code and Codex plugin with two skills that write and audit Vietnamese and English marketing documents without AI writing tells, keeping legitimate marketing vocabulary intact.

**Architecture:** Two SKILL.md entry points share one `references/` rule set. A dependency-free Node scanner `bin/scan.mjs` owns every deterministic measurement; the model owns every semantic judgement. Language-specific data lives in one fenced JSON block per language pack, so adding a language never touches `core.md` or either skill.

**Tech Stack:** Node.js >= 18 (built-in `node:test`, ESM), zero runtime dependencies, Markdown, JSON.

## Global Constraints

- **Zero external dependencies in `bin/`.** No YAML parser, no POS tagger, no sentence-splitting library. Kết quả phải không đổi theo phiên bản dependency.
- **JSON, never YAML**, for every machine-readable file and fenced data block. Node has `JSON.parse` built in; it has no YAML parser.
- **`span` is a pair of UTF-16 code unit offsets** into the original file string, half-open `[start, end)`. Not bytes, not grapheme clusters. `text` must equal `source.slice(...span)` exactly.
- **`counted` has exactly nine keys**: `dash`, `banlist`, `mt_artifacts`, `puffery`, `comparative`, `eval_candidate`, `same_shape_run`, `colon_outside_list`, `short_paragraph_ratio`.
- **`null` means "not measured", `0` means "measured and clean".** Never substitute one for the other.
- **No em dash (`—`) or en dash (`–`) anywhere in repo prose.** CI enforces this on `README.md`, `README.vi.md`, and everything in `examples/`.
- **Rule ID format:** `<SCOPE>-<NAME>`, uppercase, hyphen-separated. `SCOPE` is `CORE`, `EVID`, or a language code (`VI`, `EN`). IDs never change when rule wording changes.
- **License MIT.** `NOTICE` credits `adenaufal/anti-slop-writing` and `blader/humanizer`, both MIT.
- **All prose in the repo is bilingual**: `README.md` in English, `README.vi.md` in Vietnamese. Rule files are single-language by design.
- **Both language packs ship at the `cộng đồng` label**, not `hiệu chỉnh`, because neither has a measured `cadence_band`.

---

## File Structure

```
antislop-marketing/
├── .claude-plugin/
│   ├── plugin.json                 Claude Code plugin manifest
│   └── marketplace.json            Claude Code marketplace manifest
├── .codex-plugin/
│   └── plugin.json                 Codex plugin manifest
│
├── bin/
│   ├── scan.mjs                    public API (splitBlocks, scan) + CLI entry
│   ├── validate-pack.mjs           language pack schema validator + CLI
│   └── lib/
│       ├── blocks.mjs              Markdown block splitting, table parent/child
│       ├── sentences.mjs           sentence splitting, signature, same_shape_run
│       ├── lexicon.mjs             five-list matching with normalization
│       ├── counters.mjs            dash, colon_outside_list, short_paragraph_ratio
│       ├── tiers.mjs               effective tier resolution
│       └── pack.mjs                extract and parse the antislop-pack JSON block
│
├── skills/
│   ├── antislop-write/SKILL.md     generation entry point
│   └── antislop-check/SKILL.md     audit entry point
│
├── references/
│   ├── core.md                     language-neutral rules
│   ├── languages.json              language pack registry
│   ├── vi.md                       Vietnamese pack
│   ├── en.md                       English pack
│   ├── evidence.md                 evidence-backing rules
│   └── false-positives.md          do-not-flag guards
│
├── examples/                       before/after per tier, both languages
├── tests/
│   ├── scan-manifest.json          tier + lang for every self-scanned file
│   ├── fixtures.mjs                tier-2 headless runner
│   ├── blocks.test.mjs
│   ├── sentences.test.mjs
│   ├── lexicon.test.mjs
│   ├── counters.test.mjs
│   ├── tiers.test.mjs
│   ├── scan.test.mjs
│   ├── validate-pack.test.mjs
│   ├── selfscan.test.mjs
│   └── fixtures/
│       ├── mechanical/             <name>.md + <name>.expect.json
│       ├── judged/                 <name>.md + <name>.expect.json
│       └── packs/                  valid / missing-key / wrong-type / extra-key
├── .github/workflows/ci.yml
├── CONTRIBUTING.md                 language pack template
├── NOTICE
├── LICENSE
├── README.md
└── README.vi.md
```

Each `bin/lib/*.mjs` file is a pure module with one responsibility and no I/O. `bin/scan.mjs` is the only file that composes them, and the only one that reads argv.

---

### Task 1: Verify path resolution and scaffold the repo

This is blocking item 1 from spec section 12. It runs first because its result decides where `references/` and `bin/` live, and both SKILL.md files hardcode those paths.

**Files:**
- Create: `package.json`
- Create: `.claude-plugin/plugin.json`
- Create: `bin/probe.mjs` (temporary, deleted in step 7)
- Create: `skills/antislop-probe/SKILL.md` (temporary, deleted in step 7)
- Create: `docs/superpowers/notes/path-resolution.md`

**Interfaces:**
- Consumes: nothing
- Produces: a decision recorded in `docs/superpowers/notes/path-resolution.md`. Either `LAYOUT=root` (keep `references/` and `bin/` at plugin root) or `LAYOUT=nested` (move both under `skills/antislop-write/`). Every later task reads this note before writing a path.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "antislop-marketing",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "engines": { "node": ">=18" },
  "scripts": {
    "test": "node --test tests/",
    "scan": "node bin/scan.mjs",
    "validate-packs": "node bin/validate-pack.mjs --all"
  }
}
```

- [ ] **Step 2: Create the probe plugin manifest**

`.claude-plugin/plugin.json`:

```json
{
  "name": "antislop-marketing",
  "description": "Write and audit marketing documents without AI writing tells, in Vietnamese and English.",
  "version": "0.1.0",
  "author": { "name": "HDShinobi" },
  "license": "MIT",
  "keywords": ["writing", "marketing", "vietnamese", "anti-slop"],
  "skills": ["./skills/antislop-probe"]
}
```

- [ ] **Step 3: Create the probe scanner**

`bin/probe.mjs`:

```js
#!/usr/bin/env node
console.log(JSON.stringify({ probe: "ok", cwd: process.cwd() }))
```

- [ ] **Step 4: Create the probe skill**

`skills/antislop-probe/SKILL.md`:

```markdown
---
name: antislop-probe
description: Temporary probe that reports whether a skill can read plugin-root files. Use when the user asks to run the antislop path probe.
---

# Path probe

Do all three, then report each result as PASS or FAIL with the resolved absolute path.

1. Read `../../references/probe.txt` relative to this skill's own directory. Report its contents.
2. Run `node ../../bin/probe.mjs` relative to this skill's own directory. Report its stdout.
3. Report your current working directory.
```

Also create `references/probe.txt` containing the single line `probe-marker-7431`.

- [ ] **Step 5: Install into both harnesses and run the probe**

```bash
cd ~/Projects/antislop-marketing
mkdir -p /tmp/antislop-probe-cwd && cd /tmp/antislop-probe-cwd

claude -p "Run the antislop path probe" --permission-mode acceptEdits
codex exec "Run the antislop path probe"
```

If the marketplace install path differs on your machine, use whatever local-marketplace mechanism each CLI documents. The point of the step is that CWD is `/tmp/antislop-probe-cwd`, not the repo.

- [ ] **Step 6: Record the decision**

Write `docs/superpowers/notes/path-resolution.md` with a table: harness, step 1 result, step 2 result, resolved path. Then one line: `LAYOUT=root` if both harnesses passed both reads, otherwise `LAYOUT=nested`.

If `LAYOUT=nested`, also record that `counted_source` can still be `"scan"` as long as step 2 passed; only step 1 failing forces the nested layout.

- [ ] **Step 7: Delete the probe and commit**

```bash
cd ~/Projects/antislop-marketing
rm -rf skills/antislop-probe bin/probe.mjs references/probe.txt
git add package.json .claude-plugin/plugin.json docs/superpowers/notes/path-resolution.md
git commit -m "chore: verify plugin path resolution in Claude Code and Codex"
```

---

### Task 2: Language pack schema and validator

Blocking item 2 from spec section 12. The rule ID scheme and pack schema must be frozen before any rule content is written.

**Files:**
- Create: `bin/lib/pack.mjs`
- Create: `bin/validate-pack.mjs`
- Create: `tests/validate-pack.test.mjs`
- Create: `tests/fixtures/packs/valid.md`
- Create: `tests/fixtures/packs/missing-key.md`
- Create: `tests/fixtures/packs/wrong-type.md`
- Create: `tests/fixtures/packs/extra-key.md`
- Create: `references/languages.json`

**Interfaces:**
- Consumes: `LAYOUT` from Task 1.
- Produces:
  - `extractPackBlock(markdown: string): string | null` returns the raw JSON text of the single fenced ` ```json antislop-pack ` block, or `null` if absent.
  - `parsePack(markdown: string): { ok: true, pack: Pack } | { ok: false, errors: string[] }`
  - `PACK_SCHEMA`, the field table as data, exported for tests.
  - `Pack` shape: `{ lang: string, banlist: string[], mt_artifacts: string[], puffery: string[], comparative: string[], evaluative: string[], abbreviations: string[], openers: { dai_tu: string[], lien_tu: string[], trang_ngu: string[] }, tackon: string[], config_tokens: string[], loanwords: string[], cadence_band: [number, number] | null, tier_keywords: { R: string[], P: string[], C: string[] } }`

- [ ] **Step 1: Write the failing tests**

`tests/validate-pack.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { extractPackBlock, parsePack } from "../bin/lib/pack.mjs"

const read = (n) => readFileSync(new URL(`./fixtures/packs/${n}.md`, import.meta.url), "utf8")

test("extracts the fenced antislop-pack block", () => {
  const raw = extractPackBlock(read("valid"))
  assert.ok(raw)
  assert.equal(JSON.parse(raw).lang, "xx")
})

test("returns null when there is no pack block", () => {
  assert.equal(extractPackBlock("# just prose\n\nno block here\n"), null)
})

test("a valid pack parses", () => {
  const r = parsePack(read("valid"))
  assert.equal(r.ok, true)
  assert.equal(r.pack.lang, "xx")
  assert.equal(r.pack.cadence_band, null)
})

test("a missing required key is an error", () => {
  const r = parsePack(read("missing-key"))
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes("tackon")))
})

test("a wrong type is an error", () => {
  const r = parsePack(read("wrong-type"))
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes("banlist")))
})

test("an unknown key parses but warns", () => {
  const r = parsePack(read("extra-key"))
  assert.equal(r.ok, true)
  assert.ok(r.warnings.some((w) => w.includes("nonsense_field")))
})

test("empty arrays are valid, missing keys are not", () => {
  const r = parsePack(read("valid"))
  assert.deepEqual(r.pack.comparative, [])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/validate-pack.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/pack.mjs'`

- [ ] **Step 3: Create the four pack fixtures**

`tests/fixtures/packs/valid.md`:

````markdown
# Test pack

Prose section for humans.

```json antislop-pack
{
  "lang": "xx",
  "banlist": ["forbidden phrase"],
  "mt_artifacts": [],
  "puffery": ["amazing"],
  "comparative": [],
  "evaluative": ["good"],
  "abbreviations": ["e.g."],
  "openers": { "dai_tu": ["we"], "lien_tu": ["but"], "trang_ngu": ["after"] },
  "tackon": ["thereby"],
  "config_tokens": ["campaign"],
  "loanwords": ["ROAS"],
  "cadence_band": null,
  "tier_keywords": { "R": ["report"], "P": ["proposal"], "C": ["caption"] }
}
```
````

`missing-key.md` is `valid.md` with the `"tackon"` line deleted.
`wrong-type.md` is `valid.md` with `"banlist": "forbidden phrase"` (string, not array).
`extra-key.md` is `valid.md` plus `"nonsense_field": 1`.

- [ ] **Step 4: Implement pack.mjs**

```js
export const PACK_SCHEMA = {
  lang:           { type: "string",  empty: false },
  banlist:        { type: "string[]" },
  mt_artifacts:   { type: "string[]" },
  puffery:        { type: "string[]" },
  comparative:    { type: "string[]" },
  evaluative:     { type: "string[]" },
  abbreviations:  { type: "string[]" },
  openers:        { type: "object", keys: ["dai_tu", "lien_tu", "trang_ngu"], of: "string[]" },
  tackon:         { type: "string[]" },
  config_tokens:  { type: "string[]" },
  loanwords:      { type: "string[]" },
  cadence_band:   { type: "pair|null" },
  tier_keywords:  { type: "object", keys: ["R", "P", "C"], of: "string[]" },
}

const FENCE = /^```json\s+antislop-pack\s*$/m

export function extractPackBlock(markdown) {
  const lines = markdown.split("\n")
  const start = lines.findIndex((l) => FENCE.test(l))
  if (start === -1) return null
  const end = lines.indexOf("```", start + 1)
  if (end === -1) return null
  return lines.slice(start + 1, end).join("\n")
}

const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string")

function checkField(name, spec, value, errors) {
  if (value === undefined) { errors.push(`missing required key: ${name}`); return }
  switch (spec.type) {
    case "string":
      if (typeof value !== "string") errors.push(`${name}: expected string`)
      else if (spec.empty === false && value === "") errors.push(`${name}: must not be empty`)
      break
    case "string[]":
      if (!isStringArray(value)) errors.push(`${name}: expected array of strings`)
      break
    case "pair|null":
      if (value === null) break
      if (!Array.isArray(value) || value.length !== 2 || !value.every(Number.isInteger)) {
        errors.push(`${name}: expected [min, max] integers or null`)
      }
      break
    case "object": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        errors.push(`${name}: expected object`); break
      }
      for (const k of spec.keys) {
        if (!(k in value)) errors.push(`${name}.${k}: missing required key`)
        else if (!isStringArray(value[k])) errors.push(`${name}.${k}: expected array of strings`)
      }
      for (const k of Object.keys(value)) {
        if (!spec.keys.includes(k)) errors.push(`${name}.${k}: unknown key`)
      }
      break
    }
  }
}

export function parsePack(markdown) {
  const raw = extractPackBlock(markdown)
  if (raw === null) return { ok: false, errors: ["no fenced json antislop-pack block found"], warnings: [] }

  let pack
  try { pack = JSON.parse(raw) }
  catch (e) { return { ok: false, errors: [`pack block is not valid JSON: ${e.message}`], warnings: [] } }

  const errors = []
  const warnings = []
  for (const [name, spec] of Object.entries(PACK_SCHEMA)) checkField(name, spec, pack[name], errors)
  for (const k of Object.keys(pack)) {
    if (!(k in PACK_SCHEMA)) warnings.push(`unknown key ignored: ${k}`)
  }
  return errors.length ? { ok: false, errors, warnings } : { ok: true, pack, warnings }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/validate-pack.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 6: Create the registry and the CLI**

`references/languages.json`:

```json
{ "vi": "vi.md", "en": "en.md" }
```

`bin/validate-pack.mjs`:

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { parsePack } from "./lib/pack.mjs"

const here = new URL("../references/", import.meta.url)
const args = process.argv.slice(2)
const files = args.includes("--all")
  ? Object.values(JSON.parse(readFileSync(new URL("languages.json", here), "utf8")))
  : args

let failed = false
for (const f of files) {
  const url = args.includes("--all") ? new URL(f, here) : new URL(f, `file://${process.cwd()}/`)
  const r = parsePack(readFileSync(url, "utf8"))
  for (const w of r.warnings ?? []) console.warn(`WARN  ${f}: ${w}`)
  if (r.ok) { console.log(`OK    ${f}`) }
  else { failed = true; for (const e of r.errors) console.error(`ERROR ${f}: ${e}`) }
}
process.exit(failed ? 1 : 0)
```

- [ ] **Step 7: Commit**

```bash
git add bin/lib/pack.mjs bin/validate-pack.mjs tests/validate-pack.test.mjs \
        tests/fixtures/packs references/languages.json
git commit -m "feat(pack): language pack schema, parser and validator"
```

---

### Task 3: Block splitting

**Files:**
- Create: `bin/lib/blocks.mjs`
- Create: `tests/blocks.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `splitBlocks(text: string): Block[]` where
  `Block = { index: number, kind: "paragraph"|"list_item"|"heading"|"table"|"table_cell", span: [number, number], text: string, parent?: number, children?: number[] }`.
  Blocks are returned in document order. A `table` block has `text: ""` and a `children` array. Code fences produce no blocks at all.

- [ ] **Step 1: Write the failing tests**

`tests/blocks.test.mjs`:

```js
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
  const src = "Alpha para.\n\nBeta para.\n"
  for (const blk of splitBlocks(src)) {
    if (blk.kind === "table") continue
    assert.equal(src.slice(...blk.span), blk.text)
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
  assert.equal(b[1].kind, "paragraph")
})

test("a table produces one parent plus one block per body cell", () => {
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

test("code fences produce no blocks", () => {
  const b = splitBlocks("Before.\n\n```js\nconst x = 1\n```\n\nAfter.\n")
  assert.equal(b.length, 2)
  assert.equal(b[0].text, "Before.")
  assert.equal(b[1].text, "After.")
})

test("blank input yields no blocks", () => {
  assert.deepEqual(splitBlocks("\n\n   \n"), [])
})
```

Note the header row is included in `table_cell` blocks, so a 2-column table with a header and two body rows yields 6 cells. The data-table criterion in Task 8 excludes the header row itself; block splitting does not.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/blocks.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/blocks.mjs'`

- [ ] **Step 3: Implement blocks.mjs**

```js
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

export function splitBlocks(text) {
  const lines = lineSpans(text)
  const blocks = []
  let i = 0
  let inFence = false

  const push = (b) => { b.index = blocks.length; blocks.push(b); return b.index }

  while (i < lines.length) {
    const line = lines[i]

    if (FENCE_RE.test(line.text.trim())) { inFence = !inFence; i++; continue }
    if (inFence) { i++; continue }
    if (line.text.trim() === "") { i++; continue }

    if (HEADING_RE.test(line.text)) {
      const body = line.text.replace(HEADING_RE, "")
      const offset = line.text.length - body.length
      push({ kind: "heading", span: [line.start + offset, line.end], text: body })
      i++; continue
    }

    if (LIST_RE.test(line.text)) {
      const body = line.text.replace(LIST_RE, "")
      const offset = line.text.length - body.length
      push({ kind: "list_item", span: [line.start + offset, line.end], text: body })
      i++; continue
    }

    if (TABLE_ROW_RE.test(line.text)) {
      const rows = []
      while (i < lines.length && TABLE_ROW_RE.test(lines[i].text)) { rows.push(lines[i]); i++ }
      const parentStart = rows[0].start
      const parentEnd = rows[rows.length - 1].end
      const parentIndex = push({ kind: "table", span: [parentStart, parentEnd], text: "", children: [] })
      const children = []
      for (const row of rows) {
        if (TABLE_SEP_RE.test(row.text)) continue
        let cursor = row.start
        const parts = row.text.split("|")
        for (let p = 0; p < parts.length; p++) {
          const part = parts[p]
          if (p > 0 && p < parts.length - 1) {
            const lead = part.length - part.trimStart().length
            const body = part.trim()
            if (body !== "") {
              children.push(push({
                kind: "table_cell",
                span: [cursor + lead, cursor + lead + body.length],
                text: body,
                parent: parentIndex,
              }))
            }
          }
          cursor += part.length + 1
        }
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/blocks.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/blocks.mjs tests/blocks.test.mjs
git commit -m "feat(scan): Markdown block splitting with table parent and cell blocks"
```

---

### Task 4: Sentence splitting

**Files:**
- Create: `bin/lib/sentences.mjs`
- Create: `tests/sentences.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `splitSentences(blockText: string, abbreviations: string[]): string[]`. End of block is always a boundary. Never returns empty strings.

- [ ] **Step 1: Write the failing tests**

`tests/sentences.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { splitSentences } from "../bin/lib/sentences.mjs"

const ABBR = ["v.v.", "TP.", "ThS."]

test("splits on period followed by space", () => {
  assert.deepEqual(
    splitSentences("Câu một. Câu hai.", ABBR),
    ["Câu một.", "Câu hai."]
  )
})

test("does not require an uppercase letter after the period", () => {
  assert.deepEqual(
    splitSentences("Doanh thu tăng. chi phí cũng tăng.", ABBR),
    ["Doanh thu tăng.", "chi phí cũng tăng."]
  )
})

test("does not split a decimal number", () => {
  assert.deepEqual(splitSentences("ROAS đạt 3.4 trong tháng.", ABBR), ["ROAS đạt 3.4 trong tháng."])
})

test("does not split when there is no space after the period", () => {
  assert.deepEqual(splitSentences("Chi nhánh TP.HCM mở cửa.", ABBR), ["Chi nhánh TP.HCM mở cửa."])
})

test("does not split on a known abbreviation", () => {
  assert.deepEqual(splitSentences("Gồm A, B, v.v. và C.", ABBR), ["Gồm A, B, v.v. và C."])
})

test("does not split inside a code span", () => {
  assert.deepEqual(splitSentences("Gọi `a.b()` rồi dừng.", ABBR), ["Gọi `a.b()` rồi dừng."])
})

test("does not split inside a markdown link url", () => {
  assert.deepEqual(
    splitSentences("Xem [tài liệu](https://a.com/b.html) nhé.", ABBR),
    ["Xem [tài liệu](https://a.com/b.html) nhé."]
  )
})

test("end of block is a boundary even without punctuation", () => {
  assert.deepEqual(splitSentences("Tiêu đề không có dấu chấm", ABBR), ["Tiêu đề không có dấu chấm"])
})

test("handles question and exclamation marks", () => {
  assert.deepEqual(splitSentences("Đúng không? Có chứ!", ABBR), ["Đúng không?", "Có chứ!"])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/sentences.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/sentences.mjs'`

- [ ] **Step 3: Implement splitSentences**

```js
const TERMINATORS = new Set([".", "!", "?", "\u2026"])

function maskedRegions(text) {
  const spans = []
  const codeRe = /`[^`]*`/g
  const linkRe = /\]\([^)]*\)/g
  const bareUrlRe = /https?:\/\/\S+/g
  for (const re of [codeRe, linkRe, bareUrlRe]) {
    for (const m of text.matchAll(re)) spans.push([m.index, m.index + m[0].length])
  }
  return spans
}

const inSpans = (i, spans) => spans.some(([a, b]) => i >= a && i < b)

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
    if (next === undefined) break
    if (!/\s/.test(next)) continue

    if (ch === "." && /\d/.test(text[i - 1] ?? "") && /\d/.test(text[i + 2] ?? "")) continue

    const after = text.slice(i + 1).replace(/^\s+/, "")
    if (after === "") break
    if (!/^[\p{L}\p{N}([{"'\u201c\u2018]/u.test(after)) continue

    const head = text.slice(start, i + 1)
    if (abbreviations.some((a) => head.endsWith(a))) continue

    out.push(head.trim())
    start = i + 1
  }

  const tail = text.slice(start).trim()
  if (tail !== "") out.push(tail)
  return out
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/sentences.test.mjs`
Expected: PASS, 9 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/sentences.mjs tests/sentences.test.mjs
git commit -m "feat(scan): dependency-free sentence splitting with Vietnamese exclusions"
```

---

### Task 5: Sentence signature and same_shape_run

**Files:**
- Modify: `bin/lib/sentences.mjs`
- Modify: `tests/sentences.test.mjs`

**Interfaces:**
- Consumes: `splitSentences` from Task 4; `Pack` from Task 2.
- Produces:
  - `signature(sentence: string, pack: Pack): { opener: "so"|"dai_tu"|"lien_tu"|"trang_ngu"|"khac", clauses: number, tackon: boolean }`
  - `sameShapeRun(sentences: string[], pack: Pack): number` returns the longest run of consecutive same-shape sentences. Two `khac` openers are never the same shape.

- [ ] **Step 1: Append the failing tests**

```js
import { signature, sameShapeRun } from "../bin/lib/sentences.mjs"

const PACK = {
  openers: { dai_tu: ["chúng tôi", "tôi"], lien_tu: ["nhưng", "và"], trang_ngu: ["trong", "sau khi"] },
  tackon: ["góp phần", "mang lại"],
}

test("opener classes resolve in priority order", () => {
  assert.equal(signature("3 chiến dịch chạy tốt.", PACK).opener, "so")
  assert.equal(signature("Chúng tôi triển khai.", PACK).opener, "dai_tu")
  assert.equal(signature("Nhưng chi phí tăng.", PACK).opener, "lien_tu")
  assert.equal(signature("Trong tháng 6, CPA giảm.", PACK).opener, "trang_ngu")
  assert.equal(signature("Doanh thu tăng.", PACK).opener, "khac")
})

test("clause count is top level commas plus one", () => {
  assert.equal(signature("Một mệnh đề.", PACK).clauses, 1)
  assert.equal(signature("Một, hai.", PACK).clauses, 2)
  assert.equal(signature("Doanh thu 1.250.000 đồng.", PACK).clauses, 1)
  assert.equal(signature("Kết quả (a, b) tốt.", PACK).clauses, 1)
})

test("tackon is detected on the last clause", () => {
  assert.equal(signature("CPA giảm, góp phần cải thiện ROAS.", PACK).tackon, true)
  assert.equal(signature("CPA giảm, ROAS tăng.", PACK).tackon, false)
})

test("three same-shape sentences make a run of 3", () => {
  const s = [
    "Chúng tôi tăng ngân sách, mang lại kết quả tốt.",
    "Chúng tôi đổi creative, mang lại tương tác cao.",
    "Chúng tôi mở kênh mới, mang lại lượt xem lớn.",
  ]
  assert.equal(sameShapeRun(s, PACK), 3)
})

test("two khac openers never count as the same shape", () => {
  const s = ["Doanh thu tăng.", "Chi phí giảm.", "Lợi nhuận ổn."]
  assert.equal(sameShapeRun(s, PACK), 1)
})

test("an empty list has a run of 0", () => {
  assert.equal(sameShapeRun([], PACK), 0)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/sentences.test.mjs`
Expected: FAIL with `signature is not a function`

- [ ] **Step 3: Implement signature and sameShapeRun**

Append to `bin/lib/sentences.mjs`:

```js
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim()

function startsWithToken(sentence, list) {
  const s = norm(sentence)
  return list.some((t) => {
    const n = norm(t)
    return s === n || s.startsWith(n + " ") || s.startsWith(n + ",")
  })
}

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

export function signature(sentence, pack) {
  const o = pack.openers ?? { dai_tu: [], lien_tu: [], trang_ngu: [] }
  let opener = "khac"
  if (/^\s*\d/.test(sentence)) opener = "so"
  else if (startsWithToken(sentence, o.dai_tu)) opener = "dai_tu"
  else if (startsWithToken(sentence, o.lien_tu)) opener = "lien_tu"
  else if (startsWithToken(sentence, o.trang_ngu)) opener = "trang_ngu"

  const clauses = topLevelCommas(sentence) + 1

  const parts = sentence.split(",")
  const last = parts[parts.length - 1] ?? ""
  const tackon = clauses > 1 && startsWithToken(last, pack.tackon ?? [])

  return { opener, clauses, tackon }
}

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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/sentences.test.mjs`
Expected: PASS, 15 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/sentences.mjs tests/sentences.test.mjs
git commit -m "feat(scan): sentence signature and same_shape_run with khac guard"
```

---

### Task 6: Lexicon matching

**Files:**
- Create: `bin/lib/lexicon.mjs`
- Create: `tests/lexicon.test.mjs`

**Interfaces:**
- Consumes: `Pack` from Task 2.
- Produces: `matchLists(blockText: string, pack: Pack, offset: number): Match[]` where
  `Match = { list: "banlist"|"mt_artifacts"|"puffery"|"comparative"|"evaluative", term: string, span: [number, number], text: string }`.
  `offset` is the block's absolute start, so `span` comes back absolute. One position is reported once, by the first list in priority order `banlist, mt_artifacts, puffery, comparative, evaluative`.
  Also `hasDataToken(blockText: string, pack: Pack): boolean`.

- [ ] **Step 1: Write the failing tests**

`tests/lexicon.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { matchLists, hasDataToken } from "../bin/lib/lexicon.mjs"

const PACK = {
  banlist: ["đóng vai trò quan trọng"],
  mt_artifacts: ["được thực hiện bởi"],
  puffery: ["vượt trội", "hàng đầu"],
  comparative: ["hơn", "nhất"],
  evaluative: ["tốt", "hiệu quả"],
  config_tokens: ["campaign", "pixel"],
}

test("matches are case insensitive", () => {
  const m = matchLists("Sản phẩm VƯỢT TRỘI.", PACK, 0)
  assert.equal(m.length, 1)
  assert.equal(m[0].list, "puffery")
})

test("diacritics are significant", () => {
  assert.equal(matchLists("San pham vuot troi.", PACK, 0).length, 0)
})

test("matches respect syllable boundaries", () => {
  assert.equal(matchLists("Thương hiệu hàng đầu.", PACK, 0).length, 1)
  assert.equal(matchLists("Là hàng đầu tiên trong kho.", PACK, 0).length, 0)
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

test("span is absolute and slices back to the term", () => {
  const src = "AAAA Sản phẩm vượt trội."
  const m = matchLists(src.slice(5), PACK, 5)
  assert.equal(src.slice(...m[0].span), "vượt trội")
})

test("hasDataToken finds numbers, dates, urls and config tokens", () => {
  assert.equal(hasDataToken("CPA 47$", PACK), true)
  assert.equal(hasDataToken("đổi ngày 12/6", PACK), true)
  assert.equal(hasDataToken("xem example.com", PACK), true)
  assert.equal(hasDataToken("sửa campaign này", PACK), true)
  assert.equal(hasDataToken("đội ngũ tận tâm", PACK), false)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/lexicon.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/lexicon.mjs'`

- [ ] **Step 3: Implement lexicon.mjs**

```js
export const LIST_PRIORITY = ["banlist", "mt_artifacts", "puffery", "comparative", "evaluative"]

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function termRegex(term) {
  const pattern = escape(term.trim()).replace(/\s+/g, "\\s+")
  return new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, "giu")
}

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
        taken.push([start, end])
        out.push({ list, term, span: [start + offset, end + offset], text: m[0] })
      }
    }
  }
  return out.sort((a, b) => a.span[0] - b.span[0])
}

const NUMBER_RE = /\d/
const DATE_RE = /\d{1,4}[/-]\d{1,2}([/-]\d{1,4})?|tháng\s+\d/iu
const URL_RE = /https?:\/\/|[\w-]+\.(com|vn|net|org|io)\b/i

export function hasDataToken(blockText, pack) {
  if (NUMBER_RE.test(blockText)) return true
  if (DATE_RE.test(blockText)) return true
  if (URL_RE.test(blockText)) return true
  return (pack.config_tokens ?? []).some((t) => termRegex(t).test(blockText))
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lexicon.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/lexicon.mjs tests/lexicon.test.mjs
git commit -m "feat(scan): five-list lexicon matching with syllable boundaries"
```

---

### Task 7: Mechanical counters

**Files:**
- Create: `bin/lib/counters.mjs`
- Create: `tests/counters.test.mjs`

**Interfaces:**
- Consumes: `Block[]` from Task 3.
- Produces:
  - `countDashes(blocks: Block[]): { count: number, findings: Array<{span:[number,number], text:string, block:number}> }`
  - `countColonsOutsideList(source: string, blocks: Block[]): number`
  - `shortParagraphRatio(blocks: Block[], abbreviations: string[]): [number, number]`

- [ ] **Step 1: Write the failing tests**

`tests/counters.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { splitBlocks } from "../bin/lib/blocks.mjs"
import { countDashes, countColonsOutsideList, shortParagraphRatio } from "../bin/lib/counters.mjs"

test("counts em and en dashes, not hyphens", () => {
  const src = "Một \u2014 hai \u2013 ba - bốn.\n"
  const r = countDashes(splitBlocks(src))
  assert.equal(r.count, 2)
  assert.equal(src.slice(...r.findings[0].span), "\u2014")
})

test("dashes inside a code fence are not counted", () => {
  const src = "Text.\n\n```\na \u2014 b\n```\n"
  assert.equal(countDashes(splitBlocks(src)).count, 0)
})

test("a colon introducing a list is not counted", () => {
  const src = "Ba việc:\n\n- một\n- hai\n"
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

test("short paragraph ratio counts only prose paragraphs", () => {
  const src = "Một câu.\n\nCâu một. Câu hai. Câu ba.\n\n- mục danh sách\n\n# Tiêu đề\n"
  assert.deepEqual(shortParagraphRatio(splitBlocks(src), []), [1, 2])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/counters.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/counters.mjs'`

- [ ] **Step 3: Implement counters.mjs**

```js
import { splitSentences } from "./sentences.mjs"

const DASH_RE = /[\u2014\u2013]/g

export function countDashes(blocks) {
  const findings = []
  for (const b of blocks) {
    if (b.kind === "table" || b.text === "") continue
    for (const m of b.text.matchAll(DASH_RE)) {
      findings.push({ span: [b.span[0] + m.index, b.span[0] + m.index + 1], text: m[0], block: b.index })
    }
  }
  return { count: findings.length, findings }
}

export function countColonsOutsideList(source, blocks) {
  const lines = source.split("\n")
  let count = 0
  for (const b of blocks) {
    if (b.kind === "table" || b.text === "") continue
    for (let i = 0; i < b.text.length; i++) {
      if (b.text[i] !== ":") continue
      const abs = b.span[0] + i
      const before = source.slice(Math.max(0, abs - 8), abs)
      if (/https?$/.test(before)) continue
      const lineIndex = source.slice(0, abs).split("\n").length - 1
      const rest = lines[lineIndex].slice(lines[lineIndex].indexOf(":") + 1)
      if (rest.trim() === "") {
        const next = (lines[lineIndex + 1] ?? "").trim()
        if (/^([-*+]|\||\d+\.)/.test(next)) continue
      }
      const inCode = (b.text.slice(0, i).match(/`/g) ?? []).length % 2 === 1
      if (inCode) continue
      count++
    }
  }
  return count
}

export function shortParagraphRatio(blocks, abbreviations = []) {
  const paras = blocks.filter((b) => b.kind === "paragraph")
  let short = 0
  for (const p of paras) {
    if (splitSentences(p.text, abbreviations).length <= 2) short++
  }
  return [short, paras.length]
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/counters.test.mjs`
Expected: PASS, 6 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/counters.mjs tests/counters.test.mjs
git commit -m "feat(scan): dash, colon and short-paragraph counters"
```

---

### Task 8: Effective tier resolution

**Files:**
- Create: `bin/lib/tiers.mjs`
- Create: `tests/tiers.test.mjs`

**Interfaces:**
- Consumes: `Block[]` from Task 3.
- Produces:
  - `isDataTable(parent: Block, blocks: Block[], source: string): boolean` is true when more than half of the non-empty body cells contain a number token. The header row is excluded from both numerator and denominator.
  - `countColumns(parent: Block, blocks: Block[], source: string): number` counts the cells that start before the parent's first newline.
  - `resolveTiers(blocks: Block[], opts: { tier: "R"|"P"|"C", tierMap?: Array<{block:number, tier:string}>, source: string }): Map<number, { tier: string, tier_source: "document"|"data_table"|"tier_map" }>`
  - Strictness order `C < P < R`. Effective tier is the strictest of the three sources, so `tierMap` can raise but never lower.

- [ ] **Step 1: Write the failing tests**

`tests/tiers.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { splitBlocks } from "../bin/lib/blocks.mjs"
import { isDataTable, resolveTiers } from "../bin/lib/tiers.mjs"

const DATA = "| Kênh | Chi phí | CPA |\n|---|---|---|\n| Search | 12400 | 31 |\n| Meta | 8100 | 47 |\n"
const PROSE = "| Tính năng | Mô tả |\n|---|---|\n| Lọc RO | Loại bỏ kim loại nặng |\n| Bảo hành | Tận nơi trong 24h |\n"

test("a numeric table is a data table at 4 of 6", () => {
  const b = splitBlocks(DATA)
  assert.equal(isDataTable(b.find((x) => x.kind === "table"), b, DATA), true)
})

test("a prose table is not a data table at 1 of 4", () => {
  const b = splitBlocks(PROSE)
  assert.equal(isDataTable(b.find((x) => x.kind === "table"), b, PROSE), false)
})

test("column count comes from the first row", () => {
  const two = "| A | B |\n|---|---|\n| 1 | 2 |\n"
  const four = "| A | B | C | D |\n|---|---|---|---|\n| 1 | 2 | 3 | 4 |\n"
  const b2 = splitBlocks(two)
  const b4 = splitBlocks(four)
  assert.equal(isDataTable(b2.find((x) => x.kind === "table"), b2, two), true)
  assert.equal(isDataTable(b4.find((x) => x.kind === "table"), b4, four), true)
})

test("a data table forces tier R inside a P document", () => {
  const b = splitBlocks(DATA)
  const t = resolveTiers(b, { tier: "P", source: DATA })
  const parent = b.find((x) => x.kind === "table")
  assert.equal(t.get(parent.index).tier, "R")
  assert.equal(t.get(parent.index).tier_source, "data_table")
  for (const c of parent.children) assert.equal(t.get(c).tier, "R")
})

test("tierMap can raise a paragraph from C to R", () => {
  const b = splitBlocks("Một đoạn văn.\n")
  const t = resolveTiers(b, { tier: "C", tierMap: [{ block: 0, tier: "R" }], source: "Một đoạn văn.\n" })
  assert.equal(t.get(0).tier, "R")
  assert.equal(t.get(0).tier_source, "tier_map")
})

test("tierMap cannot lower a data table below R", () => {
  const b = splitBlocks(DATA)
  const parent = b.find((x) => x.kind === "table")
  const t = resolveTiers(b, { tier: "P", tierMap: [{ block: parent.index, tier: "C" }], source: DATA })
  assert.equal(t.get(parent.index).tier, "R")
  assert.equal(t.get(parent.index).tier_source, "data_table")
})

test("a plain paragraph inherits the document tier", () => {
  const src = "Một đoạn văn.\n"
  const t = resolveTiers(splitBlocks(src), { tier: "P", source: src })
  assert.equal(t.get(0).tier, "P")
  assert.equal(t.get(0).tier_source, "document")
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/tiers.test.mjs`
Expected: FAIL with `Cannot find module '../bin/lib/tiers.mjs'`

- [ ] **Step 3: Implement tiers.mjs**

```js
const RANK = { C: 0, P: 1, R: 2 }
const NAME = ["C", "P", "R"]
const stricter = (a, b) => (RANK[a] >= RANK[b] ? a : b)

export function isDataTable(parent, blocks, source) {
  if (!parent || parent.kind !== "table") return false
  const columns = countColumns(parent, blocks, source)
  const cells = (parent.children ?? []).map((i) => blocks[i]).filter((c) => c && c.text.trim() !== "")
  const body = cells.slice(columns)
  if (body.length === 0) return false
  const numeric = body.filter((c) => /\d/.test(c.text)).length
  return numeric * 2 > body.length
}

// The header row is the run of cells that start before the parent's first newline.
export function countColumns(parent, blocks, source) {
  const cells = (parent.children ?? []).map((i) => blocks[i])
  if (cells.length === 0) return 0
  const firstNewline = source.indexOf("\n", parent.span[0])
  const headerEnd = firstNewline === -1 ? parent.span[1] : firstNewline
  return cells.filter((c) => c.span[0] < headerEnd).length
}

export function resolveTiers(blocks, { tier, tierMap = [], source }) {
  const forced = new Map(tierMap.map((e) => [e.block, e.tier]))
  const result = new Map()

  const dataTableBlocks = new Set()
  for (const b of blocks) {
    if (b.kind === "table" && isDataTable(b, blocks, source)) {
      dataTableBlocks.add(b.index)
      for (const c of b.children ?? []) dataTableBlocks.add(c)
    }
  }

  for (const b of blocks) {
    let effective = tier
    let source = "document"
    if (forced.has(b.index) && RANK[forced.get(b.index)] > RANK[effective]) {
      effective = forced.get(b.index)
      source = "tier_map"
    }
    if (dataTableBlocks.has(b.index)) {
      const raised = stricter(effective, "R")
      if (raised === "R" && effective !== "R") { effective = "R"; source = "data_table" }
      else if (effective === "R" && source !== "tier_map") source = "data_table"
    }
    result.set(b.index, { tier: effective, tier_source: source })
  }
  return result
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/tiers.test.mjs`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add bin/lib/tiers.mjs tests/tiers.test.mjs
git commit -m "feat(scan): effective tier resolution with data-table floor"
```

---

### Task 9: Assemble scan.mjs and the CLI

**Files:**
- Create: `bin/scan.mjs`
- Create: `tests/scan.test.mjs`
- Create: `tests/fixtures/mechanical/basic-vi.md` and `.expect.json`
- Create: `tests/fixtures/mechanical/lowercase-next.md` and `.expect.json`
- Create: `tests/fixtures/mechanical/emoji-diacritics.md` and `.expect.json`
- Create: `tests/fixtures/mechanical/outside-cwd.md` and `.expect.json`

**Interfaces:**
- Consumes: every `bin/lib/*.mjs` module.
- Produces:
  - `splitBlocks` re-exported from `bin/scan.mjs`.
  - `scan(text: string, opts: { tier, lang?, langMap?, tierMap?, packs? }): ScanResult`
  - `ScanResult = { counted: {...nine keys}, findings: Finding[], blocks: BlockInfo[] }`
  - `Finding = { rule: string, span: [number,number], text: string, lang: string, block: number, tier: string, block_has_data?: boolean }`
  - Unregistered language: `banlist`, `mt_artifacts`, `puffery`, `comparative`, `eval_candidate`, `same_shape_run` are `null`; `dash`, `colon_outside_list`, `short_paragraph_ratio` still run.

- [ ] **Step 1: Write the failing tests**

`tests/scan.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { scan, splitBlocks } from "../bin/scan.mjs"

const VI = JSON.parse(readFileSync(new URL("./fixtures/packs/vi-min.json", import.meta.url), "utf8"))
const packs = { vi: VI }

test("counted has exactly the nine keys", () => {
  const r = scan("Một đoạn văn.\n", { tier: "P", lang: "vi", packs })
  assert.deepEqual(Object.keys(r.counted).sort(), [
    "banlist", "colon_outside_list", "comparative", "dash", "eval_candidate",
    "mt_artifacts", "puffery", "same_shape_run", "short_paragraph_ratio",
  ])
})

test("every finding text equals source.slice(span)", () => {
  const src = "Đội ngũ tận tâm \u2014 CPA 31 đồng.\n\nSản phẩm vượt trội.\n"
  const r = scan(src, { tier: "R", lang: "vi", packs })
  for (const f of r.findings) assert.equal(src.slice(...f.span), f.text)
})

test("eval_candidate is not filtered by the presence of a data token", () => {
  const r = scan("Đội ngũ tận tâm, CPA tháng này 31 đồng.\n", { tier: "R", lang: "vi", packs })
  const c = r.findings.filter((f) => f.rule === "VI-EVAL-CANDIDATE")
  assert.equal(c.length, 1)
  assert.equal(c[0].block_has_data, true)
})

test("an unregistered language nulls the lexical counters but keeps the mechanical ones", () => {
  const r = scan("Một \u2014 hai.\n", { tier: "P", lang: "th", packs })
  assert.equal(r.counted.dash, 1)
  assert.equal(r.counted.banlist, null)
  assert.equal(r.counted.same_shape_run, null)
  assert.deepEqual(r.counted.short_paragraph_ratio, [1, 1])
})

test("same_shape_run is a max across blocks, never a sum", () => {
  const two = "Chúng tôi làm A, mang lại X.\nChúng tôi làm B, mang lại Y.\n\nChúng tôi làm C, mang lại Z.\nChúng tôi làm D, mang lại W.\n"
  const r = scan(two, { tier: "P", lang: "vi", packs })
  assert.equal(r.counted.same_shape_run, 2)
})

test("langMap selects a pack per block", () => {
  const r = scan("Sản phẩm vượt trội.\n\nA truly amazing product.\n", {
    tier: "C", lang: "vi", langMap: [{ block: 1, lang: "en" }],
    packs: { vi: VI, en: { ...VI, lang: "en", puffery: ["amazing"], evaluative: [], banlist: [], mt_artifacts: [], comparative: [] } },
  })
  assert.equal(r.blocks[1].lang, "en")
  assert.ok(r.findings.some((f) => f.rule === "EN-PUFFERY"))
})

test("blocks report effective tier and source", () => {
  const r = scan("| Kênh | CPA |\n|---|---|\n| Search | 31 |\n", { tier: "C", lang: "vi", packs })
  const parent = r.blocks.find((b) => b.kind === "table")
  assert.equal(parent.tier, "R")
  assert.equal(parent.tier_source, "data_table")
})

test("every mechanical fixture matches its expectation", () => {
  const dir = new URL("./fixtures/mechanical/", import.meta.url)
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
    const src = readFileSync(new URL(f, dir), "utf8")
    const exp = JSON.parse(readFileSync(new URL(f.replace(/\.md$/, ".expect.json"), dir), "utf8"))
    const r = scan(src, { tier: exp.tier, lang: exp.lang, packs })
    assert.deepEqual(r.counted, exp.counted, `counted mismatch in ${f}`)
    assert.deepEqual(r.findings.map((x) => x.rule).sort(), exp.rules.sort(), `rules mismatch in ${f}`)
  }
})
```

Create `tests/fixtures/packs/vi-min.json` as a trimmed but schema-valid Vietnamese pack containing at minimum: `puffery: ["vượt trội"]`, `evaluative: ["tận tâm"]`, `banlist: ["đóng vai trò quan trọng"]`, `tackon: ["mang lại"]`, `openers.dai_tu: ["chúng tôi"]`, `abbreviations: ["v.v."]`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/scan.test.mjs`
Expected: FAIL with `Cannot find module '../bin/scan.mjs'`

- [ ] **Step 3: Implement scan.mjs**

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { splitBlocks } from "./lib/blocks.mjs"
import { splitSentences, sameShapeRun } from "./lib/sentences.mjs"
import { matchLists, hasDataToken, LIST_PRIORITY } from "./lib/lexicon.mjs"
import { countDashes, countColonsOutsideList, shortParagraphRatio } from "./lib/counters.mjs"
import { resolveTiers } from "./lib/tiers.mjs"
import { parsePack } from "./lib/pack.mjs"

export { splitBlocks }

const RULE_OF_LIST = {
  banlist: "BANLIST", mt_artifacts: "MT-ARTIFACT", puffery: "PUFFERY",
  comparative: "COMPARATIVE", evaluative: "EVAL-CANDIDATE",
}

const SCANNABLE = new Set(["paragraph", "list_item", "heading", "table_cell"])

export function scan(text, { tier, lang, langMap = [], tierMap = [], packs = {} }) {
  const blocks = splitBlocks(text)
  const tiers = resolveTiers(blocks, { tier, tierMap, source: text })
  const langOf = new Map(langMap.map((e) => [e.block, e.lang]))

  const blockInfo = blocks.map((b) => {
    const l = langOf.get(b.index) ?? lang ?? null
    const t = tiers.get(b.index)
    const info = { index: b.index, tier: t.tier, lang: l, kind: b.kind, tier_source: t.tier_source }
    if (b.children) info.children = b.children
    if (b.parent !== undefined) info.parent = b.parent
    return info
  })

  const findings = []
  let lexicalRan = false
  const perList = Object.fromEntries(LIST_PRIORITY.map((k) => [k, 0]))
  let runMax = 0
  let runRan = false

  for (const b of blocks) {
    if (!SCANNABLE.has(b.kind) || b.text === "") continue
    const info = blockInfo[b.index]
    const pack = info.lang ? packs[info.lang] : undefined
    if (!pack) continue
    lexicalRan = true
    runRan = true

    const blockHasData = hasDataToken(b.text, pack)
    for (const m of matchLists(b.text, pack, b.span[0])) {
      perList[m.list]++
      const f = {
        rule: `${info.lang.toUpperCase()}-${RULE_OF_LIST[m.list]}`,
        span: m.span, text: m.text, lang: info.lang, block: b.index, tier: info.tier,
      }
      if (m.list === "evaluative") f.block_has_data = blockHasData
      findings.push(f)
    }

    const run = sameShapeRun(splitSentences(b.text, pack.abbreviations ?? []), pack)
    if (run > runMax) runMax = run
  }

  const dashes = countDashes(blocks)
  for (const d of dashes.findings) {
    findings.push({
      rule: "CORE-DASH", span: d.span, text: d.text,
      lang: blockInfo[d.block]?.lang ?? null, block: d.block, tier: tiers.get(d.block).tier,
    })
  }

  const primaryAbbr = (lang && packs[lang]?.abbreviations) ?? []
  findings.sort((a, b) => a.span[0] - b.span[0])

  return {
    counted: {
      dash: dashes.count,
      banlist: lexicalRan ? perList.banlist : null,
      mt_artifacts: lexicalRan ? perList.mt_artifacts : null,
      puffery: lexicalRan ? perList.puffery : null,
      comparative: lexicalRan ? perList.comparative : null,
      eval_candidate: lexicalRan ? perList.evaluative : null,
      same_shape_run: runRan ? runMax : null,
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
    const r = parsePack(readFileSync(new URL(file, base), "utf8"))
    if (r.ok) out[code] = r.pack
  }
  return out
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2)
  const get = (flag) => { const i = argv.indexOf(flag); return i === -1 ? undefined : argv[i + 1] }
  const file = argv[argv.length - 1]
  const langMapPath = get("--lang-map")
  const result = scan(readFileSync(file, "utf8"), {
    tier: get("--tier") ?? "P",
    lang: get("--lang"),
    langMap: langMapPath ? JSON.parse(readFileSync(langMapPath, "utf8")) : [],
    packs: loadPacks(),
  })
  console.log(JSON.stringify(result, null, 2))
}
```

- [ ] **Step 4: Write the four mechanical fixtures**

`basic-vi.md` exercises banlist, puffery, evaluative and one em dash.
`lowercase-next.md` has a sentence whose successor starts lowercase, required by spec section 10.
`emoji-diacritics.md` contains an emoji outside the basic plane and heavily accented Vietnamese, to pin the UTF-16 offset convention.
`outside-cwd.md` is a copy of `basic-vi.md`; Task 17 runs the scanner against it from `/tmp`.

Each `.expect.json` has the shape `{ "tier": "R", "lang": "vi", "counted": {...nine keys}, "rules": [...] }`. Generate the first draft by running the scanner, then read every number and confirm it by hand before committing. A fixture copied from buggy output pins the bug.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/`
Expected: PASS, all suites

- [ ] **Step 6: Commit**

```bash
git add bin/scan.mjs tests/scan.test.mjs tests/fixtures/mechanical tests/fixtures/packs/vi-min.json
git commit -m "feat(scan): assemble scanner, nine counted keys and CLI"
```

---

### Task 10: Vietnamese language pack

**Files:**
- Create: `references/vi.md`

**Interfaces:**
- Consumes: `PACK_SCHEMA` from Task 2.
- Produces: `references/vi.md` with the eight prose sections plus one valid `json antislop-pack` block, passing `node bin/validate-pack.mjs --all`.

- [ ] **Step 1: Write the eight prose sections**

In order, per spec section 6.2: Metadata, Ban list, Cụm công thức, Dấu vết dịch máy, Xưng hô theo tier, Tiểu từ theo mức, Nhịp câu, Từ khoá tier.

Section 1 records `lang: vi`, `nhãn: cộng đồng`, `cadence_band: chưa hiệu chỉnh`.
Section 7 holds the opener class table and the tack-on list explanation, and states the cadence band is unmeasured, so the substitute test is `same_shape_run >= 3`.

Each section explains its group and gives examples. **No section lists tokens.** The JSON block is the only place tokens live.

- [ ] **Step 2: Write the pack block**

Populate from spec section 6.5 plus the four-list table in 6.2:

- `banlist`: đóng vai trò quan trọng trong việc, không chỉ, góp phần, trong thời đại số hoá ngày nay, trong bối cảnh, tóm lại, nhìn chung, hy vọng bài viết mang lại
- `puffery`: đột phá, tiên phong, hàng đầu, vượt trội, toàn diện, đẳng cấp, đáp ứng mọi nhu cầu, giải pháp toàn diện
- `comparative`: hơn, gấp, vượt, nhất, số một, đứng đầu
- `evaluative`: tốt, kém, hiệu quả, mạnh, yếu, chậm, nhanh, ổn, tệ, đáng kể, rõ rệt, tích cực, tiêu cực, hợp lý, chưa tối ưu, tận tâm, chuyên nghiệp
- `mt_artifacts`: được thực hiện bởi, nơi mà, điều mà, một trong những
- `abbreviations`: v.v., TP., Tp., ThS., TS., PGS., Q., tr.
- `openers.dai_tu`: tôi, chúng tôi, bạn, anh chị, quý khách, bên mình, họ, mình
- `openers.lien_tu`: nhưng, và, tuy nhiên, vì vậy, ngoài ra, do đó, song, thế nhưng
- `openers.trang_ngu`: trong, sau khi, khi, nếu, dù, với, theo, từ, để, trước khi
- `tackon`: góp phần, mang lại, nhằm, qua đó, từ đó, giúp cho
- `config_tokens`: campaign, ad group, ad set, keyword, bidding, pixel, tracking, conversion, audience, placement, landing page
- `loanwords`: ROAS, CPA, CPC, CPM, CTR, remarketing, prospecting, audience, creative, funnel, insight, brief
- `cadence_band`: `null`
- `tier_keywords.R`: báo cáo, audit, phân tích, tổng kết, performance, số liệu
- `tier_keywords.P`: proposal, đề xuất, kế hoạch, plan, SoW, roadmap, báo giá, pitch
- `tier_keywords.C`: caption, post, ad copy, content, email marketing, landing, tagline, blog

- [ ] **Step 3: Validate**

Run: `node bin/validate-pack.mjs --all`
Expected: `OK    vi.md`, and an ERROR line for `en.md` because it does not exist yet.

- [ ] **Step 4: Confirm the scanner loads it**

Run: `node bin/scan.mjs --tier R --lang vi tests/fixtures/mechanical/basic-vi.md`
Expected: JSON on stdout with nine `counted` keys and no `null` among the lexical ones.

- [ ] **Step 5: Commit**

```bash
git add references/vi.md
git commit -m "feat(vi): Vietnamese language pack at community label"
```

---

### Task 11: English language pack

**Files:**
- Create: `references/en.md`

**Interfaces:**
- Consumes: `PACK_SCHEMA` from Task 2.
- Produces: `references/en.md`, same eight sections, `cadence_band: [17, 23]`.

- [ ] **Step 1: Write the eight prose sections**

Section 1 records `lang: en`, `nhãn: cộng đồng`. Section 7 states that `[17, 23]` is inherited from `adenaufal/anti-slop-writing` and is **not** a measurement taken by this repo, so the pack stays at the community label.

- [ ] **Step 2: Write the pack block**

- `banlist`: in today's world, in today's fast-paced world, in the ever-evolving landscape of, as we navigate the complexities of, in conclusion, in summary, it is important to note that, at the end of the day, without further ado, last but not least, plays a crucial role in shaping, not only
- `puffery`: groundbreaking, cutting-edge, world-class, best-in-class, unparalleled, revolutionary, seamless, comprehensive, transformative
- `comparative`: better, best, more, most, leading, top, outperforms, superior
- `evaluative`: good, poor, effective, strong, weak, slow, fast, solid, significant, notable, positive, negative, suboptimal
- `mt_artifacts`: [] (English is the source language for this repo's tooling)
- `abbreviations`: e.g., i.e., etc., Inc., Ltd., vs., Dr., Mr., Ms., St.
- `openers.dai_tu`: we, i, you, they, it, our
- `openers.lien_tu`: but, and, however, therefore, moreover, so, yet, still
- `openers.trang_ngu`: in, after, when, if, although, with, by, from, to, before
- `tackon`: thereby, thus enabling, helping to, underscoring, highlighting, ensuring
- `config_tokens`: campaign, ad group, ad set, keyword, bidding, pixel, tracking, conversion, audience, placement, landing page
- `loanwords`: []
- `cadence_band`: `[17, 23]`
- `tier_keywords.R`: report, audit, analysis, recap, performance, metrics
- `tier_keywords.P`: proposal, plan, SoW, roadmap, quote, pitch
- `tier_keywords.C`: caption, post, ad copy, content, email, landing, tagline, blog

- [ ] **Step 3: Validate both packs**

Run: `node bin/validate-pack.mjs --all`
Expected: `OK    vi.md` and `OK    en.md`, exit 0

- [ ] **Step 4: Commit**

```bash
git add references/en.md
git commit -m "feat(en): English language pack at community label"
```

---

### Task 12: core.md

**Files:**
- Create: `references/core.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `references/core.md`, language-neutral, containing every rule ID prefixed `CORE-`.

- [ ] **Step 1: Write core.md**

Contents, per spec sections 3 and 5.1, containing **no token from any language**:

1. Tier definitions R, P, C with the puffery condition table from spec 3.1.
2. The tier decision table from spec 3.2, referencing `tier_keywords` in the pack rather than listing keywords.
3. The override mapping table and the four-level precedence from spec 3.2.
4. The three levels from spec 3.3, and the statement that level 1 is a failure state rather than a setting.
5. The declaration line format from spec 3.4.
6. Block definition from spec 3.0, including the table parent and child rule.
7. Structural rules from adenaufal, each with a `CORE-` ID: `CORE-CADENCE`, `CORE-RULE-OF-THREE`, `CORE-NEG-PARALLEL`, `CORE-FALSE-RANGE`, `CORE-TACKON`, `CORE-FORMULAIC-END`, `CORE-PARA-RHYTHM`, `CORE-BOLD-LIST`, `CORE-DASH`, `CORE-SENT-TYPE`, `CORE-PARA-PREDICT`, `CORE-SYNTAX-DEPTH`, `CORE-FUNCTION-WORDS`, `CORE-LEXICAL-DIVERSITY`, `CORE-BIMODAL`, `CORE-FRAGMENTED-PARA`.
8. Model fingerprints from adenaufal EN-11, both the GPT and the Claude dialect, with the structural tells only. **No unsourced statistics.** Where the source gave a multiplier, state the direction without the number.
9. The four-part sentence DNA from EN-12, as `CORE-ARGUMENT-ARC`.

- [ ] **Step 2: Check core.md contains no language tokens**

Run: `node bin/scan.mjs --tier P --lang vi references/core.md | node -e "const r=JSON.parse(require('fs').readFileSync(0));console.log(r.counted)"`

Read the output. Hits on `banlist` or `puffery` mean `core.md` is quoting Vietnamese examples it should not contain. Move those examples into `vi.md`.

- [ ] **Step 3: Commit**

```bash
git add references/core.md
git commit -m "feat(core): language-neutral rule set with stable rule IDs"
```

---

### Task 13: evidence.md and false-positives.md

**Files:**
- Create: `references/evidence.md`
- Create: `references/false-positives.md`

**Interfaces:**
- Consumes: nothing.
- Produces: rule IDs `EVID-UNBACKED`, `EVID-PROVENANCE-UNKNOWN`, `EVID-SOURCE-UNKNOWN`, and the do-not-flag guard list used only by `antislop-check`.

- [ ] **Step 1: Write evidence.md**

From spec section 5.4 and the two provenance sub-sections of 3.1:

- The four kinds of verifiable fact, from spec 4.1.
- The backing definition: the fact must entail the adjective, not merely sit near it. Include the `Đội ngũ tận tâm, CPA 31$` counterexample and the one-line test (delete the adjective; does the remaining fact say it by itself).
- The per-tier scope table separating ordinary evaluation from puffery and comparative claims.
- The tier P distinction between claims about reality and statements of intent, with the four examples from spec 3.1.
- The comparator requirement for comparative and superlative claims.
- Provenance: `.antislop-claims.txt` for condition (b), and the three-outcome table for condition (a). State plainly that the third verdict is `chưa xác định`, that it is not a violation, and that it must be displayed on its own row.
- The open-class principle: the three word lists are a floor, not a gate. `antislop-check` scans semantically and independently, and reports what it finds beyond the lists as `*-EVID-UNBACKED`, `*-PUFFERY-UNLISTED`, `*-COMPARATIVE-UNLISTED`.

- [ ] **Step 2: Write false-positives.md**

Port the two lists from `blader/humanizer`, translated and adapted:

- Twelve do-not-flag items: polished grammar, mixed register, dry prose, formal vocabulary, letter-style openings and closings, isolated transition words, curly quotes alone, an isolated em dash in a quoted source, a single short emphatic sentence, "honestly" used mid-sentence, unsourced claims in informal text, correct complex formatting.
- Seven signs of human writing to preserve: specific hard-to-fabricate detail, mixed feelings and unresolved tension, era-bound references, defensible first-person editorial choices, varied sentence length, genuine asides and self-corrections, text written before 30 November 2022.
- The clustering principle: report a cluster of tells, never an isolated one.

Add one item the source lacks, specific to this repo: **a term in the pack's `loanwords` is never a finding**, even when it looks like puffery in the other language.

- [ ] **Step 3: Commit**

```bash
git add references/evidence.md references/false-positives.md
git commit -m "feat(rules): evidence discipline and false-positive guards"
```

---

### Task 14: antislop-write skill

**Files:**
- Create: `skills/antislop-write/SKILL.md`

**Interfaces:**
- Consumes: everything in `references/`; the `LAYOUT` decision from Task 1.
- Produces: the declaration line format `[<TIER> · mức <N> · <giọng> · <lang>]` that Task 17's canary probe greps for.

- [ ] **Step 1: Write the frontmatter**

```yaml
---
name: antislop-write
description: Write marketing reports, plans and content in Vietnamese or English without AI writing tells, keeping professional and marketing vocabulary intact. Use when writing or drafting a report, audit, proposal, plan, SoW, quote, ad copy, caption, email or landing page copy.
---
```

- [ ] **Step 2: Write the body**

Sections, in order:

1. **Load first.** The `references/` table from spec section 2, keyed by tier and language. Use the path form decided in Task 1.
2. **Infer the tier** using the decision table, then the language using spec section 4.2. Emphasise that the language of the request never decides; for writing, an explicit instruction wins, then the source document, then the conversation as a last resort.
3. **Print the declaration line, then continue.** No question, no waiting.
4. **Minimum input and missing data**, from spec 4.1: the absolute rule against inventing facts, the four kinds of fact, the per-tier minimum, the three escalation levels, the `[cần ...]` label format, and the `[ví dụ]` rule for illustrative numbers.
5. **Write, then self-check silently.** Only the final text is printed unless the user asks for the draft.
6. **The tier-specific checklist**, drawn from `core.md` plus the loaded language pack.

Keep the file under about 140 lines. Detail belongs in `references/`, not here.

- [ ] **Step 3: Manual smoke test**

```bash
cd /tmp && claude -p "Viết báo cáo hiệu quả quảng cáo tháng 6 cho tôi. CPA 47 đô, mục tiêu 35 đô, ROAS 3.4, mục tiêu 2.8."
```

Confirm three things: a declaration line appears and reads `[R · mức 2 · trang trọng · vi]`; the output contains no em dash; every evaluative adjective is next to a number.

- [ ] **Step 4: Commit**

```bash
git add skills/antislop-write/SKILL.md
git commit -m "feat(skill): antislop-write generation entry point"
```

---

### Task 15: antislop-check skill

**Files:**
- Create: `skills/antislop-check/SKILL.md`

**Interfaces:**
- Consumes: `references/`, and `bin/scan.mjs` via the path decided in Task 1.
- Produces: the human table from spec 8.1 and, when the request contains the word `json`, a trailing fenced ` ```json ` block with keys `tier`, `lang`, `counted_source`, `counted`, `findings_mechanical`, `findings_judged`, `judged`.

- [ ] **Step 1: Write the frontmatter**

```yaml
---
name: antislop-check
description: Audit an existing document for AI writing tells and unbacked claims, in Vietnamese or English, and rewrite it on request. Use when asked to review, check, audit or clean up existing copy, a report, a proposal or ad text.
---
```

- [ ] **Step 2: Write the body**

1. **Run the scanner first.** Resolve `bin/scan.mjs` relative to this skill's own directory, not the working directory. Copy `counted` verbatim and set `counted_source` to `"scan"`. If Node is unavailable, count by reading, set `"model"`, and label the numbers as estimates in the human table.
2. **Copy `findings_mechanical` verbatim.** Not one code, span or text may be altered.
3. **Then judge, independently.** Read the whole document. The three word lists are a floor; find evaluative claims, strong marketing claims and comparatives that the lists missed, and report them in `findings_judged`.
4. **Apply `false-positives.md` before reporting.** Look for clusters, not isolated tells.
5. **The three verdicts.** `đạt`, `vi phạm`, `chưa xác định`. The third is not a violation and gets its own row.
6. **Output format.** The human table from spec 8.1, then the JSON block only when the request says `json`.

- [ ] **Step 3: Manual smoke test on a known-bad document**

Write a scratch file containing three em dashes, `đóng vai trò quan trọng trong việc`, and `Đội ngũ tận tâm, CPA 31$`. Then:

```bash
cd /tmp && claude -p "Soát file /tmp/bad.md giúp tôi, xuất json"
```

Confirm: `counted_source` is `"scan"`; `counted.dash` is 3; `findings_judged` contains an `EVID-UNBACKED` for `tận tâm`.

- [ ] **Step 4: Commit**

```bash
git add skills/antislop-check/SKILL.md
git commit -m "feat(skill): antislop-check audit entry point"
```

---

### Task 16: Plugin manifests for both marketplaces

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.codex-plugin/plugin.json`

**Interfaces:**
- Consumes: the two skill directories.
- Produces: installable plugin for `/plugin marketplace add` and `codex plugin marketplace add`.

- [ ] **Step 1: Finalise the Claude plugin manifest**

Replace the probe entry with both real skills:

```json
{
  "name": "antislop-marketing",
  "description": "Write and audit marketing reports, plans and content without AI writing tells, in Vietnamese and English.",
  "version": "1.0.0",
  "author": { "name": "HDShinobi", "url": "https://github.com/HDShinobi" },
  "homepage": "https://github.com/HDShinobi/antislop-marketing",
  "repository": "https://github.com/HDShinobi/antislop-marketing",
  "license": "MIT",
  "keywords": ["writing", "marketing", "reports", "vietnamese", "anti-slop", "ai-writing"],
  "skills": ["./skills/antislop-write", "./skills/antislop-check"]
}
```

- [ ] **Step 2: Write the Claude marketplace manifest**

```json
{
  "name": "antislop-marketing",
  "id": "antislop-marketing",
  "owner": { "name": "HDShinobi" },
  "metadata": {
    "description": "Anti-AI-slop writing for marketing work, Vietnamese and English.",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "antislop-marketing",
      "source": "./",
      "description": "Write and audit marketing reports, plans and content without AI writing tells.",
      "version": "1.0.0",
      "author": { "name": "HDShinobi" },
      "keywords": ["writing", "marketing", "vietnamese", "anti-slop"],
      "category": "productivity"
    }
  ]
}
```

- [ ] **Step 3: Write the Codex plugin manifest**

Same fields as the Claude one, plus `"skills": "./skills/"` in place of the array, plus:

```json
"interface": {
  "displayName": "Antislop Marketing",
  "shortDescription": "Marketing writing without AI tells, Vietnamese and English",
  "longDescription": "Writes reports, plans and marketing content that keep professional vocabulary while dropping the structural patterns that read as machine output. Audits existing documents and reports what is mechanically countable separately from what needs judgement.",
  "developerName": "HDShinobi",
  "category": "Productivity",
  "capabilities": ["Interactive", "Read", "Write"],
  "defaultPrompt": [
    "Viết báo cáo hiệu quả quảng cáo tháng này",
    "Soát lại bản proposal này giúp tôi"
  ],
  "websiteURL": "https://github.com/HDShinobi/antislop-marketing"
}
```

- [ ] **Step 4: Install from both marketplaces and verify**

```bash
claude
# /plugin marketplace add ~/Projects/antislop-marketing
# /plugin install antislop-marketing@antislop-marketing

codex plugin marketplace add ~/Projects/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

Confirm both skills appear in each harness's skill list.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin .codex-plugin
git commit -m "feat(pkg): Claude Code and Codex plugin manifests"
```

---

### Task 17: Tier-2 fixture runner

Blocking item 3 from spec section 12 is resolved inside this task: the exact local install and uninstall commands get pinned by making them work.

**Files:**
- Create: `tests/fixtures.mjs`
- Create: `tests/fixtures/judged/unbacked-vi.md` and `.expect.json`
- Create: `tests/fixtures/judged/clean-vi.md` and `.expect.json`
- Create: `docs/superpowers/notes/headless-install.md`

**Interfaces:**
- Consumes: both skills, `bin/scan.mjs`.
- Produces: `npm run test:fixtures`, not wired into CI.

- [ ] **Step 1: Write the two judged fixtures**

`unbacked-vi.md` contains `Đội ngũ tận tâm.` standing alone in its own paragraph, with no data token anywhere in the block, and `Tốt nhất thị trường.` with no comparison set.
Its `.expect.json`:

```json
{
  "tier": "R", "lang": "vi",
  "must_flag": ["EVID-UNBACKED", "VI-COMPARATIVE-UNLISTED"],
  "must_not_flag": ["EVID-PROVENANCE-UNKNOWN"]
}
```

`clean-vi.md` is a short report where every evaluative word sits next to a number.
Its `.expect.json` has an empty `must_flag` and `must_not_flag: ["EVID-UNBACKED"]`.

Only unambiguous cases go here. If choosing the expectation takes more than a few seconds of thought, the sample belongs in `examples/` instead.

- [ ] **Step 2: Write the runner**

`tests/fixtures.mjs`:

```js
import { readFileSync, readdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { scan, loadPacks } from "../bin/scan.mjs"

const RUNNER = process.env.ANTISLOP_RUNNER ?? "claude"
const CANARY = /\[\s*[RPC]\s*·/

function ask(prompt) {
  const [cmd, args] = RUNNER === "codex" ? ["codex", ["exec", prompt]] : ["claude", ["-p", prompt]]
  return execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
}

function lastJsonBlock(out) {
  const blocks = [...out.matchAll(/```json\s*([\s\S]*?)```/g)]
  if (blocks.length === 0) throw new Error("no fenced json block in agent output")
  return JSON.parse(blocks[blocks.length - 1][1])
}

console.log(`runner: ${RUNNER}`)
console.log("canary: checking the skill is actually loaded")
const canary = ask("Dùng antislop-write. Viết đúng một câu về CPA tháng này là 31 đô. In dòng khai báo tier.")
if (!CANARY.test(canary)) {
  console.error("CANARY FAILED. The skill is not loaded in this harness. Not running fixtures.")
  console.error(canary.slice(0, 500))
  process.exit(2)
}
console.log("canary: ok")

let failed = 0
const dir = new URL("./fixtures/judged/", import.meta.url)
for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
  const path = new URL(name, dir).pathname
  const exp = JSON.parse(readFileSync(new URL(name.replace(/\.md$/, ".expect.json"), dir), "utf8"))
  const src = readFileSync(path, "utf8")

  const local = scan(src, { tier: exp.tier, lang: exp.lang, packs: loadPacks() })
  const got = lastJsonBlock(ask(`Dùng antislop-check trên file ${path}. Xuất json.`))

  const problems = []
  if (got.counted_source !== "scan") problems.push(`counted_source=${got.counted_source}, expected "scan"`)
  for (const k of Object.keys(local.counted)) {
    if (JSON.stringify(got.counted?.[k]) !== JSON.stringify(local.counted[k])) {
      problems.push(`counted.${k}: agent ${JSON.stringify(got.counted?.[k])} vs scan ${JSON.stringify(local.counted[k])}`)
    }
  }
  if (JSON.stringify(got.findings_mechanical) !== JSON.stringify(local.findings)) {
    problems.push("findings_mechanical is not a verbatim copy of scan output")
  }
  const judged = new Set((got.findings_judged ?? []).map((f) => f.rule))
  for (const r of exp.must_flag) if (!judged.has(r)) problems.push(`must_flag missing: ${r}`)
  for (const r of exp.must_not_flag) if (judged.has(r)) problems.push(`must_not_flag present: ${r}`)

  if (problems.length) { failed++; console.error(`FAIL ${name}`); for (const p of problems) console.error(`  ${p}`) }
  else console.log(`PASS ${name}`)
}
process.exit(failed ? 1 : 0)
```

- [ ] **Step 3: Add the npm script**

In `package.json`, add `"test:fixtures": "node tests/fixtures.mjs"`.

- [ ] **Step 4: Run it against both backends**

```bash
ANTISLOP_RUNNER=claude node tests/fixtures.mjs
ANTISLOP_RUNNER=codex  node tests/fixtures.mjs
```

- [ ] **Step 5: Record the install and uninstall commands**

Write `docs/superpowers/notes/headless-install.md` with the exact commands that made the canary pass on each backend, and the matching uninstall commands. This is the deliverable for blocking item 3.

- [ ] **Step 6: Commit**

```bash
git add tests/fixtures.mjs tests/fixtures/judged package.json docs/superpowers/notes/headless-install.md
git commit -m "test: tier-2 fixture runner with canary probe and verbatim-copy check"
```

---

### Task 18: Examples, self-scan and CI

**Files:**
- Create: `examples/report-vi.md`, `examples/proposal-vi.md`, `examples/caption-vi.md`, `examples/report-en.md`
- Create: `tests/scan-manifest.json`
- Create: `tests/selfscan.test.mjs`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `scan` from Task 9, both packs.
- Produces: a CI job that fails on any em dash or banlist hit in the repo's own prose.

- [ ] **Step 1: Write the four examples**

Each is a before and after pair with a short note explaining which rules fired. `report-vi.md` uses tier R and shows the evidence rule. `caption-vi.md` uses tier C and shows puffery allowed with backing. The **after** halves must themselves pass the scan.

- [ ] **Step 2: Write the manifest**

`tests/scan-manifest.json`:

```json
[
  { "file": "README.md",              "tier": "P", "lang": "en" },
  { "file": "README.vi.md",           "tier": "P", "lang": "vi" },
  { "file": "CONTRIBUTING.md",        "tier": "P", "lang": "en" },
  { "file": "examples/report-vi.md",  "tier": "R", "lang": "vi" },
  { "file": "examples/proposal-vi.md","tier": "P", "lang": "vi" },
  { "file": "examples/caption-vi.md", "tier": "C", "lang": "vi" },
  { "file": "examples/report-en.md",  "tier": "R", "lang": "en" }
]
```

- [ ] **Step 3: Write the self-scan test**

`tests/selfscan.test.mjs`:

```js
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { scan } from "../bin/scan.mjs"
import { parsePack } from "../bin/lib/pack.mjs"

const root = new URL("../", import.meta.url)
const refs = new URL("references/", root)
const registry = JSON.parse(readFileSync(new URL("languages.json", refs), "utf8"))
const packs = Object.fromEntries(
  Object.entries(registry).map(([c, f]) => [c, parsePack(readFileSync(new URL(f, refs), "utf8")).pack])
)
const manifest = JSON.parse(readFileSync(new URL("tests/scan-manifest.json", root), "utf8"))

test("every scanned file is listed in the manifest", () => {
  const listed = new Set(manifest.map((m) => m.file))
  for (const f of readdirSync(new URL("examples/", root))) {
    assert.ok(listed.has(`examples/${f}`), `examples/${f} is missing from scan-manifest.json`)
  }
})

for (const entry of manifest) {
  test(`self-scan: ${entry.file}`, () => {
    const src = readFileSync(new URL(entry.file, root), "utf8")
    const r = scan(src, { tier: entry.tier, lang: entry.lang, packs })
    assert.equal(r.counted.dash, 0, `${entry.file} contains em or en dashes`)
    assert.equal(r.counted.banlist, 0, `${entry.file} contains banlist phrases`)
  })
}
```

- [ ] **Step 4: Run it and fix what it finds**

Run: `node --test tests/selfscan.test.mjs`

Fix the prose until it passes. Do not weaken the assertions.

- [ ] **Step 5: Write the CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: node bin/validate-pack.mjs --all
      - run: node --test tests/
```

Tier 2 is deliberately absent: it calls a model, costs money and is not deterministic.

- [ ] **Step 6: Commit**

```bash
git add examples tests/scan-manifest.json tests/selfscan.test.mjs .github/workflows/ci.yml
git commit -m "test: examples, self-scan manifest and CI"
```

---

### Task 19: README, NOTICE, LICENSE, CONTRIBUTING

**Files:**
- Create: `README.md`, `README.vi.md`, `NOTICE`, `LICENSE`, `CONTRIBUTING.md`

**Interfaces:**
- Consumes: everything.
- Produces: an installable, documented public repo.

- [ ] **Step 1: Write LICENSE and NOTICE**

`LICENSE` is the MIT text, copyright 2026 HDShinobi.

`NOTICE`:

```
antislop-marketing includes material derived from two MIT-licensed projects.

adenaufal/anti-slop-writing  https://github.com/adenaufal/anti-slop-writing
  Structural rules, per-model fingerprints, and the tone-tier concept from the
  Indonesian pack. Adapted. This repo drops that project's anti-detector rules
  (T-1 to T-5), its deliberate-imperfection rules, and every statistic it
  reported without a citable source.

blader/humanizer  https://github.com/blader/humanizer
  The do-not-flag list and the signs-of-human-writing list, both in
  references/false-positives.md. Adapted and translated.

Both projects are MIT licensed. Their license text is reproduced in
LICENSE-THIRD-PARTY.
```

Create `LICENSE-THIRD-PARTY` with both upstream MIT texts.

- [ ] **Step 2: Write README.md**

Sections: what it does, what it deliberately does not do (the four out-of-scope items from spec section 1), install for Claude Code and for Codex, the three tiers in one table, an example before and after, what was taken from upstream and what was dropped with the reason, the language pack status table with both packs at `community`, and how to add a language.

Keep every claim backed. This file is scanned by CI at tier P.

- [ ] **Step 3: Write README.vi.md**

Same structure in Vietnamese. Scanned at tier P with the `vi` pack.

- [ ] **Step 4: Write CONTRIBUTING.md**

The language pack template: the eight prose section headings, and an empty `json antislop-pack` block with every one of the thirteen keys present and empty. Plus the three status labels and what each requires, and the instruction to run `node bin/validate-pack.mjs --all` before opening a pull request.

- [ ] **Step 5: Run the full suite**

Run: `node bin/validate-pack.mjs --all && node --test tests/`
Expected: all green, including the self-scan of both READMEs and CONTRIBUTING.md.

- [ ] **Step 6: Commit and tag**

```bash
git add README.md README.vi.md NOTICE LICENSE LICENSE-THIRD-PARTY CONTRIBUTING.md
git commit -m "docs: bilingual README, attribution and language pack contributor guide"
git tag v1.0.0
```

---

## Post-v1, not in this plan

From spec section 11 and 12:

- Measure the Vietnamese cadence band, fill `cadence_band` in `vi.md`, raise the pack from `community` to `calibrated`.
- v1.1: Cursor and Antigravity. Both need one flat file with every rule inlined, so they need `scripts/build.mjs` plus a CI check that rebuilds and diffs.
- v1.2: further language packs. `th.md` is the nearest candidate.
