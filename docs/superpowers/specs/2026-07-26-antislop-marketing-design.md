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
├── bin/
│   ├── scan.mjs              đóng gói cùng plugin, skill gọi được
│   └── validate-pack.mjs     kiểm schema language pack, chạy trong CI
│
├── examples/
├── tests/
│   ├── scan.test.mjs         import từ ../bin/scan.mjs
│   ├── fixtures.mjs
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
| viết báo cáo tiếng Việt (R) | core.md, vi.md, evidence.md |
| viết proposal tiếng Việt (P) | core.md, vi.md, evidence.md |
| viết caption tiếng Anh (C) | core.md, en.md, evidence.md |
| soát bản tiếng Việt (R hoặc P) | core.md, vi.md, evidence.md, false-positives.md |
| soát caption tiếng Anh (C) | core.md, en.md, evidence.md, false-positives.md |

`evidence.md` nạp ở mọi tier, kể cả C. Tier C không áp kiểm bằng chứng cho đánh giá thông thường, nhưng **có** áp cho puffery và claim so sánh (mục 5.4), nên skill vẫn cần định nghĩa "chống lưng" và các mã `*-PUFFERY`, `*-COMPARATIVE`.

Không đưa quy tắc bằng chứng vào `core.md` để tiết kiệm một lần nạp. Làm thế là phá nguyên tắc rule tồn tại đúng một chỗ, và `evidence.md` là file nhỏ nhất trong `references/`.

### Hạng mục phải kiểm chứng

`references/` nằm ở gốc plugin, trên hai cấp so với thư mục của skill. Cần xác nhận đường dẫn tương đối resolve đúng ở cả Claude Code và Codex, vì hai harness cache plugin ở vị trí khác nhau.

Phương án dự phòng nếu không resolve được: đặt `references/` vào trong `skills/antislop-write/`, cho `antislop-check` trỏ sang bằng `../antislop-write/references/`.

Việc này phải làm trước khi viết nội dung rule, vì nó quyết định đường dẫn ghi trong cả hai SKILL.md.

## 3. Tier và mức

Hai trục độc lập. Tier quản nội dung được phép nói. Mức quản kết cấu câu.

### 3.0 Định nghĩa "khối"

Từ này dùng ở ba chỗ và cả ba phải hiểu giống nhau, nếu không thì skill và `scan.mjs` cho kết quả khác nhau trên cùng một văn bản: đơn vị kiểm bằng chứng ở tier C (mục 3.1), phạm vi tìm token dữ kiện của `eval_candidate` (mục 9), và đơn vị tách văn bản song ngữ (mục 9).

Khối định nghĩa theo cấu trúc Markdown:

| Là một khối | Ghi chú |
|---|---|
| một đoạn văn | các dòng liền nhau, ngăn bởi dòng trống |
| mỗi mục trong danh sách | từng gạch đầu dòng là một khối riêng, kể cả danh sách lồng |
| mỗi ô trong bảng | không phải cả hàng |
| mỗi bảng | một khối **cha**, chứa các ô làm khối con |
| mỗi heading | đứng riêng, không gộp với đoạn phía sau |

**Bảng có hai tầng.** Ô là đơn vị kiểm bằng chứng, vì một dữ kiện ở ô này không chống lưng cho tính từ ở ô khác. Nhưng bảng cũng cần tồn tại như một khối riêng, vì tiêu chí nhận bảng số liệu (mục 9) xét trên cả bảng chứ không xét từng ô.

Nên mỗi bảng sinh ra `1 + n` khối: một khối cha `kind: "table"` mang danh sách `children`, và `n` khối con `kind: "table_cell"` mang `parent`. Cả cha lẫn con đều có chỉ số riêng trong dãy khối.

Quy tắc lan tier: gán tier cho khối cha thì mọi khối con nhận theo. Đây là cách bảng số liệu nâng cả bảng lên R chỉ bằng một quyết định.

**Khối cha không có text quét được.** Nó tồn tại đúng hai việc: nhận diện bảng số liệu, và giữ danh sách `children`. Mọi phép quét từ vựng, tách câu, nhịp và bằng chứng đều chạy trên `table_cell`, không chạy trên khối cha.

Không có quy tắc này thì mỗi cụm trong bảng bị đếm hai lần, một lần ở cha một lần ở con, và `counted` tăng gấp đôi trên mọi tài liệu có bảng. `splitBlocks` trả về khối cha với `text` là chuỗi rỗng để điều này rõ ngay ở API.

Hai quy tắc biên:

**Khối không bắc qua heading.** Một dữ kiện nằm trước heading không chống lưng được cho tính từ nằm sau nó.

**Khối lệnh (code fence) bị loại hoàn toàn** khỏi mọi phép quét. Không đếm dash, không dò ban list, không tính nhịp câu. Lý do là báo cáo hay chứa đoạn cấu hình và log, và quét chúng chỉ sinh nhiễu.

### 3.1 Tier

| Tier | Loại tài liệu | Puffery | Bằng chứng | Xưng hô mặc định (vi) |
|---|---|---|---|---|
| R | báo cáo, audit, phân tích | cấm hoàn toàn | bắt buộc | chúng tôi / quý khách |
| P | proposal, kế hoạch, SoW | có điều kiện | bắt buộc với nhận định về thực tế | chúng tôi / anh chị |
| C | content, ad copy, social | cho phép nếu được chống lưng, **cực cấp cấm hẳn** | không bắt buộc | bên mình / bạn |

Tier P là mặc định khi không có tín hiệu nào. Chọn P vì nó an toàn hai đầu: đoán nhầm P cho báo cáo thì lọt vài từ có điều kiện, nhìn ra ngay; đoán nhầm P cho ad copy thì chỉ hơi khô.

#### Điều kiện dùng puffery

Cột "Puffery" ở trên phải hiểu theo đúng ba định nghĩa dưới đây. Không được để "có điều kiện" cho người đọc tự suy.

| Tier | Quy tắc |
|---|---|
| R | Không dùng, không có ngoại lệ. Mọi tính từ đánh giá đi qua `evidence.md`. |
| P | Chỉ dùng khi một trong hai điều kiện đúng: (a) claim được chứng minh bởi một dữ kiện có mặt trong tài liệu nguồn, hoặc (b) người dùng cung cấp nguyên văn câu đó, ví dụ định vị thương hiệu do khách chốt. Không thoả thì cắt, không thay bằng từ nhẹ hơn. Điều kiện (b) cần nguồn gốc, xem mục dưới. |
| C | Dùng được nếu trong cùng một khối văn bản có ít nhất một dữ kiện **chống lưng theo đúng nghĩa ở mục 5.4**, tức dữ kiện chứng minh chính tính từ đó. |

Khối là đơn vị kiểm ở tier C, không phải câu, theo định nghĩa ở mục 3.0. Lý do là ad copy hay tách chủ ngữ và dữ kiện ra hai câu liền nhau.

Tier C nới ở chỗ **cho phép dùng tính từ mạnh**, không nới ở chỗ quan hệ chứng minh. Bài kiểm ở mục 5.4 áp y nguyên.

Riêng claim so sánh và claim cực cấp thì cần thêm một thứ: **mốc so sánh phải được nêu ra**, không được để ngầm.

```
KHÔNG ĐẠT   "Lọc tới 0.0001 micron, vượt xa chuẩn thường thấy."
            Con số không nói chuẩn thường thấy là bao nhiêu. Người đọc
            không kiểm được, và "vượt xa" là khẳng định trống.

ĐẠT         "Lọc tới 0.0001 micron. Màng RO phổ thông dừng ở 0.001."
            Có mốc, người đọc tự thấy khoảng cách, không cần tính từ.

ĐẠT         "Lọc tới 0.0001 micron, mịn gấp mười lần màng RO phổ thông."
            So sánh nêu rõ đối tượng và tỉ lệ.
```

Không nêu được mốc thì bỏ tính từ so sánh và để con số đứng một mình.

#### Nguồn gốc claim

Điều kiện (b) của tier P chỉ kiểm được khi biết câu đó từ đâu ra. `antislop-write` biết, vì người dùng vừa đưa. `antislop-check` chạy trên một file có sẵn thì **không biết**, và không có cách nào phân biệt tagline khách đã duyệt với puffery model tự bịa.

Giải quyết bằng một file nguồn tuỳ chọn, `.antislop-claims.txt` ở gốc thư mục làm việc:

```
# mỗi dòng là một claim đã được duyệt, so khớp nguyên văn
Giải pháp lọc nước toàn diện cho gia đình Việt
Thương hiệu máy lọc nước số 1 Đông Nam Á
```

Hành vi:

| Tình huống | Kết quả |
|---|---|
| claim khớp nguyên văn một dòng trong file | miễn trừ, không báo |
| có file nhưng claim không khớp dòng nào | xét bình thường: `*-PUFFERY` ở tầng cơ học, rồi `EVID-UNBACKED` nếu không chống lưng |
| **không có file** | báo `EVID-PROVENANCE-UNKNOWN`, xếp vào khối `judged`, **không tính là vi phạm** |

Dòng cuối là điểm quan trọng. Không có nguồn thì không kết luận. Buộc tội một tagline khách đã duyệt chính là kiểu dương tính giả mà `false-positives.md` sinh ra để chặn, và nó đắt hơn nhiều so với việc bỏ sót một câu puffery.

`antislop-write` không dùng file này. Nó hỏi thẳng người dùng khi cần, theo mục 4.1.

#### Điều kiện (a) cũng cần nguồn

Điều kiện (a) nói claim phải được chứng minh bởi "một dữ kiện có mặt trong tài liệu nguồn". `antislop-write` có tài liệu nguồn trong tay. `antislop-check` thì chỉ có file đang soát, và dữ kiện chống lưng có thể nằm ở một file khác: bảng export, báo cáo tháng trước, email của khách.

Ba tình huống, ba kết quả khác nhau. Không được gộp:

| Tình huống | Verdict |
|---|---|
| dữ kiện chống lưng nằm ngay trong file đang soát | `đạt` |
| người dùng chỉ định nguồn kèm theo, và dữ kiện có ở đó | `đạt` |
| không có nguồn nào để đối chiếu | `chưa xác định`, **không phải vi phạm** |

Cách chỉ định nguồn: người dùng nêu trong yêu cầu ("soát bản này, số liệu ở `data/june.csv`"), hoặc `antislop-check` nhận nhiều file cùng lúc và coi các file còn lại là nguồn.

`chưa xác định` là một verdict thứ ba bên cạnh `đạt` và `vi phạm`, và nó phải hiển thị riêng trong bảng cho người đọc. Gộp nó vào `vi phạm` thì mọi báo cáo soát trong cô lập đều đỏ rực và người dùng sẽ bỏ qua công cụ. Gộp vào `đạt` thì công cụ nói dối.

Cùng nguyên tắc với `EVID-PROVENANCE-UNKNOWN` ở trên: không có nguồn thì không kết luận.

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

#### Ghi đè

Nhận bằng ngôn ngữ tự nhiên, không cần cú pháp. Ánh xạ:

| Người dùng nói | Đổi gì |
|---|---|
| "tier R", "tier P", "tier C" | đặt tier trực tiếp, mức đi theo tier |
| "trang trọng hơn", "gửi khách nhé", "formal" | chỉ đổi giọng, giữ nguyên tier và mức |
| "thoải mái hơn", "gần gũi hơn", "casual" | chỉ đổi giọng, giữ nguyên tier và mức |
| "viết tự nhiên hơn", "bớt cứng" | nâng mức 2 lên mức 3, giữ nguyên tier |
| "chặt hơn", "bỏ hết từ hoa mỹ" | hạ mức 3 xuống mức 2, giữ nguyên tier |

Thứ tự ưu tiên, cao thắng thấp:

```
1. Chuẩn R cho vùng số liệu   (mục dưới, không ghi đè được)
2. Ghi đè tường minh của người dùng
3. Bảng quyết định tier
4. Mặc định P
```

Ba dòng đầu bảng ánh xạ chỉ đổi giọng chứ không đổi tier, vì giọng và tier là hai trục độc lập (mục 3). Yêu cầu "gửi khách nhé" nói về quan hệ với người đọc, không nói tài liệu là báo cáo hay caption.

