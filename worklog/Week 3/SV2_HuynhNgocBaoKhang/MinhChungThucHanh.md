# Báo Cáo Minh Chứng Thực Hành Tuần 3 - SV2 Huỳnh Ngọc Bảo Khang

**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Dự án:** Hệ thống đặt lịch khám bệnh trực tuyến CareSync  
**Sinh viên thực hiện:** Huỳnh Ngọc Bảo Khang  
**MSSV:** 24110241  
**Vai trò:** SV2 – Backend Serverless, Cơ sở dữ liệu DynamoDB GSI, Triển khai SNS & Hosting  
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
**Nhánh (Branch):** `main`  

---

## Mục Lục

- [1. Cấu hình Global Secondary Index (GSI) trên Amazon DynamoDB](#1-cấu-hình-global-secondary-index-gsi-trên-amazon-dynamodb)
  - [1.1. Lý do kỹ thuật và ý nghĩa thiết kế](#11-lý-do-kỹ-thuật-và-ý-nghĩa-thiết-kế)
  - [1.2. Cấu hình GSI PatientPhone-index ở trạng thái Active](#12-cấu-hình-gsi-patientphone-index-ở-trạng-thái-active)
- [2. Xây dựng API Backend Tra cứu Lịch hẹn theo SĐT](#2-xây-dựng-api-backend-tra-cứu-lịch-hẹn-theo-sđt)
  - [2.1. Tầng Service (QueryCommand theo GSI)](#21-tầng-service-querycommand-theo-gsi)
  - [2.2. Tầng Controller (Validation & Response Native Lambda)](#22-tầng-controller-validation--response-native-lambda)
  - [2.3. Tầng Routes (Định tuyến GET /appointments)](#23-tầng-routes-định-tuyến-get-appointments)
- [3. Cấu hình Amazon SNS Topic & Triển khai Lambda Backend](#3-cấu-hình-amazon-sns-topic--triển-khai-lambda-backend)
  - [3.1. Khởi tạo SNS Topic CareSync-AppointmentNotice & Email Confirmed](#31-khởi-tạo-sns-topic-caresync-appointmentnotice--email-confirmed)
  - [3.2. Cấu hình biến môi trường trên Lambda Console](#32-cấu-hình-biến-môi-trường-trên-lambda-console)
  - [3.3. Đóng gói mã nguồn và Deploy hàm Lambda](#33-đóng-gói-mã-nguồn-và-deploy-hàm-lambda)
- [4. Triển khai Hosting S3 và Phân tích Rào cản Phân quyền CloudFront](#4-triển-khai-hosting-s3-và-phân-tích-rào-cản-phân-quyền-cloudfront)
  - [4.1. Upload mã nguồn giao diện lên Amazon S3](#41-upload-mã-nguồn-giao-diện-lên-amazon-s3)
  - [4.2. Phân tích rào cản phân quyền IAM CloudFront OAC trên AWS Academy](#42-phân-tích-rào-cản-phân-quyền-iam-cloudfront-oac-trên-aws-academy)
  - [4.3. Kích hoạt S3 Static Website Hosting dự phòng thành công](#43-kích-hoạt-s3-static-website-hosting-dự-phòng-thành-công)
- [5. Kiểm thử Độc lập API trên Postman](#5-kiểm-thử-độc-lập-api-trên-postman)
  - [5.1. Test API GET /appointments?phone=... (200 OK)](#51-test-api-get-appointmentsphone-200-ok)
  - [5.2. Test API POST /appointments thành công & SNS Email (201 Created)](#52-test-api-post-appointments-thành-công--sns-email-201-created)
  - [5.3. Test API POST /appointments chống trùng lịch (409 Conflict)](#53-test-api-post-appointments-chống-trùng-lịch-409-conflict)
- [6. Rà soát Thực thi trên Amazon CloudWatch Logs](#6-rà-soát-thực-thi-trên-amazon-cloudwatch-logs)

---

## 1. Cấu hình Global Secondary Index (GSI) trên Amazon DynamoDB

### 1.1. Lý do kỹ thuật và ý nghĩa thiết kế
Bảng `Appointments` có khóa chính kết hợp gồm Partition Key `DoctorId` và Sort Key `SlotKey`. Cấu trúc này tối ưu tuyệt đối cho việc ngăn chặn xung đột trùng lịch của bác sĩ, tuy nhiên không hỗ trợ tìm kiếm trực tiếp lịch hẹn theo số điện thoại bệnh nhân.

Nếu không có GSI, hệ thống buộc phải sử dụng lệnh `Scan` toàn bộ bảng với độ phức tạp $O(N)$, gây tiêu tốn dung lượng đọc (RCU) và tăng thời gian phản hồi khi lượng dữ liệu lớn.

Việc thiết lập Global Secondary Index mang tên **`PatientPhone-index`** với Partition Key là **`PatientPhone` (String)** giúp chuyển đổi toàn bộ thao tác tra cứu sang lệnh **`Query`** với độ phức tạp **$O(1)$**, tốc độ phản hồi tính bằng mili-giây và mức tiêu thụ RCU tối thiểu. Ngoài ra, việc chọn thuộc tính chiếu (Attribute Projections) là **`All`** giúp trích xuất tức thì toàn bộ thông tin lịch hẹn (Bác sĩ, ngày giờ, trạng thái khám) mà không phải thực hiện thêm lệnh `GetItem` phụ.

### 1.2. Cấu hình GSI PatientPhone-index ở trạng thái Active
* **Bảng:** `Appointments`
* **Index name:** `PatientPhone-index`
* **Partition key:** `PatientPhone` (String)
* **Attribute projections:** `All`
* **Trạng thái:** `Active`

*(Chèn ảnh chụp cấu hình GSI PatientPhone-index Active trên DynamoDB Console tại đây)*

---

## 2. Xây dựng API Backend Tra cứu Lịch hẹn theo SĐT

Mã nguồn được phân tách chuẩn theo kiến trúc **Clean Architecture** mà SV2 đã thiết lập từ Tuần 2:

### 2.1. Tầng Service (`appointment.service.js`)
Sử dụng `QueryCommand` từ `@aws-sdk/lib-dynamodb` để truy vấn trực tiếp vào GSI:

```javascript
const getAppointmentsByPhone = async (phone) => {
  const params = {
    TableName: TABLES.APPOINTMENTS,
    IndexName: "PatientPhone-index",
    KeyConditionExpression: "PatientPhone = :phone",
    ExpressionAttributeValues: {
      ":phone": phone,
    },
  };

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};
```

### 2.2. Tầng Controller (`appointment.controller.js`)
Trích xuất query parameter `phone`, kiểm tra tính hợp lệ và trả về phản hồi chuẩn HTTP Native Lambda:

```javascript
const getAppointments = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const phone = queryParams.phone || queryParams.PatientPhone;

    if (!phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Vui lòng cung cấp số điện thoại (query param: ?phone=...) để tra cứu!" })
      };
    }

    const appointments = await appointmentService.getAppointmentsByPhone(phone.trim());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Tra cứu danh sách lịch hẹn thành công!",
        count: appointments.length,
        data: appointments
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Lỗi hệ thống khi tra cứu lịch hẹn: " + error.message })
    };
  }
};
```

### 2.3. Tầng Routes (`appointment.routes.js`) & Cấu hình API Gateway
Định tuyến phương thức `GET /appointments` và tích hợp vào Central Dispatcher `index.js`:

```javascript
// Nhánh GET tra cứu lịch hẹn theo SĐT (?phone=...)
if (method === "GET" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
    return await appointmentController.getAppointments(event);
}
```

Trên Amazon API Gateway (HTTP API `2q1b3nxtkg`), tiến hành tạo Route `GET /appointments` và liên kết (Attach integration) với hàm Lambda `AppointmentBookingFunction`:

![Cấu hình Route GET appointments trên Amazon API Gateway](../img/route_get_appointment.png)

---

## 3. Cấu hình Amazon SNS Topic & Triển khai Lambda Backend

### 3.1. Khởi tạo SNS Topic CareSync-AppointmentNotice & Email Confirmed
* Khởi tạo SNS Topic loại **Standard** mang tên `CareSync-AppointmentNotice`:

![Tạo SNS Topic CareSync-AppointmentNotice](../img/create_topic.png)

* Thiết lập Subscription giao thức **Email** với endpoint `24110241@student.hcmute.edu.vn`.
* Tiến hành xác thực subscription qua liên kết từ hộp thư, trạng thái chuyển sang **`Confirmed`**:

![Xác nhận Subscription Email Confirmed trên SNS](../img/create_subscription.png)

### 3.2. Cấu hình biến môi trường trên Lambda Console
Cấu hình linh hoạt các biến môi trường tại tab **Configuration $\rightarrow$ Environment variables**:
* `SNS_TOPIC_ARN`: `arn:aws:sns:us-east-1:907464754873:CareSync-AppointmentNotice`
* `SCHEDULER_ROLE_ARN`: `arn:aws:iam::907464754873:role/LabRole`

![Cấu hình Environment Variables trên Lambda Console](../img/environment_var.png)

### 3.3. Đóng gói mã nguồn và Deploy hàm Lambda
Toàn bộ mã nguồn phân tầng `config/`, `controller/`, `routes/`, `service/`, `utils/`, `index.js` được đóng gói zip và deploy thành công lên hàm `AppointmentBookingFunction`:

![Deploy thành công mã nguồn mới lên Lambda Console](../img/deploy_new_code.png)

---

## 4. Triển khai Hosting S3 và Phân tích Rào cản Phân quyền CloudFront

### 4.1. Upload mã nguồn giao diện lên Amazon S3
Upload thành công 19 tệp tin (bao gồm `index.html`, `js/`, `css/`, `assets/`) lên bucket `appointment-booking-web-demo` tại thư mục gốc:

![Upload toàn bộ 19 file giao diện lên Amazon S3 thành công](../img/upload_client_folder_to_S3.png)

### 4.2. Phân tích rào cản phân quyền IAM CloudFront OAC trên AWS Academy
Trong quá trình triển khai CloudFront Distribution kết hợp Origin Access Control (OAC), hệ thống AWS Academy Learner Lab kích hoạt cơ chế kiểm soát chính sách phân quyền (Permission Boundary):
* Lỗi phát sinh: `cloudfront:CreateOriginAccessControl AccessDenied` và `cloudfront:ListDistributions AccessDenied`.
* Nguyên nhân: Môi trường AWS Academy Learner Lab áp dụng SCP/Boundary hạn chế các dịch vụ CDN toàn cầu để kiểm soát chi phí băng thông mạng của sinh viên.

### 4.3. Kích hoạt S3 Static Website Hosting dự phòng thành công
Áp dụng chiến lược kiến trúc dự phòng (Fallback Architecture):
* Kích hoạt **Static website hosting** trên bucket `appointment-booking-web-demo` với Index document `index.html`.
* Mở quyền Public Read thông qua Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::appointment-booking-web-demo/*"
    }
  ]
}
```
* Website hoạt động thông suốt, tải động danh sách 10 bác sĩ và giao diện đặt lịch khám tại:  
  `http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com`.

![Giao diện website CareSync hoạt động trên S3 Static Website Hosting](../img/website.png)

---

## 5. Kiểm thử Độc lập API trên Postman

### 5.1. Test API GET /appointments?phone=... (200 OK)
* **Request:** `GET https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments?phone=0934567803`
* **Kết quả:** HTTP **`200 OK`**, Body trả về đầy đủ danh sách lịch hẹn của số điện thoại `0934567803` thông qua GSI DynamoDB:

![Kiểm thử Postman tra cứu lịch hẹn theo SĐT thành công 200 OK](../img/postman_get_appointment.png)

### 5.2. Test API POST /appointments thành công & SNS Email (201 Created)
* **Request:** `POST https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com/appointments`
* **Kết quả:** HTTP **`201 Created`**, ghi dữ liệu vào bảng `Appointments`, lưu hồ sơ `Patients`, xuất bản email xác nhận qua SNS và kích hoạt EventBridge Scheduler hẹn giờ nhắc sau 2 phút.

### 5.3. Test API POST /appointments chống trùng lịch (409 Conflict)
* **Kịch bản:** Gửi lại dữ liệu trùng bác sĩ và khung giờ khám đã đặt trước.
* **Kết quả:** Biểu thức `ConditionExpression` từ chối ghi, Lambda bắt lỗi và trả về HTTP **`409 Conflict`**.

---

## 6. Rà soát Thực thi trên Amazon CloudWatch Logs

Kiểm tra nhóm log `/aws/lambda/AppointmentBookingFunction` ghi nhận đầy đủ luồng thực thi:
* Truy vấn Query qua GSI `PatientPhone-index`.
* Xuất bản thông báo email qua Amazon SNS.
* Tạo lịch nhắc thành công trên Amazon EventBridge Scheduler.
