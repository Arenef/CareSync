# Worklog Tuần 3 - Dự Án CareSync

**Nhóm sinh viên:**

- 24110258 – Bùi Anh Khôi (SV1)
- 24110241 – Huỳnh Ngọc Bảo Khang (SV2)

---

## 1. Tài liệu chung của nhóm

- **Link Github của nhóm:** https://github.com/Arenef/CareSync
- **Bảng phân công nhiệm vụ & thời gian:** [BangPhanCongWeek3.md](BangPhanCongWeek3.md)
- **Báo cáo tuần 3:** [BaoCaoWeek3.md](BaoCaoWeek3.md)
- **Bộ sưu tập Postman Collection:** [docs/CareSync_Week3.postman_collection.json](../../docs/CareSync_Week3.postman_collection.json)

---

## 2. Link tài liệu & Minh chứng của từng thành viên

- **Sinh viên 1 – Bùi Anh Khôi:**
  - Báo cáo minh chứng thực hành: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md)
  - Khai báo sử dụng công cụ AI: [SV1_BuiAnhKhoi/NoiDungAIHoTro.md](SV1_BuiAnhKhoi/NoiDungAIHoTro.md)
- **Sinh viên 2 – Huỳnh Ngọc Bảo Khang:**
  - Minh chứng thực hành AWS: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)
  - Khai báo sử dụng công cụ AI: [SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md](SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md)

---

## 3. Danh sách Commit & Message của SV1 (Bùi Anh Khôi)

### Commit 1: Tích hợp SNS & Scheduler vào đặt lịch chính thức

- **Link commit:** https://github.com/Arenef/CareSync/commit/99c59f4
- **Commit Message:** `Tích hợp SNS & Scheduler vào đặt lịch chính thức`
- **Mô tả:** Tích hợp `PublishCommand` gửi email xác nhận ngay khi đặt lịch và tạo One-time schedule `at()` hẹn giờ gửi nhắc lịch sau 2 phút qua EventBridge Scheduler trong `appointment.service.js`.

### Commit 2: Viết module lưu trữ hồ sơ bệnh nhân

- **Link commit:** https://github.com/Arenef/CareSync/commit/816e16c
- **Commit Message:** `Viết module lưu trữ hồ sơ bệnh nhân`
- **Mô tả:** Xây dựng `patient.service.js`, chuẩn hóa thông tin bệnh nhân, sinh mã định danh `PAT-<cleanPhone>` và tích hợp ghi song song bảng `Patients` qua `Promise.all` khi người dùng đặt lịch khám.

### Commit 3: Triển khai mã hóa dữ liệu nhạy cảm bằng AWS KMS

- **Link commit:** https://github.com/Arenef/CareSync/commit/2a8cc71
- **Commit Message:** `Triển khai mã hóa dữ liệu nhạy cảm bằng AWS KMS và chạy test`
- **Mô tả:** Khởi tạo Customer Managed Key `alias/caresync-patient-key`, xây dựng `kms.service.js` với AWS KMS SDK v3, viết script `test-kms.js` kiểm thử mã hóa/giải mã SĐT và CCCD thành công 100% PASS.

### Commit 4: Xây dựng giao diện Form & Modal "Lịch hẹn của tôi"

- **Link commit:** https://github.com/Arenef/CareSync/commit/00bf9bb
- **Commit Message:** `Xây dựng giao diện Form & Modal "Lịch hẹn của tôi"`
- **Mô tả:** Thiết kế form tra cứu SĐT tại Section "Lịch hẹn của tôi", validate 10 chữ số, tích hợp gọi API `appointmentApi.getByPhone` của SV2, hiển thị danh sách thẻ trực quan và toast cảnh báo.

### Commit 5: Hoàn thiện chi tiết hồ sơ bác sĩ và cập nhật styling

- **Link commit:** https://github.com/Arenef/CareSync/commit/0157213
- **Commit Message:** `feat(client): hoàn thiện giao diện xem chi tiết hồ sơ bác sĩ và cập nhật styling`
- **Mô tả:** Hoàn thiện modal xem chi tiết hồ sơ bác sĩ trong `doctors.js`, cập nhật styling responsive trong `booking.css` và đồng bộ `node_modules/.package-lock.json`.

---

## 4. Danh sách Commit & Message của SV2 (Huỳnh Ngọc Bảo Khang)

### Commit 1: Backend Service, Controller & Routes tra cứu theo SĐT

- **Link commit:** https://github.com/Arenef/CareSync/commit/c620618
- **Commit Message:** `feat(backend): xây dựng API tra cứu lịch hẹn theo số điện thoại qua DynamoDB GSI PatientPhone-index`
- **Mô tả:** Triển khai hàm `getAppointmentsByPhone` với `QueryCommand` trong `appointment.service.js`, controller validate query param `phone` và định tuyến phương thức `GET /appointments`.

### Commit 2: Bộ sưu tập Postman Collection Tuần 3

- **Link commit:** https://github.com/Arenef/CareSync/commit/65d60e3
- **Commit Message:** `test(api): bổ sung Postman Collection kiểm thử toàn diện các endpoint tuần 3`
- **Mô tả:** Xuất bộ sưu tập Postman 5 test case (`GET doctors`, `POST booking 201`, `POST conflict 409`, `GET search phone 200`, `GET missing phone 400`).

### Commit 3: Tài liệu Báo cáo & Minh chứng Tuần 3

- **Link commit:** https://github.com/Arenef/CareSync/commit/568ffdf
- **Commit Message:** `docs(week3): hoàn thiện báo cáo nhóm và minh chứng thực hành cá nhân SV2 tuần 3`
- **Mô tả:** Tổng hợp 8 ảnh minh chứng thực tế trên AWS (SNS, S3, API Gateway, Postman) và hoàn thiện các file báo cáo Markdown tuần 3.

### Commit 4: Tích hợp Module Mã hóa AWS KMS

- **Link commit:** https://github.com/Arenef/CareSync/commit/8ef75a2
- **Commit Message:** `feat(kms): xây dựng service mã hóa dữ liệu nhạy cảm bằng AWS KMS và kiểm thử thành công`
- **Mô tả:** Triển khai module `kms.service.js` với `@aws-sdk/client-kms` (`encryptData`, `decryptData`), tích hợp test handler trong `index.js` và kiểm thử mã hóa/giải mã thành công trên Lambda Console.

### Commit 5: Hoàn thiện Báo cáo Tuần 3, Khai báo AI & Minh chứng SV2

- **Link commit:** https://github.com/Arenef/CareSync/commit/672cb63
- **Commit Message:** `docs(week3): hoàn thiện báo cáo tuần 3, khai báo AI và minh chứng thực hành SV2`
- **Mô tả:** Cập nhật đầy đủ ảnh thực hành (GSI DynamoDB, Postman 201/409, 2 luồng Email SNS xác nhận & nhắc hẹn), tạo mới file khai báo AI hỗ trợ (Hosting S3 & CloudFront OAC) và tổng hợp toàn diện Báo cáo tuần 3 của cả hai thành viên.

---

## 5. Model A.I đã sử dụng

- **Huỳnh Ngọc Bảo Khang:** ChatGPT-4o
- **Bùi Anh Khôi:** ChatGPT-4o
