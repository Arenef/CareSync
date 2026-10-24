# KẾ HOẠCH VÀ HƯỚNG DẪN CHI TIẾT CÁC VIỆC CẦN LÀM - TUẦN 3
## Sinh viên thực hiện: Huỳnh Ngọc Bảo Khang – MSSV: 24110241 (SV2)

* **Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
* **Dự án:** Hệ thống đặt lịch khám bệnh CareSync  
* **Nhánh Git (Branch):** `main`  
* **Vai trò:** SV2 – Backend Serverless, Cơ sở dữ liệu DynamoDB GSI, Triển khai SNS & CloudFront CDN  

---

## 📌 Checklist Tổng Hợp Các Việc Cần Làm Của SV2

- [ ] **Nhiệm vụ 1:** Tạo Global Secondary Index (GSI) `PatientPhone-index` trên bảng DynamoDB `Appointments`.
- [ ] **Nhiệm vụ 2:** Lập trình API Backend tra cứu lịch hẹn theo SĐT (`GET /appointments?phone=...`).
- [ ] **Nhiệm vụ 3:** Cấu hình Topic Amazon SNS, xác thực Email Subscription & Deploy mã nguồn lên Lambda Console.
- [ ] **Nhiệm vụ 4:** Triển khai S3 Hosting kết hợp Amazon CloudFront CDN (OAC bảo mật, ép chuyển hướng HTTPS).
- [ ] **Nhiệm vụ 5:** Kiểm thử trọn bộ API trên Postman, rà soát CloudWatch Logs và tổng hợp Báo cáo nhóm `BaoCaoWeek3.md`.

---

## 1. NHIỆM VỤ 1: TẠO GSI TRÊN BẢNG DYNAMODB APPOINTMENTS (☁️ AWS Console)

### 1.1. Mục tiêu kỹ thuật
Bảng `Appointments` hiện có Partition Key là `DoctorId` và Sort Key là `SlotKey`. Để tra cứu lịch hẹn theo **Số điện thoại** bệnh nhân mà không cần Scan toàn bộ bảng (tốn tài nguyên và chậm), ta tạo một **Global Secondary Index (GSI)** với Partition Key là `PatientPhone`.

### 1.2. Các bước thực hiện chi tiết:
1. Đăng nhập vào **AWS Console** $\rightarrow$ Chọn Region **`us-east-1` (N. Virginia)**.
2. Tìm và mở dịch vụ **Amazon DynamoDB** $\rightarrow$ Chọn menu **Tables** bên trái.
3. Nhấp chọn bảng **`Appointments`**.
4. Chuyển sang tab **Indexes** (Chỉ mục) $\rightarrow$ Bấm nút **Create index**.
5. Điền chính xác các cấu hình sau:
   * **Partition key:** Nhập `PatientPhone`
   * **Data type:** Chọn `String` (Chuỗi ký tự). *(Lưu ý: Viết đúng hoa/thường: `PatientPhone`)*.
   * **Sort key:** Để trống (không bắt buộc).
   * **Index name:** Nhập `PatientPhone-index`.
   * **Attribute projections:** Chọn **All** *(giúp trả về đầy đủ tất cả thông tin lịch hẹn khi truy vấn mà không tốn lệnh GetItem phụ)*.
6. Bấm nút **Create index**.
7. **Theo dõi trạng thái:** Cột **Status** ban đầu sẽ là `Creating`. Đợi khoảng 1 – 3 phút đến khi trạng thái chuyển sang màu xanh lá **`Active`**.

### 1.3. Minh chứng cần thu thập:
* 📸 **Ảnh 1.1:** Ảnh chụp màn hình tab **Indexes** của bảng `Appointments`, thấy rõ `Index name: PatientPhone-index`, `Partition key: PatientPhone`, và trạng thái **`Active`**.

> 🤝 **Bàn giao cho SV1:** Nhắn SV1 xác nhận: *"GSI `PatientPhone-index` đã Active trên DynamoDB!"* để SV1 triển khai giao diện Tra cứu.

