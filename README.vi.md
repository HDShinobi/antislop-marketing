# antislop-marketing

Viết và soát tài liệu marketing sao cho không đọc ra giọng máy, mà vẫn giữ được
từ vựng một tài liệu marketing cần có.

Hai skill cho Claude Code và Codex. Tiếng Việt và tiếng Anh.

[English](README.md)

## Giải quyết vấn đề gì

Bạn viết báo cáo, proposal và ad copy bằng AI, và output đọc ra là AI viết. Gửi
cái đó cho khách thì mất uy tín ngay dòng đầu.

Các công cụ chống slop có sẵn nhắm mục tiêu khác. Chúng được dựng để né công cụ
phát hiện AI, nên chúng cấm sạch cả từ vựng marketing bạn cần, và có cái còn
khuyến khích cố tình viết sai ngữ pháp cho "tự nhiên". Không ai muốn câu cụt sai
ngữ pháp trong deck gửi khách.

Bộ này nhắm đúng việc của bạn: giữ từ vựng và tính chuyên nghiệp, chỉ gỡ phần lộ
máy.

## Không làm gì

Bốn điều, nêu ra vì chúng quyết định rule nào bị loại.

- **Không nhằm né công cụ phát hiện AI.** Turnitin, GPTZero đều không phải đối
  tượng. Toàn bộ nhóm T-1 tới T-5 của repo gốc bị loại, cùng mọi rule cố tình
  tạo lỗi.
- Không dùng cho văn học, học thuật, luận văn.
- Không đụng code, comment, tài liệu kỹ thuật. Chỉ văn xuôi viết cho người đọc.
- Không viết nội dung thay bạn. Nó quản cách diễn đạt, không quyết định nói gì.

## Cài

```bash
# Claude Code
claude plugin marketplace add HDShinobi/antislop-marketing
claude plugin install antislop-marketing@antislop-marketing

# Codex
codex plugin marketplace add https://github.com/HDShinobi/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

Cần Node 20 trở lên cho phần scanner. Còn lại là Markdown. CI chạy đúng mức sàn
đã công bố và một bản cao hơn, nên con số này được kiểm chứ không phải nói suông.

## Dùng

Cứ viết. Skill tự nhận loại tài liệu và ngôn ngữ, in một dòng khai báo, rồi làm
luôn.

```
bạn   Viết báo cáo hiệu quả tháng 6. CPA 47 đô, mục tiêu 35. ROAS 3.4, mục tiêu 2.8.

nó    [R · mức 2 · trang trọng · vi]
      ...bản báo cáo...
```

Đoán sai? Gõ `tier C` là nó làm lại. Đoán đúng? Bỏ qua dòng đó.

Soát tài liệu đã có:

```
bạn   Soát lại bản proposal này giúp tôi
```

Thêm chữ `json` vào yêu cầu thì nó xuất kèm khối máy đọc được.

## Ba tier tài liệu

Tier quyết định được nói gì. Skill tự suy, không hỏi.

| Tier | Tài liệu | Puffery | Bằng chứng |
|---|---|---|---|
| **R** | báo cáo, audit, phân tích | cấm | bắt buộc |
| **P** | proposal, kế hoạch, SoW, báo giá | có điều kiện | bắt buộc với nhận định về thực tế |
| **C** | ad copy, caption, social | cho phép nếu được chống lưng, cực cấp cấm hẳn | không áp cho đánh giá thường |

Cực cấp cấm ở tier C vì lý do không liên quan gì tới văn phong, và lý do khác
nhau theo thị trường.

**Ở Việt Nam đây là luật.** Điều 8 khoản 11 Luật Quảng cáo 2012 cấm quảng cáo
dùng `nhất`, `duy nhất`, `tốt nhất`, `số một` hoặc từ ngữ có ý nghĩa tương tự mà
không có tài liệu hợp pháp chứng minh. Nghị định 38/2021 Điều 34 đặt mức phạt 10
đến 20 triệu đồng, tổ chức gấp đôi. Thông tư 12/2026 của Bộ Văn hoá, Thể thao và
Du lịch, hiệu lực từ 5/7/2026, quy định tài liệu nào được tính là hợp lệ. Đây là
thị trường công cụ này được viết cho, nên ở đây rule là rule cứng.

**Chính sách nền tảng mỏng hơn, và nên nói cho đúng.** TikTok cấm hẳn absolute
term về sản phẩm, ví dụ của chính họ là `Number 1 song on TikTok`. Google xét
claim theo độ chính xác chứ không theo từ vựng: policy unreliable claims nhắm
vào kết quả sai hoặc phi thực tế, không nhắm vào chữ `best`. Vậy nên quảng cáo
mang cực cấp không chắc chắn bị từ chối ở mọi nơi, và repo này không còn nói thế
nữa.

Ngoài Việt Nam, hãy đọc rule tier C như một guardrail cố ý bảo thủ. Muốn biến nó
thành check compliance thì phải tách policy theo nền tảng, ngành và thị trường
trước. Nguồn nằm trong `references/vi.md`.

## Bắt được gì

```
trước   Trong bối cảnh hiện nay, chiến dịch đã mang lại hiệu quả tích cực.
        Đội ngũ tận tâm đóng vai trò quan trọng trong việc tối ưu ngân sách.

