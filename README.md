# 🏥 CareSync - Hệ Thống Đặt Lịch Khám Bệnh Trực Tuyến Serverless

> **Đồ án môn học:** Điện toán đám mây (Cloud Computing) – Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)  
> **Thành viên nhóm:**
>
> - Bùi Anh Khôi – MSSV: 24110258 (SV1)
> - Huỳnh Ngọc Bảo Khang – MSSV: 24110241 (SV2)
>
> 🌐 **Website Demo (Amazon S3 Hosting):** [http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com](http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com)  
> 📦 **GitHub Repository:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync) (Branch: `main`)
>
> ⚠️ **Lưu ý quan trọng về môi trường thử nghiệm (AWS Academy Learner Lab):**  
> Toàn bộ hạ tầng Backend (API Gateway, Lambda, DynamoDB, KMS, SNS) được triển khai trên tài khoản thực hành **AWS Academy Learner Lab**. Do cơ chế phòng lab có thời hạn phiên làm việc và cần nhấn _Start Lab_ thủ công, các kết nối API đám mây sẽ hoạt động đầy đủ khi tài khoản lab đang ở trạng thái kích hoạt (`Lab status: ready`). Khi phòng lab tắt, bạn vẫn có thể mở xem toàn bộ giao diện Frontend cục bộ.

---

## 📌 Giới Thiệu Tổng Quan

**CareSync** là nền tảng web hỗ trợ bệnh nhân đặt lịch khám bệnh trực tuyến và cung cấp không gian quản lý ca khám tiện lợi cho đội ngũ bác sĩ phòng khám.

Hệ thống được thiết kế và triển khai theo mô hình **100% Serverless trên nền tảng Amazon Web Services (AWS)**. Nhờ đó, ứng dụng đạt được khả năng co giãn linh hoạt (Auto Scaling), tính sẵn sàng cao (High Availability), bảo mật dữ liệu y tế theo chuẩn đám mây và tối ưu hóa chi phí vận hành ở mức thấp nhất.

![Sơ đồ kiến trúc Serverless CareSync](worklog/Week%204/img/Serverless_CareSync_Architecture.jpg)

---

## 🚀 Các Tính Năng Nổi Bật & Hướng Dẫn Thao Tác

### 1. Dành Cho Bệnh Nhân (Patient Portal)

- **Xem danh bạ bác sĩ trực tuyến:**
  - Danh sách bác sĩ được nạp động từ cơ sở dữ liệu Amazon DynamoDB (`GET /doctors`), phân loại theo chuyên khoa (Nội tổng quát, Tim mạch, Tai Mũi Họng, Răng Hàm Mặt, Nhi khoa...).
  - Cho phép lọc nhanh chuyên khoa hoặc tìm kiếm bác sĩ theo họ tên.
- **Đặt lịch khám thông minh & Xuất vé điện tử:**
  - Chọn bác sĩ phụ trách, chọn ngày khám và khung giờ còn trống (30 phút/ca).
  - **Tự động khóa giờ quá khứ:** Hệ thống tự động so sánh giờ hiện tại trong ngày; các khung giờ đã trôi qua sẽ bị vô hiệu hóa (`disabled`) kèm tooltip cảnh báo, tránh việc bệnh nhân đặt ca khám vào thời gian đã qua.
  - Xuất phiếu khám điện tử (Ticket Modal) hiển thị Mã đặt hẹn duy nhất (UUID), phòng khám và thông tin ca khám.
- **Cơ chế chống trùng lịch nguyên tử (Concurrency Control):**
  - Tận dụng điều kiện `attribute_not_exists(SlotKey)` của DynamoDB. Nếu có 2 bệnh nhân cùng đặt một bác sĩ vào cùng một khung giờ, request đến sau lập tức nhận mã lỗi HTTP `409 Conflict` và giao diện thông báo toast màu đỏ hướng dẫn chọn khung giờ khác.
