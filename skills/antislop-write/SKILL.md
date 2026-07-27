---
name: antislop-write
description: Write marketing reports, plans and content in Vietnamese or English without AI writing tells, keeping professional and marketing vocabulary intact. Use when writing or drafting a report, audit, monthly recap, proposal, plan, SoW, quote, pitch, ad copy, caption, email or landing page copy.
---

# antislop-write

Paths below are relative to this skill's own directory, not to the working
directory. `../../references/` and `../../bin/` resolve correctly in both
Claude Code and Codex.

## 1. Load first

Read only what the tier and language call for.

| Situation | Read |
|---|---|
| tier R or P | `../../references/core.md`, the language pack, `../../references/evidence.md` |
| tier C | `../../references/core.md`, the language pack, `../../references/evidence.md` |

Language packs are registered in `../../references/languages.json`. Load the one
matching the language you inferred in step 3.

`evidence.md` loads at every tier including C, because tier C still requires
backing for puffery and comparatives even though it lets ordinary evaluation
through.

## 2. Infer the tier

Use the decision table in `core.md` section 2, with the keyword lists from the
pack's `tier_keywords`. Default is P when nothing matches.

## 3. Infer the language

**The language of the request decides nothing.** A Vietnamese request about an
English document is ordinary, and happens daily.

Check in order, stop at the first hit:

| Signal | Example |
|---|---|
| an explicit instruction about output language | "write it in English", "bản EN" |
| the language of the source material or the file being edited | English figures in, English out |
| the language of the conversation | **only when there is no source at all** |

The last row is a last resort, not a default. Confusing the two rewrites every
English document into Vietnamese because the user typed Vietnamese.

## 4. Print the declaration line, then keep going

Do not ask. Do not wait.

```
[R · mức 2 · trang trọng · vi]
```

Tier, level, tone, language. The level follows the tier: R and P get level 2, C
gets level 3.

## 5. Minimum input, and what to do when facts are missing

**Never invent a fact.** Not a number, a name, a date, a source, or a quotation.
This outranks every other rule in the repo, including cadence and the ban lists.

Facts come in four kinds, and only figures are numeric. See `evidence.md`.

| Tier | Needed before writing |
|---|---|
| R | at least one fact of any of the four kinds |
| P | the scope of work and at least one real constraint: budget, timeline, channel, or goal |
| C | the product or message, plus one supporting fact if puffery is intended |

When facts are missing, in order:

1. **A little missing.** Write what the facts support and leave a labelled gap:
   `[cần số: CPA tháng 6]`. Square brackets, opening with `cần`, so it can be
   grepped and counted. List every gap in one line at the end.
2. **Enough missing that the document would be meaningless.** Ask one combined
   question naming everything absent. Never ask one thing at a time.
3. **Tier R with no fact of any kind.** Do not write. Say what is needed and in
   what form.

If the user says to fill in illustrative numbers, do it, but label every one
`[ví dụ]` and open the document with a line saying it contains placeholder
figures.

## 6. Unregistered language, and genuinely bilingual documents

**Language absent from `languages.json`:** load `core.md` and `evidence.md`
only. Never substitute a nearby pack; Thai does not get `vi.md`. Declare it:

```
[P · mức 2 · trang trọng · th (chưa có pack)]
```

Add one line after the output stating that vocabulary, address, particle and
cadence rules were not applied for this language.

**Loanwords do not switch packs.** Vietnamese prose carrying `ROAS`,
`remarketing`, `audience` is a single-language document, and those terms must
not be translated.

**Genuinely bilingual**, meaning complete sentences in two languages: load both
packs, apply per block, declare both.

```
[P · mức 2 · trang trọng · vi+en]
```

The boundary: a second language appearing only as words and noun phrases is
loanwords. A second language with sentences of its own is bilingual. No
percentage threshold.

## 7. Source that is not already text

When the material comes from a spreadsheet, a document or a slide deck, convert
it to Markdown **preserving tables as tables**. The rules depend on block
structure: a data table lifts itself to tier R, and each cell is its own
evidence scope. A flattened sheet breaks both.

Write your output in the form the user asked for. If they want the file itself
edited, edit the original directly and write a new file beside it; the converted
Markdown exists only so the rules can be applied, never as the deliverable.

## 8. Write, then check silently

Run the checklist against your draft before printing anything. **Print only the
final text.** The draft and the list of things you fixed are noise to someone
who needs a document to send. Show them only if asked.

### Every tier

- Zero em dashes and zero en dashes.
- No phrase from the pack's `banlist` or `mt_artifacts`.
- Sentence shapes vary: not three consecutive sentences sharing an opener class,
  a clause count and a tack-on state.
- Vary irregularly. Alternating a fragment with a long sentence, over and over,
  is its own fingerprint.
- Mix sentence types. Not every sentence declarative.
- Paragraphs of uneven length. Not a spray of one-sentence paragraphs.
- Break the four-part argument arc at least twice.
- Mid-sentence colons are rare. A colon introducing a list is fine.

### Tier R and P

- Every evaluative adjective is backed by a fact that proves that adjective.
  Delete the adjective and see whether the fact still says it.
- No puffery at R. At P only under condition (a) or (b) from `evidence.md`.
- Comparatives name what they compare against.
- Every data table and results section follows the R standard, whatever the
  document's tier.

### Tier C

- **No superlatives at all.** Not "best", not "number one", not "leading", even
  with proof. This is ad platform policy, not style: the ad gets rejected.
- Puffery only when a fact in the same block proves it.
- Ordinary evaluation is free here.
- Particles and fragments are on.

### The fourth family, every tier

Read the piece aloud as if speaking it to the reader. Where the spoken version
would differ a lot, the written one is wrong. See `core.md` section 6.
