# spec-harden SUMMARY

Spec: `docs/superpowers/specs/2026-07-26-antislop-marketing-design.md`
Ngày chạy: 2026-07-26
Critic: Codex `gpt-5.6-terra`, effort `medium`, `--depth design`
Final-verify: không dùng (`final_verify: off`)

## Kết quả

| | |
|---|---|
| Số vòng | 32 |
| Hội tụ ở vòng | 32 (`OPEN_BLOCKERS: 0`, `OPEN_MAJORS: 0`) |
| Tổng finding | 69 |
| Accept | 69 |
| Rebut | 0 |
| Spec | 406 → 1321 dòng |
| Major chưa xử lý | 0 |

### Theo mức nghiêm trọng

| Mức | Số lượng |
|---|---|
| blocker | 0 |
| major | 60 |
| minor | 9 |
| nit | 0 |

### Theo lens

| Lens | Số lượng |
|---|---|
| testability | 26 |
| ambiguity | 18 |
| completeness | 12 |
| design | 10 |
| scope | 2 |
| assumptions | 1 |

### Đường cong major theo vòng

```
5 2 3 2 2 1 3 2 1 2 1 2 3 1 3 3 2 2 2 1 3 1 1 1 1 1 1 2 2 2 2 0
```

Không đơn điệu giảm. Vòng 11 tác giả đánh giá là không hội tụ và đề nghị dừng;
người dùng chọn chạy tiếp, và nó hội tụ sau 21 vòng nữa. Phần lớn finding từ
vòng 2 trở đi là hệ quả của bản sửa vòng trước, đặc trưng của `--depth design`
trên spec kỹ thuật: mỗi lần làm rõ một chỗ lại mở ra bề mặt mới để soi.

## Bốn chuỗi thay đổi lớn nhất

### 1. Kỷ luật bằng chứng, bốn đời

```
"phải kèm số"          -> loại mất audit định tính (v2)
"kèm dữ kiện"          -> "kèm" không đòi quan hệ chứng minh (v3)
"phải chống lưng"      -> danh sách hữu hạn không phủ lớp mở (v23)
"danh sách là sàn"     -> ổn định
```

Ca dẫn đường suốt cả chuỗi: `"Đội ngũ tận tâm, CPA tháng này 31$."` Dữ kiện có
mặt nhưng không chứng minh tính từ. Nó xuất hiện lại ở vòng 22 để bắt chính bộ
lọc cơ học mà vòng 6 dựng lên, vì bộ lọc đó loại "tận tâm" khỏi danh sách ứng
viên trước khi model kịp xét.

### 2. Ranh giới tất định

Chuỗi finding nhiều nhất (lens `testability`, 26 cái). Kết quả là mọi phép đo
đều tách đôi rõ ràng:

| Cơ học, assert được | Ngữ nghĩa, không assert |
|---|---|
| `eval_candidate` | `evidence_backing` |
| `findings_mechanical` (deep-compare) | `findings_judged` (so tập hợp) |
| `counted` từ `scan.mjs` | `judged`, ba nấc |

### 3. Giao diện có thật

```
scan(text, {tier, lang})
  -> nhận trọn tài liệu, không nhận từng khối        (v17)
  -> thêm langMap, tierMap                            (v17, v18)
  -> phát hiện vòng lặp gà-trứng: map đánh theo chỉ
     số khối mà chỉ scan mới biết chỉ số              (v29)
  -> công khai splitBlocks()                          (v29)
```

Cộng việc chuyển `scan.mjs` từ `tests/` sang `bin/`, vì skill chạy ở thư mục
người dùng chứ không ở checkout của repo (v20).

### 4. Ép tuân thủ contract

- `counted_source` bắt buộc là `"scan"`, nếu không thì lỗi môi trường (v10)
- deep-compare cả mảng `findings_mechanical` thay vì so tập mã (v26)
- `bin/validate-pack.mjs` kiểm 13 khoá schema pack (v30)
- canary probe xác nhận skill đã nạp trước khi chạy fixture (v8)

## Quyết định đảo chiều trong quá trình

| Vòng | Ban đầu | Sau |
|---|---|---|
| 14 → 15 | `comparative` cấm ở tier R | cần mốc nêu rõ, giống P và C |
| 5 → 10 | chênh lệch `counted` chỉ ghi log | lệch là test fail |
| 21 | khối máy đọc dùng YAML | dùng JSON, vì Node không có parser YAML sẵn |
| 23 → 31 | cấm assert phát hiện ngữ nghĩa | assert được, nhưng chỉ ca hiển nhiên |
| 18 → 30 | `tierMap` thắng bảng-tự-nhận | chuẩn R cho vùng số liệu là sàn, chỉ nâng được |

## Việc còn lại

Ghi ở mục 12 của spec. Cả ba việc chặn v1 đều là thử tay, không phải thiết kế
thêm:

1. Đường dẫn tương đối tới `references/` và `bin/scan.mjs` ở cả Claude Code và
   Codex, chạy từ CWD ngoài repo
2. Chốt hệ mã rule trước khi viết `references/`
3. Chốt lệnh cài và gỡ plugin cục bộ headless cho `claude` và `codex`

Không chặn v1: đo ngưỡng nhịp câu tiếng Việt (mục 7). v1 phát hành với
`same_shape_run >= 3` làm bài test thay thế, `vi` mang nhãn cộng đồng.

## Minor và nit chưa xử lý

Không có. Cả 9 minor đều được accept và sửa trong cùng vòng phát hiện.