- **Tra cứu lịch khám bảo mật bằng Số điện thoại:**
  - Người bệnh không cần tạo tài khoản phức tạp mà chỉ cần nhập số điện thoại cá nhân (chuẩn 10 chữ số Việt Nam) tại mục _"Lịch hẹn của tôi"_.
  - Hệ thống truy vấn thông qua **Global Secondary Index (GSI `PatientPhone-index`)** với độ phức tạp tối ưu $O(1)$, bảo đảm thông tin y tế không bị lộ công khai.
- **Hủy lịch khám an toàn qua xác thực OTP Email:**
  - Để tránh việc người lạ bấm hủy lịch phá hoại, khi người bệnh chọn _"Hủy lịch"_, hệ thống sẽ yêu cầu nhập mã xác thực OTP 6 chữ số gửi về email đã đăng ký.

---

### 2. Dành Cho Bác Sĩ (Doctor Portal)

- **Đăng nhập không cần mật khẩu (Passwordless OTP):**
  - Bác sĩ nhấn nút _"Cổng Bác sĩ"_ trên thanh điều hướng, nhập email định danh (ví dụ: `doc1@caresync.vn`) và mã OTP xác thực để đăng nhập an toàn.
- **Không gian làm việc chuyên biệt (Doctor Workspace):**
  - Sau khi đăng nhập, toàn bộ các section trang chủ của bệnh nhân tự động ẩn đi, chuyển đổi thành trang quản lý lịch khám cá nhân của bác sĩ.
  - Hỗ trợ 2 chế độ hiển thị: Dạng danh sách thẻ (List View) và Dạng lịch biểu tháng (Calendar View).
- **Tìm kiếm thời gian thực (Live Search) không dấu tiếng Việt:**
  - Bác sĩ có thể tìm nhanh bệnh nhân theo tên hoặc số điện thoại. Hệ thống tích hợp bộ chuẩn hóa chuỗi `normalizeString`, cho phép gõ tiếng Việt không dấu (gõ _"vuong"_ vẫn tìm thấy _"Vương"_) với tốc độ phản hồi tức thì và không bị giật con trỏ phím.
- **Đăng xuất an toàn:**
  - Xóa sạch phiên làm việc trên trình duyệt và tự động khôi phục giao diện trang chủ ban đầu.

---

### 3. Tự Động Hóa Thông Báo Đám Mây (Amazon SNS & EventBridge)

> 💡 **Cơ chế gửi Email thông báo trên môi trường thực hành Lab:**  
> Do đặc thù phân quyền của **AWS Academy Learner Lab**, dịch vụ **Amazon SNS** vận hành theo mô hình Pub/Sub và chỉ gửi email đến **các địa chỉ email cố định đã được xác nhận đăng ký Subscription từ trước** với Topic `CareSync-AppointmentNotice` (phục vụ mục đích kiểm thử và demo kiến trúc không máy chủ), chưa thể gửi động đến bất kỳ email nào người dùng nhập trên form. Trong môi trường sản xuất thực tế (Production), hệ thống sẽ kết hợp thêm dịch vụ **Amazon SES (Simple Email Service)** để gửi trực tiếp đến mọi hộp thư cá nhân.

