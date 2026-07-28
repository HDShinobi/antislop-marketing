# Gói ngôn ngữ tiếng Việt

Phần này giải thích các lựa chọn ngôn ngữ. Mọi mục từ mà scanner sử dụng đều
nằm trong khối JSON `antislop-pack` ở cuối file. Nếu liệt kê ở hai chỗ, skill
và `scan.mjs` có thể áp dụng hai bộ quy tắc khác nhau.

## 1. Metadata

| | |
|---|---|
| Mã ngôn ngữ | `vi` |
| Nhãn | soát rồi |
| Người soát | HDShinobi, người bản xứ, làm marketing performance |
| Ngày soát | 2026-07-27 |

Khi viết hoặc kiểm tra nội dung tiếng Việt dành cho người đọc, tải thêm
`vi-editorial.md`. Tài liệu đó quy định cách xử lý tiêu đề, câu đầy đủ, tham
chiếu, pha ngôn ngữ, giọng biên tập và kiến trúc thông tin. Các quy tắc này
không nằm trong JSON vì chúng cần hiểu người đọc và toàn văn bản, không thể đếm
bằng scanner.

## 2. Danh sách cấm

Cụm không bao giờ được dùng, bất kể tier. Ba nhóm.

Trong file này mọi cụm đều viết trong backtick. Backtick nghĩa là cụm đang được
**gọi tên**, không phải đang được dùng, và `scan.mjs` bỏ qua code span đúng vì
lý do đó. Nhờ vậy một gói ngôn ngữ có thể mô tả danh sách cấm của chính nó mà
không tự báo lỗi khi repo quét lại tài liệu.

**Bản dịch của các dấu hiệu AI trong tiếng Anh.** Nhóm này lộ nhất vì nó không
phải cách người Việt nói, mà là cách máy dịch một khuôn tiếng Anh.

`đóng vai trò quan trọng trong việc` là bản dịch của `plays a crucial role in`.
`không chỉ ... mà còn` là negative parallelism. `góp phần` và
`mang lại hiệu quả` là participial tack-on: chúng dán một mệnh đề vào cuối câu
để câu trông sâu sắc hơn.

Bản trước ghi kèm `plays a crucial role in` một xếp hạng "trigram AI phổ biến
nhất năm 2026". Con số đó lấy từ nguồn upstream và không dẫn được về đâu, nên
đã bỏ. Cùng chính sách với ngưỡng độ dài câu ở mục 7.

**Mở bài và kết bài công thức.** `Trong thời đại số hoá ngày nay`,
`Trong bối cảnh`, `Tóm lại`, `Nhìn chung`. Chúng không mang thông tin, chỉ
báo hiệu rằng một đoạn sắp bắt đầu hoặc vừa kết thúc.

**Tàn dư hội thoại.** `Hy vọng bài viết mang lại`, `Chúc bạn thành công`.
Đây là chữ của chatbot bị dán nhầm vào tài liệu.

## 3. Cụm công thức và hai quy tắc chỉ mô hình áp dụng được

`scan.mjs` không đếm hai quy tắc dưới đây vì chúng cần ngữ cảnh mà một phép quét
theo khối không có. Mỗi quy tắc có mã riêng để `antislop-check` báo được.

**`VI-NOMINALIZATION`.** Danh từ hoá chỗ một động từ gánh được.

```
"việc triển khai chiến dịch"      ->  "triển khai chiến dịch"
"quá trình tối ưu hoá ngân sách"  ->  "tối ưu ngân sách"
"sự cải thiện về mặt chi phí"     ->  "chi phí giảm"
```

Cần ngữ cảnh, vì `việc` không phải lúc nào cũng thừa: `việc này khó` là bình
thường.

**`VI-ADDRESS-CONSISTENCY`.** Xưng hô chọn một lần và giữ nguyên cả tài liệu.
Nửa đầu `chúng tôi đề xuất` rồi nửa sau `bên mình sẽ chạy` là lỗi. Cần theo
dõi xuyên khối, ngoài tầm một máy quét theo khối.

## 4. Dấu vết dịch máy

Cấu trúc tiếng Anh dịch thẳng sang, giữ nguyên khung câu gốc.

