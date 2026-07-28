# Biên tập nội dung tiếng Việt theo người đọc

Đọc file này khi viết hoặc kiểm tra nội dung tiếng Việt dành cho con người:
README, tài liệu sản phẩm, hướng dẫn, chính sách, báo cáo, proposal, email,
landing page và nội dung quảng cáo.

Các quy tắc ở đây bổ sung cho `vi.md`. `vi.md` quản từ vựng, xưng hô và dấu vết
dịch máy; file này quản cách biên tập toàn văn bản. Không dùng các quy tắc này
để sửa mã nguồn, cấu hình, tên API hoặc chuỗi giao diện bắt buộc phải giữ
nguyên.

## 1. Xác định người đọc trước khi sửa câu

Trước khi viết hoặc biên tập, trả lời thầm ba câu:

1. Ai sẽ đọc?
2. Họ mở tài liệu để làm gì?
3. Sau mỗi mục, họ cần biết hoặc làm được điều gì?

Nếu không trả lời được, đừng sửa từng từ ngay. Hãy xác định lại thứ tự các mục
trước. Một văn bản có câu sạch nhưng không đi theo nhu cầu của người đọc vẫn
đọc như nội dung được lắp từ một template.

### `VI-INFORMATION-ARCHITECTURE`

Báo khi cấu trúc tài liệu đi theo suy nghĩ của người viết thay vì câu hỏi của
người đọc. Các dấu hiệu thường gặp:

- phần giới thiệu chưa nói tài liệu hoặc sản phẩm dùng để làm gì;
- chi tiết triển khai xuất hiện trước cách cài đặt hoặc sử dụng;
- một README trộn hướng dẫn cho người dùng với chi tiết CI dành cho maintainer;
- phần pháp lý dài làm đứt luồng giới thiệu sản phẩm;
- nhiều mục trả lời cùng một câu hỏi hoặc một mục chứa nhiều đối tượng đọc.

Cách sửa là đổi thứ tự, gộp hoặc chuyển chi tiết sang tài liệu phù hợp. Không
cố cứu cấu trúc bằng câu chuyển ý.

## 2. Viết tiêu đề như biển chỉ đường

Tiêu đề phải cho người đọc biết phần bên dưới trả lời câu hỏi gì. Một danh từ
quen thuộc như “Cài đặt”, “Cách sử dụng” hoặc “Giấy phép” đã đủ rõ. Với chủ đề
trừu tượng, hãy nêu chủ thể hoặc lợi ích.

```text
MƠ HỒ                         RÕ
Giải quyết vấn đề gì          Plugin này giúp giải quyết vấn đề gì?
Không làm gì                  Phạm vi sử dụng
Ba tier tài liệu              Plugin phân loại tài liệu như thế nào?
Bắt được gì                   Plugin phát hiện và sửa những gì?
Dựng thế nào                  Plugin hoạt động như thế nào?
Language pack                 Ngôn ngữ được hỗ trợ
Phát triển                    Kiểm thử và đóng góp
```

Không kéo dài mọi tiêu đề thành một câu. “Plugin được build dựa trên ba loại
tier cho các loại tài liệu” dài hơn nhưng vẫn khó đọc vì lặp từ, pha ngôn ngữ
và mô tả cách xây thay vì điều người đọc cần biết.

### `VI-HEADING-CLARITY`

Báo khi tiêu đề:

- thiếu chủ thể nên chỉ rõ nghĩa với người đã biết nội dung;
- là một câu cụt mang giọng ghi chú nội bộ;
- dùng thuật ngữ của người viết thay cho câu hỏi của người đọc;
- dài do danh từ hoá, lặp từ hoặc nhồi nhiều ý;
- lặp cùng một khuôn ở hầu hết các mục.

Không báo các tiêu đề quy ước đã rõ như “Cài đặt”, “Ví dụ”, “API” hoặc “Giấy
phép”.

## 3. Dùng câu đầy đủ trong phần giải thích

Tiêu đề, nhãn, bullet và quảng cáo có thể là cụm từ. Phần giải thích trong
README, báo cáo, proposal và hướng dẫn nên dùng câu đầy đủ, trừ khi một câu cụt
có chủ đích và hợp với giọng của cả đoạn.

```text
GƯỢNG                         TỰ NHIÊN
Hai skill cho Claude và       Plugin gồm hai skill dành cho Claude và
Codex. Tiếng Việt và          Codex, hỗ trợ tiếng Việt và tiếng Anh.
tiếng Anh.

Bốn điều, nêu ra vì chúng      Plugin không hướng đến bốn nhóm nội dung
quyết định rule nào bị loại.  dưới đây.
```

### `VI-SENTENCE-COMPLETENESS`

Báo một cụm từ đứng như câu khi nó thiếu chủ ngữ, vị ngữ hoặc quan hệ với câu
trước, khiến người đọc phải tự nối nghĩa. Không báo:

