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
|  5  | Kiểm thử Postman/Log, Đánh giá chi phí AWS & Quy trình dọn dẹp | Huỳnh Ngọc Bảo Khang (SV2) |    --     | _(Đang thực hiện: Postman & Log, Đánh giá chi phí, Checklist dọn dẹp)_                                                                 | **Đang thực hiện** |
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

_(Thành viên SV2 sẽ trực tiếp cập nhật chi tiết các đầu việc, số giờ và minh chứng thực hiện sau khi hoàn thành)._
