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

Phrases are written in backticks throughout this file. A term in backticks is
being named, not used, and `scan.mjs` skips code spans for exactly that reason,
so a pack can describe its own ban list without failing the self-scan.

**Temporal openers.** `in today's world`, `in today's fast-paced world`,
`in an era of`, `as we navigate the complexities of`. They carry no information
and exist only to fill the space before the first real sentence.

**Compulsory closers.** `in conclusion`, `in summary`, `at the end of the day`,
`the bottom line is`. If a piece needs an ending, the ending should say
something new.

**Formulaic sentence shapes.** `not only ... but also` is the negative
parallelism. `plays a crucial role in` is the phrase that survives longest in
text someone has already tried to clean up.

Both arrived from the upstream source with figures attached: a study, a sample
size, a ranking of correlations. None of it was citable, so the figures are
gone and the two observations stand on their own. Same policy as the sentence
length band in section 7.

## 3. Formulaic phrases

Chat residue belongs here too: `i hope this helps`, `great question`,
`let me know if`. These are correspondence, pasted into a document by accident.

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

## Cực cấp ngoài Việt Nam

Tier C bans superlatives outright. In Vietnam that rule is statute, and
`vi.md` carries the citations. For English-language markets there is no
equivalent blanket ban, so the rule has to be justified differently or it will
not survive contact with a client who asks why.

| Source | What it actually says |
|---|---|
| TikTok, misleading and false content | ad content must not feature absolute terms about a product in relation to time, region or brand. Their own example is `Number 1 song on TikTok`. Comparative claims may be allowed with evidence or a disclaimer. |
| Google Ads, unreliable claims | inaccurate claims, and claims that entice with an improbable result as the likely outcome, are not allowed. The policy addresses accuracy, not vocabulary. There is no list of banned superlative words. |

- <https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content>
- <https://support.google.com/adspolicy/answer/15936857>

So for English the honest framing is a **conservative guardrail**: a superlative
is the claim most likely to need substantiation you do not have, and the
cheapest fix is almost always a number. It is not a guarantee of rejection, and
this pack does not claim one. Anyone who needs a real compliance check has to
split the policy by platform, industry and market.

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
    "P": [
      "proposal", "plan", "sow", "roadmap", "quote", "pitch", "scope",
      "readme", "documentation", "user guide", "policy", "release notes"
    ],
    "C": ["caption", "post", "ad copy", "content", "email", "landing", "tagline", "blog"]
  }
}
```
