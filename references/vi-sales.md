# Quy tắc biên tập Sales Copy & Landing Page tiếng Việt (Profile: sales)

Tài liệu này hướng dẫn cách viết và biên tập nội dung bán hàng (Sales Copy, Landing Page, Performance Ads, Sales Brief) bằng tiếng Việt.

Khi tài liệu thuộc profile `sales`, áp dụng các quy tắc dưới đây song song với `vi.md` và `vi-editorial.md`.

---

## 1. Bản chất của Sales Copywriting

Nội dung bán hàng không phải để kể lan man hay liệt kê tính năng kỹ thuật. Mục tiêu `duy nhất` của Sales Copy là **chuyển đổi (Conversion)** bằng cách chạm đúng nhu cầu/nỗi đau của khách hàng và đưa ra đề xuất giá trị (Value Proposition) thuyết phục.

---

## 2. Công thức thuyết phục (PAS / AIDA / BAB)

Nội dung bán hàng phải đi theo một khung lập luận bán hàng rõ ràng:

1. **PAS (Problem - Agitate - Solution)**: Nêu vấn đề -> Xoáy sâu nỗi đau -> Đưa ra giải pháp sản phẩm.
2. **BAB (Before - After - Bridge)**: Thực trạng bất tiện hiện tại -> Cuộc sống tiện nghi sau khi dùng -> Cầu nối sản phẩm.

---

## 3. Chuyển đổi Tính năng (Feature) sang Lợi ích (Benefit)

Khách hàng mua **kết quả & cảm giác** sau khi sử dụng, không mua thông số kỹ thuật thuần túy.

```text
CHỈ LIỆT KÊ TÍNH NĂNG (FEATURE)     TẬP TRUNG LỢI ÍCH (BENEFIT)
Trang bị màng lọc RO Purifim sản    Loại bỏ 99.99% vi khuẩn và kim loại nặng,
xuất tại Mỹ công suất 20L/h.        cho nước uống trực tiếp tại vòi không cần đun sôi.

Thiết kế 2 vòi nóng lạnh riêng.     Nước nóng 95°C pha trà/mỳ ăn liền tức thì,
                                    nước lạnh 10°C đập tan cơn khát mùa hè.
```

### Mã lỗi `VI-SALES-FEATURE-ONLY`
Báo khi bài bán hàng chỉ liệt kê danh sách thông số kỹ thuật khô khan mà không diễn giải lợi ích thực tế cho người dùng.

---

## 4. Cấu trúc Bằng chứng (Proof) & Tuân thủ Pháp lý

- Mọi lời khẳng định về chất lượng phải đi kèm bằng chứng (Chứng nhận QCVN 6-1:2010/BYT, chính sách bảo hành 36 tháng, thử nghiệm độc lập).
- **Tuyệt đối tuân thủ Luật Quảng cáo Việt Nam**: Cấm dùng từ cực cấp (`tốt nhất`, `số một`, `hàng đầu`, `duy nhất`) nếu không có chứng nhận/văn bản khảo sát hợp pháp đi kèm (Xem `vi.md` section 2).

### Mã lỗi `VI-SALES-UNBACKED-CLAIM`
Báo khi bài bán hàng đưa ra các lời hứa hẹn/khẳng định hoa mỹ (*"cam kết chất lượng `vượt trội`"*, *" `đáp ứng mọi nhu cầu` "*) mà không có dữ kiện hoặc chính sách cụ thể hỗ trợ.

---

## 5. Ưu đãi (Offer) & Lý do Mua ngay (Urgency)

Phần kết của Sales Copy phải nêu rõ:
- **Giá niêm yết vs Giá ưu đãi + Quà tặng (Gift-with-purchase)**.
- Lý do thúc đẩy hành động ngay: Giới hạn thời gian (Campaign kết thúc 31/08) hoặc giới hạn số lượng (50 suất đầu tiên).

---

## 6. Danh mục mã kiểm tra Sales (`VI-SALES-*`)

Khi kiểm tra profile `sales`, đưa các phát hiện vào `findings_judged`:

- `VI-SALES-FEATURE-ONLY`: Chỉ liệt kê thông số kỹ thuật, thiếu diễn giải lợi ích cho người mua.
- `VI-SALES-UNBACKED-CLAIM`: Đưa ra lời hứa chất lượng chung chung mà không có số liệu/bằng chứng hỗ trợ.
- `VI-SALES-VAGUE-OFFER`: Giá cả, ưu đãi hoặc quà tặng mơ hồ không rõ ràng.
- `VI-SUPERLATIVE`: Dùng từ cực cấp trái Luật Quảng cáo Việt Nam.