Quy tắc chống lỗi ghép: mọi bảng số liệu và mục kết quả áp chuẩn R bất kể tài liệu đang ở tier nào, **và không ghi đè nào hạ được chuẩn này**. Lý do là proposal tier P vẫn chứa phần báo cáo kỳ trước, và chỗ đó không được có tính từ đánh giá nào không được chống lưng. Nếu người dùng yêu cầu "viết tự nhiên hơn" cho một tài liệu có bảng số liệu, mức 3 áp cho phần văn xuôi còn vùng số liệu giữ nguyên chuẩn R.

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
3. Suy ngôn ngữ theo mục 4.2
4. Nạp references tương ứng
5. In dòng khai báo
6. Viết draft
7. Chạy checklist theo tier, nội bộ, không in
8. Sửa và xuất bản cuối
```

Bước 6 và 7 chạy ngầm. Chỉ in bản cuối. `blader/humanizer` in cả bản nháp, danh sách lỗi còn sót, rồi bản cuối; với người cần một bản báo cáo để gửi đi thì hai khối đầu là nhiễu. Người dùng yêu cầu thì mới in.

### 4.1 Đầu vào tối thiểu và cách xử lý khi thiếu dữ kiện

Mục 1 nói skill không sinh nội dung thay người dùng. Điều đó chỉ có nghĩa nếu spec quy định rõ skill làm gì khi bị yêu cầu viết mà không có đủ dữ kiện. Không quy định thì nó sẽ bịa số, và bịa số trong báo cáo hiệu quả quảng cáo là hỏng nặng nhất mà công cụ này có thể gây ra.

**Luật tuyệt đối: không bao giờ tự sinh dữ kiện.** Con số, tên riêng, ngày tháng, tên nguồn, trích dẫn. Luật này đứng trên mọi rule khác trong repo, kể cả rule về nhịp câu và ban list.

**Dữ kiện không có nghĩa là con số.** Một audit tài khoản hoàn toàn có thể không có số nào mà vẫn là báo cáo hợp lệ: "conversion tracking chưa cài", "ba campaign dùng broad match không có negative list", "pixel không nối CAPI". Đó là dữ kiện kiểm chứng được. Bốn dạng đều tính:

| Dạng | Ví dụ |
|---|---|
| số liệu | CPA 47$, ROAS 3.4, 22% ngân sách |
| trạng thái cấu hình | tracking chưa cài, bidding đang ở Maximize Clicks |
| mốc thời gian, sự kiện | đổi bidding ngày 12/6, tài khoản bị từ chối 3 ad |
| tham chiếu | URL landing page, ID campaign, tên file nguồn |

Đầu vào tối thiểu theo tier:

| Tier | Cần có để bắt đầu viết |
|---|---|
| R | ít nhất một dữ kiện thuộc bốn dạng trên. Không có dữ kiện nào thì không viết. |
| P | phạm vi công việc và ít nhất một ràng buộc thật (ngân sách, thời gian, kênh, hoặc mục tiêu) |
| C | sản phẩm hoặc thông điệp cần truyền, cộng ít nhất một dữ kiện chống lưng nếu định dùng puffery |

Khi thiếu, xử lý theo thứ tự:

1. **Thiếu ít, không chặn.** Viết phần có dữ kiện, chừa chỗ trống có nhãn rõ ràng: `[cần số: CPA tháng 6]`. Nhãn dùng dấu ngoặc vuông và bắt đầu bằng `cần`, để `scan.mjs` đếm được và người dùng grep được. Cuối bản in một dòng liệt kê các chỗ còn trống.
2. **Thiếu nhiều đến mức tài liệu vô nghĩa.** Hỏi đúng một câu gộp, liệt kê mọi thứ còn thiếu trong câu đó. Không hỏi từng cái một.
3. **Tier R mà không có dữ kiện nào thuộc bốn dạng trên.** Không viết. Nói thẳng cần gì và ở định dạng nào.

Người dùng bảo "cứ điền số minh hoạ đi" thì được, nhưng mọi số minh hoạ phải mang nhãn `[ví dụ]` và bản in phải có một dòng cảnh báo ở đầu rằng tài liệu chứa số giả.

### 4.2 Chọn ngôn ngữ

**Ngôn ngữ của lời yêu cầu không quyết định gì cả.** Người dùng nói tiếng Việt là chuyện bình thường, kể cả khi tài liệu là tiếng Anh. Đây là ca xảy ra hàng ngày: "soát giúp tôi bản proposal này" gõ bằng tiếng Việt, file đính kèm bằng tiếng Anh.

Thứ tự xét khác nhau giữa hai skill.

`antislop-check`:

```
Ngôn ngữ của chính khối văn bản đang soát. Hết.
```

Một chỉ định, không có dự phòng. Tài liệu song ngữ thì mỗi khối theo ngôn ngữ của nó, theo mục 3.0 và mục 9.

`antislop-write`, xét theo thứ tự, dừng ở dòng đầu tiên trúng:

| Tín hiệu | Ví dụ |
|---|---|
| chỉ định tường minh về ngôn ngữ đầu ra | "viết bằng tiếng Anh", "bản EN" |
| ngôn ngữ của tài liệu nguồn hoặc file đang sửa | soát số liệu tiếng Anh thì viết tiếng Anh |
| ngôn ngữ của cuộc hội thoại | **chỉ khi không có nguồn nào**, ví dụ viết mới từ con số |

Dòng cuối là dự phòng cuối cùng chứ không phải mặc định. Nhầm hai thứ đó thì mọi tài liệu tiếng Anh sẽ bị viết lại thành tiếng Việt chỉ vì người dùng gõ tiếng Việt.

Ngôn ngữ đã suy luôn xuất hiện ở dòng khai báo (mục 3.4), nên đoán sai thì thấy ngay.

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
| Ngưỡng "17 đến 23 từ" | hiệu chỉnh cho tiếng Anh, và spec này không đặt ngưỡng độ dài câu cho ngôn ngữ nào. Xem mục 6.2, hợp đồng mục 7 |
| Rule 13 "Vary Syntactic Depth" | trùng lặp nguyên văn hai lần trong bản gốc, dòng 141-143 và 328-330 |

#### 5.3b Họ tell thứ tư: câu không có người nhận

Ba nguồn trên phủ ba họ: **từ vựng**, **cấu trúc**, **bằng chứng**. Còn một họ thứ tư mà không nguồn nào có, và nó là họ khó nhất.

Một đoạn văn có thể sạch từ vựng, đa dạng cấu trúc, đủ bằng chứng, và **vẫn đọc ra máy**. Chỗ hỏng nằm ở việc câu không định vị cho một người đọc cụ thể nào.

Ba biểu hiện, mỗi cái một mã:

| Mã | Biểu hiện | Ví dụ hỏng | Người thật viết |
|---|---|---|---|
| `CORE-READER-VOCAB` | hỏi hoặc khẳng định bằng từ vựng của người viết, không phải của người đọc | "Ad copy của bạn có chịu được mức đó không?" | "Caption của bạn có hay dùng kiểu *tốt nhất thị trường* không?" |
| `CORE-RULE-RESTATE` | nhắc lại quy tắc thay vì cho thấy hậu quả | "Tier C vẫn bắt puffery phải chống lưng" | "Nó sẽ bắt bạn thêm số vào, hoặc bỏ câu đó" |
| `CORE-NOUN-STACK` | nén câu thành chuỗi cụm danh từ, chỗ đáng lẽ một động từ gánh được | "ngưỡng nhịp câu để v1.2 mới đo" | "đo câu tiếng Việt dài bao nhiêu thì để sau" |

**Bài kiểm, dùng được ngay:** đọc câu đó lên như đang nói với người ta. Bản nói khác hẳn bản viết thì bản viết là vấn đề.

Điểm chung của ba cái: câu **đúng về mọi mặt kỹ thuật** nhưng không có người nhận. Tầng bằng chứng bắt "khẳng định không có dữ kiện". Họ này bắt "câu không có người nghe".

Ba mã đều **trung tính ngôn ngữ**, nằm trong `core.md`, và đều là phán xử nên ra ở `findings_judged`. `scan.mjs` không đếm được chúng: không có danh sách token nào, và cả ba đều cần biết người đọc là ai.

Riêng `CORE-NOUN-STACK` có phần chồng lấn với `VI-NOMINALIZATION` ở mục 6.5. Khác nhau ở phạm vi: `VI-NOMINALIZATION` bắt một cụm đơn lẻ ("việc triển khai"), còn `CORE-NOUN-STACK` bắt cả câu bị nén. Trùng thì báo mã hẹp hơn, tức bản của ngôn ngữ.

**Ghi chú về nguồn gốc.** Họ này không đến từ hai repo tham chiếu, cũng không đến từ 32 vòng review tự động. Nó đến từ một người đọc bản mô tả của chính spec này và chỉ ra ba câu trong đó nghe như máy. Hai vòng review kia đọc để tìm mâu thuẫn logic; chỉ người đọc như người đọc mới bắt được.

### 5.4 Viết mới

`evidence.md`, tầng bằng chứng. Đây là phần không có ở cả hai nguồn, vì cả hai viết cho người viết blog chứ không cho người làm báo cáo.

Quy tắc: mọi tính từ đánh giá phải được **chống lưng** bởi một dữ kiện kiểm chứng được, hoặc bị xóa. Dữ kiện lấy theo bốn dạng ở mục 4.1, không chỉ con số.

Chống lưng nghĩa là dữ kiện đó **chứng minh chính tính từ đó**, không phải chỉ đứng cạnh nó. Đây là phần dễ lách nhất của quy tắc, nên phải nói thẳng:

```
KHÔNG ĐẠT   "Đội ngũ tận tâm, CPA tháng này 31$."
            CPA không chứng minh sự tận tâm. Hai mệnh đề rời nhau.

ĐẠT         "CPA giảm từ 42$ xuống 31$ sau khi đội tách lại ad group
             theo intent trong tuần đầu tháng."
            Dữ kiện dẫn tới nhận định, và nhận định nói về việc đã làm.
```

Bài kiểm: xoá tính từ đi, dữ kiện còn lại có tự nói lên điều đó không. Không thì tính từ là trang trí, cắt.

Không chống lưng được thì có hai đường ra, chọn một: thay tính từ bằng mô tả quan sát được, hoặc xóa hẳn.

```
"CPA cải thiện tốt"        ->  "CPA giảm từ 42$ xuống 31$, tức 26%"
"Chiến dịch hiệu quả"      ->  "ROAS 3.4, vượt mục tiêu 2.8"
"Tracking đang có vấn đề"  ->  "Sự kiện purchase không bắn trên trang cảm ơn"
"Cấu trúc tài khoản kém"   ->  "12 ad group dùng chung một bộ keyword"
"Hiệu suất tăng đáng kể"   ->  xóa, hoặc đưa dữ kiện chống lưng vào
```

Hai dòng giữa là lý do quy tắc không viết là "phải kèm số". Một audit định tính vẫn phải chịu kỷ luật bằng chứng, chỉ là bằng chứng của nó không ở dạng số.

Phạm vi áp dụng theo tier. Dòng cuối là ngoại lệ, phải đọc kỹ vì nó dễ mâu thuẫn với mục 3.1.

| Tier | Đánh giá thông thường | Puffery, so sánh, cực cấp |
|---|---|---|
| R | bắt buộc chống lưng | không tồn tại, puffery bị cấm ở R |
| P | bắt buộc nếu là nhận định về thực tế; không áp với ý định hoặc đề xuất (xem bài phân biệt ở mục 3.1) | bắt buộc, theo điều kiện (a) hoặc (b) ở mục 3.1 |
| C | không áp | **bắt buộc**, theo mục 3.1, kèm mốc so sánh nếu là claim so sánh |

Tier C nới cho đánh giá thông thường, không nới cho puffery. "Dùng thích lắm" ở caption thì bỏ qua, nhưng "vượt trội" hay "tốt nhất" thì vẫn phải chống lưng.

**Tier P: phân biệt nhận định về thực tế với phát biểu về ý định.** Đây là chỗ P khác R, và trước đây hai mục của spec nói ngược nhau.

```
CẦN CHỐNG LƯNG   "Cấu trúc tài khoản hiện tại đang phân mảnh."
                 Nhận định về một thực tế kiểm chứng được.

CẦN CHỐNG LƯNG   "Cách tiếp cận này hiệu quả hơn."
                 Khẳng định về kết quả, phải có dữ kiện hoặc mốc.

KHÔNG CẦN        "Lộ trình này phù hợp với mục tiêu tăng trưởng của anh chị."
                 Phát biểu về ý định và sự khớp nhau, không phải
                 khẳng định về thế giới. Đòi số ở đây là vô nghĩa.

