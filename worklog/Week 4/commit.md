# Worklog Tuần 4 & Tổng Kết Đồ Án - Dự Án CareSync

**Nhóm sinh viên:**

- 24110258 – Bùi Anh Khôi (SV1)
- 24110241 – Huỳnh Ngọc Bảo Khang (SV2)

---

## 1. Tài liệu chung của nhóm

- **Link Github của nhóm:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)
- **Video Demo CareSync:** [https://drive.google.com/drive/folders/1sK3Uae6RGCYvLRe3XZixI6ULkMxq5bKn?usp=sharing](https://drive.google.com/drive/folders/1sK3Uae6RGCYvLRe3XZixI6ULkMxq5bKn?usp=sharing)
- **Bảng phân công nhiệm vụ & thời gian:** [BangPhanCongWeek4.md](BangPhanCongWeek4.md)
- **Báo cáo tổng kết tuần 4 & đồ án:** [BaoCaoWeek4.md](BaoCaoWeek4.md)

---

## 2. Link tài liệu & Minh chứng của từng thành viên

- **Sinh viên 1 – Bùi Anh Khôi:**
  - Báo cáo minh chứng thực hành: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md)
  - Khai báo sử dụng công cụ AI: [SV1_BuiAnhKhoi/NoiDungAIHoTro.md](SV1_BuiAnhKhoi/NoiDungAIHoTro.md)
- **Sinh viên 2 – Huỳnh Ngọc Bảo Khang:**
  - Báo cáo minh chứng thực hành: [SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md](SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md)
  - Khai báo sử dụng công cụ AI: [SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md](SV2_HuynhNgocBaoKhang/NoiDungAIHoTro.md)

---

## 3. Danh sách Commit & Message của SV1 (Bùi Anh Khôi)

### Commit 1: Hoàn thiện tính năng Live Search không dấu và sửa lỗi gõ tiếng Việt

