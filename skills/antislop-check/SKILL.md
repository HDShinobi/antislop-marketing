---
name: antislop-check
description: Review and edit existing Vietnamese or English prose for AI writing tells, weak information architecture, unclear headings, unnatural tone, unnecessary code-switching and unbacked claims. Use for reviews, editorial checks, proofreading and rewrites of marketing copy, reports, proposals, README files, product documentation, policies, guides, emails, landing pages, ad text and captions.
---

# antislop-check

Paths below are relative to this skill's own directory, not to the working
directory.

## 1. Infer tier, document profile and language

Tier: the decision table in `../../references/core.md` section 2, same as when
writing.

Document profile: infer the form of the target, not the action in the request.
A request to review a README means profile README and normally tier P. The word
“review” does not turn it into a tier R report.

Language: **the language of the block being checked. One signal, no fallback.**
The language of the request is irrelevant. A Vietnamese request about an English
document loads `en.md`.

Do not print a separate declaration line here. The report table in step 9 opens
with one, and two lines saying the same thing is noise.

## 2. Source that is not already text

A spreadsheet, a document or a slide deck has to become text before the scanner
can read it. Two rules, and they matter more than they look.

**Preserve tables as tables.** The rules depend on block structure: a data table
lifts itself to tier R, and each cell is its own evidence scope. Flatten a sheet
into paragraphs and both rules misfire. A real roadmap flattened this way
reported two dashes that were the spreadsheet convention for an empty cell.

**Convert for reading, edit at the source.** The converted text is what the
scanner reads. It is not what you rewrite. Apply fixes to the original file
directly, matching on cell or paragraph content, and leave the original
untouched by writing a new file beside it.

## 3. Run the scanner

```bash
node ../../bin/scan.mjs --tier <TIER> --lang <LANG> <file>
```

Resolve that path from this skill's directory, never from the working
directory. The user runs this from their own folder, not from the repo.

Copy `counted` **verbatim** into your JSON output and set
`"counted_source": "scan"`.

If Node is unavailable, count by reading, set `"counted_source": "model"`, and
mark the numbers as estimates in the human table. That is a degraded mode, not
an equal option.

## 4. Copy findings_mechanical verbatim

Not one code, span, text, lang, block or tier value may be altered. Do not
filter, do not reorder, do not add.

## 5. Then judge, independently

Load `../../references/evidence.md` and `../../references/false-positives.md`.
For every Vietnamese human-facing document, also load
`../../references/vi-editorial.md`. This includes README files, product
documentation and policies; they are prose for a reader even when they live in
a code repository.

**The word lists are a floor, not a gate.** Do not treat
`findings_mechanical` as the complete list of places worth examining. Read the
whole document and look for yourself:

| You found, outside the lists | Code |
|---|---|
| an evaluative claim not in `evaluative` | `EVID-UNBACKED` |
| a strong marketing claim not in `puffery` | `<LANG>-PUFFERY-UNLISTED` |
| a comparative not in `comparative` | `<LANG>-COMPARATIVE-UNLISTED` |
| a superlative not in `superlative` | `<LANG>-SUPERLATIVE-UNLISTED` |

Judge each mechanical candidate too. `eval_candidate` says a word from the list
appeared; whether the nearby fact actually proves it is your call.

Also judge what no scanner can reach: register uniformity, the four-part
argument arc, and the fourth tell family in `core.md` section 6.

For Vietnamese, run the two editorial passes from `vi-editorial.md` after the
evidence pass. For presentation slides, decks and action plans, also load
`../../references/vi-slide-presentation.md`. For social posts, also load `../../references/vi-social.md`.
For sales copy and landing pages, also load `../../references/vi-sales.md`.
For SEO, GEO and AEO content, also load `../../references/vi-seo-geo.md`.
Do not stop because the mechanical counters are clean. Inspect the whole document for:

- information ordered for the writer rather than the reader;
- vague or compressed headings (or non-action slide headings: `VI-SLIDE-NONACTION-HEADER`);
- sentence fragments in explanatory prose (waived for slide bullets and social posts);
- prose-slide mismatch where long paragraphs are jammed into slides (`VI-SLIDE-PROSE-MISMATCH`);
- hyper-correction where wording is awkwardly paraphrased to avoid banlists (`VI-HYPER-CORRECTION`);
- weak social hooks or stiff social tone (`VI-SOCIAL-WEAK-HOOK`, `VI-SOCIAL-STIFF-TONE`);
- sales copy featuring only technical specs without benefits or proof (`VI-SALES-FEATURE-ONLY`, `VI-SALES-UNBACKED-CLAIM`);
- SEO/GEO headers missing 1-3 sentence direct answers or extractable tables (`VI-GEO-MISSING-DIRECT-ANSWER`, `VI-GEO-POOR-EXTRACTABILITY`);
- unclear referents such as “nó”, “bộ này” or “cái đó”;
- avoidable English terms and inconsistent terminology;
- forced punchiness, defensive phrasing or register changes.

Put these findings in `findings_judged` with the stable `VI-*` codes from those
references. Map architecture, heading, slide heading, SEO heading and referent failures to the legacy
aggregate `judged.reader_addressed`. Map sentence, code-switch, hyper-correction, social tone, sales claim and
editorial-tone failures to the legacy aggregate `judged.register_uniform`.
Keep the specific `VI-*` code in `findings_judged`; the aggregate key names
predate the Vietnamese editorial layer and do not replace a specific finding.