KHÔNG CẦN        "Chúng tôi đề xuất ưu tiên kênh Search trước."
                 Đề xuất, không phải nhận định.
```

Bài phân biệt: câu đó có thể sai không. Nhận định về thực tế thì có thể sai và cần chống lưng. Phát biểu về ý định thì không có đúng sai để kiểm.

Phép phân biệt này là ngữ nghĩa, nên nó nằm ở `findings_judged`, không ở `counted`. `scan.mjs` vẫn báo mọi ứng viên `eval_candidate` ở tier P; việc lọc ra cái nào thuộc nhóm ý định là của model.

Hệ quả cho `antislop-check`: ở tier C, chạy phép kiểm bằng chứng trên puffery và trên claim so sánh hoặc cực cấp, không chạy trên mọi tính từ. Nhưng "puffery" ở đây không giới hạn trong danh sách của pack; xem "Danh sách là sàn, không phải cửa" ở mục 9.

Ba thứ mới còn lại:

- `vi.md`, nội dung ở mục 6.5, cấu trúc 8 mục ở mục 6.2.
- Bảng quyết định tier, định nghĩa ba mức, dòng khai báo. **Cả ba nằm duy nhất trong `core.md`**, không nằm trong bất kỳ language pack nào. Language pack chỉ đóng góp mục 8 của nó, là danh sách từ khoá nhận diện tier trong ngôn ngữ đó, còn bảng quyết định và logic thì ở `core.md`. Xem mục 6.1 và 6.2.

## 6. Language pack

### 6.1 Ranh giới

`core.md` không chứa một từ cụ thể nào của ngôn ngữ nào. Nó chứa nguyên lý burstiness, rule of three, khái niệm negative parallelism, false range, participial tack-on, kết bài công thức, nhịp đoạn văn, cấm dash, đa dạng kiểu câu, độ sâu cú pháp, vân tay model, Four-Part Sentence DNA, định nghĩa tier và mức.

Ranh giới này phải giữ nghiêm. Nếu thêm một ngôn ngữ mà phải sửa `core.md` thì tính mở rộng chỉ là lời hứa.

### 6.2 Hợp đồng: 8 mục bắt buộc

Mọi `<lang>.md` có đúng 8 mục, đúng thứ tự.

1. Metadata. Mã ngôn ngữ, nhãn trạng thái, ai soát và soát lúc nào.
2. Ban list. Puffery, động từ AI, danh từ hoa mỹ.
3. Cụm công thức. Negative parallelism, tack-on, mở bài, kết bài.
4. Dấu vết dịch máy.
5. Xưng hô theo tier R, P, C.
6. Tiểu từ theo mức 2 và mức 3.
7. Nhịp câu. Bảng phân lớp bốn lớp đóng của từ mở đầu (lớp thứ năm `khac` là dự phòng, không khai) và danh sách token tack-on. Cả hai nuôi phép tính `same_shape_run` ở mục 9.

   Không có ngưỡng độ dài câu. Spec cố tình không đặt một con số "câu tiếng Việt nên dài bao nhiêu": `same_shape_run` đo **giống khuôn**, không đo **dài ngắn**, và đó là thứ thật sự lộ máy. Giới hạn số từ, nếu cần, là chuyện người dùng nêu trong yêu cầu.
8. Từ khoá nhận diện tier.

`CONTRIBUTING.md` chứa template rỗng của 8 mục. Người đóng góp một ngôn ngữ mới không cần đọc `core.md`.

#### Khối máy đọc được

Tám mục ở trên là văn xuôi, viết cho model và cho người. Nhưng `scan.mjs` cũng cần lấy bốn danh sách từ vựng, bảng lớp từ mở đầu và danh sách tack-on ra một cách tất định. Không có định dạng chuẩn thì mỗi người viết một kiểu parse, hoặc tệ hơn là hard-code lại rule trong JavaScript và pack thành đồ trang trí.

Mỗi pack chứa **đúng một** khối rào JSON mang nhãn `antislop-pack`.

Dùng JSON chứ không dùng YAML. Node có `JSON.parse` sẵn; YAML thì không, và thêm một dependency parser mâu thuẫn với quyết định giữ `bin/scan.mjs` không phụ thuộc thư viện ngoài (mục 9, phần tách câu). JSON xấu hơn khi đọc bằng mắt, nhưng đây là dữ liệu cho máy, còn phần cho người đã nằm ở tám mục văn xuôi.

````
```json antislop-pack
{
  "lang": "vi",
  "banlist": ["đóng vai trò quan trọng trong việc", "không chỉ", "góp phần",
              "trong thời đại số hoá ngày nay", "tóm lại", "nhìn chung"],
  "puffery": ["đột phá", "tiên phong", "hàng đầu", "vượt trội", "toàn diện",
              "đẳng cấp", "đáp ứng mọi nhu cầu"],
  "comparative": ["hơn", "gấp", "vượt", "kém"],
  "superlative": ["nhất", "số một", "số 1", "hàng đầu", "đứng đầu", "top", "duy nhất"],
  "evaluative": ["tốt", "kém", "hiệu quả", "mạnh", "yếu", "chậm", "nhanh",
                 "ổn", "tệ", "đáng kể", "rõ rệt", "hợp lý", "chưa tối ưu"],
  "mt_artifacts": ["được thực hiện bởi", "nơi mà", "điều mà"],
  "abbreviations": ["v.v.", "TP.", "Tp.", "ThS.", "TS.", "PGS.", "Q.", "tr."],
  "exceptions": { "hàng đầu": ["hàng đầu tiên"] },
  "openers": {
    "dai_tu":    ["tôi", "chúng tôi", "bạn", "anh chị", "quý khách", "bên mình", "họ"],
    "lien_tu":   ["nhưng", "và", "tuy nhiên", "vì vậy", "ngoài ra", "do đó", "song"],
    "trang_ngu": ["trong", "sau khi", "khi", "nếu", "dù", "với", "theo", "từ", "để"]
  },
  "tackon": ["góp phần", "mang lại", "nhằm", "qua đó", "từ đó"],
  "config_tokens": ["campaign", "ad group", "ad set", "keyword", "bidding",
                    "pixel", "tracking", "conversion", "audience", "placement"],
  "loanwords": ["ROAS", "CPA", "CPC", "remarketing", "prospecting",
                "audience", "creative"],
  "tier_keywords": {
    "R": ["báo cáo", "audit", "phân tích", "tổng kết", "số liệu"],
    "P": ["proposal", "đề xuất", "kế hoạch", "báo giá"],
    "C": ["caption", "content", "ad copy", "landing"]
  }
}
```
````

Khối này là **nơi duy nhất** các danh sách token tồn tại. Tám mục văn xuôi giải thích ý nghĩa và cho ví dụ, nhưng không liệt kê lại token. Liệt kê hai chỗ là quay về đúng lỗi nhân bản mà cả repo này được dựng để tránh.

Quy tắc so khớp, áp cho mọi pack:

| | Quy tắc |
|---|---|
| chữ hoa thường | không phân biệt |
| dấu thanh, dấu phụ | **có phân biệt**, "toàn diện" khác "toan dien" |
| khoảng trắng | gộp nhiều khoảng trắng thành một trước khi khớp |
| biên | hai đầu của cụm không được kề một chữ cái hoặc chữ số. "toàn diện" không trúng trong "toàndiện" |
| ngoại lệ | cụm bị chặn khi nó nằm trong một chuỗi khai ở `exceptions` của pack. Xem mục dưới |
| thứ tự ưu tiên | xét `banlist`, `mt_artifacts`, `superlative`, `puffery`, `comparative`, `evaluative` theo đúng thứ tự đó; một cụm trúng nhiều danh sách chỉ tính một lần, theo danh sách trúng trước |

#### Vì sao không dùng "biên âm tiết"

Bản trước của spec viết quy tắc biên là *"khớp ở biên âm tiết, không khớp giữa từ"*, kèm ví dụ *"hàng đầu" không trúng trong "hàng đầu tiên"*. **Quy tắc đó không triển khai được, và ví dụ mâu thuẫn với chính quy tắc.**

Trong "hàng đầu tiên", vị trí sau "đầu" **đúng là một biên âm tiết**. Muốn biết cụm này không được khớp thì phải biết "đầu tiên" là một từ, mà đó là tri thức từ vựng chứ không phải biên ký tự. Không biểu thức chính quy nào làm được, và thêm một bộ tách từ tiếng Việt vào `scan.mjs` thì phá điều kiện không phụ thuộc thư viện ngoài.

Thay bằng hai thứ triển khai được:

**Biên ký tự.** Hai đầu của cụm không được kề `\p{L}` hoặc `\p{N}`. Đây là thứ một lookaround làm được, và nó bắt đúng ca thật sự sai là cụm dính liền vào một từ khác.

**Danh sách ngoại lệ trong pack.** Khoá `exceptions` ánh xạ một cụm sang những chuỗi dài hơn mà trong đó nó không được khớp:

```json
"exceptions": {
  "hàng đầu": ["hàng đầu tiên"],
  "vượt": ["vượt qua khó khăn"]
}
```

Thuật toán, chạy sau khi đã tìm khớp bình thường:

```
với mỗi khớp h của cụm T:
    với mỗi chuỗi ngoại lệ E trong exceptions[T]:
        với mỗi khớp e của E trong cùng văn bản:
            nếu h nằm trọn trong e  ->  loại h
```

Nằm trọn nghĩa là `h.start >= e.start` và `h.end <= e.end`. Chuỗi ngoại lệ so khớp theo đúng ba quy tắc đầu của bảng trên.

Điều kiện là chứa **theo vị trí**, không phải theo sự có mặt. Câu *"Vừa hàng đầu tiên vừa hàng đầu thị trường"* cho **một** khớp chứ không phải không khớp nào: khớp thứ nhất bị loại vì nằm trong "hàng đầu tiên", khớp thứ hai giữ lại vì không nằm trong ngoại lệ nào.

`exceptions` là một danh sách lớn dần, giống bốn danh sách kia. Không cần đầy đủ mới dùng được: cụm chưa có ngoại lệ thì bị báo, và `false-positives.md` cùng model là lớp lọc thứ hai. Điều này nhất quán với nguyên tắc "danh sách là sàn, không phải cửa" ở mục 9.

Vì sao không để hẳn cho model lọc mà vẫn cần `exceptions`: `puffery` ở tier R có ngưỡng cứng bằng 0, nên một khớp sai làm `counted.puffery` khác 0 và biến một cụm hợp lệ thành vi phạm ở tầng tất định. Khác với `eval_candidate`, chỗ này báo thừa có hậu quả thật.

#### Sáu danh sách, sáu vai trò

Chúng không thay thế nhau và không được gộp. Tier quyết định danh sách nào có hiệu lực, chứ danh sách không tự phân theo tier.

| Trường | Nghĩa | R | P | C | Mã rule |
|---|---|---|---|---|---|
| `banlist` | không bao giờ được dùng | cấm | cấm | cấm | `*-BANLIST` |
| `puffery` | claim marketing mạnh | cấm | cần điều kiện (a) hoặc (b) mục 3.1 | cần chống lưng | `*-PUFFERY` |
| `comparative` | so sánh có đối tượng | cần mốc nêu rõ | cần mốc nêu rõ | cần mốc nêu rõ | `*-COMPARATIVE` |
| `superlative` | cực cấp, khẳng định đứng đầu | cần mốc nêu rõ | cần mốc nêu rõ | **cấm** | `*-SUPERLATIVE` |
| `evaluative` | đánh giá thông thường | cần chống lưng | cần chống lưng **nếu nói về thực tế** | tự do | `*-EVAL-CANDIDATE` |
| `mt_artifacts` | dấu vết dịch máy | cấm | cấm | cấm | `*-MT-ARTIFACT` |

Đây là nguồn dữ liệu cho phép kiểm tier C ở mục 3.1 và 5.4. Trước đây `banlist` chia theo tier và kiêm luôn vai trò của `puffery`, khiến tier C không có trường nào để dò. Tách ra thì mỗi trường một việc và bảng trên đọc thẳng thành code.

#### Vì sao tier C cấm cực cấp, dù nơi khác cho phép

Đây là chỗ duy nhất trong spec mà một rule tồn tại **không phải vì lý do văn phong**.

Cực cấp trong ad copy làm quảng cáo bị từ chối. Meta, Google và TikTok đều có điều khoản chặn claim "số một", "tốt nhất", "hàng đầu" khi không có căn cứ được nền tảng chấp nhận, và trong thực tế thì kể cả có căn cứ vẫn hay bị chặn vì người duyệt không đọc phần chứng minh. Hậu quả là mất tiền và mất thời gian chạy lại, nặng hơn nhiều so với một câu nghe máy móc.

Nên ở tier C, cực cấp **cấm hẳn**, không có đường "nêu mốc thì được" như tier R và P.

```
CẤM ở C     "Máy lọc nước tốt nhất thị trường."
CẤM ở C     "Thương hiệu số 1 Đông Nam Á."
CẤM ở C     "Lọc sạch nhất trong tầm giá."      kể cả có số chứng minh

