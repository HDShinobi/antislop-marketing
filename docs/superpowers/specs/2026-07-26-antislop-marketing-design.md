# antislop-marketing: thiết kế

Ngày: 2026-07-26
Trạng thái: chờ duyệt
Kho: https://github.com/HDShinobi/antislop-marketing

## 1. Mục đích

Một plugin skill giúp viết và soát văn bản công việc trong ngành marketing sao cho không mang dấu vết máy sinh, nhưng vẫn giữ được từ vựng chuyên ngành và mức độ chuyên nghiệp cần có với khách hàng.

Ba loại tài liệu nằm trong phạm vi:

1. Báo cáo. Hiệu quả quảng cáo, audit tài khoản, tổng kết định kỳ.
2. Kế hoạch. Proposal, SoW, roadmap, báo giá, pitch.
3. Content marketing. Ad copy, caption, email, landing page, blog.

Hai ngôn ngữ ở bản đầu: tiếng Việt và tiếng Anh. Kiến trúc mở cho ngôn ngữ khác, mô tả ở mục 6.

### Nằm ngoài phạm vi

Bốn điều dưới đây không phải mục tiêu, và việc ghi rõ chúng quan trọng ngang phần trên vì nó quyết định rule nào bị loại.

Né công cụ phát hiện AI. Turnitin, GPTZero, Originality.ai đều không phải đối tượng. Đó là mục tiêu của `adenaufal/anti-slop-writing`, và vì mục tiêu khác nhau nên toàn bộ nhóm rule T-1 đến T-5 của repo đó bị loại, cùng với các rule cố tình tạo lỗi ngữ pháp.

Văn học, học thuật, luận văn.

Code, comment, tài liệu kỹ thuật. Skill chỉ áp cho văn xuôi viết cho người đọc.

Sinh nội dung thay người dùng. Skill quản cách diễn đạt, không quyết định nói cái gì.

## 2. Kiến trúc

Nguyên tắc: rule tồn tại đúng một chỗ. Hai skill là hai cửa vào của cùng một bộ rule.

```
antislop-marketing/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── .codex-plugin/
│   └── plugin.json
│
├── skills/
│   ├── antislop-write/SKILL.md
│   └── antislop-check/SKILL.md
│
├── references/
│   ├── core.md               trung tính ngôn ngữ
│   ├── languages.json        đăng ký language pack
│   ├── vi.md
│   ├── en.md
│   ├── evidence.md
│   └── false-positives.md
│
├── examples/
├── tests/
│   ├── scan.mjs
│   └── fixtures/
├── CONTRIBUTING.md
├── NOTICE
├── LICENSE
└── README.md
```

### Vì sao hai skill

Rule giống hệt nhau, nhưng tách vì ba lý do.

Trigger khác nhau. Skill kích hoạt bằng khớp description. "Viết báo cáo tháng 6" và "soát lại bản này" là hai ý định khác nhau; gộp vào một description làm nó mờ và bắn nhầm ngữ cảnh.

`antislop-check` cần `false-positives.md`, thứ vô nghĩa khi đang sinh text mới.

`antislop-write` cần bảng quyết định tier và quy trình draft, thứ vô nghĩa khi đang soát.

### Nạp theo nhu cầu

Không skill nào đọc trọn `references/`. Nạp theo tier và ngôn ngữ đã suy ra.

| Tình huống | Nạp |
|---|---|
| viết báo cáo tiếng Việt | core.md, vi.md, evidence.md |
| viết caption tiếng Anh | core.md, en.md |
| soát bản tiếng Việt | core.md, vi.md, false-positives.md |

### Hạng mục phải kiểm chứng

`references/` nằm ở gốc plugin, trên hai cấp so với thư mục của skill. Cần xác nhận đường dẫn tương đối resolve đúng ở cả Claude Code và Codex, vì hai harness cache plugin ở vị trí khác nhau.

Phương án dự phòng nếu không resolve được: đặt `references/` vào trong `skills/antislop-write/`, cho `antislop-check` trỏ sang bằng `../antislop-write/references/`.

Việc này phải làm trước khi viết nội dung rule, vì nó quyết định đường dẫn ghi trong cả hai SKILL.md.

## 3. Tier và mức

Hai trục độc lập. Tier quản nội dung được phép nói. Mức quản kết cấu câu.

### 3.1 Tier

