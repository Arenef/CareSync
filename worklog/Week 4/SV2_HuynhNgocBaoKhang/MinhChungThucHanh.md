<a id="top"></a>

# Báo Cáo Minh Chứng Thực Hành Tuần 4 - SV2 Huỳnh Ngọc Bảo Khang

## Chủ đề: Thử nghiệm trên Postman

**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Dự án:** Hệ thống đặt lịch khám bệnh trực tuyến (CareSync)  
**Sinh viên thực hiện:** Huỳnh Ngọc Bảo Khang  
**MSSV:** 24110241  
**Vai trò:** SV2 – Thử nghiệm trên Postman, Phát triển Module Calendar Dùng Chung, Backend Serverless & Đánh giá Chi phí Đám mây  
**Nội dung thực hành chính:** Thử nghiệm trên Postman (Postman API Testing) & Phát triển Module Lịch biểu  
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
**Nhánh (Branch):** `main`

---

## Mục Lục

- [1. Thiết Kế & Xây Dựng Module Lịch Biểu Đa Năng (Calendar Module)](#1-thiết-kế--xây-dựng-module-lịch-biểu-đa-năng-calendar-module)
  - [1.1. Mục tiêu và ý nghĩa kỹ thuật](#11-mục-tiêu-và-ý-nghĩa-kỹ-thuật)
  - [1.2. Kiến trúc module và cấu trúc dữ liệu (`client/js/calendar.js`)](#12-kiến-trúc-module-và-cấu-trúc-dữ-liệu-clientjscalendarjs)
  - [1.3. Ứng dụng Calendar trên Giao diện Bệnh nhân (Tra cứu lịch hẹn)](#13-ứng-dụng-calendar-trên-giao-diện-bệnh-nhân-tra-cứu-lịch-hẹn)
  - [1.4. Ứng dụng Calendar trên Cổng Bác sĩ (Doctor Portal Dashboard)](#14-ứng-dụng-calendar-trên-cổng-bác-sĩ-doctor-portal-dashboard)
- [2. Kiểm Thử Độc Lập Bộ API Trên Postman (Postman API Testing)](#2-kiểm-thử-độc-lập-bộ-api-trên-postman-postman-api-testing)
  - [2.1. API Yêu cầu Hủy lịch khám & Gửi mã OTP (`POST /appointments/request-cancel`)](#21-api-yêu-cầu-hủy-lịch-khám--gửi-mã-otp-post-appointmentsrequest-cancel)
  - [2.2. API Xác nhận OTP & Tiến hành Hủy lịch khám (`POST /appointments/confirm-cancel`)](#22-api-xác-nhận-otp--tiến-hành-hủy-lịch-khám-post-appointmentsconfirm-cancel)
  - [2.3. API Gửi OTP Đăng nhập Bác sĩ (`POST /auth/doctor/send-otp`)](#23-api-gửi-otp-đăng-nhập-bác-sĩ-post-authdoctorsend-otp)
  - [2.4. API Xác minh OTP & Đăng nhập Bác sĩ (`POST /auth/doctor/verify-otp`)](#24-api-xác-minh-otp--đăng-nhập-bác-sĩ-post-authdoctorverify-otp)
  - [2.5. API Lấy danh sách ca khám theo Bác sĩ (`GET /doctors/DOC01/appointments`)](#25-api-lấy-danh-sách-ca-khám-theo-bác-sĩ-get-doctorsdoc01appointments)
- [3. Đánh Giá Chi Phí Vận Hành Trên AWS (Billing & Cost Optimization)](#3-đánh-giá-chi-phí-vận-hành-trên-aws-billing--cost-optimization)
  - [3.1. Phân tích chi phí từng dịch vụ theo mô hình Serverless](#31-phân-tích-chi-phí-từng-dịch-vụ-theo-mô-hình-serverless)
  - [3.2. Bảng tổng hợp chi phí thực tế và so sánh](#32-bảng-tổng-hợp-chi-phí-thực-tế-và-so-sánh)
- [4. Lập Checklist & Kế Hoạch Dọn Dẹp Tài Nguyên AWS (Resource Cleanup)](#4-lập-checklist--kế-hoạch-dọn-dẹp-tài-nguyên-aws-resource-cleanup)
  - [4.1. Thứ tự hủy tài nguyên an toàn (Dependency Order)](#41-thứ-tự-hủy-tài-nguyên-an-toàn-dependency-order)
  - [4.2. Bảng checklist giải phóng tài nguyên Learner Lab](#42-bảng-checklist-giải-phóng-tài-nguyên-learner-lab)

---

<a id="1-thiet-ke--xay-dung-module-lich-bieu-da-nang-calendar-module"></a>

## 1. Thiết Kế & Xây Dựng Module Lịch Biểu Đa Năng (Calendar Module)

<a id="11-muc-tieu-va-y-nghia-ky-thuat"></a>

### 1.1. Mục tiêu và ý nghĩa kỹ thuật
Trong các tuần trước, việc hiển thị lịch hẹn của CareSync chỉ dừng lại ở danh sách thẻ (Card view) đơn giản hoặc phụ thuộc vào bộ nhớ tạm `localStorage`. Nhằm mang lại trải nghiệm y tế trực quan đạt chuẩn các phần mềm bệnh viện hiện đại:
- **SV2 (Huỳnh Ngọc Bảo Khang)** đã trực tiếp thiết kế và lập trình mới toàn bộ **Module Calendar dùng chung** tại tệp [`client/js/calendar.js`](../../client/js/calendar.js) kết hợp tệp phong cách [`client/css/lookup.css`](../../client/css/lookup.css).
- **Tính đa năng (Reusability):** Module được đóng gói thành IIFE độc lập, gắn vào đối tượng toàn cục `window.CareSyncCalendar`. Module hỗ trợ 2 chế độ hiển thị linh hoạt:
  1. **Chế độ Bệnh nhân (`mode: 'patient'`):** Hiển thị lịch hẹn cá nhân được phân nhóm theo ngày, cho phép lọc nhanh *Sắp tới* hoặc *Đã hủy*, mở modal xem vé và kích hoạt quy trình hủy lịch qua OTP.
  2. **Chế độ Bác sĩ (`mode: 'doctor'`):** Hiển thị tổng thể toàn bộ ca khám của phòng khám trong tháng, hỗ trợ bộ lọc trạng thái (*Hôm nay*, *Ngày mai*, *Tất cả*), tìm kiếm thời gian thực và xem chi tiết hồ sơ bệnh nhân.

<a id="12-kien-truc-module-va-cau-truc-du-lieu-clientjscalendarjs"></a>

### 1.2. Kiến trúc module và cấu trúc dữ liệu (`client/js/calendar.js`)

Module Calendar được thiết kế với các hàm xử lý dữ liệu và render chuyên nghiệp:

1. **Chuẩn hóa ngày tháng thông minh (`parseApptDate`):** Tự động nhận diện nhiều định dạng ngày khác nhau từ chuỗi `"Hôm nay"`, `"Ngày mai"`, ISO `YYYY-MM-DD`, `DD/MM/YYYY` đến khóa Sort Key hỗn hợp của DynamoDB dạng `YYYY-MM-DD#HH:mm`.
2. **Nhóm dữ liệu theo ngày ($O(N)$ Hash Map):** Gom toàn bộ các ca khám lấy từ DynamoDB vào một từ điển khóa theo ngày `YYYY-MM-DD` để truy xuất tức thì khi render các ô lưới tháng (Cell rendering).
3. **Tính toán lưới ngày trong tháng (Calendar Grid Generation):** Tính chính xác số ngày trong tháng, ngày bắt đầu của tuần (thứ Hai theo chuẩn Việt Nam T2 - CN), hiển thị mờ các ngày thuộc tháng trước/tháng sau để lấp đầy ma trận 7x5 hoặc 7x6.
4. **Cơ chế Highlight trực quan:** Tự động gắn nhãn badge `"Hôm nay"` với màu xanh nổi bật, viền xanh cho ngày đang chọn và các badge ca khám thu nhỏ kèm giờ hẹn (ví dụ: `08:00 BS. Lê Hoàng Long`).

```javascript
// Trích đoạn hàm parseApptDate trong client/js/calendar.js
function parseApptDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  const str = String(dateInput).trim();
  // Tách SlotKey dạng "2026-10-31#08:00"
  if (str.includes("#")) {
    return parseApptDate(str.split("#")[0]);
  }
  // YYYY-MM-DD (ISO chuẩn từ DynamoDB)
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }
  return null;
}
```

<a id="13-ung-dung-calendar-tren-giao-dien-benh-nhan-tra-cuu-lich-hen"></a>

### 1.3. Ứng dụng Calendar trên Giao diện Bệnh nhân (Tra cứu lịch hẹn)
Khi bệnh nhân nhập số điện thoại tại trang tra cứu, hệ thống gọi API Gateway `GET /appointments?phone=...` (truy vấn GSI DynamoDB) và đưa dữ liệu vào `CareSyncCalendar.render()`:
- Bên trái là ma trận lịch biểu tháng: Người dùng dễ dàng chuyển tháng bằng nút điều hướng `<` và `>`, hoặc bấm `[Hôm nay]` để quay về ngày hiện tại.
- Bên phải là danh sách chi tiết các ca khám trong ngày được chọn, kèm theo nút **"Xem phiếu khám"** và **"Hủy lịch"**.

![Giao diện Calendar tra cứu lịch hẹn dành cho Bệnh nhân](../img/E2E_09_Lookup_Success_Cards.png)
_Hình 1.1: Giao diện Lịch biểu tra cứu thành công 2 ca khám ngày 31/10/2026 của bệnh nhân Bùi Anh Khôi (SĐT: 0988618668)._

<a id="14-ung-dung-calendar-tren-cong-bac-si-doctor-portal-dashboard"></a>

### 1.4. Ứng dụng Calendar trên Cổng Bác sĩ (Doctor Portal Dashboard)
Sau khi bác sĩ đăng nhập thành công bằng mã OTP email, Cổng Bác sĩ chuyển sang chế độ `mode: 'doctor'`:
- Hệ thống gọi API `GET /doctors/{id}/appointments` để tải toàn bộ ca bệnh thuộc quyền quản lý của bác sĩ.
- Lịch hiển thị rõ ràng số lượng ca khám trong tháng (ví dụ: `Tháng này: 1 ca khám`), phân biệt ca khám đã xác nhận bằng thẻ xanh lá, cho phép bác sĩ tra cứu nhanh và bấm xem phiếu khám chi tiết.

![Giao diện Bảng điều khiển Calendar của Bác sĩ](../img/E2E_15_Doctor_Portal_Dashboard.png)
_Hình 1.2: Giao diện Calendar của Bác sĩ Trương Ngọc Lam theo dõi ca khám ngày 01/11/2026._

---

<a id="2-kiem-thu-doc-lap-bo-api-tren-postman-postman-api-testing"></a>

## 2. Kiểm Thử Độc Lập Bộ API Trên Postman (Postman API Testing)

Nhằm nghiệm thu các tuyến API Backend đã triển khai trên AWS Lambda (`AppointmentBookingFunction`) thông qua HTTP API Gateway, SV2 đã thực hiện kiểm thử độc lập 5 kịch bản API cốt lõi trên Postman:

<a id="21-api-yeu-cau-huy-lich-kham--gui-ma-otp-post-appointmentsrequest-cancel"></a>

### 2.1. API Yêu cầu Hủy lịch khám & Gửi mã OTP (`POST /appointments/request-cancel`)

- **Ý nghĩa nghiệp vụ:** Kiểm tra thông tin ca khám dựa trên mã bác sĩ (`doctorId`) và khung giờ (`slotKey`). Sau đó, hệ thống sinh mã OTP ngẫu nhiên 6 chữ số, lưu hạn sử dụng 5 phút vào DynamoDB và gửi mã xác thực về email của bệnh nhân qua Amazon SNS Publish.
- **Phương thức (Method):** `POST`
- **Endpoint URL:** `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments/request-cancel`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):**
```json
{
  "doctorId": "DOC12",
  "slotKey": "2026-10-31#08:00"
}
```
- **Kết quả thực tế từ AWS (HTTP 200 OK - 473 ms):**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến email của bạn!",
  "maskedEmail": "th***@gmail.com",
  "appointmentId": "APT-1793382954775"
}
```

**Thử nghiệm trên Postman:**

![Minh chứng Postman: Yêu cầu gửi mã OTP hủy lịch](../img/postman_cancel_appointment_send_otp.png)
_Hình 2.1: Gửi thành công yêu cầu hủy lịch, hệ thống che mờ email `th***@gmail.com` để bảo mật danh tính._

---

<a id="22-api-xac-nhan-otp--tien-hanh-huy-lich-kham-post-appointmentsconfirm-cancel"></a>

### 2.2. API Xác nhận OTP & Tiến hành Hủy lịch khám (`POST /appointments/confirm-cancel`)

- **Ý nghĩa nghiệp vụ:** Đối chiếu mã OTP bệnh nhân cung cấp với mã lưu trong bảng `Appointments` và kiểm tra thời hạn hiệu lực. Khi hợp lệ, Lambda thực thi lệnh `DeleteCommand` trên DynamoDB để **giải phóng khung giờ khám** và gọi `DeleteScheduleCommand` để hủy lịch nhắc nhở trên Amazon EventBridge Scheduler.
- **Phương thức (Method):** `POST`
- **Endpoint URL:** `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments/confirm-cancel`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):**
```json
{
  "doctorId": "DOC12",
  "slotKey": "2026-10-31#08:00",
  "otp": "269800"
}
```
- **Kết quả thực tế từ AWS (HTTP 200 OK - 1.25 s):**
```json
{
  "success": true,
  "message": "Đã hủy lịch hẹn #APT-1793382954775 thành công và giải phóng khung giờ!",
  "appointmentId": "APT-1793382954775"
}
```

**Thử nghiệm trên Postman:**

![Minh chứng Postman: Xác nhận OTP và hủy lịch thành công](../img/postman_cancel_appointment_comfirm.png)
_Hình 2.2: Xác nhận OTP chính xác, lịch hẹn được xóa khỏi DynamoDB và giải phóng khung giờ._

---

<a id="23-api-gui-otp-dang-nhap-bac-si-post-authdoctorsend-otp"></a>

### 2.3. API Gửi OTP Đăng nhập Bác sĩ (`POST /auth/doctor/send-otp`)

- **Ý nghĩa nghiệp vụ:** Tiếp nhận địa chỉ email của bác sĩ, kiểm tra sự tồn tại trong danh bạ bác sĩ DynamoDB, tạo mã xác thực OTP 6 chữ số và gửi qua email để phục vụ xác thực đăng nhập không dùng mật khẩu (Passwordless Authentication).
- **Phương thức (Method):** `POST`
- **Endpoint URL:** `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/auth/doctor/send-otp`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):**
```json
{
  "email": "baokhangcoder@gmail.com"
}
```
- **Kết quả thực tế từ AWS (HTTP 200 OK - 1.08 s):**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi về email của Bác sĩ BS. CKI Huỳnh Ngọc Bảo Khang!",
  "doctorName": "BS. CKI Huỳnh Ngọc Bảo Khang",
  "email": "baokhangcoder@gmail.com",
  "debugOtp": "271452"
}
```

**Thử nghiệm trên Postman:**

![Minh chứng Postman: Gửi mã OTP đăng nhập Bác sĩ](../img/postman_send_otp.png)
_Hình 2.3: Gửi OTP đăng nhập thành công cho Bác sĩ Huỳnh Ngọc Bảo Khang kèm trường debugOtp hỗ trợ kiểm thử._

---

<a id="24-api-xac-minh-otp--dang-nhap-bac-si-post-authdoctorverify-otp"></a>

### 2.4. API Xác minh OTP & Đăng nhập Bác sĩ (`POST /auth/doctor/verify-otp`)

- **Ý nghĩa nghiệp vụ:** Kiểm tra đối chiếu mã OTP bác sĩ gửi lên với mã đã lưu trong hệ thống. Nếu trùng khớp và chưa hết hạn, Lambda cấp phiên làm việc hợp lệ và trả về thông tin chi tiết của bác sĩ phụ trách.
- **Phương thức (Method):** `POST`
- **Endpoint URL:** `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/auth/doctor/verify-otp`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):**
```json
{
  "email": "baokhangcoder@gmail.com",
  "otp": "271452"
}
```
- **Kết quả thực tế từ AWS (HTTP 200 OK - 1.00 s):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công! Chào mừng Bác sĩ BS. CKI Huỳnh Ngọc Bảo Khang.",
  "doctor": {
    "DoctorId": "DOC12",
    "id": "DOC12",
    "Name": "BS. CKI Huỳnh Ngọc Bảo Khang",
    "Specialty": "Nội tổng quát & Chẩn đoán hình ảnh",
    "Avatar": "assets/images/doctor-1.jpg",
    "Email": "baokhangcoder@gmail.com",
    "Phone": "0912345678",
    "Room": "Phòng 202 - Khu A"
  }
}
```

**Thử nghiệm trên Postman:**

![Minh chứng Postman: Xác minh OTP đăng nhập Bác sĩ thành công](../img/postman_verify_otp.png)
_Hình 2.4: Đăng nhập thành công, trả về thông tin bác sĩ BS. CKI Huỳnh Ngọc Bảo Khang._

---

<a id="25-api-lay-danh-sach-ca-kham-theo-bac-si-get-doctorsdoc01appointments"></a>

### 2.5. API Lấy danh sách ca khám theo Bác sĩ (`GET /doctors/DOC01/appointments`)

- **Ý nghĩa nghiệp vụ:** Truy vấn danh sách toàn bộ các ca khám bệnh hiện có thuộc về một bác sĩ cụ thể dựa trên `DoctorId`. Lambda thực hiện truy vấn trực tiếp vào khóa chính Partition Key `DoctorId` của bảng `Appointments`.
- **Phương thức (Method):** `GET`
- **Endpoint URL:** `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/doctors/DOC01/appointments`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):** *(None)*
- **Kết quả thực tế từ AWS (HTTP 200 OK - 1.44 s - 2.1 KB):**
```json
{
  "success": true,
  "message": "Lấy danh sách ca khám thành công!",
  "count": 6,
  "data": [
    {
      "AppointmentId": "APT01",
      "PatientName": "Nguyễn Văn An Bình",
      "PatientEmail": "anbinh.nguyen@gmail.com",
      "DoctorName": "BS. CKI Nguyễn Văn An",
      "DoctorSpecialty": "Nội tổng quát",
      "DoctorId": "DOC01",
      "Reason": "Khám sức khỏe tổng quát định kỳ",
      "Status": "CONFIRMED",
      "PatientId": "PAT01",
      "PatientPhone": "0912345601",
      "CreatedAt": "2026-10-17T09:00:00Z",
      "SlotKey": "2026-10-25#08:00"
    }
  ]
}
```

**Thử nghiệm trên Postman:**

![Minh chứng Postman: Lấy danh sách ca khám của Bác sĩ DOC01](../img/postman_get_appointments_by_doctorId.png)
_Hình 2.5: Trả về danh sách 6 ca khám của Bác sĩ Nguyễn Văn An từ DynamoDB._

---

<a id="3-danh-gia-chi-phi-van-hanh-tren-aws-billing--cost-optimization"></a>

## 3. Đánh Giá Chi Phí Vận Hành Trên AWS (Billing & Cost Optimization)

<a id="31-phan-tich-chi-phi-tung-dich-vu-theo-mo-hinh-serverless"></a>

### 3.1. Phân tích chi phí từng dịch vụ theo mô hình Serverless

Kiến trúc **100% Serverless** của CareSync được thiết kế tối ưu hóa chi phí triệt để dựa trên chính sách **AWS Free Tier** và hạn mức **AWS Academy Learner Lab ($100 budget)**:

1. **AWS Lambda (Compute):**
   - *Định mức Free Tier:* Miễn phí 1.000.000 requests/tháng và 3.200.000 giây tính toán (với mức RAM 128MB).
   - *Thực tế CareSync:* Bộ nhớ cấp phát 128MB, thời gian xử lý trung bình mỗi request ~120ms. Toàn bộ quá trình phát triển và kiểm thử tiêu tốn dưới 50.000 requests $\rightarrow$ **Chi phí: $0.00**.
2. **Amazon DynamoDB (NoSQL Database):**
   - *Định mức Free Tier:* Chế độ On-Demand kết hợp GSI miễn phí 25 GB dung lượng lưu trữ cùng 25 Read/Write Capacity Units (RCU/WCU).
   - *Thực tế CareSync:* Dữ liệu 3 bảng (`Appointments`, `Doctors`, `Patients`) chiếm chưa tới 5 MB $\rightarrow$ **Chi phí: $0.00**.
3. **Amazon API Gateway (HTTP API v2):**
   - *Định mức:* HTTP API có giá $1.00 cho mỗi 1.000.000 requests (tiết kiệm hơn 70% so với REST API).
   - *Thực tế CareSync:* Dưới 10.000 lượt gọi $\rightarrow$ **Chi phí: ~$0.00**.
4. **Amazon S3 (Static Website Hosting):**
   - *Định mức Free Tier:* 5 GB dung lượng Standard Storage và 20.000 lượt GET requests miễn phí mỗi tháng.
   - *Thực tế CareSync:* Dung lượng frontend chỉ ~2.5 MB (HTML/CSS/JS) $\rightarrow$ **Chi phí: $0.00**.
5. **Amazon SNS & EventBridge Scheduler (Notification & Automation):**
   - *Định mức:* SNS miễn phí 1.000 email gửi ra mỗi tháng; EventBridge Scheduler miễn phí 14.000.000 invocations mỗi tháng.
   - *Thực tế CareSync:* Sử dụng khoảng 200 lượt gửi email thông báo và nhắc hẹn $\rightarrow$ **Chi phí: $0.00**.
6. **AWS KMS (Key Management Service):**
   - *Định mức:* 1 Customer Managed Key (CMK) có giá $1.00/tháng và 20.000 requests miễn phí.
   - *Thực tế CareSync:* Khóa `alias/caresync-patient-key` tiêu tốn $1.00/tháng, được trừ thẳng vào số dư tín dụng $100 của AWS Academy mà không phát sinh chi phí tiền túi.

<a id="32-bang-tong-hop-chi-phi-thuc-te-va-so-sanh"></a>

### 3.2. Bảng tổng hợp chi phí thực tế và so sánh

| Dịch vụ AWS cốt lõi | Chế độ triển khai | Định mức miễn phí (Free Tier) | Mức tiêu thụ CareSync | Chi phí thực tế |
| :--- | :--- | :--- | :--- | :---: |
| **AWS Lambda** | Node.js 18.x (128MB) | 1,000,000 req / tháng | ~5,000 req | **$0.00** |
| **Amazon DynamoDB** | On-Demand (kèm GSI) | 25 RCU/WCU & 25GB Storage | < 5 MB | **$0.00** |
| **Amazon API Gateway** | HTTP API (Payload v2) | $1.00 / 1,000,000 req | ~5,000 req | **$0.00** |
| **Amazon S3** | Static Website Hosting | 5 GB Storage & 20,000 GET | ~2.5 MB | **$0.00** |
| **Amazon SNS** | Topic Email Pub/Sub | 1,000 email notification | ~200 emails | **$0.00** |
| **EventBridge Scheduler** | Flexible One-time Schedule | 14,000,000 invocations | ~100 schedules | **$0.00** |
| **AWS KMS** | Symmetric CMK (256-bit) | 20,000 requests | ~500 operations | **$1.00** *(trừ tín dụng Lab)* |
| **TỔNG CỘNG** | **100% Serverless** | -- | -- | **$0.00 / tháng** *(Người dùng)* |

> **Nhận xét kiến trúc:** So với mô hình thuê máy chủ ảo truyền thống (EC2 t2.micro ~$8.50 - $12.00/tháng) phải chạy liên tục 24/7 kể cả khi không có người khám, kiến trúc Serverless của CareSync chỉ tính tiền khi có request ("Pay-as-you-go"), giúp tiết kiệm **100% ngân sách hạ tầng** trong suốt quá trình làm đồ án.

---

<a id="4-lap-checklist--ke-hoach-don-dep-tai-nguyen-aws-resource-cleanup"></a>

## 4. Lập Checklist & Kế Hoạch Dọn Dẹp Tài Nguyên AWS (Resource Cleanup)

<a id="41-thu-tu-huy-tai-nguyen-an-toan-dependency-order"></a>

### 4.1. Thứ tự hủy tài nguyên an toàn (Dependency Order)
Để tránh xung đột phụ thuộc (ví dụ không thể xóa IAM Role khi Lambda còn đang gắn, hoặc không thể xóa S3 Bucket khi còn chứa tệp), quy trình dọn dẹp cần thực hiện tuần tự theo chiều từ ngoài vào trong:

```
[EventBridge Schedules] ──> [SNS Topic & Subscriptions] ──> [API Gateway HTTP API]
          │
          ▼
   [AWS Lambda Function] ──> [S3 Bucket (Empty & Delete)] ──> [DynamoDB Tables] ──> [AWS KMS Key Deletion]
```

<a id="42-bang-checklist-giai-phong-tai-nguyen-learner-lab"></a>

### 4.2. Bảng checklist giải phóng tài nguyên Learner Lab

| STT | Tài nguyên cần dọn dẹp | Tên định danh (Resource Name) | Thao tác thực hiện trên AWS Console / CLI | Trạng thái nghiệm thu |
| :-: | :--- | :--- | :--- | :---: |
| 1 | **EventBridge Schedules** | `CareSync-remind-*` | Mở EventBridge Console $\rightarrow$ Schedules $\rightarrow$ Xóa tất cả lịch hẹn giờ một lần đang chờ. | [ ] Sẵn sàng |
| 2 | **Amazon SNS Topic** | `CareSync-AppointmentNotice` | Mở SNS Console $\rightarrow$ Xóa các email Subscriptions $\rightarrow$ Delete Topic. | [ ] Sẵn sàng |
| 3 | **Amazon API Gateway** | `CareSync-API` (`2q1b3nxtkg`) | Mở API Gateway Console $\rightarrow$ Chọn API $\rightarrow$ Actions $\rightarrow$ Delete API. | [ ] Sẵn sàng |
| 4 | **AWS Lambda** | `AppointmentBookingFunction` | Mở Lambda Console $\rightarrow$ Actions $\rightarrow$ Delete Function. | [ ] Sẵn sàng |
| 5 | **Amazon S3 Bucket** | `caresync-web-hosting` | Mở S3 Console $\rightarrow$ Empty Bucket (xóa sạch objects) $\rightarrow$ Delete Bucket. | [ ] Sẵn sàng |
| 6 | **Amazon DynamoDB** | `Appointments`, `Doctors`, `Patients` | Mở DynamoDB Console $\rightarrow$ Tables $\rightarrow$ Delete Table (xóa cả GSI). | [ ] Sẵn sàng |
| 7 | **AWS KMS Key** | `alias/caresync-patient-key` | Mở KMS Console $\rightarrow$ Customer managed keys $\rightarrow$ Key actions $\rightarrow$ Schedule key deletion (7 ngày). | [ ] Sẵn sàng |

---

_Báo cáo thực hành Tuần 4 hoàn thành ngày 31 tháng 10 năm 2026._  
**Sinh viên thực hiện:** Huỳnh Ngọc Bảo Khang (MSSV: 24110241)