ĐẠT ở C     "Lọc tới 0.0001 micron, mịn gấp mười lần màng RO phổ thông."
            So sánh có đối tượng và tỉ lệ, không phải cực cấp.
ĐẠT ở C     "Bảo hành tận nơi trong 24 giờ."
            Dữ kiện đứng một mình, mạnh hơn mọi tính từ.
```

Ngoại lệ duy nhất: cụm khớp nguyên văn một dòng trong `.antislop-claims.txt`. Đó là chỗ bạn khai những claim khách đã duyệt và chịu trách nhiệm, ví dụ một giải thưởng có thật.

Phạm vi dừng ở đây. Bộ này **không** phải công cụ kiểm duyệt quảng cáo: nó không xét claim y tế, ảnh trước và sau, hay thuộc tính cá nhân. Nó chỉ lấy đúng phần giao giữa "tell AI" và "rủi ro policy", vì cụm cực cấp vốn đã nằm trong tầm dò của nó.

**`comparative` không bị cấm ở tier R.** So sánh có mốc là cách diễn đạt minh bạch nhất trong báo cáo, không phải thứ cần tránh:

```
ĐẠT ở R    "CPA 47$, cao hơn mục tiêu 35$ khoảng 34%."
ĐẠT ở R    "Chi phí giảm so với tháng 5, từ 52$ xuống 47$."
KHÔNG ĐẠT  "CPA cao hơn kỳ vọng."      thiếu mốc
KHÔNG ĐẠT  "Kênh hiệu quả nhất tháng." thiếu tập so sánh và tiêu chí
```

Quy tắc giống nhau ở cả ba tier: nêu mốc thì đạt, không nêu thì báo. Tier chỉ đổi mức nghiêm khi phán xử, không đổi việc cho phép hay cấm.

`comparative` chỉ báo ứng viên. Câu hỏi "mốc so sánh đã nêu chưa" là ngữ nghĩa, nên nó đi vào `judged` giống `evidence_backing`, không vào `counted`.

#### Schema của antislop-pack

| Khoá | Kiểu | Bắt buộc | Rỗng được |
|---|---|---|---|
| `lang` | string, khớp khoá trong `languages.json` | có | không |
| `banlist` | mảng string | có | có |
| `mt_artifacts` | mảng string | có | có |
| `puffery` | mảng string | có | có |
| `comparative` | mảng string | có | có |
| `superlative` | mảng string | có | có |
| `evaluative` | mảng string | có | có |
| `abbreviations` | mảng string | có | có |
| `exceptions` | object, khoá là một cụm có trong bốn danh sách từ vựng, giá trị là mảng string | có | có, `{}` nghĩa là chưa có ngoại lệ nào |
| `openers` | object, đúng ba khoá `dai_tu`, `lien_tu`, `trang_ngu`, mỗi khoá một mảng string | có | mảng con rỗng được |
| `tackon` | mảng string | có | có |
| `config_tokens` | mảng string | có | có |
| `loanwords` | mảng string | có | có |
| `tier_keywords` | object, đúng ba khoá `R`, `P`, `C`, mỗi khoá một mảng string | có | mảng con rỗng được |

Mọi khoá đều bắt buộc có mặt; giá trị rỗng thì được, thiếu khoá thì không. Rỗng là một tuyên bố ("ngôn ngữ này không có từ nào thuộc nhóm đó"), còn thiếu là một thiếu sót.

Khoá lạ ngoài bảng: `scan.mjs` bỏ qua, nhưng CI cảnh báo. Cho phép thử nghiệm trường mới mà không vỡ, đồng thời không để nó lặng lẽ tồn tại.

`bin/validate-pack.mjs` kiểm bảng trên và chạy trong CI cho mọi pack đăng ký trong `languages.json`. Fixture gồm ít nhất: một pack hợp lệ, một pack thiếu khoá, một pack sai kiểu, một pack có khoá lạ.

`scan.mjs` chỉ đọc khối này, không parse văn xuôi. Pack thiếu khối hoặc không qua `validate-pack.mjs` thì `scan.mjs` xử như ngôn ngữ chưa đăng ký (mục 9) và CI báo lỗi pack.

### 6.3 Đăng ký

`references/languages.json` là chỗ duy nhất khai báo ngôn ngữ.

```json
{ "vi": "vi.md", "en": "en.md" }
```

Thêm ngôn ngữ là thêm một dòng và thả một file. Không sửa `core.md`, không sửa SKILL.md.

#### Ngôn ngữ chưa đăng ký

Suy ra một ngôn ngữ không có trong `languages.json` thì không được bỏ chạy, cũng không được lấy pack gần giống thay thế. Tiếng Thái không dùng được `vi.md`.

Hành vi: nạp `core.md` và `evidence.md`, áp các rule trung tính ngôn ngữ, và khai báo rõ trong dòng trạng thái. Phần `scan.mjs` chạy được tới đâu thì xem bảng ở mục 9.

```
[P · mức 2 · trang trọng · th (chưa có pack)]
```

Kèm một dòng ngay sau bản viết: các rule về từ vựng, xưng hô, tiểu từ và nhịp câu không áp cho ngôn ngữ này. Người dùng cần biết mình đang nhận một nửa dịch vụ chứ không phải toàn bộ.

#### Văn bản nhiều ngôn ngữ

Phân biệt hai trường hợp, vì chúng cần cách xử lý khác nhau.

**Từ mượn.** Văn xuôi tiếng Việt chêm thuật ngữ tiếng Anh. Đây là chuẩn ngành, không phải chuyển ngôn ngữ. Nạp một pack theo ngôn ngữ của văn xuôi. Danh sách trắng ở mục 2 của pack chặn skill dịch thuật ngữ. Xem mục 6.5.

**Song ngữ thật.** Tài liệu có những khối văn bản hoàn chỉnh ở hai ngôn ngữ, ví dụ proposal có bản tiếng Việt và bản tiếng Anh cạnh nhau. Nạp cả hai pack, áp theo từng khối, khai báo cả hai:

```
[P · mức 2 · trang trọng · vi+en]
```

Ranh giới giữa hai trường hợp: nếu ngôn ngữ phụ chỉ xuất hiện ở mức từ và cụm danh từ thì là từ mượn; nếu nó có câu hoàn chỉnh riêng thì là song ngữ. Không đặt ngưỡng phần trăm, vì một báo cáo dày thuật ngữ vẫn là văn bản một ngôn ngữ.

### 6.4 Nhãn trạng thái

| Nhãn | Điều kiện |
|---|---|
| soát rồi | đủ 8 mục, và có người bản xứ đọc output AI trong ngôn ngữ đó rồi soát pack |
| thử nghiệm | thiếu mục, hoặc chưa ai soát |

Chỉ hai bậc, và tiêu chí là **có người bản xứ soát hay chưa**. Đó là thứ duy nhất quyết định pack có dùng được không.

**v1 phát hành cả `vi` và `en` ở nhãn soát rồi.**

Nội dung mới mới là phần khó, không phải kiến trúc. Tell AI của một ngôn ngữ không suy ra được từ ngôn ngữ khác; nó phụ thuộc vào cấu trúc riêng và vào corpus mà model được train. Một pack dùng được cần người bản xứ đọc output AI trong ngôn ngữ đó.

### 6.5 Nội dung vi.md

**Mục này mô tả, không liệt kê.** Mọi token thực thi được nằm trong khối JSON `antislop-pack` của `vi.md` theo mục 6.2. Các cụm dưới đây là ví dụ minh hoạ để người đọc hiểu từng nhóm nhắm vào cái gì; danh sách đầy đủ ở khối JSON `antislop-pack`. Liệt kê hai chỗ thì skill và `scan.mjs` sẽ thực thi hai bộ rule khác nhau.

| Trường trong pack | Nhóm nhắm tới | Ví dụ minh hoạ |
|---|---|---|
| `banlist` | cụm AI đặc thù tiếng Việt | "đóng vai trò quan trọng trong việc" (bản dịch của top AI trigram 2026), "không chỉ ... mà còn" (negative parallelism bản Việt), "góp phần" và "mang lại hiệu quả" (tack-on bản Việt) |
| `banlist` | mở bài và kết bài công thức | "Trong thời đại số hoá ngày nay", "Trong bối cảnh", "Tóm lại", "Nhìn chung", "Hy vọng bài viết mang lại" |
| `puffery` | claim marketing mạnh | đột phá, tiên phong, hàng đầu, vượt trội, toàn diện, đẳng cấp |
| `comparative` | dấu hiệu so sánh và cực cấp | hơn, gấp, vượt, nhất, số một, đứng đầu |
| `mt_artifacts` | dấu vết dịch máy | "được thực hiện bởi", "nơi mà", "điều mà", "một trong những ... nhất" |
| `evaluative` | đánh giá cần chống lưng | đáng kể, vô cùng, hết sức, tốt, kém, hiệu quả |
| `loanwords` | thuật ngữ không được dịch | ROAS, CPA, CPC, remarketing, prospecting, audience, creative, funnel |
| `tackon` | mở đầu vế đuôi thừa | góp phần, mang lại, nhằm, qua đó |

Hai quy tắc của `vi.md` **không thực thi bằng máy được**, nên chúng ở dạng văn xuôi và chỉ model áp dụng. Chúng có mã riêng để `antislop-check` báo được, nhưng `scan.mjs` không đếm:

- `VI-NOMINALIZATION`: "việc triển khai" thành "triển khai", "quá trình tối ưu hoá" thành "tối ưu". Cần hiểu ngữ cảnh vì "việc" không phải lúc nào cũng thừa.
- `VI-ADDRESS-CONSISTENCY`: xưng hô chọn một lần và giữ nguyên cả tài liệu. Cần theo dõi xuyên khối, ngoài tầm một máy quét theo khối.

Danh sách trắng thuật ngữ đáng nói riêng. Báo cáo tiếng Việt chêm thuật ngữ Anh là chuẩn ngành, không phải chuyển ngôn ngữ. Skill không được dịch "remarketing" thành "tiếp thị lại". Ngôn ngữ chính quyết định pack được nạp; từ mượn không kích hoạt pack thứ hai.

## 7. antislop-check

### 7.1 Cách chấm

Không dùng thang điểm tổng hợp kiểu 7 hạng mục nhân 10 điểm. Bảo model cho điểm 1 đến 10 về một hạng mục trừu tượng thì chạy hai lần ra hai kết quả khác nhau; con số trông khoa học nhưng không tái lập.

Thay bằng: đếm được ở đâu thì đếm, phán đoán chỉ ở chỗ buộc phải phán đoán.

```
[check · R · vi]

ĐẾM ĐƯỢC                         thấy    ngưỡng
  dash (— –)                        3        0
  cụm trong ban list                7          0
  mt_artifacts                      2          0
  superlative                       1     0 (tier C)
  câu cùng khuôn liên tiếp          4        3
  eval_candidate (ứng viên)         5    xem PHÁN ĐOÁN
  puffery                           2    theo tier
  comparative                       1    xem PHÁN ĐOÁN
  short_paragraph_ratio         11/14   tham chiếu
  colon_outside_list                9      ~1/300 từ

PHÁN ĐOÁN
  bằng chứng chống lưng          cần sửa   3/5 ứng viên thiếu
  mốc so sánh nêu rõ              đạt
  giọng nhất quán quá mức       cần sửa
  cung lập luận 4 phần            đạt

