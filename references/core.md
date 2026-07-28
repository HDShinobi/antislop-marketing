# core: language-neutral rules

This file contains no token from any language. Everything tied to a specific
language lives in that language's pack. Adding a language must never require
editing this file.

Rule IDs here all start with `CORE-`. See "Rule ID" in spec section 9 for the
full scheme; the short version is that a code carries a language prefix if and
only if it arises from one language's vocabulary, and these do not.

---

## 1. Blocks

A block is a paragraph, a list item, a heading, a table, or a table cell.

Tables have two levels. The parent carries the child list and no scannable text
of its own; each cell is a child. The parent exists so the data-table test can
look at the whole table. The cells exist because a fact in one cell does not
back an adjective in another.

Two boundary rules:

- **A block never crosses a heading.** A fact stated before a heading does not
  back an adjective after it.
- **Code fences are excluded from every scan.** Reports carry config dumps and
  logs, and scanning those produces only noise.

---

## 2. Tier

Tier controls what may be said. It is inferred, never asked.

| Tier | Document | Puffery | Evidence |
|---|---|---|---|
| **R** | report, audit, analysis | banned | required |
| **P** | proposal, plan, SoW, quote, README, product documentation | conditional | required for claims about reality |
| **C** | ad copy, caption, social, blog | allowed when backed, **superlatives banned outright** | not required for ordinary evaluation |

The tier C superlative ban is the one rule here whose grounds sit outside this
file. Advertising law is written per country and platform policy is written per
platform, so neither can live in a language-neutral file. Each language pack
carries the citations for its own market, and they do not agree with each other:
in one the rule is statute, in another it is a guardrail. The rule is the same
either way, which is why it stays in this table.

### Deciding the tier

Match in order, stop at the first hit. The keyword lists come from the language
pack's `tier_keywords`, not from this file.

| Signal | Tier |
|---|---|
| the request carries an R keyword | R |
| the file being edited sits in `reports/` or `audits/` | R |
| the input is mostly a data table | R |
| the request carries a P keyword | P |
| the target is a README, guide, policy or human-facing product document | P |
| the request carries a C keyword | C |
| nothing matches | **P** |

P is the default because it is safe in both directions. Guessing P for a report
lets a few conditional words through, which is visible. Guessing P for a caption
makes it a little stiff, which is harmless.

### Document profile is separate from tier

Tier controls evidence and marketing claims. It does not decide whether a
heading is useful, a README is ordered for a new user, or a Vietnamese sentence
mixes avoidable English terms. Those are editorial questions tied to the
document form and language.

Infer both:

1. tier, from the table above;
2. document profile, from the target: continuous prose, README, product guide,
   policy, email, slide, sheet or another human-facing form.

A request to "review" or "check" does not make the target tier R. Review the
document under its own tier. A README normally remains P; a performance report
remains R; ad copy remains C.

Each language pack may point to an editorial reference for document forms that
need language-specific treatment. Apply that reference in addition to the tier
rules. Do not create a new tier for formatting or information architecture.

### Overrides

Accepted in plain language, no syntax required.

| The user says | What changes |
|---|---|
| "tier R", "tier P", "tier C" | tier directly; the level follows the tier |
| "more formal", "this goes to the client" | tone only; tier and level unchanged |
| "more casual", "friendlier" | tone only; tier and level unchanged |
| "write it more naturally", "less stiff" | level 2 becomes level 3; tier unchanged |
| "tighter", "cut the flowery words" | level 3 becomes level 2; tier unchanged |

Precedence, highest wins:

```
1. R standard for data regions   (cannot be overridden)
2. an explicit user override
3. the decision table
4. the default, P
```

Rows two and three of the mapping change tone without changing tier, because
tone and tier are independent axes. "This goes to the client" describes the
relationship with the reader; it says nothing about whether the document is a
report or a caption.

### Data regions are a floor

Every data table and every results section follows the R standard regardless of
the document's tier, **and no override lowers it**. A tier P proposal still
contains last quarter's results table, and that table must not carry an
unbacked adjective.

A table counts as a data table when more than half of its non-empty body cells
contain a number. The header row is excluded. Strict majority: exactly half does
not qualify, because a two-column table with one label column and one number
column is genuinely a borderline case.

---

## 3. Level

Level controls sentence construction. It follows the tier; the user does not
declare it.

```
tier R  ->  level 2
tier P  ->  level 2
tier C  ->  level 3
```

| Level | Name | What is on |
|---|---|---|
| 1 | FLAT | not a setting, see below |
| 2 | NATURAL | sentence length varies, sentence types vary, emphasis can lead |
| 3 | COLLOQUIAL | adds particles, fragments, unbacked ordinary evaluation |