| Dấu vết | Gốc tiếng Anh | Người Việt viết |
|---|---|---|
| `được thực hiện bởi` | `was performed by` | do ... làm |
| `nơi mà` | `where` | chỗ, hoặc bỏ hẳn |
| `điều mà` | `which` | bỏ hẳn |
| `một trong những` | `one of the` | bỏ, hoặc nêu thẳng |

`Một trong những` đáng nói riêng. Nó gần như luôn đi kèm một cực cấp
(`một trong những thương hiệu hàng đầu`) và làm câu vừa dài vừa yếu.

## 5. Xưng hô theo tier

| Tier | Người viết | Người đọc |
|---|---|---|
| R | chúng tôi | quý khách, hoặc bỏ hẳn đại từ |
| P | chúng tôi | anh chị, quý khách |
| C | bên mình | bạn |

Tier R thường không cần đại từ chỉ người đọc. `CPA giảm 26 phần trăm` mạnh hơn
`chúng tôi đã giúp quý khách giảm CPA 26 phần trăm`.

Chọn một lần, giữ cả tài liệu. Xem `VI-ADDRESS-CONSISTENCY` ở mục 3.

## 6. Tiểu từ theo mức

| Mức | Tiểu từ |
|---|---|
| 2 TỰ NHIÊN | tắt. Không `nhé`, không `nha`, không `ấy` |
| 3 ĐỜI THƯỜNG | bật: `thì, mà, ấy, nhé, nha, đấy, luôn` |

Mức 2 vẫn cho phép `thì` khi nó làm nhiệm vụ ngữ pháp thật
(`nếu chạy Search thì CPA thấp hơn`), chỉ cấm `thì` dùng như tiểu từ đệm
(`cái này thì cũng ổn thì phải`).

## 7. Nhịp câu

Bảng phân lớp từ mở đầu và danh sách tack-on nằm trong khối JSON. Bốn lớp đóng
được khai; lớp thứ năm `khac` là dự phòng và không khai.

**Không có ngưỡng độ dài câu.** Spec cố tình không đặt một con số "câu tiếng
Việt nên dài bao nhiêu". `same_shape_run` đo **giống khuôn**, không đo **dài
ngắn**, và giống khuôn mới là thứ thật sự lộ máy. Giới hạn số từ, nếu cần, là
chuyện người dùng nêu trong yêu cầu.

## 8. Từ khoá nhận diện tier

Trong khối JSON. Đây là dữ liệu cho bảng quyết định ở `core.md`, không phải bảng
quyết định.

## Danh sách trắng thuật ngữ

Báo cáo tiếng Việt chêm thuật ngữ tiếng Anh là chuẩn ngành, không phải chuyển
ngôn ngữ. Skill không được dịch `remarketing` thành `tiếp thị lại`, cũng không
được dịch `insight` thành `sự thấu hiểu`. Danh sách ở khoá `loanwords`.

Từ mượn không kích hoạt gói ngôn ngữ thứ hai. Một báo cáo dày thuật ngữ vẫn là
văn bản một ngôn ngữ.

## Từ đã soát và cố ý không đưa vào

`Chuyên nghiệp` và `uy tín` là từ vựng kinh doanh chuẩn của tiếng Việt, không
phải slop. `Đội ngũ chuyên nghiệp` trong một proposal đọc bình thường, và bắt
người viết chứng minh chữ đó mỗi lần sẽ tạo ma sát trên hầu hết tài liệu mà
không đổi lại được gì.

Đây là quyết định của người Việt đã soát gói ngôn ngữ và là cơ sở cho nhãn
`soát rồi` ở mục 1.

## Cơ sở pháp lý của quy tắc về từ cực cấp

Quy tắc “tier C cấm từ cực cấp” ở mục 2 của `core.md` được áp dụng mặc định cho
thị trường Việt Nam. Phần này giải thích cơ sở của quy tắc đó. `core.md` không
chứa mục từ riêng của từng ngôn ngữ nên cơ sở pháp lý được đặt trong gói tiếng
Việt.