| Tier | Loại tài liệu | Puffery | Bằng chứng | Xưng hô mặc định (vi) |
|---|---|---|---|---|
| R | báo cáo, audit, phân tích | cấm hoàn toàn | bắt buộc | chúng tôi / quý khách |
| P | proposal, kế hoạch, SoW | có điều kiện | khuyến khích | chúng tôi / anh chị |
| C | content, ad copy, social | cho phép nếu kèm dữ kiện | không bắt buộc | bên mình / bạn |

Tier P là mặc định khi không có tín hiệu nào. Chọn P vì nó an toàn hai đầu: đoán nhầm P cho báo cáo thì lọt vài từ có điều kiện, nhìn ra ngay; đoán nhầm P cho ad copy thì chỉ hơi khô.

### 3.2 Bảng quyết định tier

Khớp theo thứ tự, dừng ở dòng đầu tiên trúng.

| Tín hiệu | Tier |
|---|---|
| trong yêu cầu có: báo cáo, audit, phân tích, tổng kết, performance, số liệu | R |
| file đang mở nằm trong `reports/` hoặc `audits/` | R |
| đầu vào chủ yếu là bảng số liệu | R |
| có: proposal, đề xuất, kế hoạch, plan, SoW, roadmap, báo giá, pitch | P |
| có: caption, post, ad copy, content, email marketing, landing, tagline, blog | C |
| không tín hiệu nào | P |

Từ khoá cho từng ngôn ngữ nằm ở mục 8 của language pack, không nằm trong `core.md`.

Ghi đè bằng ngôn ngữ tự nhiên, không cần cú pháp. "Cái này gửi khách nhé", "viết thoải mái hơn", "tier C" đều nhận.

Quy tắc chống lỗi ghép: mọi bảng số liệu và mục kết quả áp chuẩn R bất kể tài liệu đang ở tier nào. Lý do là proposal tier P vẫn chứa phần báo cáo kỳ trước, và chỗ đó không được có tính từ không kèm số.

### 3.3 Mức

| Mức | Tên | Bật gì |
|---|---|---|
| 1 | PHẲNG | không phải một lựa chọn, xem bên dưới |
| 2 | TỰ NHIÊN | dao động độ dài câu, đa dạng kiểu câu, đảo trọng tâm |
| 3 | ĐỜI THƯỜNG | thêm tiểu từ, câu cụt, đánh giá không số, thú nhận chưa chắc |

Mức 1 là trạng thái hỏng, không phải cấu hình. Nó là kết quả của việc áp ban list từ vựng mà bỏ qua rule cấu trúc: sạch từ nhưng mọi câu cùng một khuôn. `antislop-write` không bao giờ chủ động sinh ra nó. Nó có tên để `antislop-check` gọi được ra.

Mức đi kèm tier, người dùng không khai báo:

```
tier R  ->  mức 2
tier P  ->  mức 2
tier C  ->  mức 3
```

Lý do không cho ghép tự do: mức 3 cho phép đánh giá không kèm số, thứ mà tier R cấm. Hai cái đó không thể cùng bật.

### 3.4 Dòng khai báo

Skill in một dòng rồi làm luôn. Không hỏi, không chờ.

```
[R · mức 2 · trang trọng · vi]
```

Dòng này giải quyết nhược điểm của việc tự suy im lặng. Tự suy mà không nói thì đoán sai không ai biết và không có cách sửa. Tự suy mà khai báo thì người dùng liếc một cái là thấy, sai thì gõ một chữ là xong, đúng thì bỏ qua.

## 4. Luồng chạy của antislop-write

```
1. Nhận yêu cầu
2. Suy tier theo bảng 3.2
3. Suy ngôn ngữ theo ngôn ngữ yêu cầu hoặc ngôn ngữ tài liệu nguồn
4. Nạp references tương ứng
5. In dòng khai báo
6. Viết draft
7. Chạy checklist theo tier, nội bộ, không in
8. Sửa và xuất bản cuối
```

Bước 6 và 7 chạy ngầm. Chỉ in bản cuối. `blader/humanizer` in cả bản nháp, danh sách lỗi còn sót, rồi bản cuối; với người cần một bản báo cáo để gửi đi thì hai khối đầu là nhiễu. Người dùng yêu cầu thì mới in.

## 5. Nội dung rule

### 5.1 Lấy từ adenaufal/anti-slop-writing (MIT)

- Nguyên lý perplexity, burstiness, stylometry
- Mục "The 2026 shift: structure beats punctuation" và hai bài test nhanh
- 15 structural rule, trong đó quan trọng nhất là Rule 1 về bimodal seesaw và Rule 8 về vụn đoạn
- EN-11 vân tay theo model, phần Claude là giá trị cao nhất
- EN-12 Four-Part Sentence DNA
- Ban list tiếng Anh
- Ý tưởng tier giọng lấy từ bản Indonesia, chuyển thành trục xưng hô và tiểu từ trong language pack
- Quy tắc lệch 10 đến 20 phần trăm khỏi tier chính