---

## 2. NHIỆM VỤ 2: VIẾT API BACKEND TRA CỨU THEO SĐT (✏️ Code Backend)

### 2.1. Mục tiêu kỹ thuật
Xây dựng endpoint: `GET /appointments?phone=<Số_điện_thoại>`
* Phân luồng request `GET` tại Router.
* Trích xuất query param `phone` tại Controller và validate.
* Dùng `QueryCommand` trong tầng Service để truy vấn trực tiếp vào GSI `PatientPhone-index`.
* Trả về kết quả JSON chuẩn Native Lambda (`statusCode: 200`, CORS headers).

### 2.2. Mã nguồn chi tiết cần triển khai theo Clean Architecture:

#### Bước 2.2.1. Cập nhật `server/lambda/service/appointment.service.js`
Thêm hàm `getAppointmentsByPhone` và import thêm `QueryCommand`:
```javascript
// 1. Thêm QueryCommand vào import @aws-sdk/lib-dynamodb
const { PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/db.js");

// ... các hàm createAppointment và logic hiện tại giữ nguyên ...

/**
 * Tra cứu danh sách lịch hẹn theo số điện thoại thông qua GSI PatientPhone-index
 * @param {string} phone - Số điện thoại của bệnh nhân
 */
const getAppointmentsByPhone = async (phone) => {
    const params = {
        TableName: TABLES.APPOINTMENTS,
        IndexName: "PatientPhone-index",
        KeyConditionExpression: "PatientPhone = :phone",
        ExpressionAttributeValues: {
            ":phone": phone
        }
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];
};

// 2. Xuất hàm ra module.exports
module.exports = {
    createAppointment,
    getAppointmentsByPhone
};
```

#### Bước 2.2.2. Cập nhật `server/lambda/controller/appointment.controller.js`
Thêm hàm controller `getAppointments`:
```javascript
/**
 * Controller xử lý tra cứu danh sách lịch hẹn theo số điện thoại (GET /appointments?phone=...)
 */
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
        console.error("Lỗi getAppointments:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Lỗi hệ thống khi tra cứu lịch hẹn: " + error.message })
        };
    }
};

// Xuất ra ngoài:
module.exports = {
    createAppointment,
    getAppointments
};
```

#### Bước 2.2.3. Cập nhật `server/lambda/routes/appointment.routes.js`
Bổ sung nhánh định tuyến cho `GET /appointments`:
```javascript
const appointmentController = require("../controller/appointment.controller");

const appointmentRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    // 1. Nhánh POST tạo lịch hẹn
    if (method === "POST" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.createAppointment(event);
    }

    // 2. Nhánh GET tra cứu lịch hẹn theo SĐT (query param ?phone=...)
    if (method === "GET" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.getAppointments(event);
    }

    return null;
};

module.exports = appointmentRoutes;
```

### 2.3. Minh chứng cần thu thập:
* 📸 **Ảnh 2.1:** Mã nguồn hoàn chỉnh trong 3 file `service`, `controller`, `routes`.
* 📸 **Ảnh 2.2:** Ảnh chụp kết quả test Postman gửi `GET /appointments?phone=0901234567` trả về mã **`200 OK`** kèm mảng danh sách lịch hẹn của số điện thoại đó.

---

## 3. NHIỆM VỤ 3: CẤU HÌNH SNS TOPIC & DEPLOY LAMBDA BACKEND (☁️ AWS Console)

### 3.1. Các bước thực hiện:
1. **Khởi tạo Amazon SNS Topic:**
   * Mở dịch vụ **Amazon SNS** $\rightarrow$ Chọn **Topics** $\rightarrow$ Bấm nút **Create topic**.
   * **Type:** Chọn **Standard**.
   * **Name:** `CareSync-AppointmentNotice`.
   * **Display name:** `CareSync`.
   * Bấm **Create topic**.
   * Copy lại **Topic ARN** (ví dụ: `arn:aws:sns:us-east-1:423015976880:CareSync-AppointmentNotice`).
