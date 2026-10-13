# Báo Cáo Thực Hiện Tuần 1 - Dự Án CareSync

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
- [9. Dựng S3, DynamoDB, Lambda, API Gateway thử nghiệm trên AWS Learner Lab](#9-dựng-s3-dynamodb-lambda-api-gateway-thử-nghiệm-trên-aws-learner-lab)
  - [9.1. Khởi tạo Amazon S3 Bucket](#91-khởi-tạo-amazon-s3-bucket)
  - [9.2. Khởi tạo và cấu hình Amazon DynamoDB](#92-khởi-tạo-và-cấu-hình-amazon-dynamodb)
  - [9.3. Xây dựng AWS Lambda Function](#93-xây-dựng-aws-lambda-function)
  - [9.4. Cấu hình Amazon API Gateway (HTTP API)](#94-cấu-hình-amazon-api-gateway-http-api)
  - [9.5. Kiểm thử tích hợp qua Postman](#95-kiểm-thử-tích-hợp-qua-postman)

---

## 1. API Gateway và Lambda: chức năng, cách hoạt động, cách kết nối

### AWS Lambda:
- **Khái niệm:** Là dịch vụ điện toán không máy chủ (Serverless Compute) cho phép thực thi mã nguồn (chạy môi trường Node.js) mà không cần cấu hình, khởi tạo hay quản lý hệ điều hành máy chủ.
- **Đặc điểm & Ưu điểm:**
  - Lambda tự động co giãn (auto-scaling) theo số lượng yêu cầu gọi vào từ người dùng.
  - Tối ưu chi phí: chỉ tính phí theo thời gian chạy thực tế (tính theo mili-giây) và số lượng yêu cầu xử lý, không phát sinh chi phí khi ở trạng thái nhàn rỗi (idle).

### Amazon API Gateway (HTTP API):
- **Vai trò:** Đóng vai trò làm cổng tiếp nhận (entry point) và định tuyến các yêu cầu HTTP từ phía client (trình duyệt web, ứng dụng di động) đến các dịch vụ xử lý backend như AWS Lambda.
- **Lý do lựa chọn HTTP API:** 
  - Giảm độ trễ và tối ưu chi phí hơn so với REST API truyền thống.
  - Hỗ trợ cấu hình CORS (Cross-Origin Resource Sharing) nhanh chóng và trực quan cho các ứng dụng web tĩnh lưu trữ trên Amazon S3.

### Cơ chế kết nối giữa API Gateway và Lambda:
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

## 2. DynamoDB: cấu trúc bảng, key, CRUD và Conditional Write chống trùng lịch

### Amazon DynamoDB:
- **Khái niệm:** Là dịch vụ cơ sở dữ liệu NoSQL dạng Key-Value và Document có hiệu năng cao, độ trễ thấp tính bằng mili-giây ở mọi quy mô và khả năng mở rộng tự động.
- **Cơ chế Schema:** DynamoDB không yêu cầu khai báo schema cố định cho toàn bộ các thuộc tính (Schemaless) mà chỉ cần xác định cấu trúc khóa chính (Primary Key) khi khởi tạo bảng.

### Cấu trúc bảng và Khóa chính (Primary Key):
- **Partition Key (PK):** Dùng để băm (hash) và phân tán dữ liệu đồng đều trên các phân vùng vật lý (partitions) của AWS (ví dụ: `DoctorId`).
- **Composite Primary Key (PK + Sort Key):** 
  - Kết hợp Partition Key và Sort Key (ví dụ: `DoctorId` và `SlotKey`) để tạo thành khóa chính phức hợp duy nhất.
  - Cho phép định danh chính xác từng khung giờ khám của từng bác sĩ cụ thể, đồng thời hỗ trợ truy vấn nhanh danh sách các khung giờ của một bác sĩ.

### Thao tác CRUD trong hệ thống:
Hệ thống sử dụng AWS SDK (v3) để thực thi các tác vụ:
- **Scan:** Quét toàn bộ bảng danh sách bác sĩ (`Doctors`) để lấy thông tin hiển thị lên giao diện đặt khám.
- **PutItem / PutCommand:** Ghi thông tin lịch khám mới vào bảng `Appointments`.
- **GetItem / GetCommand:** Truy vấn chi tiết thông tin một lịch hẹn hoặc bác sĩ theo khóa chính.
- **DeleteItem / UpdateItem:** Thực hiện hủy hoặc cập nhật trạng thái phiếu khám (ví dụ: từ `CONFIRMED` sang `CANCELLED`).

### Cơ chế Conditional Write chống trùng lịch:
- **Vai trò:** Đây là tính năng then chốt của bài toán đặt lịch khám trong dự án CareSync nhằm giải quyết tranh chấp ghi đồng thời (race condition).
- **Cơ chế hoạt động:** 
  - Khi người dùng gửi yêu cầu ghi lịch hẹn vào bảng `Appointments`, Lambda gửi lệnh `PutCommand` kèm biểu thức điều kiện (Condition Expression):
    ```sql
    attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)
    ```
  - Cơ chế này đảm bảo thao tác ghi mang tính nguyên tử (atomic operation) ở mức cơ sở dữ liệu.
  - **Xử lý xung đột:** Nếu một bệnh nhân khác đã đặt trùng khung giờ (`DoctorId`, `SlotKey`) đó trước đó, DynamoDB sẽ lập tức từ chối thao tác ghi và trả về lỗi `ConditionalCheckFailedException`.
  - Backend Lambda sẽ bắt ngoại lệ này và phản hồi mã trạng thái HTTP `409 Conflict` kèm thông báo lỗi rõ ràng về cho client, ngăn chặn tuyệt đối tình trạng đặt trùng lịch (double-booking).

## 9. Dựng S3, DynamoDB, Lambda, API Gateway thử nghiệm trên AWS Learner Lab

### 9.1. Khởi tạo Amazon S3 Bucket

Tạo thành công S3 Bucket mang tên `appointment-booking-web-demo` tại vùng `us-east-1` đóng vai trò lưu trữ mã nguồn giao diện web tĩnh (HTML, CSS, JS).

![Khởi tạo S3 Bucket appointment-booking-web-demo](./img/S3_Demo.png)

---

### 9.2. Khởi tạo và cấu hình Amazon DynamoDB

> **Lưu ý:** Giai đoạn PoC tuần 1 chỉ khởi tạo bảng `Doctors` và `Appointments` nhằm tập trung kiểm thử tính năng Conditional Write; bảng `Patients` sẽ được triển khai cùng module xác thực ở tuần sau.

- **Bảng Doctors:** Khởi tạo với Partition Key `DoctorId` (String) ở chế độ On-demand.

![Cấu hình bảng Doctors](./img/DynamoDB_Config_Doctors.png)

- **Bảng Appointments:** Khởi tạo với Composite Primary Key gồm Partition Key `DoctorId` (String) và Sort Key `SlotKey` đại diện cho trường `AppointmentDateTime` để phục vụ Conditional Write nhằm ngăn chặn việc trùng lặp ca khám trên cùng một khung giờ của bác sĩ.

![Cấu hình bảng Appointments](./img/DynamoDB_Config_Appointments.png)

- **Trạng thái bảng:** Cả hai bảng đều ở trạng thái Active sẵn sàng phục vụ truy vấn.

![Hai bảng Doctors và Appointments ở trạng thái Active](./img/DynamoDB_Doctors_Appointments_Active.png)

---

### 9.3. Xây dựng AWS Lambda Function

Khởi tạo hàm xử lý bằng runtime **Node.js 24.x** (gán quyền thực thi qua role `LabRole` có sẵn của Learner Lab).

![Khởi tạo Lambda Function](./img/Function_Demo.png)

Sử dụng thư viện `@aws-sdk/lib-dynamodb` để kết nối và thao tác với DynamoDB:

- `GET /doctors`: Thực hiện lệnh `ScanCommand` lấy danh sách bác sĩ từ bảng `Doctors`.
- `POST /appointments`: Thực hiện lệnh `PutCommand` ghi phiếu hẹn vào bảng `Appointments` kèm biểu thức `ConditionExpression: "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)"`. Nếu bị trùng giờ, hàm bắt ngoại lệ `ConditionalCheckFailedException` và trả về lỗi HTTP `409 Conflict`.

**Mã nguồn hàm Lambda:**

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  PutCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const DOCTORS_TABLE = "Doctors";
const APPOINTMENTS_TABLE = "Appointments";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));
  const httpMethod = event.requestContext?.http?.method || event.httpMethod;
  const path = event.requestContext?.http?.path || event.path;

  try {
    // 1. GET /doctors: Quét và đọc dữ liệu thật từ bảng Doctors trong DynamoDB
    if (httpMethod === "GET" && path.endsWith("/doctors")) {
      const data = await ddbDocClient.send(
        new ScanCommand({ TableName: DOCTORS_TABLE })
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: data.Items || [] })
      };
    }

    // 2. POST /appointments: Ghi lịch hẹn và dùng Conditional Write chống trùng lịch
    if (httpMethod === "POST" && path.endsWith("/appointments")) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { doctorId, patientName, patientPhone, appointmentDate, slotTime } = body;

      if (!doctorId || !patientName || !appointmentDate || !slotTime) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Thiếu thông tin đặt lịch bắt buộc!" })
        };
      }

      const appointmentItem = {
        DoctorId: doctorId,
        SlotKey: `${appointmentDate}#${slotTime}`, // Composite Sort Key
        AppointmentId: "APT-" + Date.now(),
        PatientName: patientName,
        PatientPhone: patientPhone || "",
        AppointmentDate: appointmentDate,
        SlotTime: slotTime,
        Status: "CONFIRMED",
        CreatedAt: new Date().toISOString()
      };

      try {
        await ddbDocClient.send(
          new PutCommand({
            TableName: APPOINTMENTS_TABLE,
            Item: appointmentItem,
            // Chống trùng lịch: nếu trùng cả DoctorId và SlotKey thì chặn ghi
            ConditionExpression: "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)"
          })
        );
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            message: "Đặt lịch khám thành công!",
            data: appointmentItem
          })
        };
      } catch (err) {
        // Bắt lỗi nếu khung giờ bị đặt trùng
        if (err.name === "ConditionalCheckFailedException") {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              error: "Khung giờ này của bác sĩ đã có người đặt trước. Vui lòng chọn giờ khác!"
            })
          };
        }
        throw err;
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Route không tồn tại" })
    };
  } catch (error) {
    console.error("Lỗi:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Lỗi hệ thống: " + error.message })
    };
  }
};
```

Deploy Lambda function thành công:

![Deploy Lambda Function thành công](./img/Function_Demo_Deploy_Success.png)

---

### 9.4. Cấu hình Amazon API Gateway (HTTP API)

- Tạo API mang tên `AppointmentBookingAPI` tích hợp trực tiếp với Lambda function `AppointmentBookingFunction`.

![Tạo AppointmentBookingAPI](./img/API_Demo.png)

- Định tuyến (Routes) 2 endpoint chính: `GET /doctors` và `POST /appointments` trên stage mặc định `$default` (bật Auto-deploy).

*Cấu hình routes:*
![Cấu hình routes](./img/API_Demo_2.png)

*Cấu hình stages:*
![Cấu hình stages](./img/API_Demo_3.png)

- Cấu hình đầy đủ Cross-Origin Resource Sharing (CORS) (`Access-Control-Allow-Origin: *`, Methods: `GET, POST, OPTIONS`, Headers: `content-type, authorization`) để sẵn sàng cho frontend gọi API mà không bị chặn bởi trình duyệt.

![Cấu hình CORS trên API Gateway](./img/API_Demo_4.png)

---

### 9.5. Kiểm thử tích hợp qua Postman

- **Test GET /doctors:** Gửi request thành công, nhận phản hồi mã `200 OK` kèm danh sách bác sĩ truy vấn trực tiếp từ bảng `Doctors` trong DynamoDB.

![Kiểm thử GET /doctors](./img/Test_API_1.png)

- **Test POST /appointments:** Gửi request đặt lịch với bác sĩ `DOC01` vào khung giờ `2026-10-15#09:00`, nhận mã `201 Created` và dữ liệu được ghi nhận vào DynamoDB.

*Request Body (Input):*
![Input đặt lịch](./img/Test_API_2.png)

*Response (Output đặt lịch thành công):*
![Output đặt lịch thành công](./img/Test_API_3.png)

- **Test chống trùng lịch (Conditional Write):** Gửi lại request với cùng thông tin ca khám vừa đặt, hệ thống kích hoạt cơ chế chống trùng lặp và phản hồi đúng mã `409 Conflict` kèm thông báo *"Khung giờ này của bác sĩ đã có người đặt trước. Vui lòng chọn giờ khác!"*.

![Kiểm thử trùng lịch phản hồi 409 Conflict](./img/Test_API_4.png)