KẾT LUẬN: CẦN SỬA
```

Phần đếm tái lập được. Phần phán đoán chỉ có ba nấc: đạt, cần sửa, hỏng.

Dòng `eval_candidate` cố tình không có ngưỡng. Nó đếm **ứng viên** do quét từ vựng, không đếm vi phạm. Câu hỏi "có thật sự thiếu chống lưng không" là ngữ nghĩa và nằm ở khối PHÁN ĐOÁN, nơi ghi tỉ lệ chứ không ghi ngưỡng. Đặt ngưỡng 0 cho một con số ứng viên là hứa một độ chính xác mà phép quét không có.

Sau bảng là danh sách vị trí cụ thể, rồi bản viết lại nếu người dùng yêu cầu.

### 7.2 Phanh chống dương tính giả

`false-positives.md` chạy trước khi báo lỗi. Nó chặn những thứ trông như tell nhưng không phải: curly quote do Word tự đổi, một từ "tuy nhiên" đơn lẻ, ngữ pháp chuẩn, một câu ngắn nhấn mạnh.

Nguyên tắc kế thừa từ humanizer: tìm cụm tell, không phải tell đơn lẻ.

`antislop-check` suy tier giống skill viết, vì caption và báo cáo không dùng chung thước đo.

## 8. Đóng gói

### 8.1 Manifest

`.claude-plugin/plugin.json` khai `"skills": ["./skills/antislop-write", "./skills/antislop-check"]`.

`.claude-plugin/marketplace.json` khai `plugins[0].source = "./"`.

`.codex-plugin/plugin.json` khai `"skills": "./skills/"` kèm khối `interface` với displayName, category, defaultPrompt.

Ba file này chứa metadata, không chứa dòng rule nào, nên duy trì tay không sinh rủi ro lệch bản.

### 8.2 Cài đặt

```bash
# Claude Code
/plugin marketplace add HDShinobi/antislop-marketing
/plugin install antislop-marketing@antislop-marketing

# Codex
codex plugin marketplace add https://github.com/HDShinobi/antislop-marketing
codex plugin add antislop-marketing@antislop-marketing
```

### 8.3 Giấy phép

Repo MIT. `NOTICE` ghi công hai nguồn, cả hai đều MIT:

- `adenaufal/anti-slop-writing`, structural rules, vân tay model, ý tưởng tier giọng
- `blader/humanizer`, danh sách chống dương tính giả

README ghi rõ phần nào lấy về, phần nào loại bỏ và vì sao. Việc này vừa đúng phép, vừa cho người đọc biết repo khác bản gốc ở đâu.

## 9. Kiểm thử

Đầu ra là văn xuôi không tất định, nhưng ba tầng dưới đây kiểm được.

Tầng 1, quét cơ học, tự động. `bin/scan.mjs` chạy không cần model: đếm em dash và en dash, dò cụm trong sáu danh sách của pack, tìm chuỗi câu cùng khuôn, đếm dấu hai chấm giữa câu và tỉ lệ đoạn ngắn. Mười khoá `counted`, xem schema bên dưới.

**Ranh giới năng lực của scan.mjs.** Câu hỏi "tính từ này có được chống lưng không" là câu hỏi ngữ nghĩa, không phải regex. Một máy quét từ vựng không trả lời được nó, nên spec không được đòi. Tách làm hai khái niệm riêng, và giữ chúng riêng ở mọi chỗ:

| Khái niệm | Ai quyết | Tất định | Được assert |
|---|---|---|---|
| `eval_candidate` | `scan.mjs` | có | có |
| `evidence_backing` | `antislop-check` | không | không |

`eval_candidate` đếm **mọi** từ nằm trong trường `evaluative` của language pack. Không lọc theo bất cứ điều kiện nào. Đếm được, tái lập được, và nó là **ứng viên** chứ không phải kết luận.

**Không dùng "khối có chứa token dữ kiện" để loại ứng viên.** Bản nháp trước làm thế, và nó tự vô hiệu hoá quy tắc bằng chứng. Ca kinh điển:

```
"Đội ngũ tận tâm, CPA tháng này 31$."
```

Khối có số, nên bộ lọc cũ loại "tận tâm" khỏi danh sách ứng viên, model không bao giờ được hỏi, và câu lọt. Nhưng đây chính xác là ví dụ mà mục 5.4 dựng lên để cấm. Bộ lọc cơ học đã giết đúng thứ nó phục vụ.

Sự có mặt của token dữ kiện vẫn hữu ích, nhưng là **tín hiệu kèm theo**, không phải bộ lọc:

```json
{ "rule": "VI-EVAL-CANDIDATE", "span": [12, 20], "text": "tận tâm",
  "lang": "vi", "block": 3, "block_has_data": true }
```

`block_has_data` nói cho model biết có gì để xét, giúp nó nhanh hơn. Nó không quyết định thay model. Ứng viên vào hết `findings_mechanical`; lọc là việc của `findings_judged`.

**Danh sách là sàn, không phải cửa.** Nguyên tắc này áp cho `evaluative`, `puffery`, `comparative` và `superlative`, cả bốn đều là lớp mở. Không danh sách hữu hạn nào phủ hết. Ví dụ ngay trên, "tận tâm", không có trong `evaluative` mẫu. Nếu model chỉ xét những gì `scan.mjs` đưa cho thì nó lọt, và cả cơ chế bằng chứng thành ra chỉ mạnh bằng độ dài của một danh sách.

Nên phân vai rõ:

| Tầng | Trách nhiệm |
|---|---|
| `scan.mjs` + bốn danh sách lớp mở | bảo đảm **sàn**: những từ đã biết thì không bao giờ lọt, và hồi quy bắt được |
| `antislop-check` | quét ngữ nghĩa **độc lập**, tìm mọi nhận định đánh giá, mọi claim marketing mạnh, mọi so sánh và cực cấp, kể cả không có trong danh sách |

`antislop-check` không được coi `findings_mechanical` là danh sách đầy đủ những chỗ cần xét. Nó đọc toàn văn bản và tự tìm. Cái gì nó tìm thêm được thì vào `findings_judged`, với mã theo loại:

| Model tự tìm được | Mã |
|---|---|
| nhận định đánh giá ngoài `evaluative` | `EVID-UNBACKED` |
| claim marketing mạnh ngoài `puffery` | `*-PUFFERY-UNLISTED` |
| so sánh ngoài `comparative` | `*-COMPARATIVE-UNLISTED` |
| cực cấp ngoài `superlative` | `*-SUPERLATIVE-UNLISTED` |

Chỗ này quan trọng nhất ở tier C. Tier C cho đánh giá thông thường đi tự do, nhưng vẫn bắt puffery và claim so sánh phải chống lưng (mục 3.1). Nếu chỉ dò theo danh sách thì một claim mạnh không có trong pack sẽ bị xếp nhầm vào nhóm "đánh giá thông thường" và lọt hoàn toàn. Đó là lỗ hổng lớn nhất có thể có ở tier C, vì tier C chính là nơi ad copy sống.

Hệ quả cho fixture: phát hiện ngữ nghĩa **có** assert được, nhưng chỉ với những ca hiển nhiên. Xem chính sách fixture ở phần Runner bên dưới.

Hệ quả cho người bảo trì pack: mỗi lần model bắt được một cụm hay gặp mà chưa có trong danh sách tương ứng, thêm nó vào. Ba danh sách lớn dần theo thời gian và phần tất định phủ rộng hơn, nhưng chúng không bao giờ cần đầy đủ mới dùng được.

Token dữ kiện định nghĩa bằng bốn mẫu chính xác, không phải bằng mô tả:

| Mẫu | Biểu thức | Trúng |
|---|---|---|
| số | `\d` xuất hiện ngoài code span | `47`, `3.4`, `22%`, `1.250.000` |
| ngày tháng | `\d{1,4}[/-]\d{1,2}([/-]\d{1,4})?` hoặc `tháng \d` | `12/6`, `2026-07`, `tháng 6` |
| URL hoặc đường dẫn | `https?://` hoặc `\w+\.(com\|vn\|net\|org\|io)` | `example.com` |
| tên trường cấu hình | có trong `config_tokens` của language pack | `campaign`, `bidding`, `pixel` |

Ba mẫu đầu trung tính ngôn ngữ và nằm trong `core.md`. Mẫu thứ tư phải là danh sách trong pack chứ không phải mô tả mở, vì "tên trường cấu hình" không có biên nếu để tự do.

Đơn vị đo không có mẫu riêng. Đơn vị luôn đi kèm số (`31$`, `0.0001 micron`), nên mẫu số đã bắt được, và một danh sách đơn vị đầy đủ là việc không có điểm dừng.

Chú ý `evaluative` là trường riêng, không phải `banlist`. Hai danh sách khác nhau về bản chất: `banlist` là từ không được dùng (*đột phá*, *tiên phong*); `evaluative` là từ **được dùng nếu có chống lưng** (*tốt*, *hiệu quả*, *chậm*). Gộp chúng thì hoặc cấm nhầm những từ đánh giá bình thường, hoặc cho qua puffery.

`evidence_backing` là câu hỏi thật: dữ kiện có mặt kia có chứng minh chính tính từ đó không. Chỉ model trả lời được, nên nó nằm ở khối `judged` của `antislop-check` và không bao giờ bị assert.

Hệ quả: `scan.mjs` báo nhiều hơn thực tế ở chỗ này, và đó là thiết kế. Nó lọc thô để `antislop-check` xét tiếp, giống cách một linter báo cảnh báo chứ không tuyên án.

#### Giao diện của scan.mjs

Ban list và `eval_candidate` đều phụ thuộc tier và ngôn ngữ, nên hai thứ đó phải là tham số, không được suy trong lòng hàm.

**`scan` luôn nhận trọn tài liệu**, không nhận từng khối. Nó tự tách khối theo mục 3.0, nên nó là chỗ duy nhất biết offset tuyệt đối và chỉ số khối. Bắt người gọi tách rồi ghép lại thì `span` và `block` trong schema đầu ra không dựng được.

```js
scan(text, { tier, lang })                     // đơn ngữ
scan(text, { tier, langMap: [                  // song ngữ
  { block: 0, lang: "vi" },
  { block: 1, lang: "en" }
]})
```

```bash
node bin/scan.mjs --tier R --lang vi path/to/file.md
node bin/scan.mjs --tier P --lang-map path/to/langmap.json path/to/file.md
```

#### Tìm scan.mjs từ một thư mục làm việc bất kỳ

`antislop-check` chạy ở thư mục của người dùng, không ở checkout của repo. Đường dẫn tương đối `bin/scan.mjs` chỉ đúng khi CWD tình cờ là repo, nên `counted_source: "scan"` sẽ hỏng ở mọi trường hợp dùng thật.

Ba quyết định:

**`scan.mjs` nằm ở `bin/`, không ở `tests/`.** Nó là thành phần chạy lúc dùng, không phải công cụ kiểm thử. `tests/scan.test.mjs` import từ `../bin/scan.mjs`.

**Skill giải đường dẫn theo thư mục của chính nó**, thứ harness cung cấp, không theo CWD. Từ `skills/antislop-check/` thì `bin/scan.mjs` nằm ở `../../bin/scan.mjs`.

**Đây cùng một câu hỏi với đường dẫn `references/`** ở mục 2, nên gộp làm một hạng mục kiểm chứng. Nếu đường dẫn tương đối không resolve được ở một harness nào đó thì cả hai cùng chuyển sang phương án dự phòng, và `counted_source` rơi về `"model"` ở harness đó.

Fixture phải có ít nhất một lần chạy với CWD nằm ngoài repo, nếu không lỗi này không bao giờ lộ trong CI.

Không yêu cầu Node phải có. Harness không chạy được Node thì `counted_source` là `"model"` theo bảng ở mục 9, và đó là chế độ suy giảm đã lường trước.

Khối không có trong `langMap` thì dùng `lang` nếu có, không thì xử như ngôn ngữ chưa đăng ký.

**Lấy chỉ số khối ở đâu ra.** `langMap` và `tierMap` đều đánh theo chỉ số khối, nhưng `scan` mới là chỗ tách khối. Người gọi không thể biết chỉ số trước khi gọi. Giải bằng cách công khai pha tách thành một hàm riêng:

```js
import { splitBlocks, scan } from "../../bin/scan.mjs"

const blocks = splitBlocks(text)
// [{ index, kind, span, parent?, children?, text }]

const langMap = blocks
  .filter(b => looksEnglish(b.text))
  .map(b => ({ block: b.index, lang: "en" }))

scan(text, { tier: "P", langMap })
```

`splitBlocks` là hàm thuần, không cần tier hay lang, và `scan` gọi đúng nó bên trong. Nên chỉ có một phép tách khối trong toàn hệ thống, và chỉ số mà người gọi thấy luôn khớp chỉ số trong `findings`.

Đây là đường duy nhất `antislop-check` được dùng để dựng `langMap`. Nó không được tự tách khối theo cách riêng.

