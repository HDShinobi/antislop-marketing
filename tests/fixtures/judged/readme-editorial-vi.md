# antislop-demo

Hai skill cho Claude và Codex. Tiếng Việt và tiếng Anh.

## Ma trận CI và cách chạy fixture tầng 2

CI chạy Node 20 và 22. Chạy tay thì gọi `npm test`, rồi `npm run validate-packs`,
rồi đặt biến môi trường cho runner tầng 2. Fixture tầng 2 cài plugin thật nên
phải đọc registry trước khi ghi vào đó.

## Giải quyết vấn đề gì

Bạn dùng AI để viết content. Output đọc ra là AI viết, và cái đó làm khách
hàng mất niềm tin.

## Ba tier tài liệu

Plugin được build dựa trên ba loại tier cho các loại tài liệu.

## Chính sách nền tảng mỏng hơn, và nên nói cho đúng

Ở đây rule là rule cứng. Phạm vi kiểm được ép chứ không phải nói suông.
