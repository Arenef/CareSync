# BẢNG PHÂN CÔNG CHI TIẾT CÔNG VIỆC VÀ THỜI GIAN - TUẦN 4

**Đề tài:** Hệ thống đặt lịch khám bệnh cho phòng khám trực tuyến (CareSync)  
**Nhóm thực hiện:** Domain Apps  
**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
**Nhánh chính (Branch):** `main`

---

## Thông tin thành viên nhóm

- **Sinh viên 1 (SV1):** Bùi Anh Khôi – **MSSV:** 24110258 – **Email:** [24110258@student.hcmute.edu.vn](mailto:24110258@student.hcmute.edu.vn) – **GitHub Account:** `buianhkhoi020120-cloud`
- **Sinh viên 2 (SV2):** Huỳnh Ngọc Bảo Khang – **MSSV:** 24110241 – **Email:** [24110241@student.hcmute.edu.vn](mailto:24110241@student.hcmute.edu.vn) – **GitHub Account:** `Arsenef` / `Arenef`

---

## 1. Bảng Tổng Hợp Phân Công Nhiệm Vụ Tuần 4

| STT | Nhiệm vụ thực hiện                                            |      Người phụ trách       | Thời gian | Kết quả đạt được                                                                                                                       |     Trạng thái     |
| :-: | :------------------------------------------------------------ | :------------------------: | :-------: | :------------------------------------------------------------------------------------------------------------------------------------- | :----------------: |
|  1  | Tái cấu trúc và dọn dẹp mã nguồn Client & Server Lambda       |     Bùi Anh Khôi (SV1)     |  2.5 giờ  | Cắt giảm ~400 dòng code thừa, chuẩn hóa `window.showToast`, tách biệt rành mạch `booking.js` và `lookup.js`, xóa file rác `index.mjs`. |   **Hoàn thành**   |
|  2  | Triển khai khóa khung giờ khám đã qua trong ngày              |     Bùi Anh Khôi (SV1)     |  1.5 giờ  | Tự động so sánh giờ hiện tại với các slot trong ngày, vô hiệu hóa nút đặt và gán tooltip cảnh báo trực quan.                           |   **Hoàn thành**   |
|  3  | Nâng cấp Live Search không dấu và sửa lỗi gõ tiếng Việt       |     Bùi Anh Khôi (SV1)     |  2.0 giờ  | Thêm hàm chuẩn hóa `normalizeString`, cố định thanh topbar tránh giật focus giúp gõ tiếng Việt có dấu chuẩn xác.                       |   **Hoàn thành**   |
|  4  | Kiểm thử toàn diện End-to-End (E2E) và chụp 16 ảnh minh chứng |     Bùi Anh Khôi (SV1)     |  2.5 giờ  | Nghiệm thu 4 luồng người dùng chính trên hệ thống thật, chụp 16 ảnh minh chứng sắc nét cho báo cáo.                                    |   **Hoàn thành**   |
|  5  | Module Calendar, Kiểm thử Postman API, Đánh giá chi phí & Dọn dẹp | Huỳnh Ngọc Bảo Khang (SV2) |  8.0 giờ  | Hoàn thành `calendar.js` (740 dòng), `lookup.css` (578 dòng), kiểm thử độc lập 5 API Postman, phân tích chi phí Serverless và checklist dọn dẹp. |   **Hoàn thành**   |
|  6  | Tổng hợp Báo cáo Tổng kết Tuần 4 và hoàn thiện hồ sơ đồ án    |     Cả hai thành viên      |  2.0 giờ  | Phối hợp hoàn thiện `BaoCaoWeek4.md`, `commit.md` và kiểm tra chéo hệ thống.                                                           |   **Hoàn thành**   |

---

## 2. Chi Tiết Phân Công & Thời Gian Theo Từng Thành Viên

### 2.1. Bùi Anh Khôi – MSSV: 24110258 (SV1)

- **Tổng thời gian thực hiện:** **8.5 giờ**
- **Báo cáo thực hành chi tiết:** [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md)
- **Tài liệu khai báo AI hỗ trợ:** [SV1_BuiAnhKhoi/NoiDungAIHoTro.md](SV1_BuiAnhKhoi/NoiDungAIHoTro.md)

