import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { extractPackBlock, parsePack, PACK_SCHEMA } from "../bin/lib/pack.mjs"

const read = (n) => readFileSync(new URL(`./fixtures/packs/${n}.md`, import.meta.url), "utf8")

test("extracts the fenced antislop-pack block", () => {
  const raw = extractPackBlock(read("valid"))
  assert.equal(typeof raw, "string")
  assert.equal(JSON.parse(raw).lang, "xx")
})

test("returns null when there is no pack block", () => {
  assert.equal(extractPackBlock("# just prose\n\nno block here\n"), null)
})

test("two pack blocks is an error, not a first-wins", () => {
  const r = parsePack(read("duplicate-block"))
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes("exactly one")))
})

test("a valid pack parses", () => {
  const r = parsePack(read("valid"))
  assert.equal(r.ok, true, JSON.stringify(r.errors))
  assert.equal(r.pack.lang, "xx")
})

test("empty arrays and an empty exceptions object are valid", () => {
  const r = parsePack(read("valid"))
  assert.deepEqual(r.pack.comparative, [])
  assert.deepEqual(r.pack.exceptions, {})
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
  assert.equal(r.ok, true, JSON.stringify(r.errors))
  assert.ok(r.warnings.some((w) => w.includes("nonsense_field")))
})

test("lang must match its languages.json key", () => {
  assert.equal(parsePack(read("valid"), "xx").ok, true)
  const bad = parsePack(read("valid"), "vi")
  assert.equal(bad.ok, false)
  assert.ok(bad.errors.some((e) => e.includes("does not match")))
})

test("the schema has exactly fourteen keys", () => {
  assert.equal(Object.keys(PACK_SCHEMA).length, 14)
})

test("cadence_band is not part of the schema", () => {
  assert.equal("cadence_band" in PACK_SCHEMA, false)
})