- **Email xác nhận tức thì (Amazon SNS):** Sau khi ghi nhận ca khám thành công vào DynamoDB, Lambda gọi lệnh `PublishCommand` tới Topic SNS để đẩy email xác nhận chi tiết về hộp thư kiểm thử đã đăng ký subscription.
- **Tự động nhắc lịch khám (Amazon EventBridge Scheduler):** Tạo một One-time Schedule `at()` kích hoạt sau 2 phút kể từ thời điểm đặt hẹn để tự động kích hoạt gửi thêm một email nhắc nhở bệnh nhân chuẩn bị đến khám.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần      | Công nghệ / Dịch vụ AWS                       | Vai trò trong hệ thống                                                                                               |
| :-------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | HTML5, Vanilla CSS3, JavaScript (ES6 Modules) | Giao diện Single Page Application (SPA), responsive trên điện thoại & máy tính, không dùng thư viện ngoài cồng kềnh. |
| **Hosting**     | Amazon S3 Static Website Hosting              | Lưu trữ và phân phối mã nguồn web tĩnh với độ bền 99.999999999% (11 số 9).                                           |
| **API Gateway** | Amazon API Gateway (HTTP API v2)              | Tiếp nhận request từ Client, xử lý CORS preflight tập trung và chuyển tiếp tới Lambda.                               |
| **Compute**     | AWS Lambda (Node.js 18.x)                     | Xử lý toàn bộ logic nghiệp vụ (Clean Layer Architecture: Routes $\rightarrow$ Controller $\rightarrow$ Services).    |
| **Database**    | Amazon DynamoDB (NoSQL)                       | Lưu trữ 3 bảng dữ liệu (`Appointments`, `Patients`, `Doctors`) với Composite Key và GSI.                             |
| **Security**    | AWS Key Management Service (AWS KMS)          | Mã hóa phong bì (Envelope Encryption) Customer Managed Key `alias/caresync-patient-key` cho CCCD và SĐT.             |
| **Messaging**   | Amazon SNS & EventBridge Scheduler            | Hệ thống gửi thông báo email theo kiến trúc Pub/Sub và đặt lịch nhắc hẹn tự động.                                    |

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
CareSync/
├── client/                               # Mã nguồn Frontend chạy trên trình duyệt / S3
│   ├── index.html                        # Giao diện chính của ứng dụng
│   ├── css/
│   │   ├── style.css                     # Thiết kế tổng thể & hệ thống biến giao diện (Design Tokens)
│   │   ├── booking.css                   # Định kiểu form đặt lịch, calendar & modal vé khám
│   │   └── lookup.css                    # Định kiểu danh sách tra cứu lịch hẹn & modal OTP
│   ├── js/
│   │   ├── app.js                        # Điểm khởi động ứng dụng
│   │   ├── api.js                        # Module kết nối REST API tới API Gateway
│   │   ├── doctors.js                    # Quản lý danh bạ & bộ lọc bác sĩ
│   │   ├── booking.js                    # Quản lý form đặt hẹn, khóa khung giờ quá khứ
│   │   ├── lookup.js                     # Tra cứu lịch theo SĐT & hủy ca khám bằng OTP
│   │   ├── doctor-auth.js                # Đăng nhập bác sĩ, live search không dấu & portal làm việc
│   │   └── navigation.js                 # Điều hướng cuộn trang & thông báo Toast dùng chung
│   └── assets/images/                    # Ảnh đại diện bác sĩ và tài nguyên đồ họa
│
├── server/
│   └── lambda/                           # Mã nguồn Backend triển khai lên AWS Lambda
│       ├── index.js                      # Entrypoint điều phối request & xử lý CORS
│       ├── routes/                       # Khai báo định tuyến URL (doctor, appointment)
│       ├── controller/                   # Tiếp nhận HTTP request & format response Native Lambda
│       ├── service/                      # Tầng nghiệp vụ xử lý chính:
│       │   ├── doctor.service.js         # Đọc danh bạ bác sĩ từ DynamoDB
│       │   ├── appointment.service.js    # Đặt lịch, kiểm tra 409 Conflict, tích hợp SNS & Scheduler
│       │   ├── patient.service.js        # Quản lý và đồng bộ hồ sơ bệnh nhân
│       │   ├── kms.service.js            # Mã hóa/giải mã SĐT, CCCD với AWS KMS SDK v3
│       │   └── otp.service.js            # Sinh mã OTP ngẫu nhiên & xác thực thời hạn
│       ├── config/                       # Khởi tạo kết nối DynamoDB DocumentClient
│       └── package.json                  # Cấu hình phụ thuộc AWS SDK v3
│
├── docs/                                 # Tài liệu kiểm thử Postman Collection
├── worklog/                              # Nhật ký tiến độ thực hành hàng tuần (Week 1 - Week 4)
│   ├── Week 1/
│   ├── Week 2/
│   ├── Week 3/
│   └── Week 4/                           # Báo cáo tổng kết đồ án, minh chứng E2E & khai báo AI
└── README.md                             # Tài liệu giới thiệu và hướng dẫn tổng quan dự án
```

---

## 🔌 Danh Mục REST API Chính

| Phương thức | Đường dẫn API               | Chức năng                                        |          Phản hồi chính          |
| :---------: | :-------------------------- | :----------------------------------------------- | :------------------------------: |
|    `GET`    | `/doctors`                  | Lấy danh sách toàn bộ bác sĩ đang hoạt động      | `200 OK` (Mảng thông tin bác sĩ) |
|   `POST`    | `/appointments`             | Đặt lịch khám mới (kiểm tra chống trùng lịch)    |  `201 Created` / `409 Conflict`  |
|    `GET`    | `/appointments?phone={sdt}` | Tra cứu danh sách lịch khám theo số điện thoại   |   `200 OK` (Mảng các ca khám)    |
|   `POST`    | `/appointments/cancel/otp`  | Gửi mã OTP xác thực về email yêu cầu hủy lịch    |      `200 OK` (Đã gửi OTP)       |
|    `PUT`    | `/appointments/{id}/cancel` | Xác nhận mã OTP và cập nhật trạng thái hủy ca    |   `200 OK` / `400 Bad Request`   |
|   `POST`    | `/doctor/login/otp`         | Gửi mã OTP đăng nhập vào email bác sĩ            |       `200 OK` (Mã đã gửi)       |
|   `POST`    | `/doctor/login/verify`      | Xác thực OTP và trả về phiên làm việc của bác sĩ |   `200 OK` (Thông tin bác sĩ)    |

---

## 💻 Hướng Dẫn Chạy Thử Nghiệm Cục Bộ (Local Setup)

Ứng dụng được viết hoàn toàn bằng công nghệ thuần (Vanilla JS/CSS), không phụ thuộc vào framework build phức tạp, giúp việc chạy thử nghiệm cực kỳ nhanh chóng:

1. Clone repository về máy tính:
   ```bash
   git clone https://github.com/Arenef/CareSync.git
   cd CareSync
   ```
2. Mở trực tiếp file `client/index.html` bằng trình duyệt web bất kỳ (Chrome, Edge, Firefox).  
   *Hoặc sử dụng extension **Live Server** trong VS Code / chạy lệnh Node.js:*
   ```bash
   npx serve client
   ```
3. Ứng dụng đã được cấu hình sẵn endpoint API Gateway AWS trên cloud (`client/js/api.js`).  
   *(Lưu ý: Các thao tác gọi API đám mây như nạp danh bạ từ DynamoDB, đặt lịch, tra cứu sẽ hoạt động khi tài khoản AWS Academy Learner Lab đang ở trạng thái Start Lab. Nếu phòng lab tắt, bạn vẫn có thể xem trước cấu trúc giao diện và trải nghiệm phía Client).*

---

## 🔒 Bảo Mật & Quyền Riêng Tư Y Tế

1. **Mã hóa phong bì (Envelope Encryption) với AWS KMS:** Dữ liệu số điện thoại và định danh cá nhân CCCD được mã hóa đối xứng an toàn trước khi lưu vào cơ sở dữ liệu.
2. **Kiểm soát truy cập không máy chủ (Decoupled Access Control):** Frontend không bao giờ kết nối trực tiếp vào DynamoDB hay KMS; mọi thao tác đều phải đi qua API Gateway có xác thực và hàm Lambda trung gian.
3. **Chống tấn công xóa trái phép:** Áp dụng xác thực hai bước qua OTP Email cho cả thao tác hủy lịch hẹn của bệnh nhân và đăng nhập của bác sĩ.

---

## 👥 Thành Viên Thực Hiện

- **Bùi Anh Khôi (SV1)** – MSSV: `24110258` – Email: [24110258@student.hcmute.edu.vn](mailto:24110258@student.hcmute.edu.vn)
- **Huỳnh Ngọc Bảo Khang (SV2)** – MSSV: `24110241` – Email: [24110241@student.hcmute.edu.vn](mailto:24110241@student.hcmute.edu.vn)

_Đồ án môn học Điện toán đám mây – Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)_
