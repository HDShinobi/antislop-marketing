---
name: antislop-check
description: Audit an existing document for AI writing tells and unbacked claims, in Vietnamese or English, and rewrite it on request. Use when asked to review, check, audit, proofread or clean up existing copy, a report, an audit, a proposal, ad text or a caption.
---

# antislop-check

Paths below are relative to this skill's own directory, not to the working
directory.

## 1. Infer the tier and language, and declare them

Tier: the decision table in `../../references/core.md` section 2, same as when
writing.

Language: **the language of the block being checked. One signal, no fallback.**
The language of the request is irrelevant. A Vietnamese request about an English
document loads `en.md`.

Print the line, then continue:

```
[R · mức 2 · trang trọng · vi]
```

## 2. Run the scanner

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

## 3. Copy findings_mechanical verbatim

Not one code, span, text, lang, block or tier value may be altered. Do not
filter, do not reorder, do not add.

## 4. Then judge, independently

Load `../../references/evidence.md` and `../../references/false-positives.md`.

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

## 5. Apply false-positives.md before reporting

Look for **clusters**, never isolated tells. One em dash means nothing.

Never report a term from the pack's `loanwords`.

## 6. Three verdicts

| Verdict | When |
|---|---|
| `đạt` | backed, or legitimately exempt |
| `vi phạm` | a rule is broken and you can say which fact is missing |
| `chưa xác định` | no source available to check against |

`chưa xác định` gets its own row. It is **not** a violation. Folding it into
`vi phạm` makes every isolated check red and the user stops opening the tool;
folding it into `đạt` makes the tool lie.

## 7. Unregistered language and bilingual documents

Same rules as `antislop-write`, spec section 6.3. For an unregistered language
the JSON block still appears, with the lexical counters `null` rather than `0`:
`null` means not measured, `0` means measured and clean.

## 8. Output

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
  giọng nhất quán quá mức       cần sửa
  cung lập luận 4 phần            đạt
  câu không có người nhận         đạt

KẾT LUẬN: CẦN SỬA
```

Then the specific locations. Then a rewrite, only if asked.

**The JSON block appears only when the request contains the word `json`.** It
goes last, after the human table, fenced:

```json
{
  "tier": "R",
  "lang": "vi",
  "counted_source": "scan",
  "counted": { "...": "copied verbatim from scan.mjs" },
  "findings_mechanical": [ "copied verbatim from scan.mjs" ],
  "findings_judged": [
    { "rule": "EVID-UNBACKED", "span": [412, 431], "text": "cải thiện đáng kể",
      "lang": "vi", "block": 9, "verdict": "không chống lưng" }
  ],
  "judged": { "register_uniform": "cần sửa", "four_part_dna": "đạt" }
}
```