2. **Tạo Email Subscription & Xác nhận:**
   * Trong màn hình Topic vừa tạo, bấm **Create subscription**.
   * **Protocol:** Chọn **Email**.
   * **Endpoint:** Nhập địa chỉ email của bạn (và có thể tạo thêm 1 subscription cho email của bạn Bùi Anh Khôi để cùng nhận email test).
   * Bấm **Create subscription**.
   * Mở hộp thư Gmail $\rightarrow$ Mở email từ AWS Notifications $\rightarrow$ Bấm **Confirm subscription**.
   * Trở lại trang SNS Console và F5 tải lại: Trạng thái đổi thành **`Confirmed`**.
3. **Cấu hình Environment Variables trên AWS Lambda:**
   * Mở **AWS Lambda** $\rightarrow$ Chọn hàm `AppointmentBookingFunction`.
   * Chọn tab **Configuration** $\rightarrow$ Menu trái chọn **Environment variables** $\rightarrow$ Bấm **Edit**.
   * Thêm các biến môi trường:
     * `SNS_TOPIC_ARN` = `<ARN của Topic vừa copy>`
     * `SCHEDULER_ROLE_ARN` = `arn:aws:iam::<Account_ID>:role/LabRole`
   * Bấm **Save**.
4. **Deploy mã nguồn mới nhất lên Lambda:**
   * Đồng bộ git mới nhất (`git pull origin main`) có đủ code SNS/Scheduler của SV1 và code GSI của SV2.
   * Nén thư mục mã nguồn thành file `.zip` (gồm `config/`, `controller/`, `routes/`, `service/`, `utils/`, file `index.js` và `node_modules/`).
   * Vào Lambda Console $\rightarrow$ Tab **Code** $\rightarrow$ **Upload from** $\rightarrow$ Chọn file `.zip` $\rightarrow$ Nhấn **Save** $\rightarrow$ Nhấn nút **Deploy**.

### 3.2. Minh chứng cần thu thập:
* 📸 **Ảnh 3.1:** Topic `CareSync-AppointmentNotice` với Subscription trạng thái **`Confirmed`**.
* 📸 **Ảnh 3.2:** Bảng **Environment variables** trên Lambda cấu hình đúng 2 biến `SNS_TOPIC_ARN` và `SCHEDULER_ROLE_ARN`.
* 📸 **Ảnh 3.3:** Màn hình Lambda Console sau khi Deploy file zip thành công.

---

## 4. NHIỆM VỤ 4: HOSTING S3 KẾT HỢP AMAZON CLOUDFRONT (☁️ AWS Console)

### 4.1. Các bước thực hiện:
1. **Upload Frontend lên S3 Bucket:**
   * Kiểm tra `client/js/api.js` đã điền đúng `BASE_URL` của API Gateway.
   * Mở **Amazon S3 Console** $\rightarrow$ Chọn bucket `appointment-booking-web-demo`.
   * Tải toàn bộ nội dung trong thư mục `client/` lên bucket:
     * `index.html` (đặt tại root bucket)
     * Các thư mục con: `css/`, `js/`, `assets/`
2. **Khởi tạo CloudFront Distribution:**
   * Mở **Amazon CloudFront Console** $\rightarrow$ Bấm **Create distribution**.
   * **Origin domain:** Chọn S3 Bucket: `appointment-booking-web-demo.s3.us-east-1.amazonaws.com`.
   * **Origin access:** Chọn **Origin access control settings (recommended)** $\rightarrow$ Bấm **Create control setting** $\rightarrow$ Nhấn **Create**.
   * **Viewer protocol policy:** Chọn **Redirect HTTP to HTTPS**.
   * **Allowed HTTP methods:** Chọn `GET, HEAD`.
   * **Web Application Firewall (WAF):** Chọn **Do not enable security protections**.
   * **Default root object:** Nhập `index.html`.
   * Bấm **Create distribution**.
