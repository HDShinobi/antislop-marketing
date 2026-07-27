#!/usr/bin/env node
// Validates language packs against PACK_SCHEMA. Runs in CI over every pack
// registered in references/languages.json.
//
//   node bin/validate-pack.mjs --all
//   node bin/validate-pack.mjs path/to/pack.md

import { readFileSync } from "node:fs"
import { parsePack } from "./lib/pack.mjs"

const refs = new URL("../references/", import.meta.url)
const argv = process.argv.slice(2)
const all = argv.includes("--all")

const registry = JSON.parse(readFileSync(new URL("languages.json", refs), "utf8"))
const langOfFile = Object.fromEntries(Object.entries(registry).map(([code, file]) => [file, code]))

const files = all ? Object.values(registry) : argv.filter((a) => !a.startsWith("--"))

if (files.length === 0) {
  console.error("usage: validate-pack.mjs --all | <pack.md>...")
  process.exit(2)
}

let failed = false

for (const f of files) {
  const url = all ? new URL(f, refs) : new URL(f, `file://${process.cwd()}/`)

  let text
  try {
    text = readFileSync(url, "utf8")
  } catch {
    failed = true
    console.error(`ERROR ${f}: not found`)
    continue
  }

  const result = parsePack(text, langOfFile[f])

  for (const w of result.warnings ?? []) console.warn(`WARN  ${f}: ${w}`)

  if (result.ok) {
    console.log(`OK    ${f}`)
  } else {
    failed = true
    for (const e of result.errors) console.error(`ERROR ${f}: ${e}`)
  }
}

process.exit(failed ? 1 : 0)