**Tier cũng không đồng nhất trong một tài liệu.** Mục 3.2 bắt mọi bảng số liệu và mục kết quả áp chuẩn R bất kể tier của tài liệu. Một tham số `tier` duy nhất không diễn đạt được điều đó. Chia ba đường, theo mức độ máy nhận ra được:

| Vùng R | Ai xác định | Vào đâu |
|---|---|---|
| bảng số liệu | `scan.mjs` tự nhận theo tiêu chí dưới | `findings_mechanical` |
| khối khai tường minh trong `tierMap` | người gọi | `findings_mechanical` |
| "mục kết quả" theo ngữ nghĩa | chỉ model nhận ra | `findings_judged` |

```js
scan(text, { tier: "P", tierMap: [{ block: 7, tier: "R" }] })
```

`tierMap` trỏ tới một chỉ số khối bất kỳ. Trỏ vào khối cha của bảng thì tier lan xuống mọi ô con theo quy tắc ở mục 3.0. Trỏ vào một ô lẻ thì chỉ ô đó đổi.

**Không phải mọi bảng Markdown đều là bảng số liệu.** Một bảng so sánh tính năng trong bản nháp landing page là bảng nội dung, và nâng nó lên R sẽ cấm nhầm ngôn ngữ marketing hợp lệ. Cần một tiêu chí tất định.

Tiêu chí: **quá nửa số ô thân bảng không rỗng có chứa một token khớp mẫu "số"** (mục 9, bảng token dữ kiện).

Mẫu số là **toàn bộ ô thân không rỗng**, tức mọi ô ngoài hàng tiêu đề, kể cả cột nhãn. Không loại trừ cột nào. Ô rỗng và ô chỉ chứa khoảng trắng không tính vào mẫu số. Ngưỡng là lớn hơn một nửa, đúng một nửa thì không đạt.

```
ĐẠT, là bảng số liệu       | Kênh   | Chi phí | CPA |
                           | Search | 12.400$ | 31$ |
                           | Meta   |  8.100$ | 47$ |
                           6 ô thân, 4 ô có số  ->  4/6 > 1/2

KHÔNG ĐẠT, bảng nội dung   | Tính năng | Mô tả                 |
                           | Lọc RO    | Loại bỏ kim loại nặng |
                           | Bảo hành  | Tận nơi trong 24h     |
                           4 ô thân, 1 ô có số  ->  1/4 < 1/2
```

Cột nhãn ("Search", "Meta") nằm trong mẫu số và thường không có số, nên bảng số liệu thật vẫn đạt nhờ các cột giá trị. Bảng hai cột mà một cột là nhãn thì cần cột kia gần như toàn số mới đạt, và đó là hành vi đúng: một bảng như thế đúng là ranh giới.

Còn "mục kết quả" thì không có dấu hiệu cú pháp nào, nên nó là việc của model và không được hứa hẹn ở tầng cơ học.

**Chuẩn R cho vùng số liệu là sàn, không phải một giá trị mặc định.** Mục 3.2 nói nó không ghi đè được, nên `tierMap` không được hạ một bảng số liệu xuống P hay C.

Thứ tự nghiêm: `C < P < R`. Quy tắc:

```
tier hiệu lực = max( tier toàn tài liệu,
                     R nếu là bảng số liệu,
                     tier khai trong tierMap )
```

`tierMap` chỉ nâng được, không hạ được. Khai `tierMap: [{block: 7, tier: "C"}]` cho một bảng số liệu thì khối đó vẫn là R, và `tier_source` vẫn là `data_table`. Khai `tier: "R"` cho một đoạn văn thường trong tài liệu C thì có tác dụng, và `tier_source` là `tier_map`.

Lý do không cho hạ: quy tắc vùng số liệu tồn tại để chặn một lỗi cụ thể, là proposal chứa bảng kết quả tháng trước với tính từ không chống lưng. Cho phép ghi đè thì quy tắc đó thành lời khuyên.

Ban list của hai ngôn ngữ vẫn không trộn: `scan` chọn pack theo từng khối, không hợp nhất danh sách. Trộn thì sinh dương tính giả ở cả hai phía.

**Gộp giữa các khối không phải lúc nào cũng là phép cộng.** `scan` làm việc này bên trong, nhưng quy tắc phải chốt ở đây vì fixture assert kết quả cuối:

| Bộ đếm | Gộp bằng |
|---|---|
| `dash`, `banlist`, `mt_artifacts`, `superlative`, `puffery`, `comparative`, `eval_candidate`, `colon_outside_list` | cộng |
| `same_shape_run` | **max** |
| `short_paragraph_ratio` | tính lại trên toàn tài liệu, không gộp từ khối |

`same_shape_run` là cực đại của một chuỗi liên tiếp, không phải tổng số lần xuất hiện. Cộng lại thì hai khối mỗi khối run 2 thành 4 và báo giả vượt ngưỡng 3. Chuỗi câu cũng không nối qua ranh giới khối, nên `max()` là phép đúng.

`findings` giữ nguyên `span` theo từng khối, kèm trường `lang` để biết khối nào sinh ra nó.

#### Ngôn ngữ chưa đăng ký: scan.mjs chạy được tới đâu

`lang` không có trong `languages.json` thì `scan.mjs` chạy được ít hơn nhiều so với những gì mục 6.3 gợi ý, vì `same_shape_run` cần bảng phân lớp từ mở đầu và danh sách tack-on, mà hai thứ đó chỉ có trong language pack.

Hành vi chốt:

| Bộ đếm | Ngôn ngữ chưa đăng ký |
|---|---|
| `dash` | chạy, trung tính hoàn toàn |
| `colon_outside_list`, `short_paragraph_ratio` | chạy, thuần cơ học, không cần pack |
| `same_shape_run` | `null` |
| `banlist`, `mt_artifacts`, `superlative`, `puffery`, `comparative`, `eval_candidate` | `null` |

Dùng `null` chứ không dùng `0`. Số 0 nghĩa là đã kiểm và sạch; `null` nghĩa là không kiểm được. Nhầm hai cái này thì người dùng tưởng văn bản đã qua kiểm.

Không dựng bảng phân lớp trung tính trong `core.md`. Sáu lớp từ mở đầu cần danh sách token của từng ngôn ngữ; một bảng chung sẽ hoặc rỗng, hoặc sai cho mọi ngôn ngữ.

#### Định nghĩa "cùng khuôn"

Cụm từ này xuất hiện ở mục 7 như bài test định tính thay cho ngưỡng chưa đo, và ở đây như một phép đếm tất định. Không định nghĩa thì cả hai chỗ đều trống.

#### Tách câu

Trước khi nói tới chữ ký, phải chốt câu bắt đầu và kết thúc ở đâu. Không chốt thì `same_shape_run` khác nhau giữa hai implementation và không assert được. Báo cáo quảng cáo đầy `0.0001`, `3.4`, `TP.HCM`, URL, nên đây không phải trường hợp hiếm.

`scan.mjs` tự tách, không phụ thuộc thư viện ngoài, để kết quả không đổi theo phiên bản dependency.

**Hết khối luôn là ranh giới câu**, xét trước mọi điều kiện khác, kể cả khi không có dấu kết thúc. Tiêu đề, mục danh sách và ô bảng thường không có dấu chấm cuối.

Trong lòng một khối, ranh giới câu là một trong `. ! ? …` khi **cả ba điều kiện** đúng:

1. ngay sau nó là ít nhất một khoảng trắng
2. token tiếp theo bắt đầu bằng một ký tự chữ, chữ số, hoặc dấu mở ngoặc
3. không rơi vào danh sách loại trừ bên dưới

Điều kiện 2 **không đòi chữ hoa**. Tiếng Việt không bắt buộc viết hoa đầu câu trong văn phong thân mật, và câu sau một câu kết thúc bằng số cũng hay bắt đầu bằng chữ thường. Đòi chữ hoa thì bỏ sót ranh giới thật và `same_shape_run` sai trên văn bản thực tế. Việc chống tách nhầm giao cho danh sách loại trừ, không giao cho quy tắc viết hoa.

Fixture cơ học phải có ít nhất một mẫu với câu tiếp theo bắt đầu bằng chữ thường.

Loại trừ, không tách:

| Trường hợp | Ví dụ |
|---|---|
| dấu chấm giữa hai chữ số | `3.4`, `0.0001`, `1.250.000` |
| dấu chấm không có khoảng trắng theo sau | `TP.HCM`, `example.com` |
| viết tắt trong trường `abbreviations` của pack | `v.v.`, `ThS.`, `Q.7` |
| bên trong code span hoặc URL trong link Markdown | `` `a.b()` ``, `[x](https://a.com/b.html)` |

Ký hiệu Markdown ở đầu dòng (`-`, `*`, `1.`, `#`) bị gỡ trước khi tách. Riêng `1.` ở đầu mục danh sách không tính là ranh giới câu.

Mỗi câu rút về một chữ ký ba thành phần:

```
signature(câu) = (lớp_từ_mở_đầu, số_vế, có_đuôi_bổ_nghĩa)
```

| Thành phần | Cách tính |
|---|---|
| lớp từ mở đầu | năm lớp, xem bảng dưới |
| số vế | đếm dấu phẩy cấp cao nhất cộng một, bỏ qua phẩy trong ngoặc và phẩy phân cách số |
| có đuôi bổ nghĩa | vế cuối bắt đầu bằng một token trong `tackon` của language pack, ví dụ *góp phần*, *mang lại*, *nhằm* |

**Chỉ phân lớp được cái gì đóng.** Bản nháp trước liệt kê sáu lớp gồm danh từ và động từ. Không làm được: tiếng Việt không có hình thái và không viết hoa danh từ chung, nên phân biệt danh từ với động từ ở token đầu tiên cần POS tagger. Thêm một dependency nặng vào `scan.mjs` để phục vụ một phép đếm heuristic là đánh đổi sai.

Năm lớp, bốn lớp đầu đóng hoặc nhận diện bằng mẫu, lớp cuối là dự phòng:

| Lớp | Nhận diện | Thứ tự xét |
|---|---|---|
| `so` | token bắt đầu bằng chữ số | 1 |
| `dai_tu` | có trong `openers.dai_tu` | 2 |
| `lien_tu` | có trong `openers.lien_tu` | 3 |
| `trang_ngu` | có trong `openers.trang_ngu` | 4 |
| `khac` | mọi thứ còn lại | 5 |

Xét theo thứ tự, dừng ở lớp đầu tiên trúng. Một token trúng nhiều danh sách thì lấy lớp có số thứ tự nhỏ hơn, nên không có nhập nhằng.

Hai câu **cùng khuôn** khi cả ba điều kiện đúng:

1. lớp mở đầu trùng nhau, **và lớp đó không phải `khac`**
2. số vế trùng
3. trạng thái đuôi bổ nghĩa trùng

`same_shape_run` là độ dài chuỗi câu liên tiếp cùng khuôn dài nhất trong tài liệu. Ngưỡng cảnh báo là 3.

**Hai câu cùng rơi vào `khac` thì không tính là cùng khuôn.** Đây là điều kiện quan trọng nhất trong ba. `khac` gom mọi token không thuộc bốn lớp đóng, nên hai câu ở đó có thể mở đầu bằng hai thứ chẳng liên quan gì nhau. Không có điều kiện này thì ba câu trần thuật bình thường, cùng hai vế, không đuôi bổ nghĩa, sẽ bị báo dù chúng không giống nhau chút nào. Đó là máy sinh dương tính giả.

Giới hạn vào lớp đóng cũng trung thành với quan sát gốc. Bài test của adenaufal là "quá nửa câu mở đầu bằng The, This, It, In", và bốn từ đó đều là từ chức năng thuộc lớp đóng. Thứ đáng bắt là câu nào cũng mở bằng cùng một loại từ chức năng, không phải câu nào cũng mở bằng một danh từ nào đó.

Chữ ký này nông và có chủ ý. Nó không phân tích cú pháp, chỉ bắt cái mà mắt người bắt được khi đọc lướt: câu nào cũng mở đầu giống nhau, chia vế giống nhau, kết thúc giống nhau. Phân tích cú pháp đầy đủ cho tiếng Việt là bài toán khác, và không cần thiết cho việc này.

Bảng phân lớp từ mở đầu và danh sách tack-on nằm ở **mục 7 của language pack**, cạnh ngưỡng độ dài câu, vì cả ba đều thuộc về nhịp. Số mục của hợp đồng ở 6.2 giữ nguyên là 8.