- tiêu đề và nhãn giao diện;
- bullet cùng hoàn thành một câu dẫn;
- fragment có chủ đích ở tier C;
- câu trả lời ngắn trong hội thoại.

## 4. Giữ chủ thể và tham chiếu rõ

Các từ “nó”, “bộ này”, “cái đó”, “ở đây”, “phần này” chỉ tự nhiên khi danh từ
được nhắc ngay trước và không thể hiểu sang đối tượng khác. Trong tài liệu sản
phẩm, nhắc lại “plugin”, “scanner”, “quy tắc” hoặc tên file thường rõ hơn mà
không làm câu nặng.

```text
MƠ HỒ                         RÕ
Bộ này nhắm đúng việc của     Plugin giữ thuật ngữ marketing cần thiết và
bạn.                          loại các cách diễn đạt dễ lộ giọng máy.

Nó quản cách diễn đạt.        Plugin chỉ điều chỉnh cách diễn đạt; dữ kiện
                              vẫn do người dùng cung cấp.
```

### `VI-REFERENT-CLARITY`

Báo khi đại từ hoặc từ chỉ định không quay lại một đối tượng rõ ràng,
hoặc khi tài liệu đổi liên tục giữa “plugin”, “skill”, “bộ này” và “nó” cho
cùng một chủ thể.

## 5. Dùng thuật ngữ tiếng Anh có chọn lọc

Không dịch các thuật ngữ ngành đã có trong `loanwords`. Tuy vậy, danh sách
trắng không phải giấy phép thay một từ tiếng Việt thông dụng bằng tiếng Anh.

Giữ thuật ngữ khi người đọc trong ngành dùng nó hằng ngày hoặc khi đó là tên
kỹ thuật cần tra cứu: `ROAS`, `CPA`, `remarketing`, `scanner`, `JSON`, `CI`,
`tier`.

Ưu tiên tiếng Việt khi nghĩa không đổi:

| Tránh dùng dày đặc | Ưu tiên |
|---|---|
| output | nội dung đầu ra, kết quả |
| rule | quy tắc |
| claim | khẳng định, nội dung khẳng định |
| policy | chính sách |
| guardrail | nguyên tắc an toàn |
| compliance check | kiểm tra tuân thủ |
| model | mô hình, trừ khi đang nói tên model cụ thể |
| pack | gói ngôn ngữ |

Khi một thuật ngữ cần giữ, giải thích ở lần đầu nếu người đọc có thể chưa biết:
“cấp tài liệu (`tier`)”. Sau đó dùng một cách gọi nhất quán.

### `VI-CODE-SWITCH`

Báo khi câu pha tiếng Anh không cần thiết, đặc biệt khi:

- từ tiếng Việt thông dụng truyền đạt đủ nghĩa;
- một câu đổi ngôn ngữ nhiều lần làm nhịp đọc bị vỡ;
- thuật ngữ chưa được giải thích cho nhóm người đọc mục tiêu;
- cùng một khái niệm lúc dùng tiếng Việt, lúc dùng tiếng Anh.

Không báo tên sản phẩm, lệnh, tên trường dữ liệu, chỉ số ngành hoặc thuật ngữ
nằm trong `loanwords` khi được dùng đúng nghĩa.

## 6. Tránh giọng cố tỏ ra sắc hoặc cố chứng minh mình đúng

Nội dung chống giọng máy dễ đi quá xa theo hướng ngược lại: câu quá cụt, khẩu
ngữ gượng, hoặc liên tục phủ định một cách viết khác. Giọng tự nhiên không đồng
nghĩa với giọng suồng sã hay đối đầu.

```text
GƯỢNG                         TRUNG TÍNH
Con số này được kiểm chứ      CI kiểm thử trên Node.js 20 và 22.
không phải nói suông.

Ở Việt Nam đây là luật.       Lưu ý đối với nội dung quảng cáo tại
                              Việt Nam

Rule là rule cứng.            Plugin áp dụng quy tắc này mặc định cho
                              nội dung quảng cáo tại Việt Nam.
```

### `VI-EDITORIAL-TONE`

Báo khi văn bản có một cụm dấu hiệu:

- câu liên tục tự khẳng định độ đúng, độ thật hoặc sự khác biệt của chính nó;
- dùng giọng tranh luận khi người đọc chỉ cần thông tin;
- cố tạo vẻ “người thật” bằng tiếng lóng, câu cụt hoặc câu hỏi dồn;
- gọi cách làm khác là hiển nhiên tệ mà không cần thiết cho hướng dẫn;
- thay đổi thất thường giữa trang trọng, suồng sã và ngôn ngữ kỹ thuật.

Một câu mạnh hoặc thân mật riêng lẻ không phải vi phạm. Hãy xét cả đoạn và mục
đích của tài liệu.

### `VI-HYPER-CORRECTION`

