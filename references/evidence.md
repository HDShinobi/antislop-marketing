# evidence: backing claims

Neither upstream source has this layer, because both were written for people
writing blog posts rather than for people writing performance reports.

Rule IDs here carry no language prefix. Judging whether a fact supports a claim
is language-neutral reasoning, and the finding already carries a `lang` field.

---

## What counts as a fact

Numbers are one kind, and not the only kind. An account audit can be entirely
qualitative and still be a legitimate report: tracking is not installed, three campaigns run broad match
with no negative list, the pixel is not wired to CAPI. Those are verifiable.

| Kind | Examples |
|---|---|
| figures | CPA 47, ROAS 3.4, 22 percent of budget |
| configuration state | tracking not installed, bidding set to Maximize Clicks |
| dates and events | bidding changed on 12 June, three ads rejected |
| references | a landing page URL, a campaign ID, a source filename |

---

## Backing, not proximity

**Every evaluative adjective must be backed by a verifiable fact, or removed.**

Backed means the fact **proves that adjective**, not merely that it sits nearby.
This is the part of the rule that is easiest to game, so it is stated flatly:

```
NOT BACKED   "The team is dedicated, and CPA this month was 31."
             The CPA figure says nothing about dedication. Two unrelated
             clauses sharing a comma.

BACKED       "CPA fell from 42 to 31 after the team rebuilt the ad groups
             around intent in the first week of the month."
             The fact leads to the claim, and the claim is about what was done.
```

**The test:** delete the adjective. Does the remaining fact say it by itself? If
not, the adjective was decoration. Cut it.

When a claim cannot be backed there are two ways out, and only two: replace the
adjective with an observable description, or delete it. Substituting a milder
adjective is not one of them.

```
"CPA improved nicely"        ->  "CPA fell from 42 to 31, a 26 percent drop"
"the campaign was effective" ->  "ROAS 3.4 against a 2.8 target"
"tracking has problems"      ->  "the purchase event does not fire on the
                                  thank-you page"
"account structure is poor"  ->  "twelve ad groups share one keyword set"
"performance rose sharply"   ->  delete, or add the fact
```

The middle two examples are why the rule does not say "must cite a number". A
qualitative audit is still held to evidence discipline; its evidence simply is
not numeric.

---

## Scope by tier

The last row is the exception, and it is the one that gets misread.

| Tier | Ordinary evaluation | Puffery, comparatives, superlatives |
|---|---|---|
| R | backing required | does not arise, puffery is banned at R |
| P | required when the claim is about reality | required, conditions (a) or (b) below |
| C | not applied | **required**, and superlatives are banned outright |

Tier C relaxes ordinary evaluation, not strong claims. "Love using it" in a
caption passes. "Outperforms everything" does not.

### Tier P: claims about reality versus statements of intent

```
NEEDS BACKING   "The current account structure is fragmented."
                A claim about a verifiable state of the world.

NEEDS BACKING   "This approach is more effective."
                A claim about outcomes. Needs a fact or a comparator.

NO BACKING      "This roadmap fits your growth targets."
                A statement about intent and fit, not about the world.
                Demanding a number here would be meaningless.

NO BACKING      "We recommend prioritising Search first."
                A recommendation, not an assertion.
```

The test: **could the sentence be wrong?** A claim about reality can be wrong
and needs backing. A statement of intent has no truth value to check.

This distinction is semantic, so it belongs in `findings_judged`. The scanner
still reports every `eval_candidate` at tier P; sorting out which ones are
statements of intent is the model's job.

---

## Comparators must be named

For comparative and superlative claims, backing alone is not enough: **the
thing being compared against has to appear**.

