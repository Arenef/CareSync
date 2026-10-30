# Worklog Tuần 4 & Tổng Kết Đồ Án - Dự Án CareSync

**Nhóm sinh viên:**

- 24110258 – Bùi Anh Khôi (SV1)
- 24110241 – Huỳnh Ngọc Bảo Khang (SV2)

---

## 1. Tài liệu chung của nhóm

- **Link Github của nhóm:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)
- **Bảng phân công nhiệm vụ & thời gian:** [BangPhanCongWeek4.md](BangPhanCongWeek4.md)
- **Báo cáo tổng kết tuần 4 & đồ án:** [BaoCaoWeek4.md](BaoCaoWeek4.md)

---

## 2. Link tài liệu & Minh chứng của từng thành viên

- **Sinh viên 1 – Bùi Anh Khôi:**
  - Báo cáo minh chứng thực hành: [SV1_BuiAnhKhoi/MinhChungThucHanh.md](SV1_BuiAnhKhoi/MinhChungThucHanh.md)
  - Khai báo sử dụng công cụ AI: [SV1_BuiAnhKhoi/NoiDungAIHoTro.md](SV1_BuiAnhKhoi/NoiDungAIHoTro.md)
- **Sinh viên 2 – Huỳnh Ngọc Bảo Khang:**
  - _(SV2 sẽ tự bổ sung sau khi hoàn thành phần việc tuần 4)_

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

### Commit 6: Hoàn thiện tài liệu README giới thiệu dự án
- **Hash commit:** `c3f04f0`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/c3f04f0](https://github.com/Arenef/CareSync/commit/c3f04f0)
- **Commit Message:** `docs: hoàn thiện tài liệu readme giới thiệu tổng quan hệ thống và hướng dẫn sử dụng`
- **Mô tả:** Viết tài liệu tổng quan dự án, sơ đồ kiến trúc Serverless, danh mục REST API, hướng dẫn thao tác web và lưu ý về môi trường AWS Academy Learner Lab.

### Commit 7: Báo cáo thực hiện tuần 4 và tổng kết đồ án
- **Hash commit:** `7a04da4`
- **Link commit:** [https://github.com/Arenef/CareSync/commit/7a04da4](https://github.com/Arenef/CareSync/commit/7a04da4)
- **Commit Message:** `docs: báo cáo thực hiện tuần 4 và tổng kết đồ án môn học (thiếu Chạy kiểm thử bộ API trên Postman & Kiểm tra Log - Đánh giá chi phí AWS - Lập checklist & thực hiện quy trình dọn dẹp tài nguyên)`
- **Mô tả:** Báo cáo thực hiện tuần 4, nghiệm thu 4 luồng người dùng E2E với 16 ảnh minh chứng, tối ưu code và nêu rõ các phần SV2 đang tiếp tục hoàn thiện.

---

## 4. Danh sách Commit & Message của SV2 (Huỳnh Ngọc Bảo Khang)

_(Thành viên SV2 sẽ tự bổ sung các commit cá nhân sau khi đẩy code lên repository)._

---

## 5. Model A.I đã sử dụng trong Tuần 4

- **Bùi Anh Khôi (SV1):** Gemini 3.8 flash
- **Huỳnh Ngọc Bảo Khang (SV2):** _(SV2 tự khai báo sau)_