Báo khi văn bản cố tình né từ cấm bằng cách dùng câu diễn đạt vòng vèo, chọn từ
đồng nghĩa gượng ép hoặc viết dài dòng một cách kỳ quặc, khiến câu văn đọc khó hiểu
và thiếu tự nhiên hơn văn bản ban đầu.

## 6b. Biên tập các Document Profiles chuyên biệt

Tải tài liệu quy tắc bổ sung tương ứng với profile của văn bản:

- **Slide & Presentation (`slide` / `deck`)**: Tải `vi-slide-presentation.md`. Áp dụng **Action Titles** (`VI-SLIDE-NONACTION-HEADER`), bullet telegraphic, metric-first, bold lead-in và cấu trúc chỉ số `dẫn đầu`. Tránh nhét văn xuôi vào slide (`VI-SLIDE-PROSE-MISMATCH`).
- **Social Content (`social`)**: Tải `vi-social.md`. Áp dụng Hook 3s (`VI-SOCIAL-WEAK-HOOK`), giọng văn hội thoại tự nhiên (`VI-SOCIAL-STIFF-TONE`), ngắt dòng thoáng và tránh spam icon (`VI-SOCIAL-OVERUSED-ICONS`).
- **Nội dung Bán hàng & Landing Page (`sales`)**: Tải `vi-sales.md`. Áp dụng khung PAS/AIDA, chuyển đổi tính năng sang lợi ích (`VI-SALES-FEATURE-ONLY`), bổ sung bằng chứng chứng nhận (`VI-SALES-UNBACKED-CLAIM`) và offer rõ ràng (`VI-SALES-VAGUE-OFFER`).
- **Nội dung SEO, GEO & AEO (`seo_geo`)**: Tải `vi-seo-geo.md`. Áp dụng câu trả lời trực tiếp 1-3 câu dưới H2/H3 (`VI-GEO-MISSING-DIRECT-ANSWER`), Bảng so sánh và danh sách dữ liệu dễ trích xuất (`VI-GEO-POOR-EXTRACTABILITY`), tránh nhồi từ khóa (`VI-SEO-KEYWORD-STUFFING`).

## 7. Biên tập theo hai lượt

Lượt một kiểm nội dung:

- dữ kiện, nguồn, mốc so sánh và phạm vi khẳng định;
- thứ tự các mục và thông tin còn thiếu;
- thuật ngữ cần giữ nguyên.

Lượt hai đọc như người nhận:

- tiêu đề có giúp tìm thông tin không;
- câu có đầy đủ và rõ chủ thể không (trừ slide bullets và social fragments);
- từ tiếng Anh có thật sự cần không;
- giọng có phù hợp quan hệ giữa người viết và người đọc không;
- chi tiết có nằm đúng tài liệu không.

Không bắt đầu bằng thay từ đồng nghĩa. Nếu vấn đề nằm ở cấu trúc, tiêu đề hoặc
đối tượng đọc, sửa từng từ chỉ làm văn bản trơn hơn chứ không tự nhiên hơn.

## 8. Ánh xạ sang kết quả kiểm tra

Đưa từng lỗi cụ thể vào `findings_judged` với mã tương ứng:

- `VI-INFORMATION-ARCHITECTURE`
- `VI-HEADING-CLARITY`
- `VI-SENTENCE-COMPLETENESS`
- `VI-REFERENT-CLARITY`
- `VI-CODE-SWITCH`
- `VI-EDITORIAL-TONE`
- `VI-HYPER-CORRECTION`
- `VI-SLIDE-NONACTION-HEADER`
- `VI-SLIDE-PROSE-MISMATCH`
- `VI-SOCIAL-WEAK-HOOK`
- `VI-SOCIAL-STIFF-TONE`
- `VI-SOCIAL-OVERUSED-ICONS`
- `VI-SALES-FEATURE-ONLY`
- `VI-SALES-UNBACKED-CLAIM`
- `VI-SALES-VAGUE-OFFER`
- `VI-GEO-MISSING-DIRECT-ANSWER`
- `VI-GEO-POOR-EXTRACTABILITY`
- `VI-SEO-KEYWORD-STUFFING`

Trong phần tổng kết:

- lỗi kiến trúc, tiêu đề, tiêu đề slide, tiêu đề SEO hoặc tham chiếu làm nhóm “cấu trúc và hướng tới người
  đọc” (`reader_addressed`) thành `vi phạm`;
- lỗi câu, pha ngôn ngữ, văn gượng ép (hyper-correction), giọng social, hoặc giọng biên tập làm nhóm “câu chữ và giọng biên
  tập” (`register_uniform`) thành `vi phạm`;
- dùng `chưa xác định` chỉ khi thật sự thiếu ngữ cảnh về người đọc, không dùng
  để né một lỗi đã nhìn thấy trong văn bản.

Hai tên trường JSON là định danh cũ được giữ để tương thích. Luôn ghi mã
`VI-*` cụ thể trong `findings_judged`; không dùng tên nhóm tổng kết thay cho mã
lỗi.
