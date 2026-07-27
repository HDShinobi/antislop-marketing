// Reads and validates the single fenced `json antislop-pack` block that every
// language pack carries. Spec section 6.2.
//
// JSON, not YAML: Node has JSON.parse built in, and bin/ takes no dependencies.

export const PACK_SCHEMA = {
  lang:          { type: "string", empty: false },
  banlist:       { type: "string[]" },
  mt_artifacts:  { type: "string[]" },
  superlative:   { type: "string[]" },
  puffery:       { type: "string[]" },
  comparative:   { type: "string[]" },
  evaluative:    { type: "string[]" },
  abbreviations: { type: "string[]" },
  exceptions:    { type: "freeobject", of: "string[]" },
  openers:       { type: "object", keys: ["dai_tu", "lien_tu", "trang_ngu"] },
  tackon:        { type: "string[]" },
  config_tokens: { type: "string[]" },
  loanwords:     { type: "string[]" },
  tier_keywords: { type: "object", keys: ["R", "P", "C"] },
}

const FENCE = /^```json\s+antislop-pack\s*$/

// Spec 6.2 says a pack holds EXACTLY one such block. Two is an error rather
// than a silent first-wins, which would let a stale block sit unnoticed.
export function extractPackBlock(markdown) {
  const lines = markdown.split("\n")
  const starts = []
  lines.forEach((l, i) => { if (FENCE.test(l)) starts.push(i) })
  if (starts.length === 0) return null
  if (starts.length > 1) return { duplicate: starts.length }
  const end = lines.indexOf("```", starts[0] + 1)
  if (end === -1) return null
  return lines.slice(starts[0] + 1, end).join("\n")
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

    // Fixed key set, every value an array of strings.
    case "object": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        errors.push(`${name}: expected object`)
        break
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

    // Keys are data (the terms being excepted), so only values are checked.
    case "freeobject": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        errors.push(`${name}: expected object`)
        break
      }
      for (const [k, v] of Object.entries(value)) {
        if (!isStringArray(v)) errors.push(`${name}.${k}: expected array of strings`)
      }
      break
    }
  }
}

/**
 * @param {string} markdown       full text of the pack file
 * @param {string} [expectedLang] the key this pack is registered under in
 *                                languages.json; when given, pack.lang must match
 */
export function parsePack(markdown, expectedLang) {
  const raw = extractPackBlock(markdown)
  if (raw === null) {
    return { ok: false, errors: ["no fenced json antislop-pack block found"], warnings: [] }
  }
  if (typeof raw === "object") {
    return {
      ok: false,
      errors: [`expected exactly one antislop-pack block, found ${raw.duplicate}`],
      warnings: [],
    }
  }

  let pack
  try {
    pack = JSON.parse(raw)
  } catch (e) {
    return { ok: false, errors: [`pack block is not valid JSON: ${e.message}`], warnings: [] }
  }

  const errors = []
  const warnings = []

  for (const [name, spec] of Object.entries(PACK_SCHEMA)) {
    checkField(name, spec, pack[name], errors)
  }

  // Unknown keys are tolerated so a pack can experiment, but never silently.
  for (const k of Object.keys(pack)) {
    if (!(k in PACK_SCHEMA)) warnings.push(`unknown key ignored: ${k}`)
  }

  if (expectedLang !== undefined && pack.lang !== expectedLang) {
    errors.push(`lang: "${pack.lang}" does not match its languages.json key "${expectedLang}"`)
  }

  return errors.length ? { ok: false, errors, warnings } : { ok: true, pack, warnings }
}