| STT | Công việc phụ trách                                                                                                                                                                                                                                                                                     | Số giờ  | Minh chứng thực tế & File mã nguồn                                                                                                                                                                       |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | **Tái cấu trúc mã nguồn toàn diện**<br>- Gỡ bỏ cụm hàm render lịch cũ trong `booking.js` (~200 dòng).<br>- Tối ưu helper ẩn/hiện section `togglePatientSections` trong `doctor-auth.js`.<br>- Chuẩn hóa thông báo `window.showToast` toàn ứng dụng.<br>- Xóa bỏ file `index.mjs` rỗng ở backend Lambda. | **2.5** | - File: [`client/js/booking.js`](../../client/js/booking.js)<br>- File: [`client/js/doctor-auth.js`](../../client/js/doctor-auth.js)<br>- File: [`server/lambda/index.js`](../../server/lambda/index.js) |
|  2  | **Khóa thông minh khung giờ quá khứ trong ngày**<br>- So sánh `slotMinutes` với giờ hiện tại nếu chọn ngày hôm nay.<br>- Vô hiệu hóa nút ca khám (`disabled = true`, class `is-unavailable`).<br>- Tự động reset tóm tắt nếu ca đã chọn bị quá giờ khi đổi ngày.                                        | **1.5** | - File: [`client/js/booking.js`](../../client/js/booking.js)<br>- Thử nghiệm thực tế các ca sáng bị khóa sau 12:00 trưa.                                                                                 |
|  3  | **Hoàn thiện Live Search tiếng Việt không dấu**<br>- Viết hàm `normalizeString` loại bỏ dấu tiếng Việt.<br>- Tách biệt thanh tìm kiếm `topBar` cố định trên DOM tránh gãy bộ gõ tiếng Việt (IME).<br>- Tự động kích hoạt hiển thị dạng danh sách khi tìm kiếm.                                          | **2.0** | - File: [`client/js/doctor-auth.js`](../../client/js/doctor-auth.js)<br>- Bác sĩ tìm kiếm tên bệnh nhân "Vương" chỉ cần gõ "vuong".                                                                      |
|  4  | **Kiểm thử E2E và ghi nhận minh chứng thực hành**<br>- Thực hiện 4 kịch bản người dùng trên hệ thống web và AWS.<br>- Chụp và tối ưu 16 ảnh minh chứng chất lượng cao vào `worklog/Week 4/img/`.<br>- Viết báo cáo thực hành cá nhân chi tiết.                                                          | **2.5** | - Thư mục ảnh: [`worklog/Week 4/img/`](img/)<br>- Báo cáo: [`SV1_BuiAnhKhoi/MinhChungThucHanh.md`](SV1_BuiAnhKhoi/MinhChungThucHanh.md)                                                                  |

---

### 2.2. Huỳnh Ngọc Bảo Khang – MSSV: 24110241 (SV2)

- **Tổng thời gian thực hiện:** **8.0 giờ**
- **Báo cáo thực hành chi tiết:** [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)
- **Tài liệu khai báo AI hỗ trợ:** [SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md](SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md)

| STT | Công việc phụ trách | Số giờ | Minh chứng thực tế & File mã nguồn |
| :-: | :--- | :---: | :--- |
|  1  | **Thiết kế & Xây dựng Module Lịch biểu Đa năng (Shared Calendar Module)**<br>- Lập trình module lịch biểu tái sử dụng `client/js/calendar.js` (740 dòng) và styling `client/css/lookup.css` (578 dòng).<br>- Tích hợp 2 chế độ `patient` (bệnh nhân tra cứu lịch hẹn) và `doctor` (bác sĩ theo dõi ca khám).<br>- Thuật toán xử lý ngày tháng `parseApptDate`, gom nhóm Hash Map và highlight ngày hiện tại. | **3.0** | - File: [`client/js/calendar.js`](../../client/js/calendar.js)<br>- File: [`client/css/lookup.css`](../../client/css/lookup.css)<br>- Ảnh minh chứng: `img/E2E_09_Lookup_Success_Cards.png`, `img/E2E_15_Doctor_Portal_Dashboard.png` |
|  2  | **Triệt tiêu LocalStorage & Vận hành 100% trên AWS DynamoDB Live**<br>- Loại bỏ hoàn toàn cơ chế lưu cache offline cũ trong `lookup.js` và `booking.js`.<br>- Kết nối dữ liệu sống với bảng `Appointments` qua GSI `PatientPhone-index` ($O(1)$).<br>- Đồng bộ chuẩn hóa định dạng `SlotKey` (`YYYY-MM-DD#HH:mm`). | **1.5** | - File: [`client/js/lookup.js`](../../client/js/lookup.js)<br>- File: [`client/js/booking.js`](../../client/js/booking.js)<br>- Commit: `6d48acd` |
|  3  | **Kiểm thử Độc lập 5 API trên Postman & Chụp minh chứng**<br>- Thiết lập bộ test Postman và gọi trực tiếp API Gateway endpoint thật.<br>- Kiểm thử luồng gửi/xác thực OTP đăng nhập Bác sĩ (`/auth/doctor/send-otp`, `/verify-otp`).<br>- Kiểm thử luồng gửi/xác thực OTP hủy lịch hẹn (`/appointments/request-cancel`, `/confirm-cancel`).<br>- Kiểm thử API trích xuất lịch khám theo bác sĩ (`GET /doctors/DOC01/appointments`). | **2.0** | - 5 ảnh Postman trong [`worklog/Week 4/img/`](img/): `postman_send_otp.png`, `postman_verify_otp.png`, `postman_cancel_appointment_send_otp.png`, `postman_cancel_appointment_comfirm.png`, `postman_get_appointments_by_doctorId.png` |
|  4  | **Phân tích Chi phí Serverless AWS & Lập Checklist Dọn dẹp Tài nguyên**<br>- Đánh giá định mức Free Tier và hạn mức Learner Lab ($100 budget) cho 7 dịch vụ AWS.<br>- Xây dựng checklist dọn dẹp theo thứ tự phụ thuộc (Dependency Order) từ ngoài vào trong để bảo vệ ngân sách Lab. | **1.5** | - Báo cáo chi tiết: [`SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md`](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)<br>- Báo cáo tổng kết: [`BaoCaoWeek4.md`](BaoCaoWeek4.md) |