### 5.2 Lấy từ blader/humanizer (MIT)

Vào `false-positives.md`:

- 12 mục "đừng flag cái này"
- 7 dấu hiệu văn người thật cần giữ nguyên

### 5.3 Loại bỏ

| Loại gì | Lý do |
|---|---|
| T-1 đến T-5, nhóm chống detector | sai mục tiêu, xem mục 1 |
| EN-3 cho phép lỗi dấu câu | tài liệu gửi khách không được có comma splice cố ý |
| Mọi số thống kê không nguồn: 16.9x, 82%, 4.3x, perplexity 21.2 và 35.9 | giữ rule, bỏ số. Bản gốc dẫn "a Jan 2026 corpus analysis" nhưng không có liên kết. Không kiểm chứng được thì không đưa vào |
| Ngưỡng "17 đến 23 từ" | hiệu chỉnh cho tiếng Anh, xem mục 7 |
| Rule 13 "Vary Syntactic Depth" | trùng lặp nguyên văn hai lần trong bản gốc, dòng 141-143 và 328-330 |

### 5.4 Viết mới

`evidence.md`, tầng bằng chứng. Đây là phần không có ở cả hai nguồn, vì cả hai viết cho người viết blog chứ không cho người làm báo cáo.

Quy tắc: mọi tính từ đánh giá phải kèm một con số, một mốc so sánh, hoặc bị xóa.

```
"CPA cải thiện tốt"       ->  "CPA giảm từ 42$ xuống 31$, tức 26%"
"Chiến dịch hiệu quả"     ->  "ROAS 3.4, vượt mục tiêu 2.8"
"Hiệu suất tăng đáng kể"  ->  xóa, hoặc đưa số vào
```

Bắt buộc ở tier R. Khuyến khích ở tier P. Không áp ở tier C.

`vi.md`, xem mục 6.2.

Bảng quyết định tier, định nghĩa ba mức, dòng khai báo.

## 6. Language pack

### 6.1 Ranh giới

`core.md` không chứa một từ cụ thể nào của ngôn ngữ nào. Nó chứa nguyên lý burstiness, rule of three, khái niệm negative parallelism, false range, participial tack-on, kết bài công thức, nhịp đoạn văn, cấm dash, đa dạng kiểu câu, độ sâu cú pháp, vân tay model, Four-Part Sentence DNA, định nghĩa tier và mức.

Ranh giới này phải giữ nghiêm. Nếu thêm một ngôn ngữ mà phải sửa `core.md` thì tính mở rộng chỉ là lời hứa.

### 6.2 Hợp đồng: 8 mục bắt buộc

Mọi `<lang>.md` có đúng 8 mục, đúng thứ tự.

1. Metadata. Mã ngôn ngữ, ngày hiệu chỉnh, cỡ mẫu.
2. Ban list. Puffery, động từ AI, danh từ hoa mỹ.
3. Cụm công thức. Negative parallelism, tack-on, mở bài, kết bài.
4. Dấu vết dịch máy.
5. Xưng hô theo tier R, P, C.
6. Tiểu từ theo mức 2 và mức 3.
7. Nhịp câu. Ngưỡng đã đo kèm cỡ mẫu, hoặc ghi rõ "chưa hiệu chỉnh".
8. Từ khoá nhận diện tier.

`CONTRIBUTING.md` chứa template rỗng của 8 mục. Người đóng góp một ngôn ngữ mới không cần đọc `core.md`.

### 6.3 Đăng ký

`references/languages.json` là chỗ duy nhất khai báo ngôn ngữ.

```json
{ "vi": "vi.md", "en": "en.md" }
```

Thêm ngôn ngữ là thêm một dòng và thả một file. Không sửa `core.md`, không sửa SKILL.md.

### 6.4 Nhãn trạng thái

| Nhãn | Nghĩa |
|---|---|
| hiệu chỉnh | có đo nhịp câu, có người bản xứ soát |
| cộng đồng | đủ 8 mục nhưng chưa đo, chưa soát |
| thử nghiệm | thiếu mục, dùng tạm |

Bản v1 phát hành `vi` và `en` ở mức hiệu chỉnh.

