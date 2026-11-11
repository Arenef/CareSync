# BÁO CÁO TỔNG HỢP SỬ DỤNG CÔNG CỤ AI – TUẦN 4 & TỔNG KẾT ĐỒ ÁN

**Dự án:** Hệ thống đặt lịch khám bệnh trực tuyến cho phòng khám (CareSync)  
**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Nhóm sinh viên thực hiện:** Domain Apps  
- **Sinh viên 1 (SV1):** Bùi Anh Khôi – MSSV: 24110258  
- **Sinh viên 2 (SV2):** Huỳnh Ngọc Bảo Khang – MSSV: 24110241  

---

## 1. Sinh viên 1: Bùi Anh Khôi (MSSV: 24110258)

- **AI:** Gemini
- **Model:** Gemini 3.8 Flash
- **Prompt:**
  > Hãy đóng vai trò Code Reviewer, hỗ trợ tôi quét nhanh toàn bộ source code của project CareSync (cả Client frontend lẫn Server AWS Lambda) để chỉ ra các đoạn mã có dấu hiệu trùng lặp (duplicate), dư thừa logic hoặc xung đột DOM. Đưa ra các gợi ý định hướng để tôi tham khảo và tự tay tối ưu lại codebase cho gọn gàng, sạch sẽ, chuẩn chỉ.

- **Nội dung AI sinh ra (Tóm tắt):**
  - **Trùng lặp module ca khám:** Phát hiện ở cuối tệp `client/js/booking.js` còn sót lại cụm hàm render lịch cũ từ phiên bản trước (`initMyAppointments`, `renderMyAppointments`, `renderAppointmentCard`, `openTicketModal`, `cancelAppointment`), gây nguy cơ ghi đè DOM container `#myAppointmentsList` vốn đã được bàn giao cho `client/js/lookup.js` phụ trách.
  - **Xử lý ẩn/hiện Section thủ công:** Trong `client/js/doctor-auth.js`, các thao tác gán `style.display = 'none'` và `style.display = ''` bị lặp lại thủ công cho nhiều phần tử DOM; gợi ý gom các ID vào mảng và viết hàm helper `togglePatientSections(show)` nhận tham số boolean để tái sử dụng khi bác sĩ đăng nhập/đăng xuất.
  - **Phân mảnh hàm Toast Notification:** Các module dùng các hàm thông báo khác nhau (`showToast`, `safeShowToast`, `showToastNotification` tự tạo DOM bằng JS); khuyến nghị chuẩn hóa thành một hàm dùng chung duy nhất `window.showToast(title, message, type)`.
  - **Tệp tin rác backend:** Phát hiện tệp rỗng `server/lambda/index.mjs` (21 bytes) không dùng đến trong kiến trúc CommonJS hiện tại, khuyên nên xóa bỏ để tránh nhầm entrypoint khi nén zip triển khai lên AWS Lambda.
  - *Tổng kết tiềm năng:* Dự án có thể cắt giảm 350 - 400 dòng code dư thừa và phòng ngừa xung đột thao tác DOM.

- **Nội dung sinh viên hoàn thiện:**
  - **Tái cấu trúc `client/js/booking.js`:** Cắt bỏ hơn 200 dòng mã render ca khám cũ dư thừa, giữ lại logic đặt khám, xuất hàm chuẩn `window.showToast`, bàn giao trọn vẹn trách nhiệm quản lý container `#myAppointmentsList` cho module `lookup.js`.
  - **Tối ưu Section ẩn/hiện cổng Bác sĩ:** Tự viết hàm `togglePatientSections(show)` kết hợp mảng cấu hình `PATIENT_SECTION_IDS`, thay thế toàn bộ các dòng code gán `style.display` rải rác trước đây.
  - **Đồng bộ Toast toàn hệ thống:** Xóa đoạn mã tự sinh DOM toast dài 25 dòng trong `doctor-auth.js`, chuyển toàn bộ thông báo về chuẩn `window.showToast`.
  - **Dọn dẹp cây thư mục backend:** Trực tiếp kiểm tra và xóa bỏ tệp rác `server/lambda/index.mjs`.
  - **Kiểm định độc lập:** Chạy kiểm tra cú pháp bằng `node -c` toàn dự án (đạt Exit Code 0) và trực tiếp thực hiện 4 kịch bản kiểm thử E2E trên hệ thống web thật.

