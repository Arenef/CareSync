# Báo Cáo Minh Chứng Thực Hành Tuần 2 - SV2 Huỳnh Ngọc Bảo Khang

**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE
**Dự án:** Hệ thống đặt lịch khám bệnh CareSync
**Sinh viên thực hiện:** Huỳnh Ngọc Bảo Khang
**MSSV:** 24110241
**Vai trò:** SV2 – Backend Serverless & Tích hợp Frontend
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)
**Nhánh (Branch):** `main`

---

## Mục Lục

- [1. Kiểm tra Cấu trúc và Dữ liệu CSDL Amazon DynamoDB](#1-kiểm-tra-cấu-trúc-và-dữ-liệu-csdl-amazon-dynamodb)
  - [1.1. Tổng quan 3 bảng trong hệ thống](#11-tổng-quan-3-bảng-trong-hệ-thống)
  - [1.2. Bảng Doctors (Danh mục Bác sĩ)](#12-bảng-doctors-danh-mục-bác-sĩ)
  - [1.3. Bảng Appointments (Hồ sơ Lịch khám bệnh)](#13-bảng-appointments-hồ-sơ-lịch-khám-bệnh)
  - [1.4. Bảng Patients (Hồ sơ Bệnh nhân)](#14-bảng-patients-hồ-sơ-bệnh-nhân)
- [2. Tái cấu trúc Mã nguồn AWS Lambda theo Clean Architecture](#2-tái-cấu-trúc-mã-nguồn-aws-lambda-theo-clean-architecture)
- [3. Tích hợp Giao diện Web (Frontend) với AWS API Gateway](#3-tích-hợp-giao-diện-web-frontend-với-aws-api-gateway)
  - [3.1. Hiển thị danh bạ 10 bác sĩ động từ DynamoDB (GET /doctors)](#31-hiển-thị-danh-bạ-10-bác-sĩ-động-từ-dynamodb-get-doctors)
  - [3.2. Đặt lịch khám và xuất vé điện tử thành công (POST /appointments - 201 Created)](#32-đặt-lịch-khám-và-xuất-vé-điện-tử-thành-công-post-appointments---201-created)
  - [3.3. Cơ chế chặn trùng lịch khám trực quan (POST /appointments - 409 Conflict)](#33-cơ-chế-chặn-trùng-lịch-khám-trực-quan-post-appointments---409-conflict)
- [4. Kiểm thử Độc lập API trên Postman](#4-kiểm-thử-độc-lập-api-trên-postman)
  - [4.1. Test API GET /doctors](#41-test-api-get-doctors)
  - [4.2. Test API POST /appointments thành công (201 Created)](#42-test-api-post-appointments-thành-công-201-created)
  - [4.3. Test API POST /appointments chống trùng lịch (409 Conflict)](#43-test-api-post-appointments-chống-trùng-lịch-409-conflict)
- [5. Bảng tổng hợp Git Commits Tuần 2](#5-bảng-tổng-hợp-git-commits-tuần-2)

---

## 1. Kiểm tra Cấu trúc và Dữ liệu CSDL Amazon DynamoDB

### 1.1. Tổng quan 3 bảng trong hệ thống

Hệ thống CareSync trên AWS DynamoDB khu vực `us-east-1` được cấu hình đầy đủ 3 bảng dữ liệu ở trạng thái **Active**: `Doctors`, `Appointments` và `Patients`.

![Tổng quan 3 bảng trên Amazon DynamoDB](../img/dynamoDB_overview.png)

---

### 1.2. Bảng Doctors (Danh mục Bác sĩ)

* **Khóa chính (Partition Key):** `DoctorId` (String).
* **Dữ liệu thực tế:** Đã nạp thành công 10 bản ghi bác sĩ mẫu với các thuộc tính: `Name`, `Specialty`, `Room`, `Phone`, `Email`, `Avatar`, `IsActive: true`.
* **Mục đích:** Cung cấp nguồn dữ liệu bác sĩ tập trung, phục vụ API `GET /doctors` nạp động lên website.

![Dữ liệu 10 bác sĩ trong bảng Doctors](../img/dynamoDB_doctors.png)

---

### 1.3. Bảng Appointments (Hồ sơ Lịch khám bệnh)

* **Khóa chính kết hợp (Composite Primary Key):**
  * **Partition Key (PK):** `DoctorId` (String) – Mã định danh bác sĩ.
  * **Sort Key (SK):** `SlotKey` (String) – Khóa ghép thời gian chuẩn hóa theo cú pháp `YYYY-MM-DD#HH:mm` (Ví dụ: `2026-10-25#09:00`).
* **Ý nghĩa thiết kế:** Sự kết hợp duy nhất giữa `DoctorId` và `SlotKey` cho phép DynamoDB áp dụng kiểm tra nguyên tử (Atomic Check) thông qua `ConditionExpression: "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)"`, chặn đứng triệt để tình trạng hai bệnh nhân đặt trùng cùng một giờ khám của cùng một bác sĩ.

![Cấu trúc và dữ liệu bảng Appointments](../img/dynamoDB_appointment.png)

---

### 1.4. Bảng Patients (Hồ sơ Bệnh nhân)

* **Khóa chính (Partition Key):** `PatientId` (String).
* **Mục đích:** Lưu trữ hồ sơ định danh bệnh nhân, chuẩn bị sẵn sàng cho module xác thực và lịch sử khám bệnh.

![Cấu trúc bảng Patients trên DynamoDB](../img/dynamoDB_patients.png)

---

## 2. Tái cấu trúc Mã nguồn AWS Lambda theo Clean Architecture

Thay vì duy trì mô hình nguyên khối (Lambdalith) dễ phát sinh lỗi khi mở rộng, tôi đã tái cấu trúc toàn bộ mã nguồn của hàm **`AppointmentBookingFunction`** theo mô hình phân tầng **Routes – Controller – Service**:

* **`config/db.js`:** Khởi tạo `DynamoDBDocumentClient` singleton kết nối AWS SDK v3, tối ưu tái sử dụng kết nối TCP giữa các lần thực thi.
* **`service/`:** Xử lý nghiệp vụ thuần túy và tương tác CSDL (`doctor.service.js`, `appointment.service.js`).
* **`controller/`:** Tiếp nhận request, định dạng mã phản hồi HTTP chuẩn Native Lambda (`statusCode`, `headers`, `body`), bắt lỗi `ConditionalCheckFailedException` để trả về HTTP `409 Conflict`.
* **`routes/`:** Phân luồng endpoint `/doctors` và `/appointments`.
* **`index.js`:** Đóng vai trò Central Dispatcher, xử lý CORS preflight `OPTIONS` và điều phối request.

Cấu trúc phân tầng hoàn chỉnh đã được đóng gói thành file ZIP và tải lên AWS Lambda Console, thiết lập `Runtime settings: index.handler`:

![Cấu trúc mã nguồn phân tầng trên AWS Lambda Console](../img/src_code_aws.png)

---

## 3. Tích hợp Giao diện Web (Frontend) với AWS API Gateway

### 3.1. Hiển thị danh bạ 10 bác sĩ động từ DynamoDB (GET /doctors)

* **Cơ chế:** Khi mở trang web, hàm `initDoctors()` trong `client/js/doctors.js` gọi bất đồng bộ `CareSyncAPI.doctorApi.getAll()`.
* **Kết quả:** Trình duyệt gửi request `GET https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/doctors`, nhận phản hồi **`200 OK`** và render 10 thẻ bác sĩ thật lên màn hình (thay thế hoàn toàn dữ liệu mẫu tĩnh).

![Giao diện danh bạ bác sĩ render động kèm Network 200 OK](../img/deploy_get_doctor.png)

---

### 3.2. Đặt lịch khám và xuất vé điện tử thành công (POST /appointments - 201 Created)

* **Cơ chế:** Bệnh nhân điền form đặt lịch, chọn ngày khám và khung giờ $\rightarrow$ Bấm **"Xác nhận đặt lịch"**.
* **Kết quả:** Request `POST /appointments` gửi payload JSON lên API Gateway $\rightarrow$ Lambda ghi vào bảng `Appointments` $\rightarrow$ Trả về mã **`201 Created`**. Giao diện lập tức hiển thị popup **Vé xác nhận khám bệnh** có mã `APT-...` thật.

![Đặt lịch thành công, hiển thị vé khám kèm Network 201 Created](../img/deploy_appointment.png)

---

### 3.3. Cơ chế chặn trùng lịch khám trực quan (POST /appointments - 409 Conflict)

* **Cơ chế:** Cố tình bấm nút **"Xác nhận đặt lịch"** lại đúng khung giờ và bác sĩ vừa đặt.
* **Kết quả:**
  * Biểu thức `ConditionExpression` của DynamoDB phát hiện trùng khóa `SlotKey`, từ chối ghi và ném lỗi `ConditionalCheckFailedException`.
  * Lambda trả về mã lỗi **`409 Conflict`**.
  * Giao diện bắt đúng mã 409: hiển thị thông báo Toast cảnh báo màu vàng *"Trùng lịch khám! Khung giờ này vừa có người đặt rồi! Vui lòng chọn khung giờ khác"* và tự động **vô hiệu hóa (khóa nút `disabled`)** khung giờ đó.

![Cảnh báo trùng lịch, vô hiệu hóa nút giờ kèm Network 409 Conflict](../img/deploy_appointment_conflict.png)

---

## 4. Kiểm thử Độc lập API trên Postman

Để chứng minh tính độc lập và khả năng hoạt động chuẩn RESTful của Backend Serverless, tôi đã xây dựng bộ test case kiểm thử trực tiếp trên Postman:

### 4.1. Test API GET /doctors

* **Endpoint:** `GET https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/doctors`
* **Kết quả:** HTTP **`200 OK`**, thời gian phản hồi nhanh, Body trả về JSON danh sách 10 bác sĩ từ DynamoDB.

![Kiểm thử GET /doctors trên Postman](../img/postman_get_doctor.png)

---

### 4.2. Test API POST /appointments thành công (201 Created)

* **Endpoint:** `POST https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments`
* **Payload:** JSON thông tin đặt lịch hợp lệ.
* **Kết quả:** HTTP **`201 Created`**, Body trả về dữ liệu phiếu hẹn kèm mã `AppointmentId: APT-...` và `Status: CONFIRMED`.

![Kiểm thử POST /appointments thành công trên Postman](../img/postman_post_appointment.png)

---

### 4.3. Test API POST /appointments chống trùng lịch (409 Conflict)

* **Endpoint:** `POST https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments`
* **Kịch bản:** Gửi lại dữ liệu trùng lặp y hệt mục 4.2 (cùng `doctorId`, cùng ngày và cùng `slotTime`).
* **Kết quả:** HTTP **`409 Conflict`**, Body trả về thông báo lỗi:
  `"error": "Khung giờ này của bác sĩ đã có người đặt trước. Vui lòng chọn giờ khác!"`.

![Kiểm thử chống trùng lịch 409 Conflict trên Postman](../img/postman_post_appointment_conflict.png)

---

## 5. Danh Sách Git Commits Tuần 2

Toàn bộ quá trình phát triển mã nguồn Tuần 2 của sinh viên Huỳnh Ngọc Bảo Khang được commit tuần tự, tuân thủ nghiêm ngặt quy chuẩn Conventional Commits:

### 1. Commit 1: Cấu hình DynamoDB & Tầng Service

* **Nội dung commit:** `feat(service): cấu hình DynamoDB us-east-1 và xây dựng service doctor, appointment, đặt lịch chống trùng`
* **Link tương ứng:** https://github.com/Arenef/CareSync/commit/ffdc1f63191158283b46c7318e8db244ff599dcf
* **Mô tả chi tiết:** Cấu hình DynamoDB DocumentClient singleton (`config/db.js`), xây dựng tầng nghiệp vụ `doctor.service.js` và `appointment.service.js` với biểu thức Conditional Write chống trùng lịch nguyên tử.

---

### 2. Commit 2: Tầng Controller, Routes & Lambda Handler

* **Nội dung commit:** `feat(lambda): hoàn thiện controller chuẩn Lambda, định tuyến routes và xử lý CORS preflight`
* **Link tương ứng:** https://github.com/Arenef/CareSync/commit/971878f1240a0b18c83e63e6c20beadf514ed80e
* **Mô tả chi tiết:** Xây dựng tầng `controller` định dạng response Native Lambda, bắt lỗi 409 Conflict, xây dựng router và entrypoint `index.js` điều phối request và CORS `OPTIONS`.

---

### 3. Commit 3: Tích hợp Frontend đọc danh sách Bác sĩ

* **Nội dung commit:** `feat(client): tích hợp API Gateway nạp và hiển thị động danh sách 10 bác sĩ từ DynamoDB`
* **Link tương ứng:** https://github.com/Arenef/CareSync/commit/998710656de27e2402284ae079418dee6df3b0b3
* **Mô tả chi tiết:** Xây dựng client API tập trung (`client/js/api.js`), ánh xạ dữ liệu DynamoDB và nạp danh bạ 10 bác sĩ thật lên giao diện web (`client/js/doctors.js`).

---

### 4. Commit 4: Tích hợp Đặt lịch & Chống trùng lịch 409

* **Nội dung commit:** `feat(booking): kết nối API đặt lịch khám thành công và xử lý chặn trùng lịch với mã lỗi 409`
* **Link tương ứng:** https://github.com/Arenef/CareSync/commit/4f641ddbedd91df48b4758333399fcd78300ce52
* **Mô tả chi tiết:** Tích hợp xử lý gửi form đặt lịch (`client/js/booking.js`), xuất vé khám điện tử và xử lý cảnh báo trùng lịch 409 (khóa nút giờ khám).
