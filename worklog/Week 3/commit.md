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
  - Kế hoạch & Hướng dẫn tuần 3: [SV2_HuynhNgocBaoKhang/HuongDanChiTiet_SV2.md](SV2_HuynhNgocBaoKhang/HuongDanChiTiet_SV2.md)
  - Minh chứng thực hành AWS: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)

---

## 3. Danh sách Commit & Message của SV1 (Bùi Anh Khôi)

### Commit 1: Tích hợp SNS & Scheduler vào đặt lịch chính thức

- **Hash:** `99c59f4`
- **Link commit:** https://github.com/Arenef/CareSync/commit/99c59f4f1e865382f239e89d65fb38806b5f8bd4
- **Commit Message:** `Tích hợp SNS & Scheduler vào đặt lịch chính thức`
- **Mô tả:** Tích hợp `PublishCommand` gửi email xác nhận ngay khi đặt lịch và tạo One-time schedule `at()` hẹn giờ gửi nhắc lịch sau 2 phút qua EventBridge Scheduler trong `appointment.service.js`.

### Commit 2: Viết module lưu trữ hồ sơ bệnh nhân

- **Hash:** `816e16c`
- **Link commit:** https://github.com/Arenef/CareSync/commit/816e16cc76b5a623e88e52a1017feda93bc48a10
- **Commit Message:** `Viết module lưu trữ hồ sơ bệnh nhân`
- **Mô tả:** Xây dựng `patient.service.js`, chuẩn hóa thông tin bệnh nhân, sinh mã định danh `PAT-<cleanPhone>` và tích hợp ghi song song bảng `Patients` qua `Promise.all` khi người dùng đặt lịch khám.

### Commit 3: Triển khai mã hóa dữ liệu nhạy cảm bằng AWS KMS

- **Hash:** `2a8cc71`
- **Link commit:** https://github.com/Arenef/CareSync/commit/2a8cc71e4e23a2f0412f4500addd0b0e8116f989
- **Commit Message:** `Triển khai mã hóa dữ liệu nhạy cảm bằng AWS KMS và chạy test`
- **Mô tả:** Khởi tạo Customer Managed Key `alias/caresync-patient-key`, xây dựng `kms.service.js` với AWS KMS SDK v3, viết script `test-kms.js` kiểm thử mã hóa/giải mã SĐT và CCCD thành công 100% PASS.

### Commit 4: Xây dựng giao diện Form & Modal "Lịch hẹn của tôi"

- **Hash:** `00bf9bb`
- **Link commit:** https://github.com/Arenef/CareSync/commit/00bf9bbfd1e2cbb645c5b5a2c7638753670adafc
- **Commit Message:** `Xây dựng giao diện Form & Modal "Lịch hẹn của tôi"`
- **Mô tả:** Thiết kế form tra cứu SĐT tại Section "Lịch hẹn của tôi", validate 10 chữ số, tích hợp gọi API `appointmentApi.getByPhone` của SV2, hiển thị danh sách thẻ trực quan và toast cảnh báo.

### Commit 5: Hoàn thiện chi tiết hồ sơ bác sĩ và cập nhật styling

- **Hash:** `0157213`
- **Link commit:** https://github.com/Arenef/CareSync/commit/015721327dc31879934ec28c708b177ab66c5de8
- **Commit Message:** `feat(client): hoàn thiện giao diện xem chi tiết hồ sơ bác sĩ và cập nhật styling`
- **Mô tả:** Hoàn thiện modal xem chi tiết hồ sơ bác sĩ trong `doctors.js`, cập nhật styling responsive trong `booking.css` và đồng bộ `node_modules/.package-lock.json`.

---

## 4. Danh sách Commit & Message của SV2 (Huỳnh Ngọc Bảo Khang)

### Commit 1: Backend Service, Controller & Routes tra cứu theo SĐT

- **Hash:** `c620618`
- **Link commit:** https://github.com/Arenef/CareSync/commit/c620618b7611c03d3c11424a8b0e27470652230e
- **Commit Message:** `feat(backend): xây dựng API tra cứu lịch hẹn theo số điện thoại qua DynamoDB GSI PatientPhone-index`
- **Mô tả:** Triển khai hàm `getAppointmentsByPhone` với `QueryCommand` trong `appointment.service.js`, controller validate query param `phone` và định tuyến phương thức `GET /appointments`.

### Commit 2: Bộ sưu tập Postman Collection Tuần 3

- **Hash:** `65d60e3`
- **Link commit:** https://github.com/Arenef/CareSync/commit/65d60e321616cf1de59de3abebf5523de8cf2fad
- **Commit Message:** `test(api): bổ sung Postman Collection kiểm thử toàn diện các endpoint tuần 3`
- **Mô tả:** Xuất bộ sưu tập Postman 5 test case (`GET doctors`, `POST booking 201`, `POST conflict 409`, `GET search phone 200`, `GET missing phone 400`).

### Commit 3: Tài liệu Báo cáo & Minh chứng Tuần 3

- **Hash:** `568ffdf`
- **Link commit:** https://github.com/Arenef/CareSync/commit/568ffdf8cfa18c161740cbafc9e0bee7a369c9dd
- **Commit Message:** `docs(week3): hoàn thiện báo cáo nhóm và minh chứng thực hành cá nhân SV2 tuần 3`
- **Mô tả:** Tổng hợp 8 ảnh minh chứng thực tế trên AWS (SNS, S3, API Gateway, Postman) và hoàn thiện các file báo cáo Markdown tuần 3.

### Commit 4: Cập nhật cấu hình Git Ignore

- **Hash:** `00a5399`
- **Link commit:** https://github.com/Arenef/CareSync/commit/00a53992c28a57baca512d2485e2bd4b9eaa340c
- **Commit Message:** `chore: cập nhật gitignore bỏ qua node_modules và file zip`
- **Mô tả:** Bổ sung cấu hình `.gitignore` loại trừ thư mục `node_modules` và các tệp nén zip khi triển khai Lambda.

### Commit 5: Tích hợp Module Mã hóa AWS KMS

- **Hash:** `8ef75a2`
- **Link commit:** https://github.com/Arenef/CareSync/commit/8ef75a2d1ff785c8a2e938f57ed7fb75cffba767
- **Commit Message:** `feat(kms): xây dựng service mã hóa dữ liệu nhạy cảm bằng AWS KMS và kiểm thử thành công`
- **Mô tả:** Triển khai module `kms.service.js` với `@aws-sdk/client-kms` (`encryptData`, `decryptData`), tích hợp test handler trong `index.js` và kiểm thử mã hóa/giải mã thành công trên Lambda Console.

---

## 5. Model A.I đã sử dụng

- **Huỳnh Ngọc Bảo Khang:** Gemini / Antigravity Assistant
- **Bùi Anh Khôi:** ChatGPT-4o
