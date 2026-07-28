<div align="center">

# antislop-marketing

**`antislop-marketing` là plugin dành cho Claude Code và Codex, hỗ trợ viết và
kiểm tra nội dung tiếng Việt hoặc tiếng Anh.**

Plugin phát hiện những cách diễn đạt khiến báo cáo, proposal, README và nội
dung quảng cáo đọc giống văn bản do AI tạo ra. Khi chỉnh sửa, plugin giữ nguyên
dữ kiện và các thuật ngữ chuyên ngành cần thiết.

[![ci](https://github.com/HDShinobi/antislop-marketing/actions/workflows/ci.yml/badge.svg)](https://github.com/HDShinobi/antislop-marketing/actions/workflows/ci.yml)
[![version](https://img.shields.io/github/package-json/v/HDShinobi/antislop-marketing?label=version&color=3b4252)](package.json)
[![node](https://img.shields.io/badge/node-20%2B-3b4252)](package.json)
[![licence](https://img.shields.io/badge/licence-MIT-3b4252)](LICENSE)

[English](README.md) · **Tiếng Việt**

</div>

## Plugin này giúp giải quyết vấn đề gì?

AI có thể tạo bản nháp nhanh, nhưng nội dung đầu ra thường gặp một số vấn đề:
câu văn theo khuôn, nhận định thiếu dữ kiện, tiêu đề mơ hồ, cách diễn đạt giống
bản dịch máy hoặc giọng văn cố tỏ ra tự nhiên.

Dự án này không xử lý nội dung AI bằng cách cấm hàng loạt từ hoặc cố tình tạo
lỗi ngữ pháp. Plugin tập trung vào chất lượng biên tập: câu rõ nghĩa, thông tin
có căn cứ và giọng văn phù hợp với người đọc.

## Plugin hỗ trợ những loại nội dung nào?

Plugin phù hợp với nội dung viết cho người đọc, gồm:

- báo cáo, audit và phân tích;
- proposal, kế hoạch, slide thuyết trình, pitch deck và phạm vi công việc;
- README, tài liệu sản phẩm, chính sách và hướng dẫn sử dụng;
- email, landing page, quảng cáo, caption và bài đăng mạng xã hội.

Plugin không được thiết kế để chỉnh sửa mã nguồn, cấu hình hoặc schema dành cho
máy. Nó cũng không nhằm né các công cụ phát hiện AI và không tự bổ sung số liệu,
nguồn hoặc trích dẫn mà người dùng chưa cung cấp.

## Cài đặt

```bash
# Claude Code
claude plugin marketplace add HDShinobi/antislop-marketing
claude plugin install antislop-marketing@antislop-marketing

# Codex
codex plugin marketplace add https://github.com/HDShinobi/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

> [!NOTE]
> Scanner yêu cầu Node.js 20 trở lên.
> CI kiểm thử plugin trên Node.js 20 và 22.
> Phần còn lại của plugin được viết bằng Markdown.

## Cách sử dụng

### Viết nội dung mới

Gửi yêu cầu như bình thường:

```text
Viết báo cáo hiệu quả quảng cáo tháng 6.
CPA là 47 USD, mục tiêu 35 USD.
ROAS là 3,4, mục tiêu 2,8.
```

Plugin xác định cấp tài liệu, giọng điệu và ngôn ngữ trước khi viết:

```text
[R · mức 2 · trang trọng · vi]
```

Nếu kết quả phân loại chưa đúng, bạn có thể ghi rõ `tier R`, `tier P` hoặc
`tier C` trong yêu cầu tiếp theo.

### Kiểm tra hoặc biên tập nội dung có sẵn

```text
Kiểm tra README này và chỉ ra những đoạn còn đọc giống nội dung do AI tạo.
```

```text
Biên tập lại proposal này, giữ nguyên toàn bộ số liệu.
```

Yêu cầu “kiểm tra” hoặc “review” chỉ trả về nhận xét. Yêu cầu “sửa”, “biên tập”
hoặc “viết lại” cho phép plugin chỉnh nội dung. Thêm từ `json` nếu bạn cần kết
quả theo schema dành cho máy.

## Plugin phân loại tài liệu như thế nào?

Plugin dùng ba cấp tài liệu. Cấp tài liệu (`tier`) quản yêu cầu về bằng chứng
và mức độ sử dụng ngôn ngữ quảng cáo.

| Cấp | Loại tài liệu | Ngôn ngữ quảng cáo | Yêu cầu về bằng chứng |
|---|---|---|---|
| **R** | Báo cáo, audit, phân tích | Không dùng từ ngữ phóng đại | Nhận định phải có dữ kiện hỗ trợ |
| **P** | Proposal, README, kế hoạch, tài liệu sản phẩm | Chỉ dùng khi phù hợp | Khẳng định về thực tế phải có căn cứ |
| **C** | Quảng cáo, caption, bài đăng mạng xã hội | Cho phép có điều kiện | Không bắt buộc với đánh giá thông thường |

Định dạng tài liệu được xét riêng với cấp tài liệu. Chẳng hạn, README thường
thuộc tier P nhưng còn phải đáp ứng các yêu cầu về tiêu đề, thứ tự thông tin và
cách dùng thuật ngữ. Một yêu cầu “review README” không biến README thành báo cáo
tier R.

### Lưu ý đối với nội dung quảng cáo tại Việt Nam

> [!IMPORTANT]
> Với tier C, plugin không sử dụng các khẳng định như `tốt nhất`, `số một` hoặc
> `duy nhất`. Điều 8 khoản 11 Luật Quảng cáo 2012 chỉ cho phép dùng những từ này
> trong quảng cáo khi có tài liệu hợp pháp chứng minh. Vì vậy, plugin áp dụng quy
> tắc này mặc định cho nội dung quảng cáo tại Việt Nam.

Phạm vi pháp lý, tài liệu chứng minh và khác biệt giữa chính sách của từng nền
tảng được trình bày trong [`references/vi.md`](references/vi.md).

Plugin hỗ trợ biên tập nội dung, không thay thế việc thẩm định pháp lý cho một
chiến dịch cụ thể.

## Plugin phát hiện và sửa những gì?

Ví dụ dưới đây có từ ngữ công thức và hai nhận định không được dữ kiện hỗ trợ:

```text
Trước:
Trong bối cảnh hiện nay, chiến dịch đã mang lại hiệu quả tích cực.
Đội ngũ tận tâm đóng vai trò quan trọng trong việc tối ưu ngân sách.

Sau:
CPA tháng 6 là 31 USD, thấp hơn mục tiêu 35 USD.
ROAS đạt 3,4 so với mục tiêu 2,8.

Remarketing chiếm 22% ngân sách và tạo ra 41% doanh thu.
```

Ngoài từ cấm và dấu vết dịch máy, plugin còn kiểm tra:

- nhận định thiếu bằng chứng hoặc không nêu mốc so sánh;
- nhiều câu liên tiếp dùng cùng một cấu trúc;
- đoạn văn có nhịp quá đều hoặc cố tình ngắt vụn;
- tiêu đề không cho biết mục bên dưới nói về điều gì;
- câu thiếu chủ thể hoặc dùng đại từ không rõ đối tượng;
- cách pha tiếng Anh không cần thiết;
- giọng văn thay đổi thất thường hoặc cố tỏ ra sắc.

Các ví dụ khác nằm trong thư mục [`examples/`](examples/).

## Plugin hoạt động như thế nào?

Plugin kết hợp hai lớp kiểm tra:

| Scanner kiểm tra | Mô hình đánh giá |
|---|---|
| Dấu câu, cụm từ cấm và dấu vết dịch máy | Dữ kiện có thật sự hỗ trợ nhận định không |
| Chuỗi câu có cùng cấu trúc | Tiêu đề và thứ tự thông tin có phục vụ người đọc không |
| Từ đánh giá, so sánh và cực cấp | Giọng văn, cách xưng hô và mức độ pha ngôn ngữ |

Scanner chỉ đảm nhiệm những phép kiểm có thể lặp lại với cùng một kết quả.
Những vấn đề cần hiểu ngữ cảnh được giao cho mô hình và được ghi vào nhóm kết
quả phán đoán.

Với nội dung tiếng Việt, cả hai skill đều dùng thêm bộ quy tắc biên tập trong
[`references/vi-editorial.md`](references/vi-editorial.md) và bộ quy tắc riêng
cho slide trong
[`references/vi-slide-presentation.md`](references/vi-slide-presentation.md).
Các tài liệu này xử lý README, tài liệu sản phẩm, slide thuyết trình (action
titles, bullet telegraphic), tiêu đề, câu thiếu thành phần, tham chiếu mơ hồ,
cách pha tiếng Anh và giọng biên tập.

## Ngôn ngữ được hỗ trợ

| Gói ngôn ngữ | Trạng thái |
|---|---|
| `vi` | Đã được một người Việt làm performance marketing soát lại |
| `en` | Đã được soát lại |

Mỗi ngôn ngữ có danh sách từ, ngoại lệ, cách xưng hô và quy tắc nhịp câu riêng.
Xem [CONTRIBUTING.md](CONTRIBUTING.md) nếu bạn muốn bổ sung một ngôn ngữ.

## Nguồn tham khảo và những thay đổi chính

Plugin kế thừa một phần ý tưởng từ hai dự án MIT:

- [adenaufal/anti-slop-writing](https://github.com/adenaufal/anti-slop-writing)
  cung cấp các quy tắc cấu trúc và một số dấu hiệu theo từng họ mô hình.
- [blader/humanizer](https://github.com/blader/humanizer) cung cấp danh sách
  trường hợp không nên báo lỗi và các đặc điểm nên giữ lại trong văn bản do
  người viết.

Dự án này bổ sung scanner tất định, hệ thống tier, quy tắc về bằng chứng, gói
tiếng Việt và lớp biên tập theo người đọc. Các quy tắc nhằm né công cụ phát hiện
AI hoặc cố tình tạo lỗi ngữ pháp đã được loại bỏ.

Xem [NOTICE](NOTICE) để biết thông tin giấy phép của các dự án nguồn.

## Kiểm thử và đóng góp

```bash
npm test
npm run validate-packs
ANTISLOP_RUNNER=claude npm run test:fixtures
node bin/scan.mjs --tier R --lang vi file.md
```

<details>
<summary>Mỗi lệnh kiểm thử chạy những gì</summary>

`npm test` kiểm tra scanner, schema, manifest, fixture và các tài liệu được phát
hành cùng plugin. Bộ fixture dùng mô hình được chạy riêng vì có chi phí và cần
cài plugin vào môi trường kiểm thử.

Việc tự quét tài liệu từng giúp sửa mục `most` trong gói tiếng Anh: khi đứng
một mình, từ này thường là lượng từ chứ không phải từ cực cấp.

Quy trình phát triển, cách bảo vệ plugin registry và hướng dẫn thêm gói ngôn
ngữ nằm trong [CONTRIBUTING.md](CONTRIBUTING.md).

</details>

## Giấy phép

Dự án được phát hành theo giấy phép MIT. Xem [LICENSE](LICENSE) và
[NOTICE](NOTICE).