```
NOT ENOUGH   "Filters down to 0.0001 micron, far beyond the usual standard."
             The figure does not say what the usual standard is. The reader
             cannot check it, and "far beyond" is an empty assertion.

ENOUGH       "Filters down to 0.0001 micron. Ordinary RO membranes stop at
             0.001."
             The comparator is stated; the reader sees the gap without being
             told it is a gap.

ENOUGH       "Filters down to 0.0001 micron, ten times finer than an ordinary
             RO membrane."
             The comparison names its object and its ratio.
```

If no comparator can be named, drop the comparative word and let the figure
stand alone. It is usually stronger that way.

At tier C, superlatives are banned even when a comparator exists. That rule is
not about writing, and its grounds differ by market: statute in Vietnam, a
conservative guardrail elsewhere. Each language pack carries its own citations.

---

## Provenance

### Condition (b): approved claims

Tier P allows puffery when the user supplied the line verbatim, for example a
brand positioning line the client signed off. `antislop-write` knows this,
because the user just handed it over. `antislop-check` reading an existing file
does not, and cannot tell an approved tagline from invented puffery.

An optional file, `.antislop-claims.txt`. Look for it **beside the document
being checked first, then in the working directory**, and stop at the first one
found. Beside the document is the case that comes up: a report and the claims
its client approved travel together, and the person running the check is often
sitting in a different folder entirely.

```
# one approved claim per line, matched verbatim
Giải pháp lọc nước toàn diện cho gia đình Việt
Award winner, Vietnam Digital Awards 2025
```

| Situation | Result |
|---|---|
| the claim matches a line verbatim | exempt, not reported |
| the file exists and nothing matches | judged normally: `EVID-UNBACKED` if unbacked |
| **no file at all** | `EVID-PROVENANCE-UNKNOWN`, in `judged`, **not a violation** |

### Condition (a): supporting facts in another file

Condition (a) allows a claim proved by a fact "present in the source material",
and the fact may live somewhere else: an export, last month's report, an email.

| Situation | Verdict |
|---|---|
| the supporting fact is in the file being checked | `đạt` |
| the user names a source and the fact is there | `đạt` |
| no source available to check against | `chưa xác định`, **not a violation** |

The user names sources in the request ("check this, the figures are in
`data/june.csv`"), or by passing several files at once so the rest count as
sources.

### Why the third verdict exists

`chưa xác định` sits beside `đạt` and `vi phạm`, and it gets its own row in the
report.

Folding it into `vi phạm` makes every isolated check light up red, and the user
stops opening the tool. Folding it into `đạt` makes the tool lie. Accusing a
tagline the client already approved is the same false positive
`false-positives.md` exists to prevent, and it costs more than missing one
unbacked line.

---

## The lists are a floor, not a gate

`evaluative`, `puffery`, `comparative` and `superlative` are all open classes.
No finite list covers them. A term the pack has never heard of is still a claim.

| Layer | Responsibility |
|---|---|
| `scan.mjs` plus the four lists | guarantee the **floor**: known terms never slip, and regressions are caught |
| `antislop-check` | scan **independently** for every evaluative claim, strong marketing claim, comparative and superlative, listed or not |

`antislop-check` must not treat `findings_mechanical` as the complete list of
places worth examining. It reads the whole document and looks for itself. What
it finds beyond the lists goes into `findings_judged`:

| Found by the model, outside the lists | Code |
|---|---|
| an evaluative claim not in `evaluative` | `EVID-UNBACKED` |
| a strong marketing claim not in `puffery` | `<LANG>-PUFFERY-UNLISTED` |
| a comparative not in `comparative` | `<LANG>-COMPARATIVE-UNLISTED` |
| a superlative not in `superlative` | `<LANG>-SUPERLATIVE-UNLISTED` |

This matters most at tier C. Tier C lets ordinary evaluation through but still
requires backing for puffery, so a strong claim missing from the pack would be
filed as ordinary evaluation and pass untouched. Tier C is where ad copy lives,
which makes that the worst place for a gap.

For the maintainer: each time the model catches a term the pack lacks, add it.
The lists grow and the deterministic share widens, but they never need to be
complete to be useful.
