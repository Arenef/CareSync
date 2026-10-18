# BẢNG PHÂN CÔNG CHI TIẾT CÔNG VIỆC VÀ THỜI GIAN - TUẦN 2

**Đề tài:** Hệ thống đặt lịch khám bệnh cho phòng khám trực tuyến (CareSync)  
**Nhóm thực hiện:** Domain Apps  
**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
**Nhánh chính (Branch):** `main`

---

## Thông tin thành viên nhóm

* **Sinh viên 1 (SV1):** Bùi Anh Khôi – **MSSV:** 24110258 – **Email:** [24110258@student.hcmute.edu.vn](mailto:24110258@student.hcmute.edu.vn) – **GitHub Account:** `buianhkhoi020120-cloud`
* **Sinh viên 2 (SV2):** Huỳnh Ngọc Bảo Khang – **MSSV:** 24110241 – **Email:** [24110241@student.hcmute.edu.vn](mailto:24110241@student.hcmute.edu.vn) – **GitHub Account:** `Arsenef` / `Arenef`

---

## 1. Bảng Tổng Hợp Phân Công Nhiệm Vụ Tuần 2

| STT | Nhiệm vụ thực hiện | Người phụ trách | Kết quả đạt được | Trạng thái |
| :-: | :----------------- | :-------------: | :--------------- | :--------: |
| 1 | Kiểm tra cấu trúc bảng DynamoDB Doctors, Appointments và dữ liệu mẫu | Huỳnh Ngọc Bảo Khang | Hoàn thành cấu hình 3 bảng `Active`, nạp 10 bác sĩ mẫu và thiết lập Partition Key/Sort Key. | **Hoàn thành** |
| 2 | Tạo và kiểm tra Lambda gửi email xác nhận qua SNS | Bùi Anh Khôi | Xây dựng hàm `CareSync-TestEmail` kết nối SNS Topic `DemoNhacLich` gửi email thành công. | **Hoàn thành** |
| 3 | Lambda tích hợp EventBridge Scheduler để tự động tạo lịch nhắc và gửi thông báo qua SNS | Bùi Anh Khôi | Tự động sinh lịch trình `at()` trên EventBridge Scheduler kích hoạt email nhắc nhở sau 2 phút. | **Hoàn thành** |
| 4 | Xây dựng và hoàn thiện giao diện đặt lịch bằng Node.js, Express, HTML, CSS và JavaScript | Bùi Anh Khôi | Hoàn thiện layout trang web, form đặt lịch, popup vé khám bệnh và thông báo toast. | **Hoàn thành** |
| 5 | Kiểm tra kết nối từ giao diện đến API và rà soát dữ liệu đặt lịch | Huỳnh Ngọc Bảo Khang | Kiểm tra giao tiếp CORS, bóc tách cấu trúc JSON giữa Frontend và API Gateway. | **Hoàn thành** |
| 6 | Kiểm thử luồng Scheduler → SNS, chụp ảnh minh chứng và cập nhật worklog | Bùi Anh Khôi | Kiểm thử end-to-end nhận email xác nhận và email nhắc lịch tự động từ hộp thư Gmail. | **Hoàn thành** |
| 7 | Tích hợp giao diện với API GET /doctors và POST /appointments | Huỳnh Ngọc Bảo Khang | Render động 10 bác sĩ lên web, đặt lịch thành công và xử lý chặn trùng lịch (409 Conflict). | **Hoàn thành** |
| 8 | Tổng hợp kết quả kiểm thử API, cập nhật tài liệu và minh chứng triển khai | Huỳnh Ngọc Bảo Khang | Xây dựng bộ test case Postman (200, 201, 409), cấu trúc lại mã nguồn Lambda theo Clean Architecture. | **Hoàn thành** |

---

## 2. Chi Tiết Phân Công & Minh Chứng Theo Từng Thành Viên

### 2.1. Bùi Anh Khôi – MSSV: 24110258 (SV1)

| STT | Công việc phụ trách | Số giờ | Minh chứng thực tế |
| :-: | :------------------ | :----: | :----------------- |
| 1 | Tạo và kiểm tra Lambda gửi email xác nhận qua SNS | 1.5 | - Hàm `CareSync-TestEmail` trên AWS Lambda.<br>- Topic `DemoNhacLich` trên Amazon SNS.<br>- Minh chứng chi tiết: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md#1-kiem-tra-sns-topic-va-cau-hinh-lambda-thu-nghiem) |
| 2 | Lambda tích hợp EventBridge Scheduler để tự động tạo lịch nhắc | 2.0 | - Tích hợp `@aws-sdk/client-scheduler` vào Lambda.<br>- Tạo One-time schedule `at()` tự động gửi email sau 2 phút.<br>- Minh chứng chi tiết: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md#3-tu-dong-hoa-gui-email-xac-nhan-va-dat-lich-nhac-sau-vai-phut) |
| 3 | Xây dựng và hoàn thiện giao diện đặt lịch (HTML/CSS/JS) | 2.5 | - Xây dựng form đặt lịch khám, thiết kế popup vé khám và container thông báo toast.<br>- Minh chứng chi tiết: [SV1_BuiAnhKhoi/XayDungGiaoDienMau.md](SV1_BuiAnhKhoi/XayDungGiaoDienMau.md) |
| 4 | Kiểm thử luồng Scheduler → SNS, chụp ảnh và cập nhật worklog | 1.0 | - Ảnh email xác nhận và email nhắc nhở nhận được trong Gmail.<br>- Báo cáo thực hành chi tiết: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md#4-kiem-thu-toan-dien-tren-giao-dien-web-caresync) |

---

### 2.2. Huỳnh Ngọc Bảo Khang – MSSV: 24110241 (SV2)

| STT | Công việc phụ trách | Số giờ | Minh chứng thực tế |
| :-: | :------------------ | :----: | :----------------- |
| 1 | Kiểm tra cấu trúc bảng DynamoDB Doctors, Appointments và dữ liệu mẫu | 1.5 | - Kiểm tra 3 bảng `Doctors`, `Appointments`, `Patients` ở trạng thái `Active`.<br>- Nạp 10 bản ghi bác sĩ mẫu và cấu hình Sort Key `SlotKey`.<br>- Minh chứng: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md#1-kiểm-tra-cấu-trúc-và-dữ-liệu-csdl-amazon-dynamodb) |
| 2 | Tái cấu trúc Backend AWS Lambda theo Clean Architecture | 2.0 | - Chuyển đổi mã nguồn sang 4 tầng chuẩn: `config/`, `service/`, `controller/`, `routes/`, `index.js`.<br>- Áp dụng Conditional Write chống trùng lịch.<br>- Minh chứng: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md#2-tái-cấu-trúc-mã-nguồn-aws-lambda-theo-clean-architecture) |
| 3 | Tích hợp giao diện Frontend với API GET /doctors và POST /appointments | 2.0 | - Xây dựng module `client/js/api.js`, kết nối API Gateway nạp 10 bác sĩ động.<br>- Bắt mã lỗi 409 Conflict hiển thị toast cảnh báo và khóa nút khung giờ.<br>- Minh chứng: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md#3-tích-hợp-giao-diện-web-frontend-với-aws-api-gateway) |
| 4 | Tổng hợp kết quả kiểm thử API Postman, hoàn thiện báo cáo và worklog | 1.5 | - Xây dựng bộ test case Postman độc lập (200 OK, 201 Created, 409 Conflict).<br>- Hoàn thiện tài liệu tuần 2: [BaoCaoWeek2.md](BaoCaoWeek2.md) và [MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md) |
