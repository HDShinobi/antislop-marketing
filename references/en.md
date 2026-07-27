# Language pack: English

This file describes; it does not list. Every enforceable token lives in the
`antislop-pack` JSON block at the bottom. Listing them twice would let the
skill and `scan.mjs` enforce two different rule sets.

## 1. Metadata

| | |
|---|---|
| Language code | `en` |
| Label | soát rồi |
| Reviewed by | HDShinobi |
| Reviewed on | 2026-07-27 |

## 2. Ban list

Phrases that are never allowed, at any tier. Three groups.

**Temporal openers.** "In today's world", "In today's fast-paced world", "In an
era of", "As we navigate the complexities of". They carry no information and
exist only to fill the space before the first real sentence.

**Compulsory closers.** "In conclusion", "In summary", "At the end of the day",
"The bottom line is". If a piece needs an ending, the ending should say
something new.

**Formulaic sentence shapes.** "Not only ... but also" is the negative
parallelism; a 2026 study of a thousand pages found it had the largest negative
correlation with reader engagement of any construction measured. "Plays a
crucial role in" is the most over-represented AI trigram of the same period.

## 3. Formulaic phrases

Chat residue belongs here too: "I hope this helps", "Great question", "Certainly",
"Let me know if". These are correspondence, pasted into a document by accident.

Unlike `vi.md`, English has no prose-only rules in this pack. Nominalisation and
address consistency are handled by the language-neutral `CORE-NOUN-STACK` and by
ordinary register discipline.

## 4. Machine translation artifacts

Empty. English is the source language for most of the material this tool
processes, so there is no translation direction to leave a trace. The key stays
in the schema because every pack carries all fourteen keys; an empty array is a
statement, a missing key is an omission.

## 5. Address by tier

English does not force a pronoun choice the way Vietnamese does, so this is a
register setting rather than a grammatical commitment.

| Tier | Writer | Reader |
|---|---|---|
| R | we, or no pronoun at all | the client, or no pronoun |
| P | we | you |
| C | we | you |

Tier R usually needs no pronoun for the reader. "CPA fell 26 percent" beats "we
helped you cut CPA by 26 percent".

## 6. Particles by level

English has no discourse particles in the Vietnamese sense. What level 3 unlocks
instead is contractions and sentence fragments.

| Level | What is on |
|---|---|
| 2 NATURAL | full forms, complete sentences |
| 3 COLLOQUIAL | contractions (don't, it's, we're), deliberate fragments |

## 7. Cadence

The opener classes and the tack-on list live in the JSON block. Four closed
classes are declared; the fifth, `khac`, is the fallback and is never declared.

**There is no sentence-length threshold.** The spec deliberately sets no number
for how long an English sentence should be. `same_shape_run` measures sameness
of shape, not length, and sameness is the tell worth catching.

This is a change from the upstream source. `adenaufal/anti-slop-writing` gives a
17 to 23 word band for English, but that figure has no citable source, and this
repo does not carry numbers it cannot stand behind.

## 8. Tier keywords

In the JSON block. This is data for the decision table in `core.md`, not the
decision table itself.

## Loanword whitelist

Empty for English: the metric names this tool encounters are already English.

## Match exceptions

`most` needed a change to the list rather than an exception. Bare `most` is a
quantifier far more often than a superlative: "most campaigns", "most editors",
"matters most". The superlative reading almost always carries an article, so the
list holds `the most` instead. Self-scanning this repo's own rule files is what
surfaced that.

The list grows: add cases as they come up.

```json antislop-pack
{
  "lang": "en",
  "banlist": [
    "in today's world",
    "in today's fast-paced world",
    "in an era of",
    "in the ever-evolving landscape of",
    "as we navigate the complexities of",
    "in conclusion",
    "in summary",
    "at the end of the day",
    "the bottom line is",
    "it is important to note that",
    "without further ado",
    "last but not least",
    "plays a crucial role in",
    "not only",
    "i hope this helps",
    "great question",
    "let me know if"
  ],
  "mt_artifacts": [],
  "superlative": [
    "the best",
    "best-in-class",
    "world-class",
    "number one",
    "#1",
    "leading",
    "unmatched",
    "unrivalled",
    "unrivaled",
    "the most",
    "top-rated"
  ],
  "puffery": [
    "groundbreaking",
    "cutting-edge",
    "revolutionary",
    "seamless",
    "comprehensive",
    "transformative",
    "unparalleled",
    "state-of-the-art",
    "game-changing",
    "best-in-breed"
  ],
  "comparative": [
    "far better",
    "outperforms",
    "superior to",
    "streets ahead"
  ],
  "evaluative": [
    "good",
    "poor",
    "effective",
    "strong",
    "weak",
    "slow",
    "fast",
    "solid",
    "significant",
    "notable",
    "positive",
    "negative",
    "suboptimal",
    "healthy",
    "impressive",
    "promising"
  ],
  "abbreviations": [
    "e.g.",
    "i.e.",
    "etc.",
    "vs.",
    "Inc.",
    "Ltd.",
    "Dr.",
    "Mr.",
    "Ms.",
    "St.",
    "approx."
  ],
  "exceptions": {
    "leading": ["leading to", "leading indicator"],
    "strong": ["strong signal"],
    "fast": ["fast follow"],
    "significant": ["statistically significant"]
  },
  "openers": {
    "dai_tu": ["we", "i", "you", "they", "it", "our", "your", "their"],
    "lien_tu": ["but", "and", "however", "therefore", "moreover", "so", "yet", "still", "furthermore"],
    "trang_ngu": ["in", "after", "before", "when", "if", "although", "with", "by", "from", "to", "since", "during"]
  },
  "tackon": [
    "thereby",
    "thus enabling",
    "helping to",
    "underscoring",
    "highlighting",
    "ensuring",
    "reflecting",
    "showcasing"
  ],
  "config_tokens": [
    "campaign", "ad group", "ad set", "keyword", "bidding", "pixel",
    "tracking", "conversion", "audience", "placement", "landing page",
    "creative", "budget", "funnel"
  ],
  "loanwords": [],
  "tier_keywords": {
    "R": ["report", "audit", "analysis", "recap", "performance", "metrics", "results"],
    "P": ["proposal", "plan", "sow", "roadmap", "quote", "pitch", "scope"],
    "C": ["caption", "post", "ad copy", "content", "email", "landing", "tagline", "blog"]
  }
}
```