---

## 2. Sinh viên 2: Huỳnh Ngọc Bảo Khang (MSSV: 24110241)

- **AI:** Gemini
- **Model:** Gemini 3.8 Flash
- **Prompt:**
  > Hãy đóng vai trò Cloud Architect & Frontend Advisor, tư vấn cho tôi:
  > 1. Phương pháp phân tích chi phí vận hành chi tiết cho hệ thống Serverless CareSync (gồm AWS Lambda, DynamoDB, API Gateway, S3, SNS, EventBridge, KMS) theo hạn mức AWS Free Tier và tài khoản AWS Academy Learner Lab ($100 budget).
  > 2. Quy trình lập checklist dọn dẹp tài nguyên đám mây theo thứ tự an toàn tránh lỗi phụ thuộc (Dependency Order) sau khi kết thúc môn học.
  > 3. Hướng dẫn cấu trúc thiết kế một module Calendar dùng chung (Vanilla JS) có thể hiển thị dữ liệu lịch khám từ DynamoDB cho cả trang tra cứu của người bệnh và trang bảng điều khiển của bác sĩ.

- **Nội dung AI sinh ra (Tóm tắt):**
  - **Phương pháp phân tích chi phí Serverless:** Phân tích hạn mức Free Tier cho từng dịch vụ: Lambda (1M req/tháng & 3.2M giây compute), DynamoDB (25 RCU/WCU miễn phí), S3 và API Gateway ở mức chi phí xấp xỉ $0.00; giải thích riêng khoản phí $1.00/tháng của AWS KMS Customer Managed Key (`alias/caresync-patient-key`) và khuyến cáo lên lịch xóa khóa khi kết thúc lab để bảo toàn ngân sách.
  - **Quy trình dọn dẹp theo thứ tự phụ thuộc (Dependency Order):** Đưa ra chuỗi 7 bước hủy tài nguyên từ ngoài vào trong: (1) EventBridge Scheduler $\rightarrow$ (2) SNS Topic & Subscriptions $\rightarrow$ (3) API Gateway $\rightarrow$ (4) Lambda Function $\rightarrow$ (5) Xóa dữ liệu & S3 Bucket $\rightarrow$ (6) Bảng DynamoDB $\rightarrow$ (7) Lên lịch xóa khóa KMS CMK.
  - **Tư vấn thiết kế Calendar Module:** Gợi ý mô hình gom nhóm dữ liệu theo ngày sử dụng Hash Map $O(N)$, thiết kế các hàm tiền xử lý `parseApptDate`, `formatDateKey` và dùng cờ `mode` (`'patient'` / `'doctor'`) để tái sử dụng một bộ khung giao diện HTML/CSS duy nhất.

- **Nội dung sinh viên hoàn thiện:**
  - **Tự tay lập trình Module Calendar:** Viết toàn bộ mã nguồn tệp `client/js/calendar.js` (742 dòng JavaScript) và `client/css/lookup.css` (578 dòng CSS); hỗ trợ chuyển tháng linh hoạt, highlight ngày hiện tại, gắn thẻ trạng thái ca khám và modal xem chi tiết.
  - **Xóa bỏ hoàn toàn LocalStorage:** Loại bỏ mã cache offline, đấu nối trực tiếp module Calendar với dữ liệu sống từ DynamoDB qua GSI `PatientPhone-index`.
  - **Thiết lập & kiểm thử bộ API Postman:** Tạo bộ test Postman và gọi kiểm thử độc lập 5 API cốt lõi trên endpoint AWS thật (`/auth/doctor/send-otp`, `/verify-otp`, `/doctors/{id}/appointments`, `/appointments/request-cancel`, `/confirm-cancel`), xác thực mã HTTP 200 OK và chụp 5 ảnh minh chứng cho báo cáo.
  - **Quản lý chi phí & Kế hoạch dọn dẹp:** Trực tiếp theo dõi bảng thanh toán AWS Billing Console, kiểm tra số dư Learner Lab ($100 budget) và lập bảng checklist dọn dẹp chi tiết bảo toàn ngân sách.