## 6. Apply false-positives.md before reporting

Look for **clusters**, never isolated tells. One em dash means nothing.

Never report a term from the pack's `loanwords`.

## 7. Three verdicts

| Verdict | When |
|---|---|
| `đạt` | backed, or legitimately exempt |
| `vi phạm` | a rule is broken and you can say which fact is missing |
| `chưa xác định` | no source available to check against |

`chưa xác định` gets its own row. It is **not** a violation. Folding it into
`vi phạm` makes every isolated check red and the user stops opening the tool;
folding it into `đạt` makes the tool lie.

**These three strings are the whole vocabulary, and they are identifiers rather
than prose.** A `verdict` field carries one of them and nothing else, in an
English document exactly as in a Vietnamese one. The sentence saying which fact
is missing goes in `reason`, which is free text. Putting the sentence in
`verdict` is what broke the first version of this contract: a consumer that
switches on `verdict` has no case for `không chống lưng`.

The human table in step 9 is prose and is not bound by this. It reads
`cần sửa` where the JSON says `vi phạm`.

## 8. Unregistered language and bilingual documents

Same rules as `antislop-write`, spec section 6.3. For an unregistered language
the lexical counters come back `null` rather than `0`: `null` means not
measured, `0` means measured and clean.

That is the only difference. Whether the JSON block is emitted at all is
decided in step 9 and nothing here changes it.

## 9. Output

The table for the reader, always:

```
[check · R · vi]

ĐẾM ĐƯỢC                          thấy   ngưỡng
  dash (— –)                         3        0
  cụm trong ban list                 7        0
  mt_artifacts                       2        0
  superlative                        1     0 (tier C)
  puffery                            2   theo tier
  comparative                        1   xem PHÁN ĐOÁN
  eval_candidate (ứng viên)          5   xem PHÁN ĐOÁN
  câu cùng khuôn liên tiếp           4        3
  short_paragraph_ratio          11/14   tham chiếu
  colon_outside_list                 9   ~1/300 từ

PHÁN ĐOÁN
  bằng chứng chống lưng          cần sửa   3/5 ứng viên thiếu
  mốc so sánh nêu rõ              đạt
  câu chữ và giọng biên tập     cần sửa
  cung lập luận 4 phần            đạt
  cấu trúc và hướng tới người đọc  đạt
  nguồn claim đã duyệt      chưa xác định   không có .antislop-claims.txt

KẾT LUẬN: CẦN SỬA
```

Six rows, always all six, in that order. Each maps to one key in the `judged`
object, and the JSON key never changes with the document's language:

| Row | Key |
|---|---|
| bằng chứng chống lưng | `evidence_backed` |
| mốc so sánh nêu rõ | `comparator_named` |
| câu chữ và giọng biên tập | `register_uniform` |
| cung lập luận 4 phần | `four_part_arc` |
| cấu trúc và hướng tới người đọc | `reader_addressed` |
| nguồn claim đã duyệt | `provenance` |

Then the specific locations. For editorial findings, explain the reader impact
and give one replacement that fits the surrounding section. Do not merely say
that a sentence “sounds like AI”.

Then a rewrite, only if asked. “Review”, “check” and “audit” ask for findings,
not an automatic rewrite. “Fix”, “clean up”, “edit” and “rewrite” authorize the
rewrite.

**The JSON block appears only when the request contains the word `json`.** One
condition, no others: not the tier, not the language, not whether the document
is clean. It goes last, after the human table, fenced.

The shape is `../../schema/check-output.schema.json`, and that file is the
contract. The example below is the real output for
`../../tests/fixtures/judged/unbacked-vi.md`, a four line report reading
`Đội ngũ tận tâm.` and `Sản phẩm đứng đầu phân khúc.` under a heading. A test
re-scans that file and fails if this block stops matching, so what you see here
is what the scanner actually produces:

```json
{
  "tier": "R",
  "lang": "vi",
  "counted_source": "scan",
  "counted": {
    "dash": 0,
    "banlist": 0,
    "mt_artifacts": 0,
    "superlative": 1,
    "puffery": 0,
    "comparative": 0,
    "eval_candidate": 1,
    "same_shape_run": 1,
    "colon_outside_list": 0,
    "short_paragraph_ratio": [2, 2]
  },
  "findings_mechanical": [
    { "rule": "VI-EVAL-CANDIDATE", "span": [36, 43], "text": "tận tâm",
      "lang": "vi", "block": 1, "tier": "R", "block_has_data": false },
    { "rule": "VI-SUPERLATIVE", "span": [55, 63], "text": "đứng đầu",
      "lang": "vi", "block": 2, "tier": "R" }
  ],
  "findings_judged": [
    { "rule": "EVID-UNBACKED", "span": [36, 43], "text": "tận tâm",
      "lang": "vi", "block": 1, "tier": "R",
      "verdict": "vi phạm", "reason": "khối không có fact nào chứng minh" },
    { "rule": "EVID-UNBACKED", "span": [55, 63], "text": "đứng đầu",
      "lang": "vi", "block": 2, "tier": "R",
      "verdict": "vi phạm", "reason": "không nêu mốc so sánh" }
  ],
  "judged": {
    "evidence_backed": "vi phạm",
    "comparator_named": "vi phạm",
    "register_uniform": "đạt",
    "four_part_arc": "đạt",
    "reader_addressed": "đạt",
    "provenance": "chưa xác định"
  }
}
```
