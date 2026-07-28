# Quy tắc biên tập SEO, GEO & AEO tiếng Việt (Profile: seo_geo)

Tài liệu này hướng dẫn cách viết và biên tập bài viết chuẩn SEO (Search Engine Optimization), GEO (Generative Engine Optimization: tối ưu cho ChatGPT/Perplexity/Gemini trích dẫn) và AEO (Answer Engine Optimization: tối ưu cho Featured Snippets / Google AI Overviews) bằng tiếng Việt.

Khi tài liệu thuộc profile `seo_geo`, áp dụng các quy tắc dưới đây song song với `vi.md` và `vi-editorial.md`.

---

## 1. Bản chất của GEO (Generative Engine Optimization) & AEO

Các công cụ AI Search (Google AI Overviews, Perplexity, ChatGPT Search) trích dẫn nguồn dựa trên khả năng **phân tích & trích xuất câu trả lời (Extraction)**. Bài viết chuẩn GEO/AEO phải được cấu trúc sao cho máy dễ dàng trích xuất thông tin chính xác.

---

## 2. Quy tắc Direct Answer (Trả lời trực tiếp 1-3 câu)

Ngay bên dưới các thẻ H2/H3 dạng câu hỏi tìm kiếm (ví dụ: `### Máy lọc nước RO gia đình loại nào tốt?`), **bắt buộc** có 1 đoạn 1-3 câu trả lời thẳng vào câu hỏi trước khi đi vào giải thích chi tiết.

```text
THIẾU DIRECT ANSWER / AI SLOP:
### Máy lọc nước RO loại nào phù hợp cho gia đình 4 người?

Trong thời đại công nghệ ngày nay, việc lựa chọn máy lọc nước đóng vai trò quan trọng.
Có rất nhiều yếu tố ảnh hưởng đến quyết định của bạn...

CHUẨN GEO / AEO DIRECT ANSWER:
### Máy lọc nước RO loại nào phù hợp cho gia đình 4 người?

Đối với gia đình 4 người, loại máy lọc nước RO phù hợp nhất là dòng máy có công suất lọc từ **15–20 lít/giờ**, trang bị **8–10 lõi lọc** (bao gồm lõi khoáng đá/ORP Alkaline) và dung tích bình áp từ **6–8 lít** để đảm bảo nguồn nước uống trực tiếp liên tục.

*(Sau đó mới phân tích chi tiết từng SKU...)*
```

### Mã lỗi `VI-GEO-MISSING-DIRECT-ANSWER`
Báo khi tiêu đề H2/H3 là câu hỏi hoặc chủ đề tìm kiếm cụ thể nhưng phần nội dung bên dưới lại dạo đầu dông dài, thiếu đoạn trả lời trực tiếp trong 1-3 câu đầu tiên.

---

## 3. Cấu trúc dữ liệu dễ trích xuất (Tables & Bullet Lists)

AI Search cực kỳ ưu tiên trích xuất thông tin từ **Bảng (`Tables`)** và **Danh sách có số liệu (`Lists`)**.

- **Dùng Bảng**: Khi so sánh thông số, giá cả, tiêu chí giữa 2 hoặc nhiều sản phẩm.
- **Dùng Bullet Lists**: Cho các bước quy trình, tiêu chí chọn mua hoặc lưu ý sử dụng.

### Mã lỗi `VI-GEO-POOR-EXTRACTABILITY`
Báo khi thông tin so sánh thông số/giá cả bị viết thành các đoạn văn xuôi chật chội thay vì trình bày dạng Bảng hoặc Danh sách có định dạng rõ ràng.

---

## 4. Tiêu chuẩn E-E-A-T & Brand Entity

- **Experience & Expertise**: Trích dẫn thông số kỹ thuật thực tế, kết quả kiểm định phòng lab hoặc trải nghiệm người dùng thật.
- **Brand Entity (Thực thể thương hiệu)**: Gắn liền tên thương hiệu/sản phẩm với giải pháp chuyên môn một cách tự nhiên.
- **Tránh nhồi nhét từ khóa (Keyword Stuffing)**: Từ khóa tìm kiếm phải nằm tự nhiên trong thẻ H2/H3 và đoạn văn, không lặp lại cưỡng ép.

---

## 5. Danh mục mã kiểm tra GEO/SEO (`VI-GEO-*`, `VI-SEO-*`)

Khi kiểm tra profile `seo_geo`, đưa các phát hiện vào `findings_judged`:

- `VI-GEO-MISSING-DIRECT-ANSWER`: Thiếu đoạn trả lời trực tiếp 1-3 câu bên dưới tiêu đề H2/H3.
- `VI-GEO-POOR-EXTRACTABILITY`: So sánh thông số/dữ liệu bằng văn xuôi dài dòng thay vì dùng Bảng hoặc Bullet list.
- `VI-SEO-KEYWORD-STUFFING`: Nhồi nhét từ khóa gượng gạo làm vỡ nhịp đọc.
- `VI-HEADING-CLARITY`: Tiêu đề H2/H3 mơ hồ không phản ánh Intent tìm kiếm của người dùng.