**Level 1 is a failure state, not a configuration.** It is what you get by
applying the vocabulary lists and skipping the structural rules: no banned words
left, and every sentence still built the same way. `antislop-write` never
produces it deliberately. It has a name so `antislop-check` can name it.

---

## 4. The declaration line

Print one line, then continue. Do not ask, do not wait.

```
[R · level 2 · formal · vi]
```

This line is the entire interface. Inferring silently means a wrong guess is
invisible and uncorrectable. Inferring out loud means the user sees it at a
glance, corrects it with one word if it is wrong, and ignores it if it is right.
The cost when the guess is correct is one line.

---

## 5. Structural rules

Each has a stable ID. None of them names a word in any language.

### `CORE-CADENCE`
Sentences that keep landing in the same shape, one after another. Measured by
`same_shape_run`: the longest run of consecutive sentences sharing an opener
class, a clause count, and a tack-on state. Threshold is 3.

Two sentences whose openers both fall into the fallback class are never counted
as the same shape. The fallback catches everything the closed classes miss, so
two sentences there may open with entirely unrelated words.

### `CORE-RULE-OF-THREE`
Three items, three adjectives, three examples, over and over. List two, or four,
or five. The compulsion to reach three is a reliable tell on its own.

### `CORE-NEG-PARALLEL`
"It's not just X, it's Y" and its relatives. The specific phrasing is in each
language pack; the shape is universal. State what a thing is.

### `CORE-FALSE-RANGE`
"From X to Y" where X and Y do not sit on a scale with a middle. Only use the
construction for real ranges.

### `CORE-TACKON`
A participial clause glued to the end of a sentence to make it look deeper. If
the clause adds a fact, make it a sentence. If it does not, delete it.

### `CORE-FORMULAIC-END`
A "Challenges and Future Prospects" section, a "Despite these challenges" pivot,
vague optimism about ongoing initiatives. None of these carry information.

### `CORE-PARA-RHYTHM`
Paragraphs of uniform length. Older models produced uniform three-sentence
paragraphs; newer ones over-correct into a spray of one-sentence paragraphs plus
bullet lists. Both are metronomic. A real writer runs a paragraph to seven
sentences when the argument needs it.

Measured by `short_paragraph_ratio`, reported as a pair rather than judged.

### `CORE-FRAGMENTED-PARA`
The over-correction named above, stated separately because it is the one that
appears in current output. Combine related ideas.

### `CORE-BOLD-LIST`
Bullet lists whose items open with a bolded phrase and a colon. Prefer prose in continuous documents.
When a list genuinely helps, keep the items plain. **Exemption:** In `slide` / `deck` profiles, bolded lead-ins (`**Key:** Value`) are encouraged for visual scanning.

### `CORE-DASH`
No em dash and no en dash **as sentence punctuation**. Replace with a period, a
comma, a colon, parentheses, or by restructuring. A hard constraint, not a
preference.

Three uses are ordinary typography and are not counted:

- **A tight dash, no space on either side.** `T9–T10`, `01–08/08`, `top 10–20`.
  A range or a compound, never punctuation.
- **A dash opening a table cell.** The spreadsheet convention for "nothing yet".
- **A dash in slide bullet items or range indicators.** In `slide` / `deck` profiles, dashes separating metrics or bullet phrases are permitted.

A spaced dash anywhere else in continuous prose is counted, including as a title separator, because
prose would use a colon there.

This narrowed after scanning a real roadmap in which all 28 dashes were
legitimate. The original rule would have made the tool unusable on the second
file someone tried.

### `CORE-COLON-DENSITY`
Mid-sentence colons used to introduce almost any follow-on idea. A colon that
introduces a list, a table, or a slide key-value pair (`**Metric:** 10.6x`) is fine. Counted as `colon_outside_list`.

### `CORE-SENT-TYPE`
Only declarative sentences. Mix in a genuine question, an imperative, a
deliberate fragment. A model answers; a person also wonders, instructs, and
breaks off.

### `CORE-PARA-PREDICT`
Every paragraph opening with its thesis sentence. Start some paragraphs
mid-thought, with a detail or an example that earns its context.

### `CORE-SYNTAX-DEPTH`
Every sentence at the same clause depth. Mix a blunt subject-verb-object
sentence with one that winds through subordinate clauses.

### `CORE-FUNCTION-WORDS`
The same small set of connectors throughout. Vary them. Function word
distribution is one of the strongest statistical signals there is.

### `CORE-LEXICAL-DIVERSITY`
A narrow vocabulary. Raise it by being more specific, not by cycling synonyms:
synonym cycling is itself a separate tell.

