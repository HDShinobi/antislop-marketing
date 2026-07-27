# antislop-marketing

Write and review human-facing documents that do not read like machine output,
without losing the professional vocabulary they need.

The plugin includes two skills for Claude Code and Codex, with support for
Vietnamese and English.

[Tiếng Việt](README.vi.md)

## What problem this solves

You draft reports, proposals, README files and ad copy with AI, but the result
still reads like AI wrote it. The problem is often editorial rather than
lexical: unclear headings, compressed fragments, weak evidence, unnecessary
code-switching or a tone that tries too hard to sound natural.

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
- Not for source code, configuration or machine-oriented API schemas. It can
  edit human-facing README files, product documentation and guides.
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

Node 20 or later, for the scanner. Everything else is Markdown. CI tests the
plugin on Node 20 and 22.

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
| **P** | proposal, plan, SoW, README, product documentation | conditional | required for claims about reality |
| **C** | ad copy, caption, social | allowed when backed, superlatives banned | not required for ordinary evaluation |

For tier C, the plugin does not use claims such as `nhất`, `duy nhất`, `tốt
nhất` or `số một`. Article 8(11) of Vietnam's 2012 Advertising Law permits
these terms in advertising only with qualifying proof. The plugin therefore
uses this as its conservative default for Vietnamese advertising.

The legal scope, qualifying evidence and differences between platform policies
are documented in [`references/vi.md`](references/vi.md). The plugin provides
editorial guidance, not legal advice for a specific campaign.

Document form is separate from tier. A README normally remains tier P, while
its headings, information order and terminology follow an editorial profile.
Asking the plugin to review a README does not turn that file into a tier R
report.

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
belongs to the model.

| Counted, reproducible | Judged, not reproducible |
|---|---|
| dashes, banned phrases, superlatives | whether a fact actually backs a claim |
| runs of same-shaped sentences | whether a comparison names its comparator |
| candidate evaluative words | register, argument arc, whether a sentence has a reader |

The word lists are a floor, not a gate. Adjectives are an open class and no
finite list covers them, so the model reads the whole document independently
rather than trusting the scanner's list of places to look.

Vietnamese human-facing documents also use
[`references/vi-editorial.md`](references/vi-editorial.md). That layer covers
information architecture, headings, sentence completeness, referent clarity,
code-switching and editorial tone.

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
