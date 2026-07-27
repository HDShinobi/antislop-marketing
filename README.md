# antislop-marketing

Write and audit marketing documents that do not read as machine output, without
losing the vocabulary a marketing document needs.

Two skills for Claude Code and Codex. Vietnamese and English.

[Tiếng Việt](README.vi.md)

## What problem this solves

You write reports, proposals and ad copy with an AI, and the output reads like
an AI wrote it. Sending that to a client costs you credibility on line one.

Existing anti-slop tools aim at a different target. They are built to defeat AI
detectors, so they ban the marketing vocabulary you actually need and, in some
cases, encourage deliberate grammatical errors to sound more human. Nobody wants
a comma splice in a client deck.

This one aims at yours: keep the vocabulary and the professionalism, drop the
patterns that read as machine.

## What it does not do

Four things, stated because they decide which rules got cut.

- **It does not try to defeat AI detectors.** Turnitin, GPTZero and the rest are
  not the target. The whole T-1 to T-5 group from the upstream source is gone,
  along with every rule that manufactures errors.
- Not for fiction, academic writing, or theses.
- Not for code, comments, or technical documentation. Prose written for a reader
  only.
- It does not write your content. It governs how something is said, not what.

## Install

```bash
# Claude Code
claude plugin marketplace add HDShinobi/antislop-marketing
claude plugin install antislop-marketing@antislop-marketing

# Codex
codex plugin marketplace add https://github.com/HDShinobi/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

Node 20 or later, for the scanner. Everything else is Markdown. CI runs the
declared floor and one version above it, so the number here is tested rather
than assumed.

## Use

Just write. The skill picks the document type and the language itself, prints
one line saying what it picked, and continues.

```
you   Viết báo cáo hiệu quả tháng 6. CPA 47 đô, mục tiêu 35. ROAS 3.4, mục tiêu 2.8.

it    [R · mức 2 · trang trọng · vi]
      ...the report...
```

Wrong guess? Say `tier C` and it redoes it. Right guess? Ignore the line.

To audit something that already exists:

```
you   Soát lại bản proposal này giúp tôi
```

Add the word `json` to the request and it appends a machine-readable block.

## Three document tiers

The tier decides what may be said. It is inferred, never asked.

| Tier | Document | Puffery | Evidence |
|---|---|---|---|
| **R** | report, audit, analysis | banned | required |
| **P** | proposal, plan, SoW, quote | conditional | required for claims about reality |
| **C** | ad copy, caption, social | allowed when backed, superlatives banned | not required for ordinary evaluation |

Superlatives are banned in tier C for a reason that has nothing to do with
style, and the reason differs by market.

**In Vietnam it is statute.** Điều 8 khoản 11 of the 2012 Advertising Law
prohibits advertising that uses `nhất`, `duy nhất`, `tốt nhất`, `số một` or
equivalents without qualifying proof. Nghị định 38/2021 Điều 34 puts the fine at
10 to 20 million đồng, doubled for an organisation. Thông tư 12/2026 of the
culture ministry, in force since 5 July 2026, sets out what proof qualifies.
Vietnam is the market this tool was built for, so the rule is a hard one here.

**Platform policy is thinner, and worth stating accurately.** TikTok prohibits
absolute terms about a product outright and gives `Number 1 song on TikTok` as
its own example. Google reviews claims for accuracy rather than for vocabulary:
the unreliable-claims policy targets inaccurate or improbable outcomes, not the
word `best`. So an ad carrying a superlative is not certain to be rejected
everywhere, and this repo no longer says it is.

Outside Vietnam, read the tier C rule as a deliberately conservative guardrail.
Turning it into a compliance check means splitting the policy by platform,
industry and market first. Sources are in `references/vi.md`.

## What it catches

```
before   Trong bối cảnh hiện nay, chiến dịch đã mang lại hiệu quả tích cực.
         Đội ngũ tận tâm đóng vai trò quan trọng trong việc tối ưu ngân sách.

