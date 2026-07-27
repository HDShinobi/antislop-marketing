# Contributing

A new language pack is what this project needs. Adding one means adding one
file and one line. You never edit `core.md`.

## Adding a language

1. Copy the template below to `references/<code>.md`.
2. Add `"<code>": "<code>.md"` to `references/languages.json`.
3. Run `node bin/validate-pack.mjs --all`.
4. Open a pull request.

You do not need to read `core.md` to do this. The structural rules are already
language-neutral; your pack supplies only what is tied to your language.

## Status labels

Two, and the criterion is whether a native speaker has reviewed the pack. That
is the only thing that decides whether a pack is usable.

| Label | Condition |
|---|---|
| `soát rồi` | all eight sections present, and a native speaker who has read machine output in that language has reviewed the pack |
| `thử nghiệm` | a section is missing, or nobody has reviewed it |

Being complete is not enough. The hard part of a language pack is not the
structure, it is knowing which phrases actually give a machine away in that
language, and that requires someone who reads the language daily.

## The eight sections

In this order. Sections describe and explain; they never list tokens. Every
enforceable token lives in the JSON block, so the skill and the scanner can
never diverge.

1. **Metadata.** Language code, status label, who reviewed it and when.
2. **Ban list.** What each group of banned phrases targets, and why.
3. **Formulaic phrases.** Including any prose-only rules the scanner cannot
   count, each with a stable ID.
4. **Machine translation artifacts.** Constructions carried over from another
   language's sentence frame.
5. **Address by tier.** How the writer and the reader are named at R, P and C.
6. **Particles by level.** What level 3 unlocks that level 2 does not.
7. **Cadence.** The opener classes and the tack-on list. There is no
   sentence-length threshold in this project.
8. **Tier keywords.** Data for the decision table in `core.md`.

## The JSON block

Exactly one per pack, fenced as ` ```json antislop-pack `. Fourteen keys, all
required. An empty array is a statement that the language has nothing in that
group; a missing key is an omission and fails validation.

````markdown
```json antislop-pack
{
  "lang": "",
  "banlist": [],
  "mt_artifacts": [],
  "superlative": [],
  "puffery": [],
  "comparative": [],
  "evaluative": [],
  "abbreviations": [],
  "exceptions": {},
  "openers": { "dai_tu": [], "lien_tu": [], "trang_ngu": [] },
  "tackon": [],
  "config_tokens": [],
  "loanwords": [],
  "tier_keywords": { "R": [], "P": [], "C": [] }
}
```
````

### What goes in each list

| Key | Contents |
|---|---|
| `banlist` | never allowed, any tier |
| `mt_artifacts` | translation carry-over, never allowed |
| `superlative` | claims to be first or best. **Banned outright at tier C.** Say in your pack why that holds in your market: statute, platform policy, or a guardrail you chose. Vietnamese cites advertising law, English cites TikTok and Google and calls the rest a guardrail |
| `puffery` | strong marketing claims, allowed when backed |
| `comparative` | comparison markers, allowed when the comparator is named |
| `evaluative` | ordinary praise and criticism, needs backing at R and P, free at C |
| `abbreviations` | tokens ending in a period that must not end a sentence |
| `exceptions` | a term mapped to longer strings in which it must not match |
| `openers` | closed-class first words, for the cadence signature. The fifth class is a fallback and is never declared |
| `tackon` | words that open a tacked-on final clause |
| `config_tokens` | domain nouns that count as data tokens |
| `loanwords` | terms that must never be translated or reported |
| `tier_keywords` | words that identify a document type in your language |

### Exceptions matter more than you expect

Two groups end up here, and the second is the one that decides whether people
keep the tool switched on.

**Accidental collisions.** A short term inside a longer unrelated word.

**Fixed industry phrases.** In Vietnamese, `hiệu quả` is an evaluative word, but
`báo cáo hiệu quả` is the name of a document type. Without the exception, every
report title is flagged and the user stops opening the tool.

Write a few real documents in your language, scan them, and add what fires
wrongly. That pass is worth more than a long word list.

## Working on the scanner

```bash
npm test                  # deterministic: unit tests plus the repo self-scan
npm run validate-packs
```

`bin/` takes no dependencies. Not a YAML parser, not a tokenizer, not a
sentence-splitting library. Fixtures assert exact numbers, and those numbers
must not shift because a library version did.

The repo scans its own prose, so a file that breaks a rule it documents fails
CI. When that happens, fix the prose. If the rule itself is wrong, fix the rule
and say why in the commit.

To mention a banned phrase in documentation, put it in backticks. A term inside
backticks is being mentioned rather than used, and the scanner skips it. This is
how a language pack describes its own ban list without failing the self-scan.

Every markdown file in the repo is either scanned or listed in
`tests/scan-manifest.json` under `not_scanned` with a reason. A new file that is
neither fails the coverage test, on purpose: the alternative is a manifest that
quietly shrinks until the self-scan means nothing.

## The output contract

`schema/check-output.schema.json` describes the json block `antislop-check`
emits. It is ordinary JSON Schema, so a consumer outside Node can read it, and
`bin/lib/output-schema.mjs` walks the same file rather than restating it.

Two things to know before changing it. `verdict` is a closed set of three
strings and they stay Vietnamese in every language, because they are
identifiers; the sentence explaining a verdict goes in `reason`. And the example
in `skills/antislop-check/SKILL.md` is tested against both the schema and a real
scanner run, so an example that drifts fails CI rather than misleading whoever
reads it next.

## Running the agent fixtures

```bash
ANTISLOP_RUNNER=claude npm run test:fixtures
ANTISLOP_RUNNER=codex  npm run test:fixtures
```

This calls a model, so it costs money and is not in CI. It also has to install
the plugin for real, because that is the only way a skill gets loaded. Three
things keep that from damaging your setup:

- It reads the registry before touching it, and leaves installed whatever was
  installed before the run.
- The undo handler is registered before the first install, so a crash halfway
  through still removes the half that succeeded.
- It refuses to run when a marketplace named `antislop-marketing` already points
  somewhere other than your checkout, because replacing it is destructive and
  the runner cannot put the original back. Remove it yourself, or accept the
  loss with `ANTISLOP_FIXTURE_FORCE=1`.

A fixture is a markdown file in `tests/fixtures/judged/` plus an
`.expect.json` beside it. The expect file needs a `note` explaining what the
fixture is for, and `tests/judged-fixtures.test.mjs` checks the whole set
without spending a token: paired files, legal tiers and languages, rule codes
that something can actually emit, and coverage across tiers, languages and
provenance.
