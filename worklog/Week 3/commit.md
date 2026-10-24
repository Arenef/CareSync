# Worklog Tuần 3 - Dự Án CareSync

**Nhóm sinh viên:**
- 24110258 – Bùi Anh Khôi (SV1)
- 24110241 – Huỳnh Ngọc Bảo Khang (SV2)

---

## 1. Tài liệu chung của nhóm
- **Link Github của nhóm:** https://github.com/Arenef/CareSync
- **Báo cáo tuần 3:** [BaoCaoWeek3.md](BaoCaoWeek3.md)
- **Bộ sưu tập Postman Collection:** [docs/CareSync_Week3.postman_collection.json](../../docs/CareSync_Week3.postman_collection.json)

---

## 2. Link minh chứng của Sinh viên 2 – Huỳnh Ngọc Bảo Khang
- **Kế hoạch & Hướng dẫn tuần 3:** [SV2_HuynhNgocBaoKhang/HuongDanChiTiet_SV2.md](SV2_HuynhNgocBaoKhang/HuongDanChiTiet_SV2.md)
- **Minh chứng thực hành AWS:** [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)

---

## 3. Danh sách Commit & Message của SV2 (Huỳnh Ngọc Bảo Khang)

### Commit 1: Backend Service, Controller & Routes tra cứu theo SĐT
* **Commit Message:** `feat(backend): xây dựng API tra cứu lịch hẹn theo số điện thoại qua DynamoDB GSI PatientPhone-index`
* **Mô tả:** Triển khai hàm `getAppointmentsByPhone` với `QueryCommand` trong `appointment.service.js`, controller validate query param `phone` và định tuyến phương thức `GET /appointments`.

### Commit 2: Tích hợp Frontend Client API
* **Commit Message:** `feat(client): tích hợp hàm tra cứu lịch hẹn theo SĐT vào appointmentApi`
* **Mô tả:** Bổ sung phương thức `appointmentApi.getByPhone(phone)` trong `client/js/api.js` kết nối với API Gateway.

### Commit 3: Bộ sưu tập Postman Collection Tuần 3
* **Commit Message:** `test(api): bổ sung Postman Collection kiểm thử toàn diện các endpoint tuần 3`
* **Mô tả:** Xuất bộ sưu tập Postman 5 test case (`GET doctors`, `POST booking 201`, `POST conflict 409`, `GET search phone 200`, `GET missing phone 400`).

### Commit 4: Tài liệu Báo cáo & Minh chứng Tuần 3
* **Commit Message:** `docs(week3): hoàn thiện báo cáo nhóm và minh chứng thực hành cá nhân SV2 tuần 3`
* **Mô tả:** Tổng hợp 8 ảnh minh chứng thực tế trên AWS (SNS, S3, API Gateway, Postman) và hoàn thiện các file báo cáo Markdown tuần 3.

### Commit 5: Tích hợp Module Mã hóa AWS KMS
* **Commit Message:** `feat(kms): xây dựng service mã hóa dữ liệu nhạy cảm bằng AWS KMS và kiểm thử thành công`
* **Mô tả:** Triển khai module `kms.service.js` với `@aws-sdk/client-kms` (`encryptData`, `decryptData`), tích hợp test handler trong `index.js` và kiểm thử mã hóa/giải mã thành công trên Lambda Console.

---

## 4. Model A.I đã sử dụng
- **Huỳnh Ngọc Bảo Khang:** Gemini / Antigravity Assistant
- **Bùi Anh Khôi:** ChatGPT-4o