| Văn bản | Nội dung |
|---|---|
| Luật Quảng cáo 2012, Điều 8 khoản 11 | cấm quảng cáo dùng `nhất`, `duy nhất`, `tốt nhất`, `số một` hoặc từ ngữ có ý nghĩa tương tự mà không có tài liệu hợp pháp chứng minh |
| Luật 75/2025/QH15 | sửa đổi bổ sung Luật Quảng cáo, hiệu lực 1/1/2026 |
| Thông tư 12/2026/TT-BVHTTDL | quy định tài liệu chứng minh nào hợp lệ, hiệu lực 5/7/2026 |
| Nghị định 38/2021/NĐ-CP, Điều 34 | phạt 10 đến 20 triệu đồng với cá nhân, tổ chức gấp đôi |

Tài liệu hợp pháp chứng minh, theo hướng dẫn hiện hành, là kết quả khảo sát thị
trường của tổ chức có chức năng nghiên cứu thị trường, hoặc giấy chứng nhận do
cơ quan có thẩm quyền cấp tại cuộc thi, triển lãm hay giải thưởng quy mô toàn
quốc, khu vực, quốc tế. Một con số nội bộ không đủ.

Nguồn:

- <https://thuvienphapluat.vn/van-ban/Thuong-mai/Luat-Quang-cao-sua-doi-2025-so-75-2025-QH15-555035.aspx>
- <https://dms.gov.vn/tin-chi-tiet/-/chi-tiet/noi-dung-quang-cao-su-dung-tu-nhat-duy-nhat-tot-nhat-so-mot-hoac-cac-tu-ngu-co-y-nghia-tuong-tu-chi-%C4%91uoc-phep-khi-nao--70657-3.html>
- <https://vcci.com.vn/legal-document/nghi-dinh-382021nd-cp-quy-dinh-xu-phat-vi-pham-hanh-chinh-trong-linh-vuc-van-hoa-va-quang-cao>

Bản trước của repo nói Meta, Google và TikTok đều từ chối quảng cáo có từ cực
cấp, kể cả khi có căn cứ. Nhận định đó không đủ cơ sở. TikTok cấm một số cụm từ
tuyệt đối, còn Google đánh giá độ chính xác của nội dung khẳng định thay vì chỉ
dựa vào từ vựng. Không có nguồn nào cho thấy mọi nền tảng đều từ chối các quảng
cáo này. Xem mục “Cực cấp ngoài Việt Nam” trong `en.md`.

## Ngoại lệ khớp

Khoá `exceptions` chặn một cụm khi nó nằm trong một chuỗi dài hơn.

Nhóm thứ nhất là **trùng âm ngẫu nhiên**. `Hàng đầu` là cực cấp, nhưng
`hàng đầu tiên` nghĩa là thứ tự và hoàn toàn vô hại. `Tốt` là đánh giá,
`tốt nghiệp` thì không.

Nhóm thứ hai là **cụm danh từ cố định của ngành**, và nhóm này quan trọng hơn.
`Hiệu quả` là từ đánh giá, nhưng `báo cáo hiệu quả` và *"hiệu quả quảng
cáo"* là tên gọi của một loại tài liệu và một chỉ số. Nếu để lọt thì mọi tiêu đề
báo cáo đều bị báo lỗi, và người dùng sẽ tắt công cụ.

Danh sách này lớn dần: gặp ca mới thì thêm vào.