3. **Cập nhật Bucket Policy cho S3 (OAC):**
   * Sau khi tạo xong, bấm nút **Copy policy** ở thanh thông báo màu vàng của CloudFront.
   * Quay lại **S3 Bucket** $\rightarrow$ Tab **Permissions** $\rightarrow$ Mục **Bucket policy** $\rightarrow$ Bấm **Edit** $\rightarrow$ Dán policy vào và bấm **Save changes**.
4. **Kiểm tra nghiệm thu website CloudFront:**
   * Lấy **Distribution domain name** (Ví dụ: `https://d123456abcdef.cloudfront.net`).
   * Truy cập bằng trình duyệt: Kiểm tra website có ổ khóa bảo mật **HTTPS**, load danh sách bác sĩ động và đặt lịch mượt mà.

### 4.2. Minh chứng cần thu thập:
* 📸 **Ảnh 4.1:** Cấu hình CloudFront Distribution với Origin S3 OAC và Viewer Protocol HTTPS.
* 📸 **Ảnh 4.2:** S3 Bucket Policy cấp quyền đọc cho CloudFront OAC.
* 📸 **Ảnh 4.3:** Giao diện website CareSync hoạt động trên domain `https://...cloudfront.net`.

---

## 5. NHIỆM VỤ 5: KIỂM THỬ POSTMAN, CLOUDWATCH & BÁO CÁO (📄)

### 5.1. Các bước thực hiện:
1. **Bộ test case trên Postman:**
   * Request 1: `GET /doctors` $\rightarrow$ HTTP 200 OK (10 bác sĩ).
   * Request 2: `POST /appointments` $\rightarrow$ HTTP 201 Created (Đặt lịch mới, gửi email SNS & kích hoạt Scheduler).
   * Request 3: `POST /appointments` $\rightarrow$ HTTP 409 Conflict (Gửi lại đúng giờ đó để test chặn trùng lịch).
   * Request 4: `GET /appointments?phone=<SĐT>` $\rightarrow$ HTTP 200 OK (Truy vấn theo GSI).
   * Export collection ra file `CareSync_Week3.postman_collection.json`.
2. **Kiểm tra CloudWatch Logs:**
   * Mở **CloudWatch Logs** $\rightarrow$ Log group `/aws/lambda/AppointmentBookingFunction`.
   * Chụp lại log các lượt thực thi `QueryCommand`, `PublishCommand`, `CreateScheduleCommand`.
3. **Hoàn thiện tài liệu tuần 3:**
   * Viết file [BaoCaoWeek3.md](../BaoCaoWeek3.md) tổng hợp kết quả toàn nhóm.
   * Viết file minh chứng cá nhân SV2: `worklog/Week 3/SV2_HuynhNgocBaoKhang/MinhChungThucHanh.md`.

---

## 📅 BẢNG PHỐI HỢP & BÀN GIAO GIỮA 2 THÀNH VIÊN

| STT | Người bàn giao | Người tiếp nhận | Nội dung bàn giao | Thời điểm thực hiện |
| :-: | :------------: | :-------------: | :---------------- | :------------------ |
| 1 | **SV2** | **SV1** | Xác nhận GSI `PatientPhone-index` đã Active và URL API Gateway | Ngay sau khi xong Bước 1 |
| 2 | **SV1** | **SV2** | Push mã nguồn hoàn chỉnh (`appointment.service.js`, `patient.service.js`, `kms.service.js`, `client/`) lên `main` | Sau khi SV1 hoàn thành code |
| 3 | **SV2** | **SV1** | Điền ARN SNS/Scheduler vào Lambda, deploy và cung cấp URL CloudFront | Sau khi SV2 deploy xong Bước 3 & 4 |
| 4 | **Cả hai** | **Cả hai** | Cùng truy cập web CloudFront, test 1 ca đặt lịch hoàn chỉnh và nghiệm thu | Giai đoạn nghiệm thu cuối tuần |
