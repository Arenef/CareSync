# Tổng Hợp Nội Dung Tìm Hiểu - SV1 Bùi Anh Khôi

## Mục lục

- [Tổng Hợp Nội Dung Tìm Hiểu - SV1 Bùi Anh Khôi](#tổng-hợp-nội-dung-tìm-hiểu---sv1-bùi-anh-khôi)
  - [Mục lục](#mục-lục)
  - [1. Tìm hiểu EventBridge Scheduler và SNS: cơ chế tạo lịch nhắc và gửi thông báo](#1-tìm-hiểu-eventbridge-scheduler-và-sns-cơ-chế-tạo-lịch-nhắc-và-gửi-thông-báo)
    - [Amazon EventBridge Scheduler](#amazon-eventbridge-scheduler)
    - [Amazon SNS (Amazon Simple Notification Service)](#amazon-sns-amazon-simple-notification-service)
    - [Cơ chế kết hợp và ứng dụng thực tế](#cơ-chế-kết-hợp-và-ứng-dụng-thực-tế)
  - [2. Tìm hiểu KMS và S3: mã hóa dữ liệu, lưu trữ website và bảo mật](#2-tìm-hiểu-kms-và-s3-mã-hóa-dữ-liệu-lưu-trữ-website-và-bảo-mật)
    - [AWS Key Management Service (KMS)](#aws-key-management-service-kms)
    - [Amazon Simple Storage Service (Amazon S3)](#amazon-simple-storage-service-amazon-s3)
    - [Cơ chế bảo mật và ứng dụng thực tế](#cơ-chế-bảo-mật-và-ứng-dụng-thực-tế)
  - [3. Thiết kế Database](#3-thiết-kế-database)
    - [1. Bảng Doctors](#1-bảng-doctors)
    - [2. Bảng Patients](#2-bảng-patients)
    - [3. Bảng Appointments](#3-bảng-appointments)
    - [Mối quan hệ giữa các bảng](#mối-quan-hệ-giữa-các-bảng)
  - [4. Thiết kế luồng nhắc lịch và bảo mật](#4-thiết-kế-luồng-nhắc-lịch-và-bảo-mật)

---

## 1. Tìm hiểu EventBridge Scheduler và SNS: cơ chế tạo lịch nhắc và gửi thông báo

### Amazon EventBridge Scheduler

- Là dịch vụ lập lịch của AWS, dịch vụ này cho phép tự động thực thi các tác vụ tại những thời điểm được xác định trước. Dịch vụ hỗ trợ lập lịch chạy một lần hoặc lặp lại theo chu kỳ thông qua biểu thức rate và cron. Nhờ đó, người dùng có thể tự động hóa các công việc mà không cần trực tiếp thực hiện thủ công.

### Amazon SNS (Amazon Simple Notification Service)

- Là dịch vụ gửi thông báo theo mô hình publish/subscribe (xuất bản/đăng ký). Dịch vụ cho phép gửi thông báo đến nhiều đối tượng hoặc hệ thống thông qua các kênh như email, SMS và các dịch vụ AWS được hỗ trợ.

### Cơ chế kết hợp và ứng dụng thực tế

- EventBridge Scheduler có thể được cấu hình để gọi Amazon SNS theo lịch đã thiết lập. Khi đến thời điểm quy định, Scheduler thực thi tác vụ gửi thông báo đến một SNS topic. Sau đó, SNS phân phối thông báo đến các đối tượng đã đăng ký nhận tin.
- Trong CareSync, nhóm dùng cơ chế này để nhắc lịch hẹn khám cho bệnh nhân qua Email/SMS.
- Định hướng kiến trúc của nhóm là kết hợp **Scheduler ➔ Lambda ➔ SNS**: Scheduler gọi Lambda kiểm tra trạng thái lịch hẹn trong database trước (tránh gửi nhầm nếu lịch đã bị hủy), sau đó Lambda mới phát thông báo qua SNS.
- Về bảo mật, hệ thống cần cấu hình quyền IAM phù hợp để Scheduler có thể thực thi tác vụ và kiểm soát quyền truy cập vào SNS topic. Điều này giúp hạn chế việc sử dụng dịch vụ trái phép và bảo vệ thông tin được gửi đi.

[⬆ Quay lại Mục lục](#mục-lục)

---

## 2. Tìm hiểu KMS và S3: mã hóa dữ liệu, lưu trữ website và bảo mật

### AWS Key Management Service (KMS)

- AWS Key Management Service (KMS) là dịch vụ quản lý khóa mã hóa, hỗ trợ tạo, quản lý và kiểm soát việc sử dụng khóa để bảo vệ dữ liệu. KMS có thể được tích hợp với nhiều dịch vụ AWS nhằm thực hiện mã hóa và giải mã dữ liệu theo các chính sách quyền hạn đã thiết lập.
- Một trong những ứng dụng phổ biến của KMS là mã hóa dữ liệu lưu trữ trên Amazon S3 bằng cơ chế SSE-KMS. Cơ chế này giúp tăng khả năng kiểm soát khóa mã hóa và hỗ trợ ghi nhận các hoạt động sử dụng khóa thông qua các dịch vụ giám sát, nhật ký phù hợp.

### Amazon Simple Storage Service (Amazon S3)

- Amazon S3 là dịch vụ lưu trữ đối tượng trên nền tảng đám mây AWS. Dịch vụ cho phép lưu trữ và truy xuất dữ liệu như hình ảnh, tài liệu, tệp tin, dữ liệu sao lưu và các thành phần của website.
- Amazon S3 có khả năng mở rộng linh hoạt, độ bền dữ liệu cao và hỗ trợ nhiều cơ chế bảo mật. Người dùng có thể thiết lập quyền truy cập bằng IAM, bucket policy, mã hóa dữ liệu và các tính năng bảo vệ quyền truy cập công khai.
- Ngoài chức năng lưu trữ, S3 còn hỗ trợ triển khai website tĩnh thông qua việc lưu trữ các tệp HTML, CSS, JavaScript và hình ảnh. Để tăng cường bảo mật và hiệu quả phân phối nội dung, có thể kết hợp S3 với Amazon CloudFront và cấu hình HTTPS.

### Cơ chế bảo mật và ứng dụng thực tế

- KMS và S3 có thể kết hợp để bảo vệ dữ liệu trong quá trình lưu trữ. Amazon S3 đảm nhiệm việc lưu trữ đối tượng, trong khi AWS KMS hỗ trợ quản lý khóa mã hóa khi sử dụng cơ chế SSE-KMS. Việc phân quyền hợp lý giúp giới hạn những người dùng và dịch vụ được phép truy cập dữ liệu hoặc sử dụng khóa.
- Trong thực tế, sự kết hợp này phù hợp với các hệ thống cần lưu trữ tài liệu, hình ảnh, dữ liệu sao lưu hoặc nội dung website. Để tăng cường an toàn, cần bật S3 Block Public Access khi không có nhu cầu truy cập công khai, sử dụng chính sách quyền hạn tối thiểu và theo dõi các hoạt động truy cập quan trọng.
- Áp dụng vào CareSync: Website tĩnh (HTML/CSS/JS) lưu trên S3 hosting dùng mã hóa mặc định SSE-S3; còn các tệp sao lưu hoặc dữ liệu nhạy cảm lưu ở bucket riêng, kích hoạt SSE-KMS và bật S3 Block Public Access để bảo vệ an toàn.

[⬆ Quay lại Mục lục](#mục-lục)

---

## 3. Thiết kế Database

### 1. Bảng Doctors

Lưu trữ thông tin hồ sơ và trạng thái hoạt động của các bác sĩ trong hệ thống.

- **Partition Key (PK):** DoctorId (String) – Khóa phân vùng định danh duy nhất cho từng bác sĩ.
- **Sort Key (SK):** Không sử dụng.
- **Các thuộc tính phi khóa:**
  - FullName (String): Họ và tên bác sĩ.
  - Specialty (String): Chuyên khoa khám
  - Phone (String): Số điện thoại liên hệ
  - Email (String): Email liên hệ.
  - IsActive (Boolean): Trạng thái hoạt động (cho phép đặt lịch hay đang tạm ngưng).

### 2. Bảng Patients

Lưu trữ thông tin cá nhân của người bệnh đặt lịch.

- **Partition Key (PK):** PatientId (String) – Mã định danh duy nhất của từng bệnh nhân.
- **Sort Key (SK):** Không sử dụng.
- **Các thuộc tính phi khóa:**
  - FullName (String): Họ và tên bệnh nhân.
  - Phone (String): Số điện thoại liên hệ
  - Email (String): Email liên hệ.
  - DateOfBirth (String): Ngày tháng năm sinh (định dạng YYYY-MM-DD).

### 3. Bảng Appointments

Lưu trữ thông tin các lịch khám bệnh do bệnh nhân đặt với bác sĩ.

- **Partition Key (PK):** DoctorId (String) – Mã bác sĩ tiếp nhận ca khám.
- **Sort Key (SK):** AppointmentDateTime (String) – Khung thời gian khám bệnh (định dạng ISO 8601).
- **Các thuộc tính phi khóa:**
  - AppointmentId (String): Mã phiếu đặt khám duy nhất trả về cho bệnh nhân.
  - PatientId (String): Mã định danh bệnh nhân đặt lịch.
  - PatientName (String): Họ tên bệnh nhân (phi chuẩn hóa để hiển thị ngay mà không cần tra cứu sang bảng Patients).
  - Status (String): Trạng thái phiếu khám (PENDING, CONFIRMED, CANCELLED, COMPLETED).
  - Reason (String): Lý do khám / triệu chứng ban đầu.
  - CreatedAt (String): Thời điểm thực hiện đặt lịch, định dạng ISO 8601.

### Mối quan hệ giữa các bảng

- Doctors – Appointments: 1:N.
- Patients – Appointments: 1:N.

[⬆ Quay lại Mục lục](#mục-lục)

---

## 4. Thiết kế luồng nhắc lịch và bảo mật

Hệ thống có thể sử dụng Amazon EventBridge Scheduler kết hợp với Amazon SNS để tự động gửi thông báo nhắc lịch khám bệnh.

Quy trình hoạt động được thiết kế như sau:

1. Bệnh nhân tạo lịch hẹn và hệ thống lưu thông tin vào bảng Appointments.
2. Sau khi lịch hẹn được xác nhận, hệ thống tạo lịch nhắc tự động tương ứng.
3. EventBridge Scheduler kích hoạt tác vụ tại thời điểm đã thiết lập.
4. Tác vụ gửi thông báo thông qua Amazon SNS đến kênh nhận tin đã đăng ký.
5. Hệ thống ghi nhận kết quả gửi thông báo để phục vụ kiểm tra và xử lý khi có lỗi.
6. Khi lịch hẹn bị hủy hoặc thay đổi, lịch nhắc cũ cần được cập nhật hoặc hủy để tránh gửi thông báo sai.

Đối với các trường hợp cần gửi thông báo qua email hoặc SMS, hệ thống cần cấu hình đúng kênh nhận tin, quyền truy cập và thông tin liên hệ của bệnh nhân. Trạng thái gửi thông báo cũng nên được lưu trữ riêng để hỗ trợ theo dõi và gửi lại khi cần thiết.

Hệ thống xử lý thông tin cá nhân và thông tin liên quan đến khám chữa bệnh, bảo mật cần được triển khai ở cả tầng API, cơ sở dữ liệu và dịch vụ AWS.

- Xác thực và phân quyền: Sử dụng cơ chế đăng nhập an toàn, token xác thực và phân quyền theo vai trò bệnh nhân, bác sĩ và quản trị viên.
- Bảo vệ API: Kiểm tra dữ liệu đầu vào, giới hạn tần suất yêu cầu, xác minh quyền sở hữu lịch hẹn và ngăn truy cập trái phép.
- Bảo vệ cơ sở dữ liệu: Sử dụng tài khoản có quyền tối thiểu, truy vấn có tham số, mã hóa dữ liệu và sao lưu định kỳ.
- Bảo mật trên AWS: Sử dụng IAM để phân quyền cho các dịch vụ (trong môi trường AWS Learner Lab: dùng LabRole/LabInstanceProfile có sẵn, không tạo IAM user/role mới), AWS KMS để quản lý khóa mã hóa và AWS Secrets Manager để lưu trữ thông tin bí mật như thông tin xác thực kết nối cơ sở dữ liệu.
- Bảo vệ thông báo: Hạn chế đưa thông tin nhạy cảm vào nội dung email hoặc SMS; chỉ sử dụng dữ liệu cần thiết để nhắc lịch.
- Giám sát hệ thống: Ghi nhật ký hoạt động, theo dõi lỗi và cảnh báo những truy cập bất thường; không ghi mật khẩu, token hoặc dữ liệu nhạy cảm vào log.

[⬆ Quay lại Mục lục](#mục-lục)