```json antislop-pack
{
  "lang": "vi",
  "banlist": [
    "đóng vai trò quan trọng trong việc",
    "đóng vai trò then chốt",
    "không chỉ",
    "góp phần",
    "mang lại hiệu quả",
    "trong thời đại số hoá ngày nay",
    "trong thời đại ngày nay",
    "trong bối cảnh hiện nay",
    "tóm lại",
    "nhìn chung",
    "nói tóm lại",
    "hy vọng bài viết mang lại",
    "chúc bạn thành công"
  ],
  "mt_artifacts": [
    "được thực hiện bởi",
    "được tiến hành bởi",
    "nơi mà",
    "điều mà",
    "một trong những"
  ],
  "superlative": [
    "tốt nhất",
    "hàng đầu",
    "số một",
    "số 1",
    "đứng đầu",
    "dẫn đầu",
    "duy nhất",
    "vô địch",
    "đỉnh cao"
  ],
  "puffery": [
    "đột phá",
    "tiên phong",
    "vượt trội",
    "toàn diện",
    "đẳng cấp",
    "hoàn hảo",
    "tuyệt vời",
    "đáp ứng mọi nhu cầu",
    "giải pháp toàn diện",
    "chất lượng cao cấp"
  ],
  "comparative": [
    "hơn hẳn",
    "vượt xa",
    "gấp nhiều lần",
    "ưu việt hơn"
  ],
  "evaluative": [
    "tốt",
    "kém",
    "hiệu quả",
    "mạnh",
    "yếu",
    "chậm",
    "nhanh",
    "ổn",
    "tệ",
    "đáng kể",
    "rõ rệt",
    "tích cực",
    "tiêu cực",
    "hợp lý",
    "chưa tối ưu",
    "tận tâm",
    "ấn tượng",
    "khả quan"
  ],
  "abbreviations": [
    "v.v.",
    "TP.",
    "Tp.",
    "ThS.",
    "TS.",
    "PGS.",
    "GS.",
    "Q.",
    "tr.",
    "St."
  ],
  "exceptions": {
    "hàng đầu": ["hàng đầu tiên"],
    "duy nhất": ["mã duy nhất", "id duy nhất"],
    "không chỉ": ["không chỉ định", "không chỉ số"],
    "hiệu quả": [
      "báo cáo hiệu quả",
      "hiệu quả quảng cáo",
      "hiệu quả chiến dịch",
      "chỉ số hiệu quả",
      "đo lường hiệu quả",
      "tối ưu hiệu quả"
    ],
    "mạnh": ["thế mạnh", "điểm mạnh"],
    "nhanh": ["nhanh chóng"],
    "tốt": ["tốt nghiệp"],
    "ổn": ["ổn định"],
    "chậm": ["chậm nhất"]
  },
  "openers": {
    "dai_tu": [
      "tôi", "chúng tôi", "chúng ta", "bạn", "anh", "chị", "anh chị",
      "quý khách", "bên mình", "mình", "họ", "nó"
    ],
    "lien_tu": [
      "nhưng", "và", "tuy nhiên", "vì vậy", "ngoài ra", "do đó", "song",
      "thế nhưng", "hơn nữa", "mặt khác", "bên cạnh đó"
    ],
    "trang_ngu": [
      "trong", "sau khi", "trước khi", "khi", "nếu", "dù", "với", "theo",
      "từ", "để", "tại", "về", "nhờ", "dựa trên", "kể từ"
    ]
  },
  "tackon": [
    "góp phần",
    "mang lại",
    "nhằm",
    "qua đó",
    "từ đó",
    "giúp cho",
    "tạo điều kiện",
    "thể hiện"
  ],
  "config_tokens": [
    "campaign", "ad group", "ad set", "keyword", "bidding", "pixel",
    "tracking", "conversion", "audience", "placement", "landing page",
    "creative", "budget", "funnel"
  ],
  "loanwords": [
    "ROAS", "ROI", "CPA", "CPC", "CPM", "CTR", "CVR", "AOV", "LTV", "GMV", "SKU", "CPAS",
    "remarketing", "retargeting", "prospecting", "audience", "creative",
    "funnel", "insight", "brief", "budget", "bidding", "impression",
    "reach", "engagement", "lookalike", "pixel", "tracking", "landing page",
    "geo-target", "geo-targeting", "partnership ads", "koc", "kol", "koc/kol",
    "seller center", "odoo", "pos", "deck", "slide", "action plan", "paid media"
  ],
  "tier_keywords": {
    "R": [
      "báo cáo", "audit", "phân tích", "tổng kết", "performance",
      "số liệu", "kết quả tháng", "hiệu quả"
    ],
    "P": [
      "proposal", "đề xuất", "kế hoạch", "plan", "sow", "roadmap",
      "báo giá", "pitch", "phương án", "readme", "tài liệu hướng dẫn",
      "hướng dẫn sử dụng", "tài liệu sản phẩm", "chính sách",
      "ghi chú phát hành", "slide", "presentation", "deck", "action plan"
    ],
    "C": [
      "caption", "post", "ad copy", "content", "email marketing",
      "landing", "tagline", "blog", "bài viết", "quảng cáo"
    ]
  }
}
```