### `CORE-BIMODAL`
Faked variety. A model that has learned to vary sentence length often
alternates mechanically between a fragment and a very long sentence. Repeated,
that alternation is its own fingerprint. Vary irregularly: a medium sentence,
another medium one, a fragment, a long one, two mediums.

### `CORE-ARGUMENT-ARC`
The four-part shape that repeats regardless of topic: establish context, add
supporting detail, acknowledge a complication, resolve. It is recognisable
within three or four sentences, and instructions do not remove it; the model
rebuilds it under any vocabulary.

Break it deliberately at least twice per piece. Open with the complication and
never resolve it. Expand without contrasting. End a section on an unresolved
tension or a blunt fact. Put the conclusion first and argue backward. Let one
paragraph be pure detail with no claim.

---

## 6. The fourth tell family: sentences with no addressee

The three rules below catch something the vocabulary, structure and evidence
layers all miss. A passage can be clean on every one of them and still read as
machine, because the sentence is not aimed at any particular reader.

**The test, usable immediately:** read the sentence aloud as if speaking it to
the person. If the spoken version differs a lot from the written one, the
written one is the problem.

### `CORE-READER-VOCAB`
Asking or asserting in the writer's vocabulary rather than the reader's. The
reader cannot answer, because answering requires terms they were never given.

```
BAD   "Can your ad copy tolerate that level?"
GOOD  "Do your captions often say things like 'best on the market'?
       If so, the tool will ask you to add a number or cut the line."
```

### `CORE-RULE-RESTATE`
Restating a rule instead of showing what it does. The reader learns the rule
already exists, which they knew, and nothing about its effect.

```
BAD   "Tier C still requires puffery to be backed."
GOOD  "It will ask you to add a number, or to cut the line."
```

### `CORE-NOUN-STACK`
Compressing a sentence into a chain of noun phrases where a verb would carry it.
The result reads like a spec bullet rather than speech.

```
BAD   "sentence cadence threshold measurement deferred to v1.2"
GOOD  "measuring how long Vietnamese sentences usually run can wait"
```

All three are judged, never counted: there is no token list for any of them, and
each needs to know who the reader is. They belong in `findings_judged`.

Where `CORE-NOUN-STACK` overlaps a language pack's own nominalisation rule, the
narrower language-specific code wins.

**Where this family came from.** Not from either upstream source, and not from
automated review. A person read this project's own description and pointed at
three sentences in it that sounded like a machine. Automated review reads for
logical contradiction; only a reader reading as a reader catches this.

---

## 7. Model fingerprints

Current models have distinguishable habits. The vocabulary examples below are
English because that is where the observations were made, but the structural
tells are what matter and they carry across languages.

Numbers are stated as directions rather than multipliers. The upstream source
gave precise multipliers without a citable source, and this repo does not carry
figures it cannot stand behind.

### GPT-5.x
- The negated contrast, roughly one per paragraph: "It's not just X, it's Y".
  Still the sentence shape that identifies GPT fastest.
- Symmetric two-clause hooks opening a piece, of the form "everyone assumes A,
  in fact B". Fine once; a fingerprint when it opens four pieces out of five.
- Rigid "Firstly, Secondly, Finally" scaffolding.
- Hedging verbs used as padding: ensuring, highlights, supports, reflects. A
  person says what the thing does.
- Intensifiers with no evidence behind them: significantly, effectively,
  increasingly. If no number backs it, cut it.
- A sanitised texture. The self-correction pass scrubs the obvious tells and
  leaves prose with no awkward transitions at all. Perfectly smooth is
  suspicious.
- Closers containing "one thing is clear".

Em dashes are suppressed in recent versions, so their absence is not evidence
of human authorship.

### Claude 4.5 and later
- The worst punctuation offender: em dashes mid-sentence to attach qualifier
  clauses, and colons to introduce almost any follow-on idea. Both are counted
  mechanically here for exactly this reason.
- Hedge-and-reassure stacking, sometimes three hedges before saying anything.
- Empathetic framing on autopilot.
- The essayistic arc regardless of format: contextualise, explore perspectives,
  qualify, then close by observing what the analysis "raises" rather than
  concluding what it means. A pricing memo gets the same treatment as an essay.
- Abstract vocabulary inflation, where a plain claim is restated in longer
  words.
- Opening sentences with "And" or "But" as a flow crutch every other paragraph.
- Bimodal rhythm and paragraph over-fragmentation, both above.

The legacy vocabulary tells are largely gone from current output. Their absence
proves nothing; check the structural tells.

### Gemini
Purple prose, adjective pile-ups, explicit theme statements, a textbook
lecturing tone.
