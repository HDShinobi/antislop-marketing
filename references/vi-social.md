# Quy tắc biên tập Social Content tiếng Việt (Profile: social)

Tài liệu này hướng dẫn cách viết và biên tập bài đăng mạng xã hội (Facebook, LinkedIn, Threads, TikTok Caption, Instagram) bằng tiếng Việt.

Khi tài liệu thuộc profile `social`, áp dụng các quy tắc dưới đây song song với `vi.md` và `vi-editorial.md`.

---

## 1. Bản chất của Social Content

Người dùng lướt mạng xã hội trên di động với tốc độ cực nhanh. Một bài viết social thành công phải giữ chân người đọc ngay trong 3 giây đầu tiên và ngắt nhịp phù hợp với màn hình điện thoại.

| Yếu tố | Văn xuôi thông thường | Social Content (Facebook / Threads / LinkedIn) |
|---|---|---|
| **Dòng đầu (Hook)** | Dạo đầu, giới thiệu bối cảnh | **Hook 3 giây**: Đánh vào nỗi đau, câu hỏi ngược hoặc con số bất ngờ |
| **Định dạng** | Đoạn văn dài 5-7 câu | Đoạn ngắn 1-3 câu, ngắt dòng thoáng, skimmable |
| **Giọng văn** | Trang trọng, khách quan | Thân mật, có khẩu ngữ (`thì, mà, đấy, nhé, nha`) (Level 3 Colloquial) |
| **Icon / Emoji** | Hạn chế | Dùng vừa đủ làm mốc thị giác, không spam bừa bãi |

---

## 2. Quy tắc Hook 3 giây (Kích thích tò mò / Nỗi đau)

Dòng mở đầu (1-2 câu đầu) phải khiến người đọc dừng ngón tay lướt (thumb-stopping).

```text
MƠ HỒ / AI SLOP                     HOOK SOCIAL SẮC BÉN
Như các bạn đã biết, việc sử        Có tới 70% gia đình mua máy lọc nước về nhưng...
dụng nước sạch đóng vai trò         quên thay lõi đúng hạn.
rất quan trọng trong cuộc sống.

Bài viết này sẽ giúp bạn hiểu       Chi 15 triệu mua máy lọc nước, vì sao nước
rõ hơn về cấu tạo máy lọc.          vẫn có mùi lạ?
```

### Mã lỗi `VI-SOCIAL-WEAK-HOOK`
Báo khi bài đăng social mở đầu bằng các câu dạo đầu công thức AI (*"Trong bài viết hôm nay..."*, *"Như chúng ta đã biết..."*, *"Chào các bạn..."*) thay vì đi thẳng vào tình huống/nỗi đau/câu hỏi tò mò.

---

## 3. Văn phong Hội thoại & Nhịp ngắt dòng (Skimmable Format)

- **Ngắt dòng thoáng**: Tối đa 2-3 câu mỗi đoạn nhỏ.
- **Tiểu từ đời thường**: Sử dụng các từ đệm tự nhiên (*thì, mà, đấy, nhé, nha, luôn, thực ra là...*).
- **Tránh xa icon spam**: Dùng tối đa 3-5 icon phù hợp trong toàn bài. Không dùng emoji ở đầu mọi dòng bullet.

```text
CỨNG NHẮC / AI SLOP:
Sản phẩm D66 sở hữu công nghệ hiện đại. Đội ngũ chúng tôi tận tâm phục vụ khách hàng.
Quý khách có thể liên hệ với chúng tôi để biết thêm chi tiết.

TỰ NHIÊN / SOCIAL CHUẨN:
Máy D66 đợt này bên mình về thêm bản màu trắng ngọc trai, nhìn ngoài đời ưng mắt hơn trên ảnh nhiều.
Bác nào đang dùng dòng D66 mà tới mốc thay lõi thì nhắn bên mình check mốc free nhé!
```

### Mã lỗi `VI-SOCIAL-STIFF-TONE`
Báo khi bài đăng social dùng giọng văn quá hành chính, thiếu tiểu từ đệm tự nhiên, hoặc xưng hô không phù hợp với môi trường mạng xã hội.

---

## 4. Call-to-Action (CTA) Tự nhiên & Cụ thể

Thay vì CTA AI chung chung (*"Hãy comment bên dưới để biết thêm chi tiết"*), hãy dùng CTA ngắn gọn, cụ thể và tự nhiên.

```text
CTA AI SLOP                         CTA SOCIAL CHUẨN
Hãy comment bên dưới để được        Nhắn cho bên mình để nhận mã giảm 20% đợt này nhé.
tư vấn chi tiết nhất.

Hy vọng bài viết mang lại thông     Link xem chi tiết khung ưu đãi mình để ngay
tin hữu ích cho bạn.                comment đầu tiên nha!
```

---

## 5. Danh mục mã kiểm tra Social (`VI-SOCIAL-*`)

Khi kiểm tra profile `social`, đưa các phát hiện vào `findings_judged`:

- `VI-SOCIAL-WEAK-HOOK`: Dòng mở đầu bài social nhạt nhẽo, dạo đầu công thức AI.
- `VI-SOCIAL-STIFF-TONE`: Văn phong bài social cứng nhắc, thiếu tiểu từ đệm tự nhiên.
- `VI-SOCIAL-OVERUSED-ICONS`: Sử dụng emoji quá đà làm nhiễu mắt người đọc.
- `VI-REFERENT-CLARITY`: Dùng đại từ mơ hồ (`nó`, `cái này`) thay cho tên sản phẩm/dịch vụ cụ thể.
