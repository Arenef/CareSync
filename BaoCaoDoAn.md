# BÁO CÁO TỔNG KẾT ĐỒ ÁN MÔN HỌC

## ĐIỆN TOÁN ĐÁM MÂY (CLOUD COMPUTING)

---

# ĐỀ TÀI: HỆ THỐNG ĐẶT LỊCH KHÁM BỆNH TRỰC TUYẾN CHO PHÒNG KHÁM (CARESYNC)

### KIẾN TRÚC 100% SERVERLESS TRÊN NỀN TẢNG AMAZON WEB SERVICES (AWS)

**Trường:** Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh (HCMUTE)  
**Khoa:** Công nghệ Thông tin  
**Học phần:** Điện toán đám mây (Cloud - Đợt 1 - 2026-2027)  
**Giảng viên hướng dẫn (GVHD):** TS. Huỳnh Xuân Phụng  
**Nhóm sinh viên thực hiện:** Domain Apps

- **Sinh viên 1:** Bùi Anh Khôi – **MSSV:** 24110258
- **Sinh viên 2:** Huỳnh Ngọc Bảo Khang – **MSSV:** 24110241

**Thông tin truy cập dự án:**

- 🌐 **Website Demo (Amazon S3 Hosting):** [http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com](http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com)
- 📦 **GitHub Repository:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync) (Branch: `main`)
- 🎥 **Video Demo CareSync:** [Google Drive Folder](https://drive.google.com/drive/folders/1sK3Uae6RGCYvLRe3XZixI6ULkMxq5bKn?usp=sharing)

---

## MỤC LỤC

- [BÁO CÁO TỔNG KẾT ĐỒ ÁN MÔN HỌC](#báo-cáo-tổng-kết-đồ-án-môn-học)
  - [ĐIỆN TOÁN ĐÁM MÂY (CLOUD COMPUTING)](#điện-toán-đám-mây-cloud-computing)
- [ĐỀ TÀI: HỆ THỐNG ĐẶT LỊCH KHÁM BỆNH TRỰC TUYẾN CHO PHÒNG KHÁM (CARESYNC)](#đề-tài-hệ-thống-đặt-lịch-khám-bệnh-trực-tuyến-cho-phòng-khám-caresync)
  - [KIẾN TRÚC 100% SERVERLESS TRÊN NỀN TẢNG AMAZON WEB SERVICES (AWS)](#kiến-trúc-100-serverless-trên-nền-tảng-amazon-web-services-aws)
  - [MỤC LỤC](#mục-lục)
  - [CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI \& ĐẶT VẤN ĐỀ](#chương-1-giới-thiệu-đề-tài--đặt-vấn-đề)
    - [1.1. Bối cảnh thực tiễn \& Lý do chọn đề tài](#11-bối-cảnh-thực-tiễn--lý-do-chọn-đề-tài)
    - [1.2. Mục tiêu nghiên cứu và phạm vi đồ án](#12-mục-tiêu-nghiên-cứu-và-phạm-vi-đồ-án)
    - [1.3. Đối tượng sử dụng và các kịch bản nghiệp vụ](#13-đối-tượng-sử-dụng-và-các-kịch-bản-nghiệp-vụ)
    - [1.4. Bảng đối chiếu yêu cầu môn học \& Mức độ đáp ứng của đồ án (Compliance Matrix)](#14-bảng-đối-chiếu-yêu-cầu-môn-học--mức-độ-đáp-ứng-của-đồ-án-compliance-matrix)
  - [CHƯƠNG 2: THIẾT KẾ KIẾN TRÚC HỆ THỐNG SERVERLESS TRÊN AWS](#chương-2-thiết-kế-kiến-trúc-hệ-thống-serverless-trên-aws)
    - [2.1. Sơ đồ kiến trúc đám mây tổng thể (Cloud Architecture)](#21-sơ-đồ-kiến-trúc-đám-mây-tổng-thể-cloud-architecture)
    - [2.2. Vai trò \& cơ chế hoạt động của các dịch vụ AWS cốt lõi](#22-vai-trò--cơ-chế-hoạt-động-của-các-dịch-vụ-aws-cốt-lõi)
    - [2.3. Thiết kế Cơ sở Dữ liệu NoSQL trên Amazon DynamoDB](#23-thiết-kế-cơ-sở-dữ-liệu-nosql-trên-amazon-dynamodb)
      - [1. Bảng `Doctors` (Danh bạ bác sĩ)](#1-bảng-doctors-danh-bạ-bác-sĩ)
      - [2. Bảng `Patients` (Hồ sơ bệnh nhân \& Bảo mật KMS)](#2-bảng-patients-hồ-sơ-bệnh-nhân--bảo-mật-kms)
      - [3. Bảng `Appointments` (Quản lý lịch khám \& Lịch hẹn)](#3-bảng-appointments-quản-lý-lịch-khám--lịch-hẹn)
    - [2.4. Danh mục RESTful API của hệ thống CareSync](#24-danh-mục-restful-api-của-hệ-thống-caresync)
  - [CHƯƠNG 3: QUÁ TRÌNH HIỆN THỰC ĐỒ ÁN QUA 4 TUẦN](#chương-3-quá-trình-hiện-thực-đồ-án-qua-4-tuần)
    - [3.1. Tuần 1: Nghiên cứu lý thuyết, thiết kế sơ đồ và khởi tạo hạ tầng PoC](#31-tuần-1-nghiên-cứu-lý-thuyết-thiết-kế-sơ-đồ-và-khởi-tạo-hạ-tầng-poc)
    - [3.2. Tuần 2: Xây dựng Backend Serverless, CRUD DynamoDB \& Khóa chống trùng](#32-tuần-2-xây-dựng-backend-serverless-crud-dynamodb--khóa-chống-trùng)
    - [3.3. Tuần 3: Tích hợp AWS KMS, GSI DynamoDB \& Web Hosting S3](#33-tuần-3-tích-hợp-aws-kms-gsi-dynamodb--web-hosting-s3)
    - [3.4. Tuần 4: Tái cấu trúc Clean Architecture, Module Lịch dùng chung \& OTP Security](#34-tuần-4-tái-cấu-trúc-clean-architecture-module-lịch-dùng-chung--otp-security)
  - [CHƯƠNG 4: KẾT QUẢ KIỂM THỬ \& NGHIỆM THU HỆ THỐNG](#chương-4-kết-quả-kiểm-thử--nghiệm-thu-hệ-thống)
    - [4.1. Kiểm thử độc lập 5 API cốt lõi trên Postman](#41-kiểm-thử-độc-lập-5-api-cốt-lõi-trên-postman)
    - [4.2. Nghiệm thu 4 kịch bản End-to-End (E2E) trên môi trường Live](#42-nghiệm-thu-4-kịch-bản-end-to-end-e2e-trên-môi-trường-live)
      - [Kịch bản 1: Luồng bệnh nhân đặt khám và xuất vé điện tử](#kịch-bản-1-luồng-bệnh-nhân-đặt-khám-và-xuất-vé-điện-tử)
      - [Kịch bản 2: Bắt lỗi chống trùng lịch khám (409 Conflict) trên Cloud](#kịch-bản-2-bắt-lỗi-chống-trùng-lịch-khám-409-conflict-trên-cloud)
      - [Kịch bản 3: Tra cứu lịch khám bảo mật \& Hủy lịch bằng OTP Email](#kịch-bản-3-tra-cứu-lịch-khám-bảo-mật--hủy-lịch-bằng-otp-email)
      - [Kịch bản 4: Cổng bác sĩ - Đăng nhập OTP, xem lịch khám và tìm kiếm bệnh nhân](#kịch-bản-4-cổng-bác-sĩ---đăng-nhập-otp-xem-lịch-khám-và-tìm-kiếm-bệnh-nhân)
    - [4.3. Giám sát vận hành và nhật ký thực thi trên Amazon CloudWatch Logs](#43-giám-sát-vận-hành-và-nhật-ký-thực-thi-trên-amazon-cloudwatch-logs)
  - [CHƯƠNG 5: PHÂN TÍCH CHI PHÍ VẬN HÀNH \& QUY TRÌNH DỌN DẸP](#chương-5-phân-tích-chi-phí-vận-hành--quy-trình-dọn-dẹp)
    - [5.1. Bảng phân tích chi phí Serverless theo AWS Free Tier \& Learner Lab](#51-bảng-phân-tích-chi-phí-serverless-theo-aws-free-tier--learner-lab)
    - [5.2. So sánh hiệu quả kinh tế: Serverless vs Máy chủ ảo EC2](#52-so-sánh-hiệu-quả-kinh-tế-serverless-vs-máy-chủ-ảo-ec2)
    - [5.3. Quy trình dọn dẹp tài nguyên an toàn (Teardown Dependency Order)](#53-quy-trình-dọn-dẹp-tài-nguyên-an-toàn-teardown-dependency-order)
  - [CHƯƠNG 6: ĐÁNH GIÁ ĐỒ ÁN, BÀI HỌC KINH NGHIỆM \& HƯỚNG PHÁT TRIỂN](#chương-6-đánh-giá-đồ-án-bài-học-kinh-nghiệm--hướng-phát-triển)
    - [6.1. Tự đánh giá mức độ hoàn thành nhiệm vụ](#61-tự-đánh-giá-mức-độ-hoàn-thành-nhiệm-vụ)
    - [6.2. Thuận lợi, khó khăn và bài học kinh nghiệm](#62-thuận-lợi-khó-khăn-và-bài-học-kinh-nghiệm)
      - [Thuận lợi:](#thuận-lợi)
      - [Khó khăn \& Rào cản kỹ thuật:](#khó-khăn--rào-cản-kỹ-thuật)
      - [Bài học kinh nghiệm:](#bài-học-kinh-nghiệm)
    - [6.3. Định hướng mở rộng trong tương lai](#63-định-hướng-mở-rộng-trong-tương-lai)
  - [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & ĐẶT VẤN ĐỀ

### 1.1. Bối cảnh thực tiễn & Lý do chọn đề tài

Trong thời đại chuyển đổi số y tế, các cơ sở khám chữa bệnh vừa và nhỏ (phòng khám tư nhân, trung tâm chăm sóc sức khỏe ban đầu) thường xuyên đối mặt với các thách thức:

1. **Tình trạng quá tải và xếp hàng chờ đợi:** Bệnh nhân phải đến sớm lấy số thứ tự thủ công, dẫn đến tập trung đông người và lãng phí thời gian.
2. **Trùng lịch khám (Double Booking):** Nhân viên ghi chép sổ sách hoặc các hệ thống lưu trữ phân tán dễ gây xung đột giờ khám của cùng một bác sĩ.
3. **Chi phí hạ tầng máy chủ đắt đỏ:** Duy trì máy chủ vật lý hoặc thuê máy chủ ảo chạy 24/7 (EC2) đòi hỏi chi phí cố định từ $10 - $20/tháng kèm công tác vá lỗi, bảo trì hệ điều hành phức tạp.
4. **Bảo mật dữ liệu y tế nhạy cảm:** Số điện thoại và lý do khám của bệnh nhân có nguy cơ rò rỉ nếu lưu trữ dạng văn bản thuần (plaintext) trong cơ sở dữ liệu.

Nhằm giải quyết triệt để các bài toán trên, nhóm đã phát triển dự án **CareSync - Nền tảng đặt lịch khám bệnh trực tuyến ứng dụng 100% kiến trúc Serverless trên Amazon Web Services (AWS)**.

### 1.2. Mục tiêu nghiên cứu và phạm vi đồ án

- **Mục tiêu kỹ thuật:**
  - Làm chủ và hiện thực hóa mô hình điện toán không máy chủ (**100% Serverless Architecture**), tận dụng cơ chế co giãn tự động (Auto-scaling) từ 0 đến hàng ngàn người dùng mà không cần quản trị OS.
  - Vận dụng tối đa chính sách **AWS Free Tier** và tài khoản **AWS Academy Learner Lab** ($100 budget) để hệ thống vận hành với chi phí xấp xỉ **$0.00**.
  - Thiết kế mô hình dữ liệu phi quan hệ (**NoSQL Single Table / Multi-Table**) với tốc độ phản hồi tính bằng mili-giây, chống trùng lịch ở tầng cơ sở dữ liệu bằng **DynamoDB Conditional Writes**.
  - Tích hợp mã hóa bảo vệ dữ liệu nhạy cảm (số điện thoại) trực tiếp bằng khóa bảo mật do người dùng quản lý (**AWS KMS CMK** mang alias `alias/caresync-patient-key`).
  - Tự động hóa truyền thông đa kênh không máy chủ bằng mô hình Pub/Sub (**Amazon SNS**) kết hợp lên lịch trình nhắc hẹn tức thời (**Amazon EventBridge Scheduler**).

### 1.3. Đối tượng sử dụng và các kịch bản nghiệp vụ

Hệ thống phân tách rạch ròi 2 nhóm đối tượng người dùng chính:

1. **Bệnh nhân (Patient Portal):**
   - Xem danh bạ bác sĩ động theo chuyên khoa và tìm kiếm bác sĩ theo tên.
   - Chọn ngày khám, chọn khung giờ còn trống (tự động khóa khung giờ đã qua trong ngày).
   - Điền thông tin, nhận vé khám điện tử tức thì và nhận email thông báo xác nhận.
   - Tra cứu lại lịch sử ca khám thông qua số điện thoại bảo mật.
   - Yêu cầu hủy lịch khám thông qua mã OTP bảo mật 6 chữ số gửi về email.
2. **Bác sĩ / Nhân viên y tế (Doctor Portal):**
   - Đăng nhập bảo mật không mật khẩu (Passwordless Authentication) thông qua mã OTP gửi qua email phòng khám.
   - Theo dõi toàn bộ lịch khám của chính mình theo 2 chế độ hiển thị: Dạng danh sách (List View) và Dạng lịch biểu trực quan (Calendar Month View).
   - Tìm kiếm bệnh nhân theo thời gian thực (Live Search) hỗ trợ gõ tiếng Việt không dấu chuẩn xác.

### 1.4. Bảng đối chiếu yêu cầu môn học & Mức độ đáp ứng của đồ án (Compliance Matrix)

| Danh mục yêu cầu của GVHD      | Chi tiết yêu cầu theo đề cương môn học                                                                                                                                           | Hiện thực thực tế của Đồ án CareSync                                                                                                                                                                                                                                                                                                                                                             | Mức độ đáp ứng |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------: |
| **Sản phẩm dự kiến**           | - API Serverless.<br>- DynamoDB (bác sĩ, lịch hẹn) có Conditional Write chống trùng lịch.<br>- EventBridge Scheduler nhắc lịch qua SNS.<br>- Mã hóa KMS.<br>- Web đặt lịch khám. | - HTTP API Gateway (`2q1b3nxtkg`) + AWS Lambda Node.js.<br>- 3 bảng DynamoDB (`Doctors`, `Appointments`, `Patients`) với Conditional Write chống trùng khung giờ $O(1)$.<br>- EventBridge Scheduler tự động bắn SNS Topic nhắc hẹn sau 2 phút.<br>- Mã hóa trực tiếp dữ liệu nhạy cảm qua AWS KMS CMK `alias/caresync-patient-key`.<br>- Web HTML5/CSS3/Vanilla JS chạy trên S3 Website Hosting. |  **100% ĐẠT**  |
| **Dịch vụ AWS bắt buộc**       | API Gateway, Lambda, DynamoDB, EventBridge, SNS, KMS, S3.                                                                                                                        | Triển khai đầy đủ và tích hợp cả 7 dịch vụ AWS cốt lõi (kèm Amazon CloudWatch Logs giám sát).                                                                                                                                                                                                                                                                                                    |  **100% ĐẠT**  |
| **Tính chất dữ liệu**          | Chỉ sử dụng dữ liệu giả lập (Mock data).                                                                                                                                         | Sử dụng dữ liệu giả lập cho 10 bác sĩ (`DOC01` - `DOC10`) và các hồ sơ bệnh nhân mẫu; tuyệt đối không dùng dữ liệu nhạy cảm thật.                                                                                                                                                                                                                                                                |  **100% ĐẠT**  |
| **Môi trường & Ràng buộc AWS** | Region `us-east-1` / `us-west-2`; dùng `LabRole`; không tạo IAM user/role; gắn tag `Project/Owner`; dừng/xóa tài nguyên sau mỗi buổi.                                            | Vận hành tại Region `us-east-1`; sử dụng quyền `LabRole` có sẵn; gắn tag đầy đủ `Project: CareSync`, `Owner: DomainApps`; lập checklist dọn dẹp tài nguyên theo Dependency Order bảo toàn ngân sách Learner Lab.                                                                                                                                                                                 |  **100% ĐẠT**  |
| **Minh chứng nộp bài**         | Ảnh chụp console/CLI (Account ID, Region, thời gian); mã nguồn trên Git; báo cáo + sơ đồ kiến trúc; video demo $\le$ 10 phút.                                                    | 16 ảnh chụp console/CLI và luồng E2E có định danh đầy đủ; repo GitHub công khai; sơ đồ kiến trúc Serverless trực quan; video demo chuẩn thời lượng trên Google Drive.                                                                                                                                                                                                                            |  **100% ĐẠT**  |

---

## CHƯƠNG 2: THIẾT KẾ KIẾN TRÚC HỆ THỐNG SERVERLESS TRÊN AWS

### 2.1. Sơ đồ kiến trúc đám mây tổng thể (Cloud Architecture)

Toàn bộ hệ thống CareSync được thiết kế theo mô hình phân tầng hướng dịch vụ (Decoupled Microservices) hoàn toàn không máy chủ:

![Sơ đồ kiến trúc Serverless CareSync hoàn chỉnh](worklog/Week%204/img/Serverless_CareSync_Architecture.jpg)

### 2.2. Vai trò & cơ chế hoạt động của các dịch vụ AWS cốt lõi

| Dịch vụ AWS            | Loại dịch vụ            | Vai trò trong dự án CareSync                                                                                                                                                                                                                                                                  |
| :--------------------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Amazon S3**          | Object Storage          | Lưu trữ toàn bộ mã nguồn Frontend tĩnh (HTML5, CSS3, ES6 JavaScript, hình ảnh bác sĩ). Cấu hình tính năng **Static Website Hosting** công khai để phục vụ người dùng qua trình duyệt.                                                                                                         |
| **Amazon API Gateway** | API Management          | Giao diện cổng HTTP API (Payload Format v2). Tiếp nhận các request HTTPS từ trình duyệt, định tuyến (Routing), cấu hình CORS linh hoạt và chuyển tiếp trực tiếp vào Lambda Function qua cơ chế **Lambda Proxy Integration**.                                                                  |
| **AWS Lambda**         | Serverless Compute      | Trái tim xử lý nghiệp vụ backend (`AppointmentBookingFunction`). Chạy runtime **Node.js 18.x/20.x**, cấu hình 128MB RAM, triển khai theo mô hình kiến trúc phân tầng sạch (Clean Layered Architecture: Router $\rightarrow$ Controller $\rightarrow$ Services $\rightarrow$ AWS SDK Clients). |
| **Amazon DynamoDB**    | Managed NoSQL Database  | Lưu trữ cơ sở dữ liệu phân tán tốc độ cao cho 3 bảng: `Doctors`, `Patients`, `Appointments`. Cấu hình chế độ **On-Demand** kèm chỉ mục toàn cục **GSI** để truy vấn theo số điện thoại với độ phức tạp $O(1)$.                                                                                |
| **AWS KMS**            | Security & Cryptography | Quản lý khóa mã hóa khách hàng (**Customer Managed Key - CMK** mang alias `alias/caresync-patient-key`). Thực hiện mã hóa dữ liệu nhạy cảm (số điện thoại) trực tiếp bằng lệnh EncryptCommand của AWS KMS trước khi lưu vào bảng Patients trên DynamoDB.                                      |
| **Amazon SNS**         | Pub/Sub Messaging       | Chủ đề thông báo **Amazon Simple Notification Service** (`CareSync-AppointmentNotice`). Nhận lệnh Publish từ Lambda để phân phối bản tin email tức thời đến bệnh nhân và gửi mã OTP xác thực.                                                                                                 |
| **Amazon EventBridge** | Event & Task Scheduler  | Dịch vụ **EventBridge Scheduler** tạo các lịch trình một lần (**One-time Schedule**). Tự động kích hoạt sau thời gian đặt hẹn (demo 2 phút) để gửi email nhắc nhở bệnh nhân qua SNS Topic mà không cần máy chủ Cronjob.                                                                       |
| **Amazon CloudWatch**  | Observability           | Thu thập toàn bộ log thực thi (`/aws/lambda/AppointmentBookingFunction`), giám sát độ trễ, số lượng request và hỗ trợ điều tra lỗi khi có ngoại lệ phát sinh.                                                                                                                                 |

### 2.3. Thiết kế Cơ sở Dữ liệu NoSQL trên Amazon DynamoDB

Hệ thống thiết kế 3 bảng dữ liệu chuẩn hóa, tối ưu hóa truy vấn dạng khóa (Key-value access pattern) để tránh thao tác quét toàn bảng (Full Table Scan):

#### 1. Bảng `Doctors` (Danh bạ bác sĩ)

- **Partition Key (PK):** `DoctorId` (String, ví dụ: `DOC01`, `DOC02`...).
- **Thuộc tính:** `Name`, `Specialty`, `Room`, `Phone`, `Email`, `Bio`, `IsActive` (Boolean).
- **Mục đích:** Lưu trữ hồ sơ nhân sự y tế, cung cấp dữ liệu nạp động cho danh bạ bác sĩ trên website.

#### 2. Bảng `Patients` (Hồ sơ bệnh nhân & Bảo mật KMS)

- **Partition Key (PK):** `PatientId` (String - Mã định danh bệnh nhân dạng `PAT-{phone}`, ví dụ: `PAT-0901234567`).
- **Thuộc tính:** `FullName` / `PatientName`, `Phone` (Plaintext), `PhoneEncrypted` (chuỗi Base64 đã mã hóa qua AWS KMS), `IsKmsEncrypted` (Boolean), `Email`, `CreatedAt`, `UpdatedAt`.
- **Cơ chế bảo mật:** Mã hóa trực tiếp trường số điện thoại bằng lệnh `EncryptCommand` của AWS KMS Customer Managed Key (`alias/caresync-patient-key`) và lưu bản mã Base64 vào trường `PhoneEncrypted`. Khi truy vấn hồ sơ (`getPatientById`), Lambda sử dụng `DecryptCommand` để giải mã về số điện thoại gốc một cách an toàn.

#### 3. Bảng `Appointments` (Quản lý lịch khám & Lịch hẹn)

- **Composite Primary Key:**
  - **Partition Key (PK):** `DoctorId` (String - Mã định danh bác sĩ tiếp nhận ca khám, ví dụ: `DOC01`).
  - **Sort Key (SK):** `SlotKey` (String - Khóa thời gian tổ hợp dạng `YYYY-MM-DD#HH:mm`, ví dụ: `2026-10-30#09:30`).
- **Thuộc tính phi khóa:** `AppointmentId` (String - Mã phiếu khám duy nhất dạng `APT-...`), `DoctorName`, `DoctorSpecialty`, `DoctorRoom`, `DoctorAvatar`, `Reason`, `PatientId`, `PatientName`, `PatientPhone`, `PatientEmail`, `AppointmentDate`, `SlotTime`, `Status` (`CONFIRMED`, `CANCELLED`), `CancelOTP`, `CancelOTPExpiresAt`, `CreatedAt`.
- **Chỉ mục toàn cục (Global Secondary Index - GSI):**
  - **Index Name:** `PatientPhone-index`
  - **GSI PK:** `PatientPhone`
  - **GSI SK:** `AppointmentDate`
  - **Projection:** `ALL`
  - **Mục đích:** Cho phép bệnh nhân tra cứu toàn bộ danh sách lịch hẹn của mình theo số điện thoại trong thời gian thực với độ phức tạp $O(1)$ mà không cần biết trước `DoctorId` hay `SlotKey`.
- **Cơ chế chống trùng lịch (Conditional Writes):**
  - Khi lưu lịch hẹn mới, Lambda thực hiện lệnh `PutCommand` kèm biểu thức điều kiện nguyên tử:
    ```javascript
    ConditionExpression: "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)";
    ```
  - Nếu đã tồn tại bản ghi có cùng `DoctorId` và `SlotKey` trong bảng, DynamoDB sẽ từ chối ghi và ném ngoại lệ `ConditionalCheckFailedException`. Lambda bắt lỗi này và phản hồi ngay mã HTTP `409 Conflict` về giao diện web để người dùng chọn lại khung giờ khác.

### 2.4. Danh mục RESTful API của hệ thống CareSync

Toàn bộ **9 RESTful API** được triển khai qua Amazon API Gateway (Base URL: `https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com`):

| STT | Phương thức | Endpoint                           | Chức năng nghiệp vụ                                                                               |        Mã phản hồi         |
| :-: | :---------: | :--------------------------------- | :------------------------------------------------------------------------------------------------ | :------------------------: |
|  1  |    `GET`    | `/doctors`                         | Lấy danh sách toàn bộ bác sĩ đang hoạt động để hiển thị danh bạ                                   |           200 OK           |
|  2  |    `GET`    | `/doctors/{id}`                    | Lấy thông tin chi tiết của một bác sĩ theo mã `DoctorId`                                          |   200 OK / 404 Not Found   |
|  3  |   `POST`    | `/appointments`                    | Bệnh nhân đặt lịch khám mới, kích hoạt KMS mã hóa, gửi Email qua SNS và tạo lịch nhắc EventBridge | 201 Created / 409 Conflict |
|  4  |    `GET`    | `/appointments?phone={phone}`      | Bệnh nhân tra cứu các lịch hẹn của mình qua số điện thoại (truy vấn qua GSI `PatientPhone-index`) |           200 OK           |
|  5  |   `POST`    | `/appointments/request-cancel`     | Yêu cầu hủy lịch khám: Hệ thống sinh mã OTP 6 số và gửi qua Email SNS Topic đến bệnh nhân         |   200 OK / 404 Not Found   |
|  6  |   `POST`    | `/appointments/confirm-cancel`     | Xác nhận mã OTP, chuyển trạng thái lịch thành `CANCELLED` và giải phóng khung giờ khám            |  200 OK / 400 Bad Request  |
|  7  |   `POST`    | `/auth/doctor/send-otp`            | Bác sĩ yêu cầu đăng nhập: Gửi mã OTP 6 chữ số qua Email SNS Topic đến bác sĩ                      |   200 OK / 404 Not Found   |
|  8  |   `POST`    | `/auth/doctor/verify-otp`          | Bác sĩ nhập OTP: Xác thực và cấp phiên làm việc (Session) hiển thị cổng bác sĩ                    | 200 OK / 401 Unauthorized  |
|  9  |    `GET`    | `/doctors/{doctorId}/appointments` | Cổng bác sĩ trích xuất danh sách tất cả các ca khám của chính mình theo ngày                      |           200 OK           |

---

## CHƯƠNG 3: QUÁ TRÌNH HIỆN THỰC ĐỒ ÁN QUA 4 TUẦN

### 3.1. Tuần 1: Nghiên cứu lý thuyết, thiết kế sơ đồ và khởi tạo hạ tầng PoC

- **Nghiên cứu nền tảng:** Phân tích nguyên lý Serverless Computing trên AWS, tìm hiểu chu trình sống của Lambda Function, cơ chế tích hợp giữa API Gateway và Lambda, mô hình định giá Pay-as-you-go và hạn mức AWS Free Tier.
- **Thiết kế kiến trúc PoC:** Lập sơ đồ kiến trúc khởi điểm, phác thảo cấu trúc 3 bảng DynamoDB (`Doctors`, `Patients`, `Appointments`) và quy tắc đặt tên khóa chính.
- **Khởi tạo tài nguyên trên AWS Academy Learner Lab:**
  - Khởi tạo S3 Bucket `appointment-booking-web-demo` tại vùng `us-east-1`.
  - Tạo 3 bảng DynamoDB ban đầu.
  - Tạo hàm Lambda cơ bản viết bằng Node.js và kết nối với HTTP API Gateway.
  - Tạo khóa KMS CMK `alias/caresync-patient-key` và chủ đề Amazon SNS `CareSync-AppointmentNotice`.
  - Cấu hình tag chuẩn hóa phân loại dự án (`Project: CareSync`, `Owner: DomainApps`).

### 3.2. Tuần 2: Xây dựng Backend Serverless, CRUD DynamoDB & Khóa chống trùng

- **Phát triển Backend API:** Xây dựng các hàm Lambda xử lý nghiệp vụ đặt khám, truy vấn bác sĩ và lưu trữ dữ liệu vào DynamoDB.
- **Tái cấu trúc mã nguồn theo Clean Architecture:** Chia tách mã nguồn nguyên khối ban đầu thành cấu trúc thư mục rõ ràng: `config/`, `controllers/`, `services/`, `routes/`, `utils/`.
- **Cơ chế chống trùng lịch (409 Conflict):** Áp dụng DynamoDB Conditional Writes ngăn chặn việc đặt trùng ca khám cùng một khung giờ.
- **Thử nghiệm tích hợp SNS & EventBridge Scheduler:** Viết hàm kích hoạt SNS Publish khi có lịch khám mới và lập lịch tự động kích hoạt nhắc nhở sau 2 phút.
- **Xây dựng giao diện Web giai đoạn 1:** Hiển thị danh bạ 10 bác sĩ nạp động từ cloud, hoàn thiện form đặt hẹn và xuất vé khám điện tử (Ticket Modal).

### 3.3. Tuần 3: Tích hợp AWS KMS, GSI DynamoDB & Web Hosting S3

- **Triển khai mã hóa dữ liệu nhạy cảm trực tiếp bằng AWS KMS:**
  - Tích hợp AWS KMS Client (`@aws-sdk/client-kms`) vào module `kms.service.js`.
  - Sử dụng lệnh `EncryptCommand` với khóa CMK `alias/caresync-patient-key` để mã hóa trường số điện thoại của bệnh nhân.
  - Lưu chuỗi bản mã dạng Base64 vào trường `PhoneEncrypted` và gắn cờ `IsKmsEncrypted: true` trong bảng `Patients`.
  - Khi cần tra cứu giải mã, hệ thống gọi lệnh `DecryptCommand` để khôi phục số điện thoại ban đầu.
- **Cấu hình Global Secondary Index (GSI):** Tạo chỉ mục `PatientPhone-index` trên bảng `Appointments` giải quyết bài toán tra cứu lịch hẹn qua số điện thoại tốc độ mili-giây.
- **Triển khai Web Hosting trên Amazon S3:** Cấu hình hosting tĩnh công khai trên S3, phân tích nguyên nhân và giải pháp vượt rào cản phân quyền CloudFront OAC trên môi trường đào tạo AWS Academy.
- **Xây dựng giao diện Tra cứu lịch hẹn:** Phát triển giao diện cho phép bệnh nhân nhập SĐT để xem lại các lịch hẹn đã đặt.

### 3.4. Tuần 4: Tái cấu trúc Clean Architecture, Module Lịch dùng chung & OTP Security

- **Tái cấu trúc và dọn dẹp mã nguồn Frontend & Backend (SV1):**
  - Cắt giảm ~400 dòng code dư thừa, loại bỏ cụm hàm render lịch cũ trong `booking.js` để bàn giao trọn vẹn trách nhiệm cho `lookup.js`.
  - Tối ưu helper ẩn/hiện màn hình `togglePatientSections` trong `doctor-auth.js` qua mảng cấu hình tập trung.
  - Chuẩn hóa hàm thông báo toàn hệ thống `window.showToast(title, message, type)`.
  - Xóa bỏ file rác `server/lambda/index.mjs`, kiểm tra toàn bộ cú pháp dự án bằng `node -c` đạt Exit Code 0.
- **Tính năng khóa khung giờ đã qua trong ngày (SV1):** Tự động so sánh giờ hiện tại với các slot khám trong ngày hôm nay, vô hiệu hóa nút đặt và gán tooltip cảnh báo trực quan.
- **Nâng cấp Live Search không dấu và sửa lỗi IME tiếng Việt (SV1):** Thêm hàm chuẩn hóa chuỗi `normalizeString`, cố định thanh topbar tránh giật focus giúp bác sĩ gõ tiếng Việt có dấu chuẩn xác.
- **Module Lịch biểu Đa năng dùng chung (Shared Calendar Module) (SV2):** Lập trình module lịch tháng `calendar.js` (742 dòng) và `lookup.css` (578 dòng), hỗ trợ 2 chế độ hiển thị `patient` và `doctor`.
- **Triệt tiêu hoàn toàn LocalStorage (SV2):** Loại bỏ hoàn toàn bộ nhớ cache offline của trình duyệt, chuyển toàn bộ hoạt động tra cứu vận hành 100% trên AWS DynamoDB Live.
- **Bảo mật xác thực OTP 6 số (SV2):** Xây dựng các API gửi và xác thực mã OTP phục vụ tính năng Hủy lịch khám của bệnh nhân và Đăng nhập không mật khẩu của Bác sĩ.

---

## CHƯƠNG 4: KẾT QUẢ KIỂM THỬ & NGHIỆM THU HỆ THỐNG

### 4.1. Kiểm thử độc lập 5 API cốt lõi trên Postman

SV2 đã thiết lập bộ sưu tập Postman và chạy kiểm thử độc lập trực tiếp lên API Gateway thật trên AWS (`https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com`):

| STT | Endpoint kiểm thử              | Phương thức | Dữ liệu đầu vào (Payload)                                    | Kết quả kỳ vọng                             | Kết quả thực tế                          | Trạng thái |
| :-: | :----------------------------- | :---------: | :----------------------------------------------------------- | :------------------------------------------ | :--------------------------------------- | :--------: |
|  1  | `/appointments/request-cancel` |   `POST`    | `{"appointmentId": "APT-971930", "email": "test@gmail.com"}` | HTTP 200, sinh OTP 6 số và gửi SNS          | HTTP 200 OK (1.18 s - 750 B)             |  **PASS**  |
|  2  | `/appointments/confirm-cancel` |   `POST`    | `{"appointmentId": "APT-971930", "otp": "384504"}`           | HTTP 200, đổi status `CANCELLED`            | HTTP 200 OK (1.18 s - 750 B)             |  **PASS**  |
|  3  | `/auth/doctor/send-otp`        |   `POST`    | `{"email": "buianhkhoi020120@gmail.com"}`                    | HTTP 200, kiểm tra danh bạ bác sĩ & gửi OTP | HTTP 200 OK (1.53 s - 751 B)             |  **PASS**  |
|  4  | `/auth/doctor/verify-otp`      |   `POST`    | `{"email": "buianhkhoi020120@gmail.com", "otp": "252514"}`   | HTTP 200, cấp quyền và trả hồ sơ bác sĩ     | HTTP 200 OK (1.29 s - 912 B)             |  **PASS**  |
|  5  | `/doctors/DOC01/appointments`  |    `GET`    | Không (truy vấn theo `DoctorId = DOC01`)                     | HTTP 200, trả về danh sách ca khám          | HTTP 200 OK (1.44 s - 2.1 KB, 6 ca khám) |  **PASS**  |

_Minh chứng kiểm thử chi tiết trên Postman:_

- **Gửi OTP đăng nhập Bác sĩ:**
  ![Postman Send OTP Doctor](worklog/Week%204/img/postman_send_otp.png)
- **Xác thực OTP Bác sĩ thành công:**
  ![Postman Verify OTP Doctor](worklog/Week%204/img/postman_verify_otp.png)
- **Gửi OTP yêu cầu hủy lịch khám:**
  ![Postman Cancel Request OTP](worklog/Week%204/img/postman_cancel_appointment_send_otp.png)
- **Xác nhận OTP hủy lịch khám thành công:**
  ![Postman Confirm Cancel OTP](worklog/Week%204/img/postman_cancel_appointment_comfirm.png)
- **Truy vấn danh sách lịch khám của Bác sĩ:**
  ![Postman Get Doctor Appointments](worklog/Week%204/img/postman_get_appointments_by_doctorId.png)

### 4.2. Nghiệm thu 4 kịch bản End-to-End (E2E) trên môi trường Live

Hệ thống đã trải qua nghiệm thu 4 kịch bản người dùng toàn diện trên website chạy thực tế:

#### Kịch bản 1: Luồng bệnh nhân đặt khám và xuất vé điện tử

- **Các bước thực hiện:** Bệnh nhân truy cập trang chủ S3, lọc danh bạ chọn Bác sĩ Lê Thị Bình, chọn ngày khám và khung giờ `09:30`, nhập thông tin cá nhân kèm CCCD và gửi yêu cầu.
- **Kết quả:** Hệ thống hiển thị modal vé khám điện tử (`APT-179340`), lưu dữ liệu vào DynamoDB với CCCD được mã hóa KMS và nhận ngay email thông báo qua Amazon SNS.
- **Minh chứng:**
  ![Đặt lịch thành công](worklog/Week%204/img/E2E_04_Booking_Success_Ticket.png)
  ![Minh chứng mã hóa KMS trên DynamoDB](worklog/Week%204/img/E2E_05_DynamoDB_KMS_Patient.jpg)

#### Kịch bản 2: Bắt lỗi chống trùng lịch khám (409 Conflict) trên Cloud

- **Các bước thực hiện:** Một người dùng khác cố tình đặt lại cùng Bác sĩ Lê Thị Bình vào đúng khung giờ `09:30` cùng ngày.
- **Kết quả:** AWS Lambda kích hoạt `ConditionalCheckFailedException` từ DynamoDB và trả về HTTP 409 Conflict; giao diện hiển thị thông báo toast màu đỏ cảnh báo khung giờ đã có người đặt và yêu cầu chọn lại.
- **Minh chứng:**
  ![Bắt lỗi 409 Conflict](worklog/Week%204/img/E2E_07_Booking_Conflict_409.png)

#### Kịch bản 3: Tra cứu lịch khám bảo mật & Hủy lịch bằng OTP Email

- **Các bước thực hiện:** Bệnh nhân chuyển sang tab "Lịch hẹn của tôi", nhập số điện thoại để tra cứu các ca khám của mình từ DynamoDB GSI. Nhấn nút "Hủy lịch", hệ thống gửi OTP 6 số qua email. Bệnh nhân nhập mã OTP để xác nhận hủy.
- **Kết quả:** Lịch hẹn chuyển sang trạng thái `Đã hủy` (màu đỏ) và khung giờ khám được tự động giải phóng trên hệ thống.
- **Minh chứng:**
  ![Tra cứu lịch hẹn](worklog/Week%204/img/E2E_09_Lookup_Success_Cards.png)
  ![Xác nhận hủy bằng OTP thành công](worklog/Week%204/img/E2E_13_Cancel_Success_Result.png)

#### Kịch bản 4: Cổng bác sĩ - Đăng nhập OTP, xem lịch khám và tìm kiếm bệnh nhân

- **Các bước thực hiện:** Bác sĩ truy cập Cổng bác sĩ, nhập email phòng khám để nhận OTP qua SNS, nhập OTP đăng nhập thành công. Giao diện bảng điều khiển hiển thị thống kê tổng ca khám, chuyển đổi giữa List View và Calendar View, thử nghiệm tìm kiếm không dấu "vuong".
- **Kết quả:** Danh sách lọc ngay lập tức còn 1 ca khám của bệnh nhân "Nguyễn Thị Vương" mà không bị reload trang hay gãy dấu tiếng Việt.
- **Minh chứng:**
  ![Cổng bác sĩ Dashboard](worklog/Week%204/img/E2E_15_Doctor_Portal_Dashboard.png)
  ![Live Search không dấu](worklog/Week%204/img/E2E_16_Doctor_Search_Filter.png)

### 4.3. Giám sát vận hành và nhật ký thực thi trên Amazon CloudWatch Logs

Nhóm log `/aws/lambda/AppointmentBookingFunction` ghi nhận đầy đủ luồng thực thi, các sự kiện tạo lịch, hủy lịch và xác thực OTP đều trả về mã trạng thái tương ứng (200/201/409), Lambda chạy ổn định trong hạn mức 128MB RAM mà không xảy ra timeout hay crash.

---

## CHƯƠNG 5: PHÂN TÍCH CHI PHÍ VẬN HÀNH & QUY TRÌNH DỌN DẸP

### 5.1. Bảng phân tích chi phí Serverless theo AWS Free Tier & Learner Lab

Nhờ triển khai theo mô hình 100% Serverless, chi phí vận hành hàng tháng của CareSync trên thực tế đạt tiêu chuẩn **Zero-Cost Operation**:

| Dịch vụ AWS               | Cấu hình triển khai        | Hạn mức miễn phí (Free Tier)              | Mức tiêu thụ thực tế   |       Chi phí phát sinh        |
| :------------------------ | :------------------------- | :---------------------------------------- | :--------------------- | :----------------------------: |
| **AWS Lambda**            | Node.js (128MB RAM)        | 1,000,000 req & 3,200,000 s compute/tháng | ~5,000 req (< 1,000 s) |           **$0.00**            |
| **Amazon DynamoDB**       | On-Demand (kèm GSI)        | 25 RCU/WCU & 25 GB Storage miễn phí       | 3 bảng (< 5 MB)        |           **$0.00**            |
| **Amazon API Gateway**    | HTTP API (Payload v2)      | $1.00 / 1,000,000 requests                | ~5,000 requests        |           **$0.00**            |
| **Amazon S3**             | Static Website Hosting     | 5 GB Storage & 20,000 GET req             | ~2.5 MB (HTML/CSS/JS)  |           **$0.00**            |
| **Amazon SNS**            | Email Pub/Sub Topic        | 1,000 email thông báo/tháng               | ~200 emails            |           **$0.00**            |
| **EventBridge Scheduler** | One-time Schedule (2 phút) | 14,000,000 invocations/tháng              | ~100 schedules         |           **$0.00**            |
| **AWS KMS**               | Customer Managed Key (CMK) | 20,000 KMS requests miễn phí              | 1 CMK ($1.00/tháng)    | **$1.00** _(trừ Learner Lab)_  |
| **TỔNG CỘNG**             | **Kiến trúc Serverless**   | --                                        | --                     | **$0.00 / tháng** _(Tiền túi)_ |

### 5.2. So sánh hiệu quả kinh tế: Serverless vs Máy chủ ảo EC2

| Tiêu chí so sánh                 | Kiến trúc truyền thống (Amazon EC2 VM)                                                                  | Kiến trúc CareSync (100% Serverless)                                                           |
| :------------------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| **Chi phí cố định**              | Phải trả tiền 24/7 dù không có người truy cập (tối thiểu ~$8.50 - $12.00/tháng cho t3.micro/t4g.small). | **$0.00** (Chỉ trả tiền khi có người gửi request, 0 request = 0 đồng).                         |
| **Khả năng co giãn (Scaling)**   | Cần cấu hình Auto Scaling Group, Application Load Balancer và mất vài phút để spin up máy chủ mới.      | **Tức thời (Tự động scale từ 0 lên hàng ngàn concurrent executions trong mili-giây)**.         |
| **Công tác bảo trì hệ thống**    | Phải tự cấu hình Linux/Windows, vá lỗi bảo mật OS, cài đặt Node.js/Nginx, backup máy chủ.               | **Không quản trị máy chủ (Zero Server Administration)**, AWS quản lý toàn bộ hạ tầng bên dưới. |
| **Tính sẵn sàng (Availability)** | Cần triển khai Multi-AZ đắt tiền để tránh Single Point of Failure.                                      | **Mặc định Multi-AZ** trên toàn Region của AWS.                                                |

### 5.3. Quy trình dọn dẹp tài nguyên an toàn (Teardown Dependency Order)

Để bảo toàn số dư tài khoản AWS Academy Learner Lab sau khi kết thúc môn học, nhóm đã xây dựng quy trình giải phóng tài nguyên tuân thủ nghiêm ngặt **thứ tự phụ thuộc (Dependency Order) từ ngoài vào trong**:

1. **Bước 1: Hủy Amazon EventBridge Scheduler:** Xóa toàn bộ các lịch trình gửi nhắc nhở còn tồn đọng trong EventBridge để tránh bắn event vào các tài nguyên backend đã hủy.
2. **Bước 2: Hủy Amazon SNS Topic & Subscriptions:** Xóa các đăng ký email (Subscriptions) và xóa chủ đề `CareSync-AppointmentNotice`.
3. **Bước 3: Xóa Amazon API Gateway:** Xóa HTTP API `2q1b3nxtkg` để ngắt kết nối cổng tiếp nhận request từ internet.
4. **Bước 4: Xóa AWS Lambda Function:** Xóa hàm `AppointmentBookingFunction`.
5. **Bước 5: Dọn sạch và xóa Amazon S3 Bucket:** Dùng lệnh "Empty Bucket" xóa toàn bộ các tệp web trước khi thực hiện lệnh xóa bucket `appointment-booking-web-demo`.
6. **Bước 6: Xóa các bảng Amazon DynamoDB:** Lần lượt xóa 3 bảng `Appointments`, `Doctors` và `Patients` (kèm các GSI liên quan).
7. **Bước 7: Lên lịch thu hồi khóa AWS KMS:** Thực hiện lệnh `ScheduleKeyDeletion` với thời gian chờ tối thiểu 7 ngày cho khóa CMK mang alias `alias/caresync-patient-key`.

---

## CHƯƠNG 6: ĐÁNH GIÁ ĐỒ ÁN, BÀI HỌC KINH NGHIỆM & HƯỚNG PHÁT TRIỂN

### 6.1. Tự đánh giá mức độ hoàn thành nhiệm vụ

Đối chiếu với đề cương môn học và mục tiêu ban đầu, nhóm sinh viên tự đánh giá đã **hoàn thành 100% khối lượng công việc**:

- [x] **Hạ tầng đám mây Serverless:** Triển khai hoàn chỉnh S3, API Gateway, Lambda, DynamoDB, KMS, SNS, EventBridge.
- [x] **Cơ sở dữ liệu NoSQL tối ưu:** Thiết kế chuẩn hóa 3 bảng, chỉ mục GSI cho tra cứu thời gian thực, chống trùng lịch khám bằng Conditional Writes.
- [x] **Bảo mật dữ liệu y tế:** Ứng dụng thành công mã hóa dữ liệu nhạy cảm với khóa AWS KMS CMK và bảo mật OTP qua Email.
- [x] **Tái cấu trúc mã nguồn chất lượng cao:** Codebase phân tầng sạch sẽ, gỡ bỏ code thừa, chuẩn hóa toast notification, kiểm tra cú pháp `node -c` toàn bộ đạt chuẩn.
- [x] **Giao diện người dùng toàn diện:** Hoàn thiện cả 2 cổng Bệnh nhân và Bác sĩ, tích hợp module Lịch biểu dùng chung (Shared Calendar), khóa khung giờ quá hạn, hỗ trợ Live Search tiếng Việt không dấu.
- [x] **Kiểm thử & Báo cáo minh chứng:** 100% các API cốt lõi được kiểm thử đạt HTTP 200 OK trên Postman, 4 kịch bản E2E được kiểm định thực tế với đầy đủ hình ảnh minh chứng và video demo.

### 6.2. Thuận lợi, khó khăn và bài học kinh nghiệm

#### Thuận lợi:

- Hệ sinh thái dịch vụ của AWS vô cùng phong phú và tích hợp chặt chẽ với nhau thông qua IAM Roles và Event Triggers.
- Kiến trúc Serverless giúp nhóm tập trung 100% thời gian vào logic nghiệp vụ và trải nghiệm người dùng thay vì tốn công cài đặt máy chủ.
- Chính sách AWS Free Tier cho phép thử nghiệm và kiểm thử hệ thống liên tục mà không lo phát sinh chi phí.

#### Khó khăn & Rào cản kỹ thuật:

- **Rào cản phân quyền trên AWS Academy Learner Lab:** Quyền IAM của tài khoản học tập bị hạn chế, không cho phép tạo CloudFront Origin Access Control (OAC) hoặc kích hoạt dịch vụ gửi email sản xuất Amazon SES. Nhóm đã linh hoạt giải quyết bằng giải pháp S3 Static Website Hosting kết hợp Amazon SNS Pub/Sub.
- **Xung đột DOM và bộ gõ tiếng Việt:** Khi phát triển tính năng Live Search thời gian thực, sự kiện re-render liên tục gây gián đoạn bộ gõ tiếng Việt (IME). Nhóm đã khắc phục bằng cách cố định thanh tìm kiếm trên DOM và viết hàm chuẩn hóa `normalizeString`.

#### Bài học kinh nghiệm:

- Hiểu sâu sắc sự khác biệt giữa thiết kế CSDL quan hệ (RDBMS) và CSDL NoSQL phân tán (DynamoDB): Cần xuất phát từ các mẫu truy vấn (Access Patterns) để thiết kế khóa PK/SK và GSI ngay từ đầu.
- Nắm vững nguyên lý bảo mật trên đám mây: Mã hóa dữ liệu khi nghỉ (Encryption at Rest) với KMS và mã hóa khi truyền (Encryption in Transit) với HTTPS/TLS.
- Rèn luyện kỹ năng phân tích chi phí và dọn dẹp tài nguyên đám mây chuyên nghiệp.

### 6.3. Định hướng mở rộng trong tương lai

1. **Nâng cấp xác thực với Amazon Cognito:** Triển khai Cognito User Pools và Identity Pools để quản lý tài khoản bác sĩ và bệnh nhân chuyên nghiệp bằng JWT Bearer Token thay cho xác thực qua email đơn thuần.
2. **Chuyển đổi sang Amazon SES trong môi trường Production:** Khi chuyển sang tài khoản AWS thương mại, nâng cấp Amazon SNS sang **Amazon Simple Email Service (SES)** với tên miền tùy chỉnh (Custom Domain) để gửi email đến bất kỳ địa chỉ nào mà không cần bệnh nhân xác nhận Subscription trước.
3. **Thanh toán trực tuyến:** Tích hợp cổng thanh toán viện phí trực tuyến (VNPay / MoMo) qua webhook Lambda trước khi xuất vé khám chính thức.
4. **Thông báo đẩy thời gian thực:** Ứng dụng WebSocket API trên API Gateway để cập nhật trạng thái lịch khám cho bác sĩ và bệnh nhân theo thời gian thực mà không cần người dùng tải lại trang.

---

## TÀI LIỆU THAM KHẢO

1. **Amazon Web Services Documentation:**
   - AWS Lambda Developer Guide: https://docs.aws.amazon.com/lambda/
   - Amazon DynamoDB Developer Guide: https://docs.aws.amazon.com/dynamodb/
   - Amazon API Gateway HTTP APIs: https://docs.aws.amazon.com/apigateway/
   - AWS Key Management Service (KMS) Cryptographic Details: https://docs.aws.amazon.com/kms/
   - Amazon EventBridge Scheduler Documentation: https://docs.aws.amazon.com/scheduler/
   - Amazon Simple Notification Service (SNS) Developer Guide: https://docs.aws.amazon.com/sns/
2. **AWS Free Tier Details:** https://aws.amazon.com/free/
3. **Clean Architecture on Node.js Serverless:** https://aws.amazon.com/blogs/compute/
