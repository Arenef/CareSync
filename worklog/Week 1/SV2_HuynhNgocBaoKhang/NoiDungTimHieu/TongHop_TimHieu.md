# Tổng Hợp Nội Dung Tìm Hiểu - SV2 Huỳnh Ngọc Bảo Khang

## Mục lục

- [1. API Gateway và Lambda: chức năng, cách hoạt động, cách kết nối](#1-api-gateway-và-lambda-chức-năng-cách-hoạt-động-cách-kết-nối)
  - [AWS Lambda](#aws-lambda)
  - [Amazon API Gateway (HTTP API)](#amazon-api-gateway-http-api)
  - [Cơ chế kết nối giữa API Gateway và Lambda](#cơ-chế-kết-nối-giữa-api-gateway-và-lambda)
- [2. DynamoDB: cấu trúc bảng, key, CRUD và Conditional Write chống trùng lịch](#2-dynamodb-cấu-trúc-bảng-key-crud-và-conditional-write-chống-trùng-lịch)
  - [Amazon DynamoDB](#amazon-dynamodb)
  - [Cấu trúc bảng và Khóa chính (Primary Key)](#cấu-trúc-bảng-và-khóa-chính-primary-key)
  - [Thao tác CRUD trong hệ thống](#thao-tác-crud-trong-hệ-thống)
  - [Cơ chế Conditional Write chống trùng lịch](#cơ-chế-conditional-write-chống-trùng-lịch)
- [3. Thiết kế API cho hệ thống đặt lịch](#3-thiết-kế-api-cho-hệ-thống-đặt-lịch)
  - [Danh sách các API chính của hệ thống](#danh-sách-các-api-chính-của-hệ-thống)
  - [Quy trình xử lý yêu cầu đặt lịch](#quy-trình-xử-lý-yêu-cầu-đặt-lịch)
  - [Cơ chế chống trùng lịch và mã trạng thái HTTP](#cơ-chế-chống-trùng-lịch-và-mã-trạng-thái-http)
- [4. Thiết kế Kiến trúc AWS](#4-thiết-kế-kiến-trúc-aws)

---

## 1. API Gateway và Lambda: chức năng, cách hoạt động, cách kết nối

### AWS Lambda

- **Khái niệm:** Là dịch vụ điện toán không máy chủ (Serverless Compute) cho phép thực thi mã nguồn (chạy môi trường Node.js) mà không cần cấu hình, khởi tạo hay quản lý hệ điều hành máy chủ.
- **Đặc điểm & Ưu điểm:**
  - Lambda tự động co giãn (auto-scaling) theo số lượng yêu cầu gọi vào từ người dùng.
  - Tối ưu chi phí: chỉ tính phí theo thời gian chạy thực tế (tính theo mili-giây) và số lượng yêu cầu xử lý, không phát sinh chi phí khi ở trạng thái nhàn rỗi (idle).

### Amazon API Gateway (HTTP API)

- **Vai trò:** Đóng vai trò làm cổng tiếp nhận (entry point) và định tuyến các yêu cầu HTTP từ phía client (trình duyệt web, ứng dụng di động) đến các dịch vụ xử lý backend như AWS Lambda.
- **Lý do lựa chọn HTTP API:**
  - Giảm độ trễ và tối ưu chi phí hơn so với REST API truyền thống.
  - Hỗ trợ cấu hình CORS (Cross-Origin Resource Sharing) nhanh chóng và trực quan cho các ứng dụng web tĩnh lưu trữ trên Amazon S3.

### Cơ chế kết nối giữa API Gateway và Lambda

- **Lambda Proxy Integration:** API Gateway sử dụng cơ chế tích hợp proxy để chuyển tiếp toàn bộ ngữ cảnh yêu cầu.
  - **Phía tiếp nhận (Request):** Khi có HTTP Request gửi đến, API Gateway tự động đóng gói toàn bộ thông tin (HTTP Method, Path, Headers, Body, Query Parameters) thành đối tượng sự kiện (`event`) và chuyển cho hàm handler của Lambda xử lý.
  - **Phía phản hồi (Response):** Sau khi thực thi xong, Lambda trả về kết quả theo định dạng chuẩn gồm `statusCode`, `headers` và `body` dạng chuỗi JSON:
    ```json
    {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      "body": "{\"message\": \"Thành công\"}"
    }
    ```
  - API Gateway tiếp nhận định dạng chuẩn này và chuyển tiếp nguyên vẹn phản hồi HTTP về cho phía client.

[⬆ Quay lại Mục lục](#mục-lục)

---

## 2. DynamoDB: cấu trúc bảng, key, CRUD và Conditional Write chống trùng lịch

### Amazon DynamoDB

- **Khái niệm:** Là dịch vụ cơ sở dữ liệu NoSQL dạng Key-Value và Document có hiệu năng cao, độ trễ thấp tính bằng mili-giây ở mọi quy mô và khả năng mở rộng tự động.
- **Cơ chế Schema:** DynamoDB không yêu cầu khai báo schema cố định cho toàn bộ các thuộc tính (Schemaless) mà chỉ cần xác định cấu trúc khóa chính (Primary Key) khi khởi tạo bảng.

### Cấu trúc bảng và Khóa chính (Primary Key)

- **Partition Key (PK):** Dùng để băm (hash) và phân tán dữ liệu đồng đều trên các phân vùng vật lý (partitions) của AWS (ví dụ: `DoctorId`).
- **Composite Primary Key (PK + Sort Key):**
  - Kết hợp Partition Key và Sort Key (ví dụ: `DoctorId` và `SlotKey`) để tạo thành khóa chính phức hợp duy nhất.
  - Cho phép định danh chính xác từng khung giờ khám của từng bác sĩ cụ thể, đồng thời hỗ trợ truy vấn nhanh danh sách các khung giờ của một bác sĩ.

### Thao tác CRUD trong hệ thống

Hệ thống sử dụng AWS SDK (v3) để thực thi các tác vụ:

- **Scan:** Quét toàn bộ bảng danh sách bác sĩ (`Doctors`) để lấy thông tin hiển thị lên giao diện đặt khám.
- **PutItem / PutCommand:** Ghi thông tin lịch khám mới vào bảng `Appointments`.
- **GetItem / GetCommand:** Truy vấn chi tiết thông tin một lịch hẹn hoặc bác sĩ theo khóa chính.
- **DeleteItem / UpdateItem:** Thực hiện hủy hoặc cập nhật trạng thái phiếu khám (ví dụ: từ `CONFIRMED` sang `CANCELLED`).

### Cơ chế Conditional Write chống trùng lịch

- **Vai trò:** Đây là tính năng then chốt của bài toán đặt lịch khám trong dự án CareSync nhằm giải quyết tranh chấp ghi đồng thời (race condition).
- **Cơ chế hoạt động:**
  - Khi người dùng gửi yêu cầu ghi lịch hẹn vào bảng `Appointments`, Lambda gửi lệnh `PutCommand` kèm biểu thức điều kiện (Condition Expression):
    ```sql
    attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)
    ```
  - Cơ chế này đảm bảo thao tác ghi mang tính nguyên tử (atomic operation) ở mức cơ sở dữ liệu.
  - **Xử lý xung đột:** Nếu một bệnh nhân khác đã đặt trùng khung giờ (`DoctorId`, `SlotKey`) đó trước đó, DynamoDB sẽ lập tức từ chối thao tác ghi và trả về lỗi `ConditionalCheckFailedException`.
  - Backend Lambda sẽ bắt ngoại lệ này và phản hồi mã trạng thái HTTP `409 Conflict` kèm thông báo lỗi rõ ràng về cho client, ngăn chặn tuyệt đối tình trạng đặt trùng lịch (double-booking).

[⬆ Quay lại Mục lục](#mục-lục)

---

## 3. Thiết kế API cho hệ thống đặt lịch

API được thiết kế theo mô hình RESTful, cho phép giao diện người dùng giao tiếp với máy chủ thông qua các phương thức HTTP tiêu chuẩn. Dữ liệu trao đổi giữa máy khách và máy chủ chủ yếu sử dụng định dạng JSON.

### Danh sách các API chính của hệ thống


| Phương thức | Endpoint                          | Chức năng                                         |
| :------------- | :-------------------------------- | :-------------------------------------------------- |
| **GET**        | `/api/doctors`                    | Lấy danh sách bác sĩ                            |
| **GET**        | `/api/doctors/{id}`               | Xem thông tin chi tiết bác sĩ                   |
| **GET**        | `/api/doctors/{id}/availability`  | Kiểm tra lịch trống của bác sĩ                |
| **POST**       | `/api/appointments`               | Tạo lịch hẹn khám bệnh                         |
| **GET**        | `/api/appointments/{id}`          | Xem thông tin lịch hẹn                           |
| **GET**        | `/api/patients/{id}/appointments` | Xem lịch hẹn của bệnh nhân                     |
| **PATCH**      | `/api/appointments/{id}`          | Cập nhật thông tin hoặc trạng thái lịch hẹn |
| **DELETE**     | `/api/appointments/{id}`          | Hủy lịch hẹn theo quy tắc hệ thống            |

### Quy trình xử lý yêu cầu đặt lịch

Khi bệnh nhân gửi yêu cầu đặt lịch (`POST /api/appointments`), máy chủ tiến hành các bước kiểm tra và xử lý tuần tự:

1. **Xác thực người dùng:** Kiểm tra tính hợp lệ của phiên đăng nhập hoặc thông tin định danh của bệnh nhân.
2. **Kiểm tra dữ liệu đầu vào:** Xác thực các trường thông tin bắt buộc (mã bác sĩ, ngày hẹn, khung giờ, thông tin liên lạc).
3. **Xác nhận trạng thái bác sĩ:** Kiểm tra bác sĩ có đang trong trạng thái hoạt động và nhận bệnh nhân hay không.
4. **Kiểm tra khung giờ:** Xác minh khung giờ khám của bác sĩ tại thời điểm yêu cầu vẫn còn trống.
5. **Ghi nhận lịch khám:** Nếu tất cả điều kiện đều hợp lệ, hệ thống tiến hành lưu thông tin lịch hẹn vào cơ sở dữ liệu và trả về phản hồi xác nhận cho người dùng.

### Cơ chế chống trùng lịch và mã trạng thái HTTP

Để tránh việc hai hoặc nhiều bệnh nhân đặt lịch đồng thời gây trùng ca khám (race condition), thao tác kiểm tra và ghi nhận lịch hẹn cần được thực hiện bằng giao dịch cơ sở dữ liệu (Database Transaction) hoặc cơ chế khóa/ràng buộc điều kiện (Conditional Write).

Hệ thống phản hồi các mã trạng thái HTTP tương ứng:

- **`201 Created`**: Tạo lịch hẹn khám thành công và trả về dữ liệu phiếu khám đã tạo.
- **`400 Bad Request`**: Dữ liệu gửi lên không hợp lệ hoặc thiếu các trường thông tin bắt buộc.
- **`401 Unauthorized`**: Người dùng chưa xác thực hoặc phiên đăng nhập không hợp lệ.
- **`409 Conflict`**: Khung giờ khám của bác sĩ đã có bệnh nhân khác đặt trước, yêu cầu chọn khung giờ khác.

[⬆ Quay lại Mục lục](#mục-lục)

---

## 4. Thiết kế Kiến trúc AWS

Hệ thống được thiết kế theo mô hình Serverless hoàn chỉnh trên AWS Region `us-east-1` bao gồm các thành phần:

1. **Giao diện người dùng & Hosting**: Người dùng truy cập trình duyệt web để tải giao diện HTML/CSS/JavaScript lưu trữ tĩnh trên Amazon S3 (Static Website Hosting).
2. **Cổng tiếp nhận API**: Trình duyệt gửi yêu cầu RESTful HTTP đến Amazon API Gateway (đã cấu hình CORS).
3. **Xử lý nghiệp vụ**: API Gateway kích hoạt hàm AWS Lambda (`AppointmentBookingFunction` chạy Node.js).
4. **Lưu trữ dữ liệu**: Lambda truy vấn bảng Doctors và ghi phiếu khám vào bảng Appointments trên Amazon DynamoDB có gắn kèm cơ chế Conditional Write chống trùng giờ.
5. **Nhắc lịch tự động**: Lambda đẩy lịch hẹn vào Amazon EventBridge Scheduler; khi đến thời điểm nhắc khám, EventBridge kích hoạt Amazon SNS để gửi email/SMS thông báo đến bệnh nhân.
6. **Bảo mật**: AWS KMS cung cấp và quản lý khóa mã hóa dữ liệu tĩnh lưu trữ trên DynamoDB và S3.

![Sơ đồ Kiến trúc AWS CareSync](../../img/KienTrucAWS.png)

[⬆ Quay lại Mục lục](#mục-lục)