`scan.mjs` là hàm thuần: cùng đầu vào cho cùng đầu ra, nên nó tự kiểm được bằng fixture cơ học. `tests/fixtures/mechanical/` chứa các cặp:

```
sample-01.md              văn bản đầu vào
sample-01.expect.json     kỳ vọng, cùng schema với đầu ra scan.mjs
```

#### Đầu ra của scan.mjs

Model phải chép nguyên `findings_mechanical`, nên định dạng của thứ được chép phải chốt ở đây.

```json
{
  "counted": { "dash": 2, "banlist": 5, "mt_artifacts": 2, "superlative": 1,
               "puffery": 1, "comparative": 0, "eval_candidate": 1, "same_shape_run": 3,
               "colon_outside_list": 9, "short_paragraph_ratio": [11, 14] },
  "findings": [
    { "rule": "VI-BANLIST", "span": [120, 145],
      "text": "đóng vai trò quan trọng trong việc",
      "lang": "vi", "block": 4, "tier": "P" }
  ]
}
```

Mười khoá trong `counted`, không hơn không kém. Bảng ĐẾM ĐƯỢC ở mục 7.1 hiển thị đúng mười khoá này, nên mọi dòng trong bảng đó đều có nguồn.

Hai khoá cuối cần định nghĩa vì chúng không hiển nhiên:

**`dash`** đếm em dash và en dash dùng làm **dấu câu**, tức gắn một mệnh đề phụ vào giữa câu. Hai cách dùng khác là chính tả bình thường và không tính:

| Không tính | Ví dụ | Vì sao |
|---|---|---|
| dash sát hai bên, không khoảng trắng | `T9–T10`, `01–08/08`, `top 10–20`, `Cuối T10–đầu T11` | khoảng số hoặc từ ghép, không bao giờ là dấu câu |
| dash mở đầu một ô bảng | `\| — (chuẩn bị BM) \|` | quy ước bảng tính cho "chưa có gì" |

Dash có khoảng trắng ở chỗ khác thì tính, kể cả khi nó phân cách tiêu đề. Văn xuôi ở chỗ đó sẽ dùng dấu hai chấm.

Quy tắc này hẹp lại sau khi quét một roadmap thật: **28 trên 28 dash trong đó đều hợp lệ**, và rule như viết ban đầu sẽ làm người dùng tắt công cụ sau file thứ hai.

**`colon_outside_list`** đếm dấu hai chấm không đứng cuối dòng dẫn vào một danh sách hoặc bảng, và không nằm trong code span hay URL. Dấu hai chấm ở cuối một dòng mà dòng kế tiếp bắt đầu bằng `-`, `*`, `|` hoặc chữ số thì không tính. Đây là dấu hai chấm giữa câu, thứ Claude dùng nhiều hơn người viết đáng kể.

**`short_paragraph_ratio`** là một cặp `[số đoạn văn xuôi có 1-2 câu, tổng số đoạn văn xuôi]`. Chỉ tính đoạn văn, không tính mục danh sách, ô bảng, heading, code fence. Xuất dạng cặp chứ không xuất tỉ lệ thập phân, vì cặp số nguyên so khớp chính xác được trong fixture còn số thực thì không.

Cả hai đều thuần cơ học và không cần language pack, nên chúng vẫn chạy với ngôn ngữ chưa đăng ký.

Ngoài `counted` và `findings`, đầu ra còn một mảng `blocks` khai tier và ngôn ngữ **hiệu lực** của từng khối sau khi đã áp `tierMap`, bảng-tự-nhận và `langMap`:

```json
"blocks": [
  { "index": 0, "tier": "P", "lang": "vi", "kind": "paragraph" },
  { "index": 7, "tier": "R", "lang": "vi", "kind": "table",
    "children": [8, 9, 10, 11], "tier_source": "data_table" },
  { "index": 8, "tier": "R", "lang": "vi", "kind": "table_cell",
    "parent": 7, "tier_source": "data_table" }
]
```

`tier_source` nhận `document`, `data_table`, hoặc `tier_map`, cho biết tier hiệu lực đến từ đâu.

Mỗi phần tử trong `findings` cũng mang `tier` là tier hiệu lực của khối chứa nó.

Lý do bắt buộc: `scan.mjs` đã tính tier hiệu lực rồi, và nếu không xuất ra thì `antislop-check` phải tự suy lại để áp rule bằng chứng chỉ-dành-cho-R. Hai bên suy độc lập là hai bên có thể lệch nhau, và lúc đó không ai biết bên nào đúng. Tính một lần, xuất ra, dùng chung.

Quy ước bắt buộc:

| Trường | Quy ước |
|---|---|
| `span` | cặp offset theo **UTF-16 code unit** tính từ đầu file gốc, tức chỉ số chuỗi gốc của JavaScript. Không phải byte, không phải grapheme, không phải theo khối. Nửa mở `[đầu, cuối)` |
| `text` | trích đúng đoạn mà `span` trỏ tới, không cắt bớt, không thêm dấu ba chấm |
| `lang` | mã pack đã dùng cho khối đó, cần cho tài liệu song ngữ |
| `block` | chỉ số khối tính từ 0, theo thứ tự xuất hiện, dùng để định vị khi đọc |
| thứ tự | `findings` sắp theo `span[0]` tăng dần, để hai lần chạy cho cùng mảng |

Chọn UTF-16 code unit vì đó là đơn vị `String.prototype.slice` của JavaScript dùng sẵn, nên `bin/scan.mjs` không cần chuyển đổi và `text` luôn khớp `span` bằng một phép cắt. Không dùng byte: chữ tiếng Việt có dấu chiếm nhiều byte UTF-8 và trộn hai cách đếm thì `span` trỏ sai chỗ. Không dùng grapheme cluster: Node không có API dựng sẵn cho nó.

Emoji ngoài mặt phẳng cơ bản chiếm hai code unit. Đó là hành vi đúng theo định nghĩa này, không phải lỗi. Fixture cơ học phải có một mẫu chứa emoji và một mẫu chứa chữ có dấu, để quy ước này bị kiểm chứ không chỉ được tuyên bố.

`.expect.json` của fixture cơ học dùng đúng schema này.

Điều kiện fail của tầng 1, cả ba đều làm CI đỏ:

1. `scan.mjs` trả về `counted` lệch bất kỳ giá trị nào trong `.expect.json`
2. Tập `rules` trả về khác tập kỳ vọng, thừa hoặc thiếu
3. `scan.mjs` ném lỗi hoặc không parse được đầu vào

Đây là chỗ bắt hồi quy khi sửa ban list hoặc thêm rule. Không có bước này thì sửa một regex có thể làm hỏng phép đếm mà không ai biết.

Tầng 2, fixture có lỗi biết trước. `tests/fixtures/` chứa đoạn văn đã gài lỗi kèm chú thích lỗi gì ở đâu. Chạy `antislop-check` lên và kiểm hai điều: có bắt đúng không, và có báo nhầm gì không. Vế thứ hai kiểm `false-positives.md`.

Tầng này gọi một model, nên đầu ra không tất định. Để nó kiểm được, cần ba thứ.

**Rule ID.** Mọi rule có một mã ổn định. Mã không đổi khi sửa câu chữ của rule.

Dạng: `<PHẠM VI>-<TÊN>`, viết hoa, nối bằng gạch ngang.

| Phạm vi | Khi nào dùng | Tiền tố ngôn ngữ | Ví dụ |
|---|---|---|---|
| `CORE` | rule cấu trúc trong `core.md`, không dính từ vựng của ngôn ngữ nào | không | `CORE-DASH`, `CORE-CADENCE`, `CORE-ARGUMENT-ARC` |
| mã ngôn ngữ | trúng một trong sáu danh sách từ vựng của pack | **có** | `VI-BANLIST`, `VI-MT-ARTIFACT`, `VI-SUPERLATIVE`, `VI-PUFFERY`, `VI-COMPARATIVE`, `VI-EVAL-CANDIDATE` |
| mã ngôn ngữ | model tự tìm được, ngoài danh sách của pack | **có** | `VI-PUFFERY-UNLISTED`, `VI-COMPARATIVE-UNLISTED`, `VI-SUPERLATIVE-UNLISTED` |
| mã ngôn ngữ | rule văn xuôi chỉ model áp được, `scan.mjs` không đếm | **có** | `VI-NOMINALIZATION`, `VI-ADDRESS-CONSISTENCY` |
| `EVID` | phán xử về quan hệ giữa claim và dữ kiện | **không** | `EVID-UNBACKED`, `EVID-PROVENANCE-UNKNOWN`, `EVID-SOURCE-UNKNOWN` |

Quy tắc quyết định tiền tố: **mã mang tiền tố ngôn ngữ khi và chỉ khi nó phát sinh từ từ vựng của một ngôn ngữ cụ thể.** Phán xử bằng chứng là suy luận trung tính ngôn ngữ, nên `EVID-*` không có tiền tố; finding đã mang sẵn trường `lang` nên tiền tố sẽ thừa.

`VI-PUFFERY-UNLISTED` **có** tiền tố dù do model tự tìm, vì nó khẳng định một điều về từ vựng tiếng Việt: cụm này đáng lẽ nên có trong `puffery` của pack `vi`. Nó chính là đầu vào để người bảo trì bổ sung danh sách.

Đây là hệ mã đã chốt, nên hạng mục "chốt hệ mã rule" ở mục 11 coi như xong.

