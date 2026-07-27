// Validates the json block antislop-check emits, against
// schema/check-output.schema.json.
//
// The schema file is the single source of truth: consumers outside Node read
// it as ordinary JSON Schema, and this module walks the same file so the repo
// cannot drift from what it publishes. Writing the contract twice, once as
// JSON Schema and once as a hand-rolled check, is the exact failure this
// replaces.
//
// It interprets the subset the schema actually uses: $ref to a local $def,
// type, enum, required, properties, additionalProperties, items, prefixItems,
// minItems, maxItems, minimum, minLength, pattern. Anything else in a schema
// node is ignored rather than silently treated as satisfied, so
// assertSchemaIsSupported() exists to catch a keyword added later.

import { readFileSync } from "node:fs"

export const SCHEMA = JSON.parse(
  readFileSync(new URL("../../schema/check-output.schema.json", import.meta.url), "utf8"),
)

export const VERDICTS = SCHEMA.$defs.verdict.enum
export const TIERS = SCHEMA.$defs.tier.enum
export const JUDGED_KEYS = SCHEMA.$defs.judgedSummary.required
export const COUNTED_KEYS = SCHEMA.$defs.counted.required

const KNOWN = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description",
  "type", "enum", "required", "properties", "additionalProperties",
  "items", "prefixItems", "minItems", "maxItems", "minimum", "minLength", "pattern",
])

/** Throws if the schema grows a keyword this validator would quietly ignore. */
export function assertSchemaIsSupported(node = SCHEMA, at = "#") {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return
  for (const k of Object.keys(node)) {
    if (!KNOWN.has(k)) throw new Error(`${at}: unsupported schema keyword "${k}"`)
  }
  for (const k of ["properties", "$defs"]) {
    for (const [name, sub] of Object.entries(node[k] ?? {})) assertSchemaIsSupported(sub, `${at}/${k}/${name}`)
  }
  if (node.items) assertSchemaIsSupported(node.items, `${at}/items`)
  for (const [i, sub] of (node.prefixItems ?? []).entries()) assertSchemaIsSupported(sub, `${at}/prefixItems/${i}`)
}

function deref(node) {
  if (!node?.$ref) return node
  const path = node.$ref.replace(/^#\//, "").split("/")
  let cur = SCHEMA
  for (const seg of path) cur = cur?.[seg]
  if (cur === undefined) throw new Error(`unresolvable $ref: ${node.$ref}`)
  return cur
}

const typeOf = (v) => {
  if (v === null) return "null"
  if (Array.isArray(v)) return "array"
  if (Number.isInteger(v)) return "integer"
  return typeof v            // "number", "string", "boolean", "object"
}

const matchesType = (want, actual) =>
  want === actual || (want === "number" && actual === "integer")

function check(value, node, at, errors) {
  const s = deref(node)
  if (!s) return

  if (s.type !== undefined) {
    const wanted = Array.isArray(s.type) ? s.type : [s.type]
    const actual = typeOf(value)
    if (!wanted.some((w) => matchesType(w, actual))) {
      errors.push(`${at}: expected ${wanted.join(" or ")}, got ${actual}`)
      return   // every check below assumes the type held
    }
  }

  if (s.enum && !s.enum.includes(value)) {
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${s.enum.map((e) => JSON.stringify(e)).join(", ")}`)
  }
  if (typeof value === "number" && s.minimum !== undefined && value < s.minimum) {
    errors.push(`${at}: ${value} is below the minimum ${s.minimum}`)
  }
  if (typeof value === "string") {
    if (s.minLength !== undefined && value.length < s.minLength) errors.push(`${at}: must not be empty`)
    if (s.pattern !== undefined && !new RegExp(s.pattern, "u").test(value)) {
      errors.push(`${at}: ${JSON.stringify(value)} does not match ${s.pattern}`)
    }
  }

  if (Array.isArray(value)) {
    if (s.minItems !== undefined && value.length < s.minItems) errors.push(`${at}: needs at least ${s.minItems} items`)
    if (s.maxItems !== undefined && value.length > s.maxItems) errors.push(`${at}: allows at most ${s.maxItems} items`)
    for (const [i, sub] of (s.prefixItems ?? []).entries()) {
      if (i < value.length) check(value[i], sub, `${at}[${i}]`, errors)
    }
    if (s.items) {
      const from = (s.prefixItems ?? []).length
      for (let i = from; i < value.length; i++) check(value[i], s.items, `${at}[${i}]`, errors)
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const key of s.required ?? []) {
      if (!(key in value)) errors.push(`${at}: missing required key "${key}"`)
    }
    for (const [key, sub] of Object.entries(s.properties ?? {})) {
      if (key in value) check(value[key], sub, `${at}.${key}`, errors)
    }
    if (s.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in (s.properties ?? {}))) errors.push(`${at}: unknown key "${key}"`)
      }
    }
  }
}

/**
 * @param {unknown} value the parsed json block
 * @returns {{ok: boolean, errors: string[]}}
 */
export function validateCheckOutput(value) {
  const errors = []
  check(value, SCHEMA, "output", errors)
  return { ok: errors.length === 0, errors }
}
