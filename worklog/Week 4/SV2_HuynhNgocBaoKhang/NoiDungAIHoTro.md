<a id="top"></a>

# KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 4)

**Sinh viên 2:** Huỳnh Ngọc Bảo Khang  
**MSSV:** 24110241  
**Vai trò:** SV2 – Thử nghiệm trên Postman, Phát triển Module Calendar Dùng Chung, Backend Serverless & Đánh giá Chi phí Đám mây  
**Công cụ AI sử dụng:** Gemini  
**Model:** Gemini 3.8 Flash  

---

## Mục lục

- [1. Khai báo công cụ AI](#1-khai-bao-cong-cu-ai)
- [2. Hỗ trợ kỹ thuật & Phân tích tối ưu hóa](#2-ho-tro-ky-thuat--phan-tich-toi-uu-hoa)
  - [2.1. Yêu cầu (Prompt)](#21-yeu-cau-prompt)
  - [2.2. Nội dung AI tư vấn & Đề xuất giải pháp](#22-noi-dung-ai-tu-van--de-xuat-giai-phap)
  - [2.3. Sinh viên trực tiếp đánh giá, hiện thực và hoàn thiện](#23-sinh-vien-truc-tiep-danh-gia-hien-thuc-va-hoan-thien)

---

<a id="1-khai-bao-cong-cu-ai"></a>

## 1. Khai báo công cụ AI

- **Công cụ AI sử dụng:** Gemini
- **Model:** Gemini 3.8 Flash
- **Mục đích:** Tham vấn kỹ thuật về phương pháp tính toán chi phí vận hành trên AWS theo biểu giá Free Tier & Pay-as-you-go, lập thứ tự phụ thuộc (Dependency Order) để dọn dẹp tài nguyên Serverless an toàn trên AWS Academy, cũng như tư vấn cấu trúc thiết kế module Calendar JavaScript thuần tái sử dụng cho cả Bệnh nhân và Bác sĩ.
- **Vai trò chủ đạo của sinh viên:** Sinh viên trực tiếp cấu hình tài khoản AWS, tự tay lập trình module `calendar.js` (740 dòng) và `lookup.css` (578 dòng), cấu hình Postman và thực hiện kiểm thử thực tế trên API Gateway thật, ghi nhận toàn bộ kết quả và hình ảnh minh chứng.

---

<a id="2-ho-tro-ky-thuat--phan-tich-toi-uu-hoa"></a>

## 2. Hỗ trợ kỹ thuật & Phân tích tối ưu hóa

<a id="21-yeu-cau-prompt"></a>

### 2.1. Yêu cầu (Prompt)

> Hãy đóng vai trò Cloud Architect & Frontend Advisor, tư vấn cho tôi:
> 1. Phương pháp phân tích chi phí vận hành chi tiết cho hệ thống Serverless CareSync (gồm AWS Lambda, DynamoDB, API Gateway, S3, SNS, EventBridge, KMS) theo hạn mức AWS Free Tier và tài khoản AWS Academy Learner Lab ($100 budget).
> 2. Quy trình lập checklist dọn dẹp tài nguyên đám mây theo thứ tự an toàn tránh lỗi phụ thuộc (Dependency Order) sau khi kết thúc môn học.
> 3. Hướng dẫn cấu trúc thiết kế một module Calendar dùng chung (Vanilla JS) có thể hiển thị dữ liệu lịch khám từ DynamoDB cho cả trang tra cứu của người bệnh và trang bảng điều khiển của bác sĩ.

---

<a id="22-noi-dung-ai-tu-van--de-xuat-giai-phap"></a>

### 2.2. Nội dung AI tư vấn & Đề xuất giải pháp

Sau khi tiếp nhận yêu cầu, công cụ AI đã phản hồi các phân tích kỹ thuật:

#### 1. Đề xuất phân tích chi phí Serverless:
- Đối với **AWS Lambda**: Do kích thước payload nhỏ và thời gian thực thi trung bình ~120ms, cấu hình 128MB RAM sẽ nằm trọn vẹn trong hạn mức 1 triệu requests và 3.2 triệu giây compute miễn phí mỗi tháng.
- Đối với **Amazon DynamoDB**: Khuyến nghị dùng chế độ On-Demand cho môi trường học tập hoặc tận dụng 25 RCU/WCU miễn phí của Free Tier, tối ưu khóa Partition Key và Sort Key để không quét toàn bảng (Scan).
- Đối với **AWS KMS**: Giải thích rõ chi phí $1.00/tháng cho 1 Customer Managed Key (`alias/caresync-patient-key`) và khuyến cáo sinh viên lên lịch hủy khóa (`ScheduleKeyDeletion`) sau khi kết thúc học phần để tránh tiếp tục trừ tiền tín dụng.

#### 2. Đề xuất quy trình dọn dẹp tài nguyên (Teardown Checklist):
- Nhấn mạnh quy trình hủy tài nguyên cần tuân thủ thứ tự từ ngoài vào trong:
  1. Hủy EventBridge Scheduler (tránh trường hợp lịch kích hoạt bắn vào SNS Topic đã xóa).
  2. Hủy SNS Topic & Subscription.
  3. Xóa API Gateway HTTP API.
  4. Xóa hàm AWS Lambda.
  5. Dọn sạch đối tượng (Empty Bucket) rồi mới xóa S3 Bucket.
  6. Xóa các bảng DynamoDB (`Appointments`, `Doctors`, `Patients`).
  7. Lên lịch xóa KMS CMK (chờ 7 ngày).

#### 3. Tư vấn cấu trúc Calendar Module:
- Gợi ý phân tách các hàm tiện ích xử lý thời gian (`parseApptDate`, `formatDateKey`), sử dụng mô hình Hash Map theo ngày `$O(N)$` để nhóm các ca khám trước khi render vào từng ô ngày của lịch tháng.
- Khuyên dùng cờ tham số `mode` (`'patient'` vs `'doctor'`) để tái sử dụng cùng một bộ khung HTML/CSS thay vì viết 2 màn hình riêng biệt.

---

<a id="23-sinh-vien-truc-tiep-danh-gia-hien-thuc-va-hoan-thien"></a>

### 2.3. Sinh viên trực tiếp đánh giá, hiện thực và hoàn thiện

Dựa trên các tư vấn kiến trúc của AI, sinh viên đã:
1. **Trực tiếp viết mã nguồn:** Tự tay triển khai toàn bộ mã nguồn [`client/js/calendar.js`](../../client/js/calendar.js) với 742 dòng JavaScript và [`client/css/lookup.css`](../../client/css/lookup.css) với 578 dòng CSS; xử lý mượt mà chuyển tháng, highlight ngày hiện tại, gắn thẻ ca khám và hiển thị modal chi tiết.
2. **Loại bỏ LocalStorage:** Triệt tiêu hoàn toàn mã lưu tạm trình duyệt cũ, kết nối module Calendar với dữ liệu thực tế từ AWS DynamoDB.
3. **Thực thi kiểm thử Postman:** Thiết lập bộ sưu tập Postman với 5 API chính (`/auth/doctor/send-otp`, `/auth/doctor/verify-otp`, `/doctors/{id}/appointments`, `/appointments/request-cancel`, `/appointments/confirm-cancel`), gửi request thực tế lên máy chủ AWS và chụp 5 ảnh minh chứng kết quả HTTP 200 OK.
4. **Kiểm soát chi phí:** Theo dõi bảng thanh toán AWS Billing Console, kiểm tra số dư Learner Lab và lập kế hoạch dọn dẹp tài nguyên hoàn chỉnh cho nhóm.

---

_Khai báo hoàn thành ngày 31 tháng 10 năm 2026._  
**Sinh viên khai báo:** Huỳnh Ngọc Bảo Khang (MSSV: 24110241)