**Đầu ra máy đọc được.** `antislop-check` là một SKILL.md, không phải chương trình, nên nó không có cờ dòng lệnh. Contract phải nói bằng ngôn ngữ của skill: khi yêu cầu có chứa từ `json`, skill in thêm một khối rào ```json sau bảng dành cho người đọc. Khối này là phần cuối cùng của phản hồi.

```json
{
  "tier": "R", "lang": "vi",
  "counted_source": "scan",
  "counted": { "dash": 3, "banlist": 7, "mt_artifacts": 2, "superlative": 1,
               "puffery": 2, "comparative": 1, "eval_candidate": 5, "same_shape_run": 4,
               "colon_outside_list": 9, "short_paragraph_ratio": [11, 14] },
  "findings_mechanical": [
    { "rule": "VI-EVAL-CANDIDATE", "span": [412, 431],
      "text": "cải thiện đáng kể", "lang": "vi", "block": 9 }
  ],
  "findings_judged": [
    { "rule": "EVID-UNBACKED", "span": [412, 431],
      "text": "cải thiện đáng kể", "lang": "vi", "block": 9,
      "verdict": "không chống lưng" }
  ],
  "judged": { "register_uniform": "cần sửa", "four_part_dna": "đạt" }
}
```

**`counted` phải đến từ scan.mjs, không phải từ model đếm nhẩm.**

Spec tuyên bố `counted` tái lập được. Điều đó chỉ đúng nếu skill thật sự chạy `scan.mjs` chứ không tự đếm. Model đếm nhẩm dash trong một tài liệu dài thì sai, và sai một cách im lặng.

Trường `counted_source` bắt buộc có trong schema, nhận đúng hai giá trị:

| Giá trị | Khi nào | Skill làm gì |
|---|---|---|
| `"scan"` | môi trường chạy được `node <plugin>/bin/scan.mjs` | chạy nó, chép nguyên `counted` vào JSON, không sửa một số nào |
| `"model"` | không chạy được, ví dụ harness không có Bash hoặc không có Node | tự đếm khi đọc, và **bảng cho người đọc phải ghi rõ số là ước lượng** |

Ưu tiên `"scan"` bất cứ khi nào chạy được. `"model"` là chế độ suy giảm, không phải lựa chọn ngang hàng.

Runner tầng 2 fail nếu `counted_source` khác `"scan"`, cùng nhóm với lỗi canary ở phần Runner: đó là lỗi môi trường, không phải lỗi nội dung rule, và kết quả fixture lúc đó không dùng được.

**Hai nhóm finding, không trộn.** Cùng lý do như `counted`: model được tự do thêm bớt mã rule thì tập rule không tất định và fixture flake.

| Trường | Nguồn | Model được sửa | Assert |
|---|---|---|---|
| `findings_mechanical` | chép nguyên từ `scan.mjs` | không, một mã cũng không | có |
| `findings_judged` | model tự sinh | có, đây là việc của nó | không |

`findings_mechanical` là kết quả từ vựng: trúng `banlist`, `mt_artifacts`, `superlative`, `puffery`, `comparative`, `evaluative`, đếm dash, chuỗi cùng khuôn. Model chép nguyên, không lọc, không thêm.

`findings_judged` là phán xử ngữ nghĩa: một ứng viên `eval_candidate` có thật sự thiếu chống lưng không, một `comparative` có nêu mốc không, `false-positives.md` có tha cái nào không. Đây là nơi model làm việc thật, và đúng vì thế mà không assert được.

Người đọc thấy hai nhóm hợp nhất trong bảng cho người; chỉ khối JSON mới tách.

**Ranh giới cái gì được assert.**

| Trường | Assert | Vì sao |
|---|---|---|
| `counted` | có, khớp chính xác | tất định, chép từ scan.mjs |
| `findings_mechanical` | có, deep-compare cả mảng | chép nguyên từ scan.mjs, nên phải giống hệt |
| tập `rule` trong `findings_judged` | có, theo quan hệ tập hợp | chỉ quan hệ tập hợp là ổn định |
| `span`, `text` trong `findings_judged` | không | model tự chọn phạm vi trích |
| `verdict` trong `findings_judged` | không | phán xử ngữ nghĩa, không tái lập |
| `judged` | không | ba nấc phán đoán, không tái lập |

Ghi chú: `span` và `text` **có** được assert bên trong `findings_mechanical`, vì ở đó chúng đến từ scan.mjs. Chỉ khi model tự sinh thì mới không assert.

Mỗi fixture khai kỳ vọng dạng hai tập hợp rule, cộng phần đếm:

```json
{
  "must_flag":     ["EVID-UNBACKED", "VI-PUFFERY-UNLISTED"],
  "must_not_flag": ["EVID-PROVENANCE-UNKNOWN"],
  "counted": { "dash": 0, "eval_candidate": 2 }
}
```

**`must_flag` và `must_not_flag` chỉ khai mã phán xử**, tức mã xuất hiện trong `findings_judged`. Không khai mã cơ học ở đây.

Lý do: phần cơ học đã được deep-compare với đầu ra `scan.mjs`, chặt hơn phép so tập hợp nhiều. Khai lại `VI-PUFFERY` trong `must_flag` vừa thừa vừa sai chỗ, vì runner tìm hai tập này trong `findings_judged` chứ không tìm trong `findings_mechanical`.

Khối `counted` trong fixture vẫn đối chiếu với `scan.mjs`, không đổi.

**Chỉ được assert phán xử hiển nhiên.** Đầu ra ngữ nghĩa không tất định, nên fixture phải chọn ca mà mọi người soát có năng lực đều kết luận giống nhau. Tiêu chí chọn:

| Nên đưa vào fixture | Không nên |
|---|---|
| "Đội ngũ tận tâm." đứng một mình, không có dữ kiện nào trong khối | ca mà dữ kiện có mặt nhưng quan hệ chứng minh yếu và tranh cãi được |
| "Tốt nhất thị trường." không nêu tập so sánh | so sánh có nêu mốc nhưng mốc mơ hồ một phần |
| văn bản không có puffery nào, dùng cho `must_not_flag` | ca ranh giới mà chính người viết fixture cũng lưỡng lự |

Nguyên tắc: nếu người viết fixture phải suy nghĩ quá vài giây để quyết định kỳ vọng, ca đó không thuộc về fixture. Nó thuộc về `examples/` như tài liệu minh hoạ.

Fixture nào flake quá một lần thì gỡ khỏi bộ, không siết prompt để ép nó xanh. Siết prompt cho vừa một fixture ranh giới là tối ưu sai mục tiêu.

Fixture đặt tên `<tên>.md` và `<tên>.expect.json`, cùng quy ước với fixture cơ học. Dùng JSON vì `tests/fixtures.mjs` cũng không được phụ thuộc parser YAML, cùng lý do như khối pack ở mục 6.2.

**Ai tạo ra con số quyết định ai được assert.** Khối `counted` trong fixture được đối chiếu với đầu ra của `scan.mjs`, không phải với đầu ra của model. Runner tự chạy `scan.mjs` trên fixture để lấy nó.

Lý do: `counted` do model tự đếm thì không tất định. Model có thể đếm sót một dash, hoặc gộp hai cụm ban list thành một. Assert vào đó thì test flake, và tệ hơn là nó không thực sự kiểm `scan.mjs` chút nào.

Bốn phép kiểm của runner tầng 2. Runner tự chạy `bin/scan.mjs` trên fixture trước, rồi đối chiếu:

| Kiểm | Đối tượng | Cách |
|---|---|---|
| schema | khối JSON của model | parse được, đủ sáu khoá `tier`, `lang`, `counted_source`, `counted`, `findings_mechanical`, `findings_judged`; `counted_source` phải là `"scan"` |
| `counted` | model vs `scan.mjs` | khớp chính xác từng khoá |
| `findings_mechanical` | model vs `scan.mjs` | **deep-compare toàn mảng** |
| tập rule trong `findings_judged` | model vs fixture | `must_flag` có mặt, `must_not_flag` vắng mặt |

**Deep-compare nghĩa là so cả mảng, không so tập mã.** Contract nói model chép nguyên `findings_mechanical`, nên phép kiểm phải đủ chặt để bắt mọi cách chép sai: cùng số phần tử, cùng thứ tự, và mỗi phần tử khớp cả `rule`, `span`, `text`, `lang`, `block`, `block_has_data`.

So tập mã thì quá lỏng. Model bỏ một trong ba lần xuất hiện của cùng một rule, hoặc sửa `span`, hoặc cắt ngắn `text`, đều lọt qua. Mà đó chính là những cách chép sai dễ xảy ra nhất.

Phép so tập hợp chỉ dùng cho `findings_judged`, nơi đầu ra vốn không tất định và chỉ có quan hệ tập hợp là kiểm được. Mã ngoài hai danh sách không xét, vì thêm rule mới không nên làm đỏ fixture cũ.

Khi `counted_source` là `"scan"`, hai con số phải trùng khít, vì cả hai đến từ cùng một lần chạy `scan.mjs`. Lệch nhau nghĩa là skill đã sửa số sau khi chép, và đó là test fail chứ không phải cảnh báo.

`must_not_flag` là phần quan trọng hơn trong hai tập. Nó kiểm `false-positives.md` có làm việc không, và đó là thứ dễ hỏng nhất khi thêm rule mới.

**Runner.** `tests/fixtures.mjs` gọi agent ở chế độ headless, bắt stdout, lấy khối ```json cuối cùng, rồi chạy ba phép kiểm ở bảng trên. Hai backend, chọn bằng biến môi trường `ANTISLOP_RUNNER`:

```
claude   ->  claude -p "<prompt fixture>"
codex    ->  codex exec "<prompt fixture>"
```

Prompt fixture có dạng cố định: gọi `antislop-check`, kèm nội dung fixture, kèm từ `json`.

**Cài plugin trước khi chạy.** Một checkout mới không tự có skill trong registry của backend, nên agent sẽ chạy mà không bao giờ nạp `antislop-check`. Lúc đó test hoặc xanh nhầm, hoặc đỏ vì lý do sai. Runner phải làm ba bước theo thứ tự:

1. **Cài** repo đang checkout vào registry cục bộ của backend, dùng cơ chế local marketplace của chính backend đó.
2. **Dò canary.** Chạy một prompt tối thiểu và kiểm skill đã nạp thật chưa, ví dụ yêu cầu in dòng khai báo tier. Không thấy dòng đó thì **dừng toàn bộ và báo lỗi môi trường**, không chạy fixture nào. Kết quả fixture khi skill chưa nạp là vô nghĩa và nguy hiểm hơn là không có kết quả.
3. **Gỡ** sau khi chạy xong, kể cả khi có test fail, để lần chạy sau bắt đầu từ trạng thái sạch.

Lệnh chính xác cho từng backend chưa chốt. Nó vào danh sách phải kiểm chứng ở mục 11, cùng nhóm với câu hỏi đường dẫn `references/`. Không đoán lệnh ở đây, vì đoán sai thì CI đỏ vì lý do không liên quan tới nội dung rule.

Nếu khối JSON không xuất hiện hoặc không parse được, test tính là fail chứ không bỏ qua. Đó chính là tín hiệu contract đầu ra của skill bị trôi.

Tầng này chạy tay hoặc chạy định kỳ, **không đưa vào CI chặn merge**, vì nó gọi model, tốn thời gian và tốn tiền. CI chặn merge chỉ có tầng 1 và tầng 3.

Tầng 3, repo tự soi mình. CI chạy `bin/scan.mjs` lên `README.md` và mọi file trong `examples/`. Một repo chống slop mà README đầy em dash thì mất uy tín ngay dòng đầu, nên để CI chặn.

`scan` bắt buộc có `tier` và `lang`, mà README không tự khai hai thứ đó. Nên repo giữ một manifest `tests/scan-manifest.json`:

```json
[
  { "file": "README.md",              "tier": "P", "lang": "en" },
  { "file": "README.vi.md",           "tier": "P", "lang": "vi" },
  { "file": "examples/report-vi.md",  "tier": "R", "lang": "vi" },
  { "file": "examples/caption-en.md", "tier": "C", "lang": "en" }
]
```

CI duyệt manifest và chạy từng dòng. Thêm file vào `examples/` mà quên thêm dòng manifest thì CI báo lỗi thiếu, không im lặng bỏ qua. Đó là cách duy nhất để tầng 3 không mục dần khi repo lớn lên.

README chọn tier P vì nó là tài liệu giới thiệu và thuyết phục, gần proposal hơn báo cáo. Ví dụ trong `examples/` thì mỗi file khai đúng tier mà nó minh hoạ.

Không kiểm tự động được: câu hỏi "đoạn này đọc có ra người không". Chỗ đó cần người đọc. Kế hoạch là ba tầng trên tự động từ v1, chất lượng thật đánh giá qua hai đến ba tuần dùng vào việc thật.

## 10. Phạm vi phát hành

### v1

Claude Code và Codex. Hai nền tảng này dùng chung layout `skills/<name>/SKILL.md`, nên không phát sinh nhân bản rule và không cần script build.

Nội dung: hai skill, `core.md`, `languages.json`, `vi.md`, `en.md`, `evidence.md`, `false-positives.md`, examples, tests, `CONTRIBUTING.md` kèm template language pack, `NOTICE`, `LICENSE`, README song ngữ.

Kèm theo: hệ mã rule ổn định (mục 9), contract đầu ra JSON của `antislop-check` cùng runner `tests/fixtures.mjs` (mục 9), và cơ chế nhãn dữ kiện thiếu `[cần ...]` (mục 4.1).

Cả `vi` và `en` phát hành ở nhãn soát rồi. Xem mục 6.4.

Cột "ngưỡng" trong bảng mục 7.1 có ba loại giá trị: một con số là ngưỡng cứng; "theo tier" nghĩa là lấy từ bảng bốn danh sách ở mục 6.2 theo tier đang xét; "tham chiếu" và "xem PHÁN ĐOÁN" nghĩa là chỉ hiển thị, không kết luận cơ học.

### v1.1

Cursor và Antigravity. Hai nền tảng này không đọc `skills/`; chúng cần một file phẳng chứa toàn bộ rule inline, là `.cursor/rules/*.mdc` và `GEMINI.md`. Đó là chỗ phát sinh nhân bản, nên cần `scripts/build.mjs` sinh từ nguồn và CI kiểm bằng cách build lại rồi so `git diff`.

Hoãn sang v1.1 vì hai tuần đầu rule còn sửa liên tục, và không nên nhân một bộ rule ra bốn nền tảng khi chưa biết nó có đúng không.

### v1.2 trở đi

Language pack mới. `th.md` là ứng viên gần nhất, và bạn có sẵn người bản xứ để soát.

## 11. Việc phải làm

### Chặn v1

1. Kiểm chứng đường dẫn tương đối từ SKILL.md tới `references/` **và tới `bin/scan.mjs`** ở cả hai harness, chạy từ một CWD nằm ngoài repo. Cùng một câu hỏi, giải một lần. Kết quả quyết định bố cục thư mục (mục 2) và quyết định `counted_source` có bao giờ đạt `"scan"` không (mục 9). Làm trước khi viết nội dung rule.
2. ~~Chốt hệ mã rule~~ **xong**, hệ mã chốt ở mục 9, phần Rule ID.
3. Chốt lệnh cài plugin cục bộ ở chế độ headless cho cả `claude` và `codex`, cùng cách gỡ. Cần trước khi viết `tests/fixtures.mjs`. Xem mục 9, phần Runner.

Không còn hạng mục nào ở nhóm không chặn.
