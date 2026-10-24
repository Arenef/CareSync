<a id="top"></a>

# Báo Cáo Minh Chứng Thực Hành Tuần 3 - SV1 Bùi Anh Khôi

**Học phần:** Điện toán đám mây (Cloud Computing) – HCMUTE  
**Dự án:** Hệ thống đặt lịch khám bệnh cho phòng khám trực tuyến (CareSync)  
**Sinh viên thực hiện:** Bùi Anh Khôi  
**MSSV:** 24110258  
**Vai trò:** SV1 – Bảo mật dữ liệu AWS KMS, Tự động hóa SNS & Scheduler, Module Hồ sơ Bệnh nhân, Giao diện Tra cứu Lịch hẹn  
**Repository GitHub:** [https://github.com/Arenef/CareSync](https://github.com/Arenef/CareSync)  
**Nhánh (Branch):** `main`  

---

## Mục Lục

- [1. Triển khai Mã hóa Dữ liệu Nhạy cảm bằng AWS KMS](#1-trien-khai-ma-hoa-du-lieu-nhay-cam-bang-aws-kms)
  - [1.1. Cấu hình Customer Managed Key (CMK) trên AWS KMS Console](#11-cau-hinh-customer-managed-key-cmk-tren-aws-kms-console)
  - [1.2. Thiết lập Bí danh (Alias) và Thẻ phân loại (Tags)](#12-thiet-lap-bi-danh-alias-va-the-phan-loai-tags)
  - [1.3. Khởi tạo Khóa KMS thành công ở trạng thái Enabled](#13-khoi-tao-khoa-kms-thanh-cong-o-trang-thai-enabled)
  - [1.4. Xây dựng Module Dịch vụ Mã hóa Envelope Encryption (kms.service.js)](#14-xay-dung-module-dich-vu-ma-hoa-envelope-encryption-kmsservicejs)
  - [1.5. Viết Script và Kiểm thử Độc lập (test-kms.js)](#15-viet-script-va-kiem-thu-doc-lap-test-kmsjs)
- [2. Tích hợp Amazon SNS & EventBridge Scheduler vào Quy trình Đặt lịch](#2-tich-hop-amazon-sns--eventbridge-scheduler-vao-quy-trinh-dat-lich)
  - [2.1. Kiến trúc xử lý luồng thông báo bất đồng bộ](#21-kien-truc-xu-ly-luong-thong-bao-bat-dong-bo)
  - [2.2. Chi tiết mã nguồn tích hợp (appointment.service.js)](#22-chi-tiet-ma-nguon-tich-hop-appointmentservicejs)
- [3. Xây dựng Module Lưu trữ và Đồng bộ Hồ sơ Bệnh nhân (patient.service.js)](#3-xay-dung-module-luu-tru-va-dong-bo-ho-so-benh-nhan-patientservicejs)
  - [3.1. Thiết kế định danh duy nhất PAT-cleanPhone](#31-thiet-ke-dinh-danh-duy-nhat-pat-cleanphone)
  - [3.2. Triển khai ghi song song vào bảng Patients](#32-trien-khai-ghi-song-song-vao-bang-patients)
- [4. Xây dựng Giao diện Form Tra Cứu "Lịch hẹn của tôi"](#4-xay-dung-giao-dien-form-tra-cuu-lich-hen-cua-toi)
  - [4.1. Thiết kế Form tra cứu số điện thoại chuẩn Việt Nam](#41-thiet-ke-form-tra-cuu-so-dien-thoai-chuan-viet-nam)
  - [4.2. Tích hợp gọi API của SV2 và cơ chế Fallback](#42-tich-hop-goi-api-cua-sv2-va-co-che-fallback)
  - [4.3. Hiển thị thẻ lịch hẹn trực quan và Toast cảnh báo](#43-hien-thi-the-lich-hen-truc-quan-va-toast-canh-bao)

---

<a id="1-trien-khai-ma-hoa-du-lieu-nhay-cam-bang-aws-kms"></a>

## 1. Triển khai Mã hóa Dữ liệu Nhạy cảm bằng AWS KMS

Trong hệ thống y tế như CareSync, các thông tin định danh cá nhân của người bệnh bao gồm **Số điện thoại**, **Số Căn cước công dân (CCCD)** và **Email** là dữ liệu nhạy cảm cao (PII - Personally Identifiable Information). Nhằm tuân thủ các nguyên tắc bảo mật đám mây và tiêu chuẩn y tế, SV1 đã trực tiếp cấu hình và triển khai giải pháp mã hóa dữ liệu văn bản tĩnh bằng dịch vụ **AWS Key Management Service (KMS)**.

---

<a id="11-cau-hinh-customer-managed-key-cmk-tren-aws-kms-console"></a>

### 1.1. Cấu hình Customer Managed Key (CMK) trên AWS KMS Console

* **Dịch vụ:** AWS Key Management Service (KMS)
* **Khu vực (Region):** `us-east-1` (N. Virginia)
* **Loại khóa (Key type):** **Symmetric** (Khóa đối xứng đơn dùng cho cả quá trình mã hóa và giải mã dữ liệu).
* **Mục đích sử dụng (Key usage):** **Encrypt and decrypt**
* **Tiêu chuẩn thuật toán mã hóa:** `SYMMETRIC_DEFAULT` (chuẩn AES-256-GCM bảo mật cao cấp theo tiêu chuẩn của NIST).

![Cấu hình loại khóa Symmetric và mục đích mã hóa trên AWS KMS Console](../img/CareSync_KMS_1.png)
*Hình 1.1: Màn hình Step 1 - Cấu hình Key type là Symmetric và Key usage là Encrypt and decrypt trên AWS KMS Console.*

---

<a id="12-thiet-lap-bi-danh-alias-va-the-phan-loai-tags"></a>

### 1.2. Thiết lập Bí danh (Alias) và Thẻ phân loại (Tags)

Nhằm giúp mã nguồn ứng dụng có thể gọi khóa thông qua định danh mang tính gợi nhớ mà không bị phụ thuộc cứng vào mã Key ID ngẫu nhiên của AWS, SV1 đã cấu hình bí danh chuẩn:
* **Bí danh (Alias):** `caresync-patient-key` (Đường dẫn alias đầy đủ: `alias/caresync-patient-key`).
* **Mô tả (Description):** `Encryption key for sensitive patient data` (Khóa mã hóa cho dữ liệu nhạy cảm của người bệnh).
* **Thẻ quản trị (Tags):**
  * `Key:` `project`
  * `Value:` `CareSync`

![Thiết lập Alias caresync-patient-key và Tags quản trị dự án CareSync](../img/CareSync_KMS_2.png)
*Hình 1.2: Màn hình Step 2 - Đặt bí danh alias/caresync-patient-key và cấu hình tag cho khóa KMS.*

---

<a id="13-khoi-tao-khoa-kms-thanh-cong-o-trang-thai-enabled"></a>

### 1.3. Khởi tạo Khóa KMS thành công ở trạng thái Enabled

Sau khi hoàn tất việc định nghĩa quyền quản trị (Key administrators) và phân quyền sử dụng (Key usage permissions) cho tài khoản học tập `voclabs/user5515277=24110258@student.hcmute.edu.vn`, khóa đã được khởi tạo thành công:
* **Mã khóa (Key ID):** `d476cab3-aa0f-4862-a3ca-e37e97f356c4`
* **Amazon Resource Name (ARN):** `arn:aws:kms:us-east-1:423015976880:key/d476cab3-aa0f-4862-a3ca-e37e97f356c4`
* **Bí danh (Alias):** `caresync-patient-key`
* **Trạng thái (Status):** **`Enabled`** (Sẵn sàng tiếp nhận các yêu cầu mã hóa/giải mã API từ hệ thống).
* **Phạm vi vùng (Regionality):** Single Region (`us-east-1`).

![Khóa KMS caresync-patient-key đã khởi tạo thành công ở trạng thái Enabled](../img/CareSync_KMS_3.png)
*Hình 1.3: Chi tiết thông tin cấu hình và trạng thái Enabled của khóa KMS trên bảng điều khiển AWS.*

---

<a id="14-xay-dung-module-dich-vu-ma-hoa-envelope-encryption-kmsservicejs"></a>

### 1.4. Xây dựng Module Dịch vụ Mã hóa (kms.service.js)

Tại thư mục [`server/lambda/service/kms.service.js`](../../server/lambda/service/kms.service.js), SV1 đã sử dụng thư viện chuẩn AWS SDK for JavaScript v3 (`@aws-sdk/client-kms`) để xây dựng 2 hàm cốt lõi:
1. `encryptData(text)`: Chuyển chuỗi văn bản thuần (plaintext) thành dạng Buffer nhị phân, gọi lệnh `EncryptCommand` lên khóa KMS, và chuyển đổi kết quả `CiphertextBlob` sang định dạng chuỗi **Base64** để lưu trữ an toàn vào cơ sở dữ liệu.
2. `decryptData(cipherTextBase64)`: Tiếp nhận chuỗi Base64, giải mã về Buffer qua `DecryptCommand` và trích xuất lại văn bản gốc dạng `utf-8`.

Đặc biệt, module hỗ trợ cơ chế đọc khóa linh hoạt từ biến môi trường (`KMS_KEY_ARN` hoặc `KMS_KEY_ID`), tự động fallback về `alias/caresync-patient-key` và hỗ trợ nạp credentials an toàn khi kiểm thử cục bộ.

Trích đoạn mã nguồn xử lý [`server/lambda/service/kms.service.js`](../../server/lambda/service/kms.service.js):
```javascript
const { KMSClient, EncryptCommand, DecryptCommand } = require("@aws-sdk/client-kms");

const REGION = process.env.AWS_REGION || "us-east-1";
const kmsClient = new KMSClient({ region: REGION });

// Đọc ARN khóa KMS hoặc Alias từ biến môi trường
const KEY_ID = process.env.KMS_KEY_ARN || process.env.KMS_KEY_ID || "alias/caresync-patient-key";

/**
 * Mã hóa chuỗi văn bản thuần thành ciphertext dạng Base64
 */
async function encryptData(text) {
  if (!text) return "";
  const result = await kmsClient.send(
    new EncryptCommand({
      KeyId: KEY_ID,
      Plaintext: Buffer.from(text, "utf-8"),
    })
  );
  return Buffer.from(result.CiphertextBlob).toString("base64");
}

/**
 * Giải mã ciphertext dạng Base64 về chuỗi ban đầu
 */
async function decryptData(cipherText) {
  if (!cipherText) return "";
  const result = await kmsClient.send(
    new DecryptCommand({
      CiphertextBlob: Buffer.from(cipherText, "base64"),
    })
  );
  return Buffer.from(result.Plaintext).toString("utf-8");
}
```

---

<a id="15-viet-script-va-kiem-thu-doc-lap-test-kmsjs"></a>

### 1.5. Viết Script và Kiểm thử Độc lập (test-kms.js)

Để kiểm chứng tính chính xác của thuật toán và quyền truy cập khóa KMS từ máy trạm phát triển, SV1 đã viết script kiểm thử độc lập [`server/lambda/test-kms.js`](../../server/lambda/test-kms.js) với 2 tập dữ liệu mẫu:
* **Dữ liệu 1 - Số điện thoại người bệnh:** `0912345678`
* **Dữ liệu 2 - Số Căn cước công dân (CCCD):** `012345678901`

**Quy trình kiểm thử:**
1. Thực hiện mã hóa plaintext ban đầu qua hàm `encryptData`.
2. Ghi nhận chuỗi ciphertext nhị phân được mã hóa dưới dạng Base64.
3. Chuyển chuỗi Base64 vào hàm `decryptData` để giải mã ngược lại.
4. So sánh kết quả sau giải mã với dữ liệu gốc: nếu hoàn toàn trùng khớp thì xuất kết quả **`PASS`**, ngược lại xuất **`FAIL`**.

**Kết quả chạy thực tế trên Terminal:**
```bash
D:\Src Code\HTML_CSS_JS\CareSync\CareSync>cd "D:\Src Code\HTML_CSS_JS\CareSync\CareSync\server\lambda"
D:\Src Code\HTML_CSS_JS\CareSync\CareSync\server\lambda>node test-kms.js
=== TEST PHONE ===
Encrypted: AQICAHh+YKwBNewmcmYF3VUy69BJL6tbLRZWk60vMEB3oLK0vwHqfbdH1ZXkQGRc40Khx8EfAAAAaDBmBgkqhkiG9w0BBwagWTBXAgEAMFIGCSqGSIb3DQEHA...
Decrypted: 0912345678
Result: PASS

=== TEST CCCD ===
Encrypted: AQICAHh+YKwBNewmcmYF3VUy69BJL6tbLRZWk60vMEB3oLK0vwF7Ur8jsxq0twk925L7RNWYAAAAajBoBgkqhkiG9w0BBwagWzBZAgEAMFQGCSqGSIb3DQEHA...
Decrypted: 012345678901
Result: PASS
```

![Kết quả chạy kiểm thử test-kms.js thành công 100% PASS trên terminal](../img/CareSync_KMS_4.png)
*Hình 1.4: Màn hình thực thi script test-kms.js kiểm thử mã hóa và giải mã số điện thoại, CCCD thành công rực rỡ với kết quả PASS.*

---

<a id="2-tich-hop-amazon-sns--eventbridge-scheduler-vao-quy-trinh-dat-lich"></a>

## 2. Tích hợp Amazon SNS & EventBridge Scheduler vào Quy trình Đặt lịch

---

<a id="21-kien-truc-xu-ly-luong-thong-bao-bat-dong-bo"></a>

### 2.1. Kiến trúc xử lý luồng thông báo bất đồng bộ

Nhằm hoàn thiện luồng nghiệp vụ sau khi người bệnh đăng ký khám, SV1 đã tích hợp trực tiếp 2 dịch vụ thông báo và lập lịch vào module [`server/lambda/service/appointment.service.js`](../../server/lambda/service/appointment.service.js):
1. **Amazon SNS (Email tức thời):** Ngay sau khi phiếu khám được ghi thành công vào bảng `Appointments` của DynamoDB, hệ thống tự động gọi `PublishCommand` gửi email định dạng chuyên nghiệp thông báo Mã lịch hẹn, Bác sĩ, Ngày khám và Giờ khám đến hộp thư của người bệnh.
2. **Amazon EventBridge Scheduler (Nhắc lịch tự động):** Khởi tạo một One-time schedule `at(yyyy-MM-ddTHH:mm:ss)` với thời gian sau 2 phút. Lịch trình này sẽ tự động kích hoạt đẩy thông điệp nhắc lịch hẹn vào SNS Topic để gửi email nhắc nhở cho bệnh nhân, kèm cấu hình `ActionAfterCompletion: "DELETE"` giúp tự động dọn dẹp lịch trình sau khi hoàn thành.
3. **Mô hình thực thi bất đồng bộ:** Áp dụng `Promise.all` cho các tác vụ gửi thông báo giúp phản hồi HTTP `201 Created` trả về cho Frontend gần như ngay lập tức mà không phải chờ quá trình xử lý email mạng.

---

<a id="22-chi-tiet-ma-nguon-tich-hop-appointmentservicejs"></a>

### 2.2. Chi tiết mã nguồn tích hợp (appointment.service.js)

Trích đoạn mã nguồn trong hàm `createAppointment`:
```javascript
// Đọc ARN linh hoạt từ biến môi trường
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN;
const schedulerTargetArn = process.env.SCHEDULER_TARGET_ARN || snsTopicArn;

// 1. Gửi email xác nhận đặt lịch tức thì qua Amazon SNS
if (snsTopicArn) {
  const publishTask = snsClient.send(
    new PublishCommand({
      TopicArn: snsTopicArn,
      Subject: `[CareSync] Xác nhận đặt lịch khám #${appointmentId}`,
      Message: [
        `Xin chào ${patientName},`,
        `Lịch hẹn khám bệnh của bạn đã được xác nhận thành công trên CareSync:`,
        `- Mã lịch hẹn: ${appointmentId}`,
        `- Bác sĩ: ${doctorId}`,
        `- Ngày khám: ${appointmentDate}`,
        `- Khung giờ: ${slotTime}`,
        `Vui lòng đến trước giờ hẹn 15 phút. Trân trọng!`
      ].join("\n"),
    })
  );
  asyncTasks.push(publishTask);
}

// 2. Tạo lịch nhắc one-time sau 2 phút qua EventBridge Scheduler
if (schedulerRoleArn && schedulerTargetArn) {
  const delayMinutes = parseInt(process.env.REMINDER_DELAY_MINUTES || "2", 10);
  const remindAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  const atTime = remindAt.toISOString().slice(0, 19);

  const scheduleName = `CareSync-remind-${appointmentId}-${Date.now()}`
    .replace(/[^a-zA-Z0-9_.-]/g, "-")
    .slice(0, 64);

  const scheduleTask = schedulerClient.send(
    new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${atTime})`,
      ScheduleExpressionTimezone: "UTC",
      FlexibleTimeWindow: { Mode: "OFF" },
      ActionAfterCompletion: "DELETE",
      Target: {
        Arn: schedulerTargetArn,
        RoleArn: schedulerRoleArn,
        Input: JSON.stringify({
          Subject: `[CareSync] Nhắc lịch hẹn khám bệnh #${appointmentId}`,
          Message: `Xin chào ${patientName},\nĐây là thông báo nhắc lịch khám bệnh từ CareSync vào lúc ${slotTime} ngày ${appointmentDate}.`,
        }),
      },
    })
  );
  asyncTasks.push(scheduleTask);
}
```

---

<a id="3-xay-dung-module-luu-tru-va-dong-bo-ho-so-benh-nhan-patientservicejs"></a>

## 3. Xây dựng Module Lưu trữ và Đồng bộ Hồ sơ Bệnh nhân (patient.service.js)

---

<a id="31-thiet-ke-dinh-danh-duy-nhat-pat-cleanphone"></a>

### 3.1. Thiết kế định danh duy nhất PAT-cleanPhone

Trong các phòng khám thực tế, một bệnh nhân có thể đặt lịch khám nhiều lần ở các chuyên khoa khác nhau. Do đó, việc lưu tách biệt hồ sơ bệnh nhân sang bảng riêng `Patients` là nguyên tắc thiết kế cơ sở dữ liệu quan trọng:
* **Mã định danh bệnh nhân (PatientId):** Được tự động chuẩn hóa dựa trên số điện thoại đã loại bỏ khoảng trắng và ký tự đặc biệt theo quy chuẩn `PAT-<cleanPhone>` (Ví dụ: Số điện thoại `0912 345 678` -> `PAT-0912345678`).
* Quy chuẩn này giúp hệ thống tự động nhận diện bệnh nhân cũ khi họ tái khám, hỗ trợ theo dõi lịch sử khám bệnh lâu dài.

---

<a id="32-trien-khai-ghi-song-song-vao-bang-patients"></a>

### 3.2. Triển khai ghi song song vào bảng Patients

Tại [`server/lambda/service/patient.service.js`](../../server/lambda/service/patient.service.js), SV1 đã triển khai hàm `saveOrUpdatePatient`:
* Sử dụng `PutCommand` ghi dữ liệu vào bảng DynamoDB `TABLES.PATIENTS`.
* Lưu trữ các trường: `PatientId`, `FullName`, `PatientName`, `Phone`, `Email`, `CreatedAt`, `UpdatedAt`.
* Tích hợp cơ chế ghi song song cùng lúc với thao tác đặt lịch trong `appointment.service.js` qua `Promise.all([appointmentTask, patientTask])`, vừa đảm bảo tính toàn vẹn dữ liệu, vừa duy trì điều kiện chống trùng lịch `ConditionalCheckFailedException` ở bảng `Appointments`.

---

<a id="4-xay-dung-giao-dien-form-tra-cuu-lich-hen-cua-toi"></a>

## 4. Xây dựng Giao diện Form Tra Cứu "Lịch hẹn của tôi"

---

<a id="41-thiet-ke-form-tra-cuu-so-dien-thoai-chuan-viet-nam"></a>

### 4.1. Thiết kế Form tra cứu số điện thoại chuẩn Việt Nam

Tại Section **"Lịch hẹn của tôi"** ([`client/index.html`](../../client/index.html)), SV1 đã nâng cấp ô tra cứu thành biểu mẫu tra cứu chuyên dụng:
* **Kiểm tra định dạng Số điện thoại Việt Nam:** Sử dụng biểu thức chính quy (Regex) `/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/` đảm bảo người dùng nhập đúng 10 chữ số hợp lệ.
* **Xử lý trải nghiệm người dùng (UX):**
  * Nút xóa nhanh nội dung (`lookup-clear-btn`) tự động xuất hiện khi có văn bản.
  * Khi nhập sai định dạng hoặc để trống: Input đổi viền đỏ và hiển thị thông báo lỗi rung nhẹ (`lookupShake` animation).
  * Lỗi tự động biến mất khi người dùng gõ lại số điện thoại.
  * Hỗ trợ kích hoạt tra cứu bằng phím `Enter` hoặc click nút bấm **"Tra cứu"**.

---

<a id="42-tich-hop-goi-api-cua-sv2-va-co-che-fallback"></a>

### 4.2. Tích hợp gọi API của SV2 và cơ chế Fallback

Module độc lập [`client/js/lookup.js`](../../client/js/lookup.js) và [`client/js/api.js`](../../client/js/api.js) chịu trách nhiệm kết nối mạng:
1. **Gọi API của SV2:** Sử dụng phương thức `appointmentApi.getByPhone(phone)` gửi yêu cầu `GET /appointments?phone=...` đến AWS API Gateway.
2. **Bộ chuyển đổi dữ liệu (Mapper):** Hàm `mapAppointmentFromDynamoDB` tự động bóc tách `SlotKey` thành ngày/giờ, chuẩn hóa thuộc tính PascalCase từ DynamoDB thành camelCase giao diện.
3. **Cơ chế Fallback thông minh:** Nếu mạng bị ngắt quãng hoặc phiên Lab AWS tạm dừng, module tự động kết hợp truy vấn dữ liệu từ `localStorage` (`caresync_appointments`), đảm bảo người kiểm thử luôn nghiệm thu được kết quả trực quan mà không bị gián đoạn.

---

<a id="43-hien-thi-the-lich-hen-truc-quan-va-toast-canh-bao"></a>

### 4.3. Hiển thị thẻ lịch hẹn trực quan và Toast cảnh báo

1. **Hiển thị thẻ trực quan (Visual Card):**
   * Hiển thị mã phiếu hẹn dạng monospace badge (Ví dụ: `CS-89240`, `APT-1738...`).
   * Badge trạng thái nổi bật: Xanh ngọc cho *"Sắp tới"*, Xám cho *"Đã hủy"*.
   * Avatar bác sĩ, tên chuyên khoa và phòng khám tiếp nhận.
   * Lưới 4 ô thông tin: Ngày khám, Khung giờ khám (highlight xanh đậm), Tên bệnh nhân, Số điện thoại.
   * Nút **"Xem phiếu khám"** mở popup vé chi tiết và nút **"Hủy lịch"**.
2. **Thông báo Toast Notifications:**
   * **Khi tìm thấy:** Bắn Toast màu xanh thông báo: *"Tìm thấy X lịch hẹn cho số điện thoại..."*.
   * **Khi không tìm thấy lịch hẹn:** Tự động kích hoạt Toast cảnh báo màu cam: *"Không tìm thấy lịch hẹn nào gắn với số điện thoại... Vui lòng kiểm tra lại!"*.
3. **Bộ lọc trạng thái:** Tự động đồng bộ số lượng đếm trên 3 tab: `Tất cả` (`#countAll`), `Sắp tới` (`#countUpcoming`) và `Đã hủy` (`#countCancelled`).

---

[Quay lại đầu trang](#top)
