# Báo Cáo Thực Hiện Tuần 3 - Dự Án CareSync

**Đề tài:** Hệ thống đặt lịch khám bệnh cho phòng khám trực tuyến (CareSync)  
**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Nhóm thực hiện:** Domain Apps  
**Thành viên:**

- **SV1:** Bùi Anh Khôi – MSSV: 24110258
- **SV2:** Huỳnh Ngọc Bảo Khang – MSSV: 24110241  
  **GitHub Repository:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
  **Nhánh chính (Branch):** `main`

---

## Mục Lục

- [Báo Cáo Thực Hiện Tuần 3 - Dự Án CareSync](#báo-cáo-thực-hiện-tuần-3---dự-án-caresync)
  - [Mục Lục](#mục-lục)
  - [1. Tổng Quan Nhiệm Vụ Tuần 3](#1-tổng-quan-nhiệm-vụ-tuần-3)
    - [1.1. Bảng phân công nhiệm vụ chi tiết](#11-bảng-phân-công-nhiệm-vụ-chi-tiết)
    - [1.2. Kiến trúc giải pháp hệ thống Tuần 3](#12-kiến-trúc-giải-pháp-hệ-thống-tuần-3)
  - [2. Chi Tiết Triển Khai Kỹ Thuật](#2-chi-tiết-triển-khai-kỹ-thuật)
    - [2.1. Tích hợp Thông báo Tự động SNS \& EventBridge Scheduler](#21-tích-hợp-thông-báo-tự-động-sns--eventbridge-scheduler)
    - [2.2. Module Lưu trữ Hồ sơ Bệnh nhân Song song](#22-module-lưu-trữ-hồ-sơ-bệnh-nhân-song-song)
    - [2.3. Tối ưu Truy vấn DynamoDB qua Global Secondary Index (GSI)](#23-tối-ưu-truy-vấn-dynamodb-qua-global-secondary-index-gsi)
    - [2.4. API Backend Tra cứu Lịch hẹn theo Số điện thoại](#24-api-backend-tra-cứu-lịch-hẹn-theo-số-điện-thoại)
    - [2.5. Triển khai Hosting S3 và Phân tích Rào cản CloudFront OAC](#25-triển-khai-hosting-s3-và-phân-tích-rào-cản-cloudfront-oac)
  - [3. Kết Quả Kiểm Thử Hệ Thống](#3-kết-quả-kiểm-thử-hệ-thống)
    - [3.1. Bảng ma trận kết quả kiểm thử API Tuần 3](#31-bảng-ma-trận-kết-quả-kiểm-thử-api-tuần-3)
    - [3.2. Cấu hình SNS Topic \& Deploy Lambda Backend](#32-cấu-hình-sns-topic--deploy-lambda-backend)
  - [4. Đánh Giá Kết Quả và Kế Hoạch Tuần Tiếp Theo](#4-đánh-giá-kết-quả-và-kế-hoạch-tuần-tiếp-theo)
    - [4.1. Đánh giá kết quả Tuần 3](#41-đánh-giá-kết-quả-tuần-3)
    - [4.2. Kế hoạch Tuần 4](#42-kế-hoạch-tuần-4)

---

## 1. Tổng Quan Nhiệm Vụ Tuần 3

### 1.1. Bảng phân công nhiệm vụ chi tiết

> Xem chi tiết phân công, số giờ thực hiện và minh chứng thực tế: [BangPhanCongWeek3.md](BangPhanCongWeek3.md)

| STT | Thành viên                     | Nhiệm vụ cụ thể                                                    | Tài nguyên AWS / File mã nguồn                             | Kết quả đạt được                                                                                   |
| :-: | :----------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
|  1  | **Bùi Anh Khôi (SV1)**         | Tích hợp SNS & Scheduler vào quy trình đặt lịch chính thức         | `server/lambda/service/appointment.service.js`             | Gửi email xác nhận ngay sau khi ghi DB và tự động tạo lịch nhắc sau 2 phút qua EventBridge.        |
|  2  | **Bùi Anh Khôi (SV1)**         | Viết module lưu trữ hồ sơ bệnh nhân                                | `server/lambda/service/patient.service.js`                 | Lưu/cập nhật thông tin bệnh nhân vào bảng `Patients` song song khi đặt lịch khám.                  |
|  3  | **Bùi Anh Khôi (SV1)**         | Xây dựng giao diện Form & Modal "Lịch hẹn của tôi"                 | `client/index.html`, `client/js/api.js`                    | Giao diện tra cứu lịch hẹn trực quan theo số điện thoại bệnh nhân.                                 |
|  4  | **Bùi Anh Khôi (SV1)**         | Triển khai mã hóa dữ liệu nhạy cảm bằng AWS KMS                    | `server/lambda/service/kms.service.js`, AWS KMS            | Tạo CMK Key `alias/caresync-patient-key` và hàm mã hóa/giải mã SĐT/CCCD.                           |
|  5  | **Huỳnh Ngọc Bảo Khang (SV2)** | Tạo Global Secondary Index (GSI) trên bảng Appointments            | AWS DynamoDB Console                                       | Tạo GSI `PatientPhone-index` (Partition Key: `PatientPhone`) ở trạng thái `Active`.                |
|  6  | **Huỳnh Ngọc Bảo Khang (SV2)** | Viết API Backend tra cứu lịch hẹn theo SĐT                         | `routes/`, `controller/`, `service/appointment.service.js` | Hoàn thiện endpoint `GET /appointments?phone=...` qua `QueryCommand` (HTTP 200 OK).                |
|  7  | **Huỳnh Ngọc Bảo Khang (SV2)** | Cấu hình SNS Topic & Deploy Lambda Backend                         | Amazon SNS, AWS Lambda Console                             | Khởi tạo Topic `CareSync-AppointmentNotice`, config biến môi trường và deploy code.                |
|  8  | **Huỳnh Ngọc Bảo Khang (SV2)** | Triển khai Hosting S3 kết hợp CloudFront                           | Amazon S3, Amazon CloudFront                               | Upload 19 file `client/` lên S3, phân tích rào cản IAM CloudFront và kích hoạt S3 Website Hosting. |
|  9  | **Cả hai thành viên**          | Kiểm thử End-to-End, xuất Postman Collection và hoàn thiện báo cáo | `docs/CareSync_Week3.postman_collection.json`, CloudWatch  | Nghiệm thu toàn bộ luồng nghiệp vụ trên môi trường đám mây thực tế.                                |

---

### 1.2. Kiến trúc giải pháp hệ thống Tuần 3

```
[ Người dùng / Trình duyệt Web ]
              │
              ▼
   [ Amazon S3 Static Hosting ] (Giao diện HTML/CSS/JS)
              │ (Fetch REST API)
              ▼
    [ Amazon API Gateway ] (HTTP API Endpoint: 2q1b3nxtkg)
              │
              ▼
    [ AWS Lambda Handler ] (AppointmentBookingFunction)
       ├── routes/ (doctor.routes, appointment.routes)
       ├── controller/ (Response Formatting, Validation, 409 Conflict)
       └── service/
              ├── doctor.service.js
              ├── patient.service.js ─────────────► [ DynamoDB: Patients ]
              ├── kms.service.js ─────────────────► [ AWS KMS: Customer Managed Key ]
              └── appointment.service.js
                     ├── PutItem (Chống trùng) ──► [ DynamoDB: Appointments ]
                     ├── QueryItem (GSI O(1)) ───► [ GSI: PatientPhone-index ]
                     ├── PublishCommand ─────────► [ Amazon SNS: CareSync-AppointmentNotice ]
                     │                                         │
                     │                                         ▼ (Email ngay lập tức)
                     │                              [ Hộp thư Gmail Bệnh nhân ]
                     │                                         ▲
                     └── CreateScheduleCommand ─┐              │ (Nhắc hẹn sau 2 phút)
                                                ▼              │
                                   [ EventBridge Scheduler ] ──┘
```

---

## 2. Chi Tiết Triển Khai Kỹ Thuật

### 2.1. Tích hợp Thông báo Tự động SNS & EventBridge Scheduler

- Sau khi ghi nhận lịch khám vào DynamoDB, Lambda đọc `process.env.SNS_TOPIC_ARN` và kích hoạt lệnh `PublishCommand` gửi email xác nhận tức thì.
- Sử dụng `process.env.SCHEDULER_ROLE_ARN` để gọi `CreateScheduleCommand` với biểu thức `at(YYYY-MM-DDTHH:mm:ss)` lên Amazon EventBridge Scheduler, tự động kích hoạt thông báo nhắc hẹn sau 2 phút và xóa lịch trình sau khi hoàn thành (`ActionAfterCompletion: DELETE`).

### 2.2. Module Lưu trữ Hồ sơ Bệnh nhân Song song

- Tách biệt nghiệp vụ quản lý bệnh nhân tại `patient.service.js`.
- Hàm `saveOrUpdatePatient` sử dụng `PutCommand` ghi nhận dữ liệu vào bảng `Patients` theo mã định danh duy nhất `PAT-<cleanPhone>`, đảm bảo đồng bộ hóa hồ sơ bệnh nhân khi phát sinh lượt đặt lịch mới.

### 2.3. Tối ưu Truy vấn DynamoDB qua Global Secondary Index (GSI)

- Bảng `Appointments` sử dụng khóa chính kết hợp `DoctorId` + `SlotKey` để kiểm soát chống trùng giờ khám.
- Để phục vụ tính năng tra cứu theo số điện thoại bệnh nhân, SV2 đã cấu hình GSI mang tên **`PatientPhone-index`** với Partition Key là **`PatientPhone` (String)** và Attribute Projections là **`All`**.
- Việc truy vấn qua GSI giúp chuyển đổi từ phép quét toàn bảng `Scan` ($O(N)$) sang phép truy vấn chỉ mục `Query` ($O(1)$), giảm tối đa thời gian đáp ứng và chi phí RCU.

### 2.4. API Backend Tra cứu Lịch hẹn theo Số điện thoại

- **Endpoint:** `GET /appointments?phone=<Số_điện_thoại>`
- Phân luồng chuẩn Clean Architecture:
  - `routes/appointment.routes.js`: Định tuyến request `GET`.
  - `controller/appointment.controller.js`: Đọc query parameter `phone`, kiểm tra dữ liệu và định dạng phản hồi chuẩn Native Lambda.
  - `service/appointment.service.js`: Thực thi `QueryCommand` với `IndexName: "PatientPhone-index"`.
- **Cấu hình trên Amazon API Gateway:** Tạo Route `GET /appointments` và gắn integration tới Lambda `AppointmentBookingFunction`:

![Cấu hình Route GET appointments trên Amazon API Gateway](img/route_get_appointment.png)

### 2.5. Triển khai Hosting S3 và Phân tích Rào cản CloudFront OAC

- Upload thành công 19 file mã nguồn `client/` lên S3 Bucket `appointment-booking-web-demo`:

![Upload toàn bộ 19 file giao diện lên Amazon S3 thành công](img/upload_client_folder_to_S3.png)

- Trong quá trình cấu hình CloudFront Distribution kết hợp OAC, hệ thống AWS Academy Learner Lab kích hoạt cơ chế Permission Boundary chặn các hành động `cloudfront:CreateOriginAccessControl` và `cloudfront:ListDistributions`.
- Nhóm áp dụng kiến trúc dự phòng tiêu chuẩn: Kích hoạt **S3 Static Website Hosting** với Bucket Policy cấp quyền Public Read. Website hoạt động ổn định và sẵn sàng truy cập tại:  
  `http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com`.

![Giao diện website CareSync hoạt động trên S3 Static Website Hosting](img/website.png)

---

## 3. Kết Quả Kiểm Thử Hệ Thống

### 3.1. Bảng ma trận kết quả kiểm thử API Tuần 3

| STT | Phương thức & Endpoint               | Mục đích kiểm thử                            | Mã phản hồi kỳ vọng |                 Kết quả thực tế                 | Trạng thái |
| :-: | :----------------------------------- | :------------------------------------------- | :-----------------: | :---------------------------------------------: | :--------: |
|  1  | `GET /doctors`                       | Lấy danh sách 10 bác sĩ từ DynamoDB          |       200 OK        |    Trả về 10 bản ghi bác sĩ đầy đủ thông tin    |  **Đạt**   |
|  2  | `POST /appointments`                 | Đặt lịch khám mới, kích hoạt SNS & Scheduler |     201 Created     | Ghi nhận DB, mã `APT-...`, gửi email thành công |  **Đạt**   |
|  3  | `POST /appointments`                 | Kiểm thử cơ chế chặn trùng lịch khám         |    409 Conflict     |    Bắt lỗi `ConditionalCheckFailedException`    |  **Đạt**   |
|  4  | `GET /appointments?phone=0934567803` | Tra cứu lịch hẹn theo SĐT qua GSI            |       200 OK        |     Trích xuất chính xác danh sách ca khám      |  **Đạt**   |
|  5  | `GET /appointments`                  | Kiểm tra validation khi thiếu SĐT            |   400 Bad Request   |     Báo lỗi yêu cầu cung cấp số điện thoại      |  **Đạt**   |

_(Bộ sưu tập Postman collection đầy đủ đã được xuất và lưu trữ tại `docs/CareSync_Week3.postman_collection.json`)_.

Minh chứng kiểm thử tra cứu lịch hẹn qua GSI trên Postman:

![Kiểm thử Postman tra cứu lịch hẹn theo SĐT thành công 200 OK](img/postman_get_appointment.png)

---

### 3.2. Cấu hình SNS Topic & Deploy Lambda Backend

- Khởi tạo Topic SNS `CareSync-AppointmentNotice`:

![Tạo Topic SNS CareSync-AppointmentNotice](img/create_topic.png)

- Xác nhận Email Subscription trạng thái `Confirmed`:

![Xác nhận Subscription Email Confirmed trên SNS](img/create_subscription.png)

- Cấu hình biến môi trường trên Lambda Console:

![Cấu hình Environment Variables trên Lambda Console](img/environment_var.png)

- Deploy mã nguồn phân tầng mới nhất lên Lambda Console:

![Deploy thành công mã nguồn mới lên Lambda Console](img/deploy_new_code.png)

---

## 4. Đánh Giá Kết Quả và Kế Hoạch Tuần Tiếp Theo

### 4.1. Đánh giá kết quả Tuần 3

- **Điểm đạt được:**
  - Hoàn thành 100% các mục tiêu kỹ thuật đề ra cho Tuần 3 của cả 2 thành viên.
  - Tích hợp thành công luồng thông báo tự động hóa kết hợp SNS và EventBridge Scheduler.
  - Tối ưu hóa hiệu năng truy vấn CSDL DynamoDB với Global Secondary Index.
  - Nhận diện và xử lý linh hoạt rào cản phân quyền phòng lab đám mây bằng giải pháp kiến trúc dự phòng S3 Website Hosting.
- **Tỷ lệ hoàn thành nhiệm vụ:** 100%.

### 4.2. Kế hoạch Tuần 4

- Hoàn thiện bảo mật dữ liệu nhạy cảm nâng cao (mã hóa CCCD/SĐT trước khi ghi DB).
- Kiểm thử tải (Load Testing) và tối ưu hóa chi phí vận hành Serverless.
- Chuẩn bị slide thuyết trình và video demo sản phẩm cuối kỳ.
