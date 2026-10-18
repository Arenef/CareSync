<a id="top"></a>

# KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC

**Sinh viên 2:** Huỳnh Ngọc Bảo Khang  
**MSSV:** 24110241  
**Vai trò:** SV2 – Backend Serverless & Tích hợp Frontend  

---

## Mục lục

- [1. Khai báo công cụ AI](#1-khai-bao-cong-cu-ai)
- [2. Tra cứu tác dụng và cách sử dụng các Command trong DynamoDB SDK v3](#2-tra-cuu-tac-dung-va-cach-su-dung-cac-command-trong-dynamodb-sdk-v3)
- [3. Ứng dụng thực tế vào mã nguồn CareSync](#3-ung-dung-thuc-te-vao-ma-nguon-caresync)

---

<a id="1-khai-bao-cong-cu-ai"></a>

## 1. Khai báo công cụ AI

- **Công cụ AI sử dụng:** ChatGPT  
- **Model:** ChatGPT-4o  
- **Mục đích:** Tra cứu cú pháp, tác dụng và cách thức hoạt động của các Command cơ bản trong thư viện `@aws-sdk/lib-dynamodb` (AWS SDK v3) nhằm phục vụ việc xây dựng tầng Service trên AWS Lambda và thao tác với Amazon DynamoDB cho dự án CareSync.

---

<a id="2-tra-cuu-tac-dung-va-cach-su-dung-cac-command-trong-dynamodb-sdk-v3"></a>

## 2. Tra cứu tác dụng và cách sử dụng các Command trong DynamoDB SDK v3

**Prompt:**

> nêu tác dụng và cách sử dụng của: PutCommand, GetCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand, trả lời gọn

### Nội dung AI sinh ra

| Command | Tác dụng | Cách sử dụng |
| :--- | :--- | :--- |
| **PutCommand** | Thêm item mới hoặc ghi đè item có cùng khóa chính. | Truyền `TableName` và `Item`. |
| **GetCommand** | Lấy một item theo khóa chính. | Truyền `TableName` và `Key`. |
| **ScanCommand** | Quét toàn bộ bảng hoặc một phần bảng. | Truyền `TableName`, có thể thêm `FilterExpression`. |
| **QueryCommand** | Truy vấn item theo Partition Key và điều kiện Sort Key. | Truyền `TableName` và `KeyConditionExpression`. |
| **UpdateCommand** | Cập nhật hoặc thêm thuộc tính cho item. | Truyền `TableName`, `Key`, `UpdateExpression`. |
| **DeleteCommand** | Xóa một item theo khóa chính. | Truyền `TableName` và `Key`. |

#### Ví dụ sử dụng chung:

```javascript
const { PutCommand } = require("@aws-sdk/lib-dynamodb");

await docClient.send(new PutCommand({
    TableName: "Doctors",
    Item: {
        DoctorId: "D01",
        Name: "Nguyen Van A"
    }
}));
```

#### Ghi nhớ nhanh:

- **Put** → Thêm / ghi đè.
- **Get** → Lấy một item.
- **Scan** → Quét bảng.
- **Query** → Truy vấn theo khóa.
- **Update** → Cập nhật.
- **Delete** → Xóa.

---

<a id="3-ung-dung-thuc-te-vao-ma-nguon-caresync"></a>

## 3. Ứng dụng thực tế vào mã nguồn CareSync

### Nội dung đã hoàn thiện:

Dựa trên phản hồi từ AI, sinh viên đã nắm rõ cơ chế và áp dụng chuẩn xác vào dự án thực tế:

1. **Sử dụng `ScanCommand` trong `doctor.service.js`:**
   - Dùng để quét và lấy toàn bộ danh sách 10 bác sĩ từ bảng `Doctors` trên DynamoDB (`us-east-1`).
   - Cung cấp dữ liệu trực tiếp cho endpoint `GET /doctors` hiển thị động lên giao diện web CareSync.

2. **Sử dụng `PutCommand` kết hợp `ConditionExpression` trong `appointment.service.js`:**
   - Sử dụng `PutCommand` để tạo mới bản ghi lịch hẹn trên bảng `Appointments`.
   - Kết hợp biểu thức điều kiện `attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)` để đảm bảo tính nguyên tử (atomic check), chặn hoàn toàn lỗi đặt trùng khung giờ (double-booking).
   - Xử lý mã lỗi `ConditionalCheckFailedException` từ DynamoDB và trả về mã HTTP `409 Conflict` kèm thông báo trực quan cho người dùng.

**Hình ảnh minh chứng:** Chi tiết mã nguồn và hình ảnh thực hành được trình bày tại [MinhChungThucHanh.md](MinhChungThucHanh.md).

---

[↑ Quay lại đầu trang](#top)