- **Hash commit:** `14e50f3`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/14e50f3](https://github.com/Arenef/CareSync/commit/14e50f3)
- **Commit Message:** `fix: hoan thien live search khong dau cho trang quan ly ca kham bac si`
- **Mô tả:** Thêm hàm chuẩn hóa chuỗi `normalizeString` không dấu, tách biệt thanh tìm kiếm `topBar` cố định trên DOM tránh lỗi gãy dấu bộ gõ tiếng Việt (IME) và tự động chuyển về chế độ danh sách khi tìm kiếm.

### Commit 2: Bổ sung minh chứng thực hành và ảnh chụp kiểm thử E2E Tuần 4

- **Hash commit:** `5d88648`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/5d88648](https://github.com/Arenef/CareSync/commit/5d88648)
- **Commit Message:** `docs: bổ sung minh chứng thực hành và ảnh chụp kiểm thử E2E Tuần 4 - SV1 Bùi Anh Khôi`
- **Mô tả:** Nghiệm thu toàn diện 4 kịch bản người dùng (Đặt khám, Chống trùng 409, Tra cứu/hủy lịch qua OTP, Cổng bác sĩ), tối ưu 16 ảnh minh chứng chất lượng cao vào `worklog/Week 4/img/` và viết báo cáo `MinhChungThucHanh.md`.

### Commit 3: Tự động khóa các khung giờ khám đã trôi qua trong ngày

- **Hash commit:** `d7a0d36`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/d7a0d36](https://github.com/Arenef/CareSync/commit/d7a0d36)
- **Commit Message:** `tu dong khoa cac khung gio kham da troi qua trong ngay va dong bo lich bac si`
- **Mô tả:** Bổ sung logic so sánh `slotMinutes` với giờ hiện tại khi chọn ngày hôm nay, tự động gán trạng thái `disabled`, class `is-unavailable` và tooltip cảnh báo; tự động reset tóm tắt nếu ca đã chọn bị quá giờ.

### Commit 4: Tái cấu trúc mã nguồn và khai báo sử dụng công cụ AI

- **Hash commit:** `b6d5291` / `9234c7e`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/b6d5291](https://github.com/Arenef/CareSync/commit/b6d5291)
- **Commit Message:** `docs: nội dung AI hỗ trợ`
- **Mô tả:** Rà soát và dọn dẹp ~400 dòng code thừa (tách biệt `booking.js` và `lookup.js`, helper `togglePatientSections` trong `doctor-auth.js`, chuẩn hóa `window.showToast`, xóa file rác `index.mjs`) và kiểm tra cú pháp toàn bộ hệ thống bằng `node -c` đạt Exit Code 0.

### Commit 5: Bổ sung bảng phân công nhiệm vụ tuần 4

- **Hash commit:** `6268736`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/6268736](https://github.com/Arenef/CareSync/commit/6268736)
- **Commit Message:** `docs: bổ sung bảng phân công nhiệm vụ tuần 4`
- **Mô tả:** Phân bổ chi tiết nhiệm vụ và thời gian thực hiện tuần 4 của SV1 và SV2.

### Commit 6: Hoàn thiện báo cáo tổng kết tuần 4 và tài liệu README với sơ đồ kiến trúc thực tế AWS

- **Hash commit:** `6b0f586`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/6b0f586](https://github.com/Arenef/CareSync/commit/6b0f586)
- **Commit Message:** `docs: hoàn thiện báo cáo week 4 và readme với sơ đồ thực tế AWS`
- **Mô tả:** Cập nhật sơ đồ kiến trúc Serverless CareSync trực quan (`Serverless_CareSync_Architecture.jpg`) vào `README.md` và `BaoCaoWeek4.md`; đồng thời lược bỏ các ghi chú chưa hoàn thành sau khi đồng bộ đầy đủ kết quả kiểm thử 5 API trên Postman, CloudWatch Logs, đánh giá chi phí Free Tier và quy trình dọn dẹp tài nguyên từ SV2, hoàn tất 100% tài liệu tổng kết đồ án.

---

## 4. Danh sách Commit & Message của SV2 (Huỳnh Ngọc Bảo Khang)

### Commit 1: Tách module Calendar dùng chung và hỗ trợ lịch khám bác sĩ

- **Hash commit:** `9c9d490`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/9c9d490](https://github.com/Arenef/CareSync/commit/9c9d490)
- **Commit Message:** `feat(calendar): tach module calendar dung chung va ho tro lich kham bac si`
- **Mô tả:** Xây dựng module lịch biểu tháng `client/js/calendar.js` (740 dòng) và styling `client/css/lookup.css` (578 dòng), hỗ trợ 2 chế độ `patient` và `doctor`, chuyển tháng, highlight ngày hiện tại và kết nối trực tiếp với DynamoDB.

### Commit 2: Loại bỏ hoàn toàn localStorage, vận hành 100% trên AWS DynamoDB

- **Hash commit:** `6d48acd`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/6d48acd](https://github.com/Arenef/CareSync/commit/6d48acd)
- **Commit Message:** `refactor(lookup): loai bo hoan toan localStorage, van hanh 100% tren DynamoDB va fix SlotKey`
- **Mô tả:** Chuyển đổi toàn diện cơ chế tra cứu từ cache trình duyệt offline sang gọi trực tiếp GSI `PatientPhone-index` của DynamoDB; chuẩn hóa định dạng khóa `SlotKey` (`YYYY-MM-DD#HH:mm`).

### Commit 3: Cập nhật giao diện email thông báo SNS và Cache-Busting cho S3

- **Hash commit:** `bba3d17`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/bba3d17](https://github.com/Arenef/CareSync/commit/bba3d17)
- **Commit Message:** `fix: cap nhat giao dien email thong bao va bo sung cache-busting cho calendar`
- **Mô tả:** Tối ưu hóa mẫu email xác nhận và nhắc hẹn chuyên nghiệp qua SNS; bổ sung query string phiên bản (`?v=...`) chống kẹt cache JavaScript trên S3 Website Hosting.

### Commit 4: Xây dựng API yêu cầu và xác thực hủy lịch hẹn qua OTP SNS

- **Hash commit:** `fa5f78e`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/fa5f78e](https://github.com/Arenef/CareSync/commit/fa5f78e)
- **Commit Message:** `feat(backend): thêm API yêu cầu và xác thực hủy lịch hẹn qua OTP SNS`
- **Mô tả:** Xây dựng 2 endpoint `/appointments/request-cancel` và `/appointments/confirm-cancel`, tích hợp mã OTP 6 chữ số có hiệu lực 5 phút gửi qua SNS Publish và giải phóng slot DynamoDB.

---

## 5. Model A.I đã sử dụng trong Tuần 4

- **Bùi Anh Khôi (SV1):** Gemini 3.8 flash
- **Huỳnh Ngọc Bảo Khang (SV2):** Gemini 3.8 flash