after    CPA tháng 6 là 31 đô, mục tiêu 35 đô. ROAS 3.4 so với mục tiêu 2.8.

         Phần lớn mức cải thiện đến từ remarketing: nhóm này chiếm 22 phần trăm
         ngân sách nhưng mang về 41 phần trăm doanh thu.
```

More in [examples/](examples/).

The rule everyone underestimates: **an evaluative adjective must be backed by a
fact that proves that adjective**, not one that merely sits nearby.

```
not backed   The team is dedicated, and CPA this month was 31.
backed       CPA fell from 42 to 31 after the team rebuilt the ad groups
             around intent in the first week.
```

Delete the adjective. Does the remaining fact still say it? If not, it was
decoration.

## How it is built

The deterministic half is a dependency-free Node scanner. The judgement half
belongs to the model. Nothing crosses that line.

| Counted, reproducible | Judged, not reproducible |
|---|---|
| dashes, banned phrases, superlatives | whether a fact actually backs a claim |
| runs of same-shaped sentences | whether a comparison names its comparator |
| candidate evaluative words | register, argument arc, whether a sentence has a reader |

The word lists are a floor, not a gate. Adjectives are an open class and no
finite list covers them, so the model reads the whole document independently
rather than trusting the scanner's list of places to look.

## Language packs

| Pack | Status |
|---|---|
| `vi` | soát rồi (reviewed by a native speaker) |
| `en` | soát rồi |

Adding a language means adding one file and one line in
`references/languages.json`. Never editing `core.md`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credit, and what was changed

Derived from two MIT-licensed projects. See [NOTICE](NOTICE).

**[adenaufal/anti-slop-writing](https://github.com/adenaufal/anti-slop-writing)**
supplied the structural rules, the model fingerprints, and the tone-tier idea
from its Indonesian pack.

Dropped from it: the anti-detector group, the deliberate-imperfection rules, and
every statistic it reported without a citable source. Its sentence-length band
went too, because `same_shape_run` measures sameness of shape and that is the
tell worth catching.

**[blader/humanizer](https://github.com/blader/humanizer)** supplied the
do-not-flag list and the signs-of-human-writing list, both in
`references/false-positives.md`.

Added here: the evidence layer, the tier system, the Vietnamese pack, the
deterministic scanner, and a fourth family of tells that neither source has.
That last one came from a person reading this project's own description and
pointing at three sentences in it that sounded like a machine.

## Development

```bash
npm test                              # tiers 1 and 3, deterministic
npm run validate-packs                # schema check on every pack
ANTISLOP_RUNNER=claude npm run test:fixtures   # tier 2, calls a model
node bin/scan.mjs --tier R --lang vi file.md
```

Tier 2 installs the plugin for real, so it reads your registry before touching
it, leaves alone whatever was already installed, and refuses to run if a
marketplace of the same name points somewhere other than your checkout.
`CONTRIBUTING.md` has the detail.

The json block `antislop-check` emits is described by
`schema/check-output.schema.json`, and the example in the skill is tested
against both that schema and a real scanner run.

CI runs tiers 1 and 3 only. Tier 2 calls a model and costs money, so it stays
manual.

The repo scans its own prose, and a file that breaks the rules it documents
fails CI. That is how the `most` entry in the English pack got fixed: bare
`most` is a quantifier far more often than a superlative.

Coverage is enforced rather than asserted. Every markdown file in the repo is
either scanned or listed in `tests/scan-manifest.json` with a reason, and a test
fails on anything that is neither. Rule files, both skills and both language
packs are scanned against every registered pack rather than only their own. Six
counters are checked: dashes, ban list, translation artifacts, superlatives,
puffery, and runs of same-shaped sentences.

A pack can describe its own ban list because a phrase in backticks is being
named rather than used, and the scanner skips code spans.

## Licence

MIT. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