Nội dung mới mới là phần khó, không phải kiến trúc. Tell AI của một ngôn ngữ không suy ra được từ ngôn ngữ khác; nó phụ thuộc vào cấu trúc riêng và vào corpus mà model được train. Một pack dùng được cần người bản xứ đọc output AI trong ngôn ngữ đó.

### 6.5 Nội dung vi.md

Puffery, chặn theo tier: đột phá, tiên phong, hàng đầu, vượt trội, toàn diện, đẳng cấp, chuyên nghiệp khi rỗng nghĩa, tối ưu hoá, đáp ứng mọi nhu cầu, giải pháp toàn diện.

Cụm AI đặc thù tiếng Việt, chặn mọi tier:

- "đóng vai trò quan trọng trong việc" là bản dịch của top AI trigram 2026
- "không chỉ ... mà còn" là negative parallelism bản Việt
- "góp phần", "mang lại hiệu quả" là participial tack-on bản Việt
- "đáng kể", "vô cùng", "hết sức" khi không kèm số

Mở bài và kết bài: "Trong thời đại số hoá ngày nay", "Trong bối cảnh", "Tóm lại", "Nhìn chung", "Hy vọng bài viết mang lại".

Dấu vết dịch máy: "được thực hiện bởi", "nơi mà", "điều mà", "một trong những ... nhất".

Nominalization: "việc triển khai" thành "triển khai", "quá trình tối ưu hoá" thành "tối ưu".

Danh sách trắng thuật ngữ. Báo cáo tiếng Việt chêm thuật ngữ Anh là chuẩn ngành, không phải chuyển ngôn ngữ. `vi.md` liệt kê những từ không được đụng tới: ROAS, CPA, CPC, remarketing, prospecting, audience, creative, funnel, và các từ tương tự. Skill không được dịch "remarketing" thành "tiếp thị lại".

Ngôn ngữ chính quyết định pack được nạp. Từ mượn không kích hoạt pack thứ hai.

## 7. Hiệu chỉnh ngưỡng nhịp câu

Ngưỡng "ba câu liên tiếp trong khoảng 17 đến 23 từ" của bản gốc hiệu chỉnh cho tiếng Anh. Tiếng Việt là ngôn ngữ đơn lập, đa số âm tiết rời, nên cùng một lượng thông tin tốn nhiều token hơn. Bê nguyên con số sang sẽ làm bài test bắn sai liên tục.

Cách đo:

1. Gom tập văn bản tiếng Việt do người viết: báo ngành, blog marketing, email công việc thật.
2. Tính phân bố độ dài câu.
3. Lấy khoảng chứa phần lớn câu làm vùng đều.
4. Ghi số đo được cùng cỡ mẫu vào mục 7 của `vi.md`.

Nếu chưa kịp đo trước khi phát hành, `vi.md` dùng bài test định tính thay thế, là "ba câu liên tiếp cùng khuôn cú pháp", và đánh dấu mục 7 là "chưa hiệu chỉnh".

Không được bịa một con số thay thế.

## 8. antislop-check

### 8.1 Cách chấm

Không dùng thang điểm tổng hợp kiểu 7 hạng mục nhân 10 điểm. Bảo model cho điểm 1 đến 10 về một hạng mục trừu tượng thì chạy hai lần ra hai kết quả khác nhau; con số trông khoa học nhưng không tái lập.

Thay bằng: đếm được ở đâu thì đếm, phán đoán chỉ ở chỗ buộc phải phán đoán.

```
[check · R · vi]

ĐẾM ĐƯỢC                         thấy    ngưỡng
  dash (— –)                        3        0
  cụm trong ban list                7    theo tier
  câu cùng khuôn liên tiếp          4        3
  đánh giá không kèm số             5        0   (tier R)
  đoạn 1-2 câu                  11/14   tham chiếu
  dấu hai chấm ngoài danh sách      9      ~1/300 từ

PHÁN ĐOÁN
  giọng nhất quán quá mức       cần sửa
  cung lập luận 4 phần           đạt

KẾT LUẬN: CẦN SỬA
```

Phần đếm tái lập được. Phần phán đoán chỉ có ba nấc: đạt, cần sửa, hỏng.

Sau bảng là danh sách vị trí cụ thể, rồi bản viết lại nếu người dùng yêu cầu.

### 8.2 Phanh chống dương tính giả

`false-positives.md` chạy trước khi báo lỗi. Nó chặn những thứ trông như tell nhưng không phải: curly quote do Word tự đổi, một từ "tuy nhiên" đơn lẻ, ngữ pháp chuẩn, một câu ngắn nhấn mạnh.

Nguyên tắc kế thừa từ humanizer: tìm cụm tell, không phải tell đơn lẻ.