sau     CPA tháng 6 là 31 đô, mục tiêu 35 đô. ROAS 3.4 so với mục tiêu 2.8.

        Phần lớn mức cải thiện đến từ remarketing: nhóm này chiếm 22 phần trăm
        ngân sách nhưng mang về 41 phần trăm doanh thu.
```

Thêm ví dụ ở [examples/](examples/).

Rule bị đánh giá thấp nhất: **tính từ đánh giá phải được chống lưng bởi một dữ
kiện chứng minh chính tính từ đó**, không phải một dữ kiện chỉ nằm cạnh.

```
không chống lưng   Đội ngũ tận tâm, CPA tháng này 31 đô.
chống lưng         CPA giảm từ 42 xuống 31 sau khi đội tách lại ad group
                   theo intent trong tuần đầu tháng.
```

Bài kiểm: xoá tính từ đi, dữ kiện còn lại có tự nói lên điều đó không. Không thì
tính từ chỉ là trang trí.

## Dựng thế nào

Nửa tất định là một scanner Node không phụ thuộc thư viện nào. Nửa phán đoán
thuộc về model. Không cái nào lấn sang cái kia.

| Đếm được, tái lập được | Phán đoán, không tái lập |
|---|---|
| dash, cụm bị cấm, cực cấp | dữ kiện có thật sự chống lưng không |
| chuỗi câu cùng khuôn | so sánh có nêu mốc không |
| ứng viên từ đánh giá | giọng, cung lập luận, câu có người nhận không |

Danh sách từ là **sàn, không phải cửa**. Tính từ là lớp mở, không danh sách hữu
hạn nào phủ hết, nên model đọc toàn văn bản độc lập chứ không tin danh sách của
scanner là đầy đủ.

## Language pack

| Pack | Trạng thái |
|---|---|
| `vi` | soát rồi, người bản xứ |
| `en` | soát rồi |

Thêm một ngôn ngữ là thêm một file và một dòng trong
`references/languages.json`. Không bao giờ phải sửa `core.md`. Xem
[CONTRIBUTING.md](CONTRIBUTING.md).

## Ghi công, và đã đổi gì

Phái sinh từ hai dự án MIT. Xem [NOTICE](NOTICE).

**[adenaufal/anti-slop-writing](https://github.com/adenaufal/anti-slop-writing)**
cho phần structural rule, vân tay theo model, và ý tưởng tier giọng từ bản
Indonesia.

Loại bỏ khỏi nó: nhóm chống detector, các rule cố tình tạo lỗi, và mọi con số
thống kê không dẫn được nguồn. Ngưỡng độ dài câu cũng bỏ, vì `same_shape_run` đo
giống khuôn, và giống khuôn mới là thứ đáng bắt.

**[blader/humanizer](https://github.com/blader/humanizer)** cho danh sách
đừng-flag và danh sách dấu hiệu văn người thật, cả hai ở
`references/false-positives.md`.

Thêm mới ở đây: tầng bằng chứng, hệ tier, pack tiếng Việt, scanner tất định, và
một họ tell thứ tư mà không nguồn nào có. Cái cuối đến từ một người đọc chính
bản mô tả của dự án này rồi chỉ ra ba câu trong đó nghe như máy.

## Phát triển

```bash
npm test                              # tầng 1 và 3, tất định
npm run validate-packs                # kiểm schema mọi pack
ANTISLOP_RUNNER=claude npm run test:fixtures   # tầng 2, có gọi model
node bin/scan.mjs --tier R --lang vi file.md
```

Tầng 2 cài plugin thật, nên nó đọc registry trước khi đụng vào, giữ nguyên thứ
gì đã cài sẵn, và từ chối chạy nếu có marketplace cùng tên trỏ đi chỗ khác thay
vì trỏ về checkout của bạn. Chi tiết nằm ở `CONTRIBUTING.md`.

Khối json mà `antislop-check` xuất được mô tả trong
`schema/check-output.schema.json`, và ví dụ trong skill được test lại với cả
schema lẫn một lần chạy scanner thật.

CI chỉ chạy tầng 1 và 3. Tầng 2 gọi model và tốn tiền nên để chạy tay.

Repo tự quét văn của chính nó, file nào phá rule mà nó mô tả thì CI đỏ. Đó là
cách mục `most` trong pack tiếng Anh được sửa: `most` trần là lượng từ nhiều hơn
là cực cấp.

Phạm vi quét được ép chứ không phải nói suông. Mọi file markdown trong repo hoặc
được quét, hoặc nằm trong `tests/scan-manifest.json` kèm lý do, và có test đỏ
nếu một file không thuộc nhóm nào. File rule, hai skill và hai language pack đều
bị quét với mọi pack đã đăng ký, không riêng pack của chính nó. Sáu counter
được kiểm: dash, ban list, dấu vết dịch máy, cực cấp, puffery, và chuỗi câu cùng
khuôn.

Một pack mô tả được ban list của chính nó vì cụm trong backtick là đang được gọi
tên chứ không phải đang dùng, và scanner bỏ qua code span.

## Giấy phép

MIT. Xem [LICENSE](LICENSE) và [NOTICE](NOTICE).