`antislop-check` suy tier giống skill viết, vì caption và báo cáo không dùng chung thước đo.

## 9. Đóng gói

### 9.1 Manifest

`.claude-plugin/plugin.json` khai `"skills": ["./skills/antislop-write", "./skills/antislop-check"]`.

`.claude-plugin/marketplace.json` khai `plugins[0].source = "./"`.

`.codex-plugin/plugin.json` khai `"skills": "./skills/"` kèm khối `interface` với displayName, category, defaultPrompt.

Ba file này chứa metadata, không chứa dòng rule nào, nên duy trì tay không sinh rủi ro lệch bản.

### 9.2 Cài đặt

```bash
# Claude Code
/plugin marketplace add HDShinobi/antislop-marketing
/plugin install antislop-marketing@antislop-marketing

# Codex
codex plugin marketplace add https://github.com/HDShinobi/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

### 9.3 Giấy phép

Repo MIT. `NOTICE` ghi công hai nguồn, cả hai đều MIT:

- `adenaufal/anti-slop-writing`, structural rules, vân tay model, ý tưởng tier giọng
- `blader/humanizer`, danh sách chống dương tính giả

README ghi rõ phần nào lấy về, phần nào loại bỏ và vì sao. Việc này vừa đúng phép, vừa cho người đọc biết repo khác bản gốc ở đâu.

## 10. Kiểm thử

Đầu ra là văn xuôi không tất định, nhưng ba tầng dưới đây kiểm được.

Tầng 1, quét cơ học, tự động. `tests/scan.mjs` chạy không cần model: đếm em dash và en dash, dò cụm trong ban list, đo phân bố độ dài câu và tìm chuỗi câu cùng khuôn, với tier R thì tìm tính từ đánh giá không có số đi kèm.

Tầng 2, fixture có lỗi biết trước. `tests/fixtures/` chứa đoạn văn đã gài lỗi kèm chú thích lỗi gì ở đâu. Chạy `antislop-check` lên và kiểm hai điều: có bắt đúng không, và có báo nhầm gì không. Vế thứ hai kiểm `false-positives.md`.

Tầng 3, repo tự soi mình. CI chạy `scan.mjs` lên `README.md` và `examples/`. Một repo chống slop mà README đầy em dash thì mất uy tín ngay dòng đầu, nên để CI chặn.

Không kiểm tự động được: câu hỏi "đoạn này đọc có ra người không". Chỗ đó cần người đọc. Kế hoạch là ba tầng trên tự động từ v1, chất lượng thật đánh giá qua hai đến ba tuần dùng vào việc thật.

## 11. Phạm vi phát hành

### v1

Claude Code và Codex. Hai nền tảng này dùng chung layout `skills/<name>/SKILL.md`, nên không phát sinh nhân bản rule và không cần script build.

Nội dung: hai skill, `core.md`, `languages.json`, `vi.md`, `en.md`, `evidence.md`, `false-positives.md`, examples, tests, `CONTRIBUTING.md` kèm template language pack, `NOTICE`, `LICENSE`, README song ngữ.

Ba dòng trong bảng đếm ở mục 8.1 cần định nghĩa chính xác trước khi viết `scan.mjs`: "theo tier" nghĩa là ngưỡng lấy từ ban list áp dụng cho tier đang xét; "tham chiếu" nghĩa là chỉ hiển thị, không có ngưỡng cứng, dùng để người đọc tự đánh giá mức vụn đoạn.

### v1.1

Cursor và Antigravity. Hai nền tảng này không đọc `skills/`; chúng cần một file phẳng chứa toàn bộ rule inline, là `.cursor/rules/*.mdc` và `GEMINI.md`. Đó là chỗ phát sinh nhân bản, nên cần `scripts/build.mjs` sinh từ nguồn và CI kiểm bằng cách build lại rồi so `git diff`.

Hoãn sang v1.1 vì hai tuần đầu rule còn sửa liên tục, và không nên nhân một bộ rule ra bốn nền tảng khi chưa biết nó có đúng không.

### v1.2 trở đi

Language pack mới. `th.md` là ứng viên gần nhất.

## 12. Danh sách việc phải làm trước khi viết nội dung

1. Kiểm chứng đường dẫn tương đối từ SKILL.md tới `references/` ở cả hai harness. Kết quả quyết định bố cục thư mục, xem mục 2.
2. Đo ngưỡng nhịp câu tiếng Việt, xem mục 7. Nếu không kịp thì đánh dấu "chưa hiệu chỉnh".
