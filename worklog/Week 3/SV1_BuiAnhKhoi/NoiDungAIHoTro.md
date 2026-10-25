<a id="top"></a>

# KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 3)

**Sinh viên 1:** Bùi Anh Khôi  
**Công cụ AI sử dụng:** ChatGPT  
**Model:** ChatGPT-4o

---

## Mục lục

- [KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 3)](#khai-báo-sử-dụng-công-cụ-ai--caresync-tuần-3)
  - [Mục lục](#mục-lục)
  - [1. Khai báo công cụ AI](#1-khai-báo-công-cụ-ai)
  - [2. Hỗ trợ sinh mã nguồn module AWS KMS và script kiểm thử](#2-hỗ-trợ-sinh-mã-nguồn-module-aws-kms-và-script-kiểm-thử)
    - [2.1. Yêu cầu (Prompt)](#21-yêu-cầu-prompt)
    - [2.2. Nội dung AI sinh ra](#22-nội-dung-ai-sinh-ra)
      - [1. Cài đặt thư viện AWS KMS SDK v3:](#1-cài-đặt-thư-viện-aws-kms-sdk-v3)
      - [2. Khung sườn module `server/lambda/service/kms.service.js` do AI gợi ý:](#2-khung-sườn-module-serverlambdaservicekmsservicejs-do-ai-gợi-ý)
      - [3. Khung sườn script kiểm thử `server/lambda/test-kms.js` do AI gợi ý:](#3-khung-sườn-script-kiểm-thử-serverlambdatest-kmsjs-do-ai-gợi-ý)
    - [2.3. Sinh viên đã hoàn thiện](#23-sinh-viên-đã-hoàn-thiện)
  - [3. Hỗ trợ cấu hình AWS Credentials để kiểm thử trên máy tính Windows](#3-hỗ-trợ-cấu-hình-aws-credentials-để-kiểm-thử-trên-máy-tính-windows)
    - [3.1. Yêu cầu (Prompt)](#31-yêu-cầu-prompt)
    - [3.2. Nội dung AI sinh ra](#32-nội-dung-ai-sinh-ra)
      - [Quá trình các bước thực hiện:](#quá-trình-các-bước-thực-hiện)
    - [3.3. Sinh viên đã hoàn thiện](#33-sinh-viên-đã-hoàn-thiện)

---

<a id="1-khai-bao-cong-cu-ai"></a>

## 1. Khai báo công cụ AI

- **Công cụ AI sử dụng:** ChatGPT
- **Model:** ChatGPT-4o
- **Mục đích:** Hỗ trợ thiết kế mã nguồn module dịch vụ mã hóa phong bì dữ liệu y tế bằng AWS KMS, viết script kiểm thử độc lập dữ liệu số điện thoại và CCCD, hướng dẫn cấu hình AWS Credentials từ tài khoản AWS Academy Learner Lab trên môi trường Windows.

---

<a id="2-ho-tro-sinh-ma-nguon-module-aws-kms-va-script-kiem-thu"></a>

## 2. Hỗ trợ sinh mã nguồn module AWS KMS và script kiểm thử

<a id="21-yeu-cau-prompt"></a>

### 2.1. Yêu cầu (Prompt)

> Viết module `kms.service.js` sử dụng AWS SDK for JavaScript v3 (`@aws-sdk/client-kms`) để mã hóa và giải mã dữ liệu chuỗi (như số điện thoại, số CCCD người bệnh) bằng AWS KMS. Sử dụng Customer Master Key thông qua alias `alias/caresync-patient-key`, kết quả mã hóa chuyển sang dạng chuỗi Base64 để lưu trữ. Đồng thời viết script `test-kms.js` chạy độc lập bằng Node.js để kiểm thử quá trình mã hóa và giải mã với dữ liệu mẫu, in kết quả PASS/FAIL ra màn hình.

---

<a id="22-noi-dung-ai-sinh-ra"></a>

### 2.2. Nội dung AI sinh ra

Chào bạn! Dưới đây là khung sườn định hướng thiết kế module `kms.service.js` và cấu trúc script kiểm thử độc lập `test-kms.js`, sử dụng thư viện `@aws-sdk/client-kms` của AWS SDK v3. Tôi cung cấp khung logic cơ bản, các lệnh API cần dùng và để lại các phần ghi chú hướng dẫn để bạn tự cấu hình tham số cũng như hoàn thiện mã nguồn thực tế cho hệ thống CareSync:

#### 1. Cài đặt thư viện AWS KMS SDK v3:

```bash
npm install @aws-sdk/client-kms
```

#### 2. Khung sườn module `server/lambda/service/kms.service.js` do AI gợi ý:

```javascript
const {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
} = require("@aws-sdk/client-kms");

// TODO: Sinh viên cấu hình Region tương ứng với phòng lab (ví dụ: us-east-1)
const REGION = process.env.AWS_REGION || "YOUR_AWS_REGION";

// Khởi tạo KMS Client kết nối với dịch vụ AWS KMS
const kms = new KMSClient({
  region: REGION,
});

// TODO: Điền alias hoặc ARN của Customer Master Key đã tạo trên KMS Console
const KEY_ID = process.env.KMS_KEY_ID || "alias/YOUR_KMS_KEY_ALIAS";

/**
 * Hàm mã hóa dữ liệu văn bản thuần
 */
async function encryptData(text) {
  // TODO: Chuyển chuỗi text sang Buffer (utf8) và gọi lệnh EncryptCommand lên KMS
  // ...
  // Gợi ý kết quả: chuyển CiphertextBlob sang chuỗi Base64 để thuận tiện lưu trữ
}

/**
 * Hàm giải mã ciphertext về dữ liệu ban đầu
 */
async function decryptData(cipherText) {
  // TODO: Chuyển cipherText từ Base64 sang Buffer và gọi DecryptCommand lên KMS
  // ...
  // Gợi ý kết quả: chuyển Plaintext nhị phân về chuỗi utf8 ban đầu
}

module.exports = {
  encryptData,
  decryptData,
};
```

**Giải thích các thành phần cốt lõi:**

- `KMSClient`: Đối tượng chịu trách nhiệm duy trì kết nối và gửi request tới AWS KMS.
- `EncryptCommand` & `DecryptCommand`: Các lệnh Native SDK v3 thực hiện mã hóa và giải mã dữ liệu đối xứng trực tiếp trên HSM của AWS.
- `KEY_ID`: Định danh khóa qua Alias giúp ứng dụng linh hoạt thay đổi khóa mà không cần can thiệp mã nguồn.
- _Lưu ý về tải trọng:_ Lệnh `Encrypt` trực tiếp của KMS phù hợp cho các dữ liệu nhạy cảm kích thước nhỏ (dưới 4.096 byte) như số điện thoại, số định danh CCCD hoặc số thẻ y tế.

#### 3. Khung sườn script kiểm thử `server/lambda/test-kms.js` do AI gợi ý:

```javascript
const { encryptData, decryptData } = require("./service/kms.service");

async function testKMS() {
  // TODO: Khai báo các dữ liệu mẫu kiểm thử (số điện thoại, CCCD...)
  const phone = "...";
  const cccd = "...";

  try {
    // TODO: Gọi hàm encryptData và decryptData để kiểm tra tính toàn vẹn
    // So sánh dữ liệu trước và sau giải mã để in kết quả PASS hoặc FAIL
    // ...
  } catch (error) {
    console.error("Lỗi kiểm thử KMS:", error.message);
  }
}

testKMS();
```

---

<a id="23-sinh-vien-da-hoan-thien"></a>

### 2.3. Sinh viên đã hoàn thiện

Dựa trên khung sườn và định hướng từ AI, sinh viên đã tự mình tìm hiểu tài liệu AWS SDK v3, tự tay viết và hoàn thiện toàn bộ mã nguồn chi tiết:

1. **Hoàn thiện module `kms.service.js`:**
   - Cấu hình chính xác khu vực `us-east-1` và liên kết với Alias `alias/caresync-patient-key` đã khởi tạo trên AWS KMS Console.
   - Tự viết logic xử lý dữ liệu nhị phân: dùng `Buffer.from(text, "utf8")` để chuẩn bị dữ liệu gửi đi và `Buffer.from(result.CiphertextBlob).toString("base64")` để lưu trữ ciphertext an toàn dưới dạng chuỗi.
   - Viết hàm giải mã `decryptData` với `Buffer.from(cipherText, "base64")` và khôi phục văn bản với encoding `utf8`.

2. **Hoàn thiện script kiểm thử `test-kms.js`:**
   - Xây dựng 2 ca kiểm thử cụ thể cho trường **Số điện thoại** (`0912345678`) và **Số CCCD** (`012345678901`).
   - Viết khối so sánh đối chiếu tự động trả về nhãn `PASS` / `FAIL`, kèm cơ chế bắt lỗi `try-catch` chi tiết.
   - Bổ sung cơ chế tự động đọc cấu hình xác thực từ file nội bộ trên máy cá nhân để phục vụ chạy kiểm thử.

---

<a id="3-ho-tro-cau-hinh-aws-credentials-de-kiem-thu-tren-may-tinh-windows"></a>

## 3. Hỗ trợ cấu hình AWS Credentials để kiểm thử trên máy tính Windows

<a id="31-yeu-cau-prompt"></a>

### 3.1. Yêu cầu (Prompt)

> Hướng dẫn cấu hình AWS Credentials để chạy script Node.js kiểm thử AWS KMS trên máy tính Windows, sử dụng tài khoản AWS Academy Learner Lab. Trình bày các bước lấy thông tin xác thực từ Learner Lab, nạp credentials vào môi trường chạy Node.js, cấu hình AWS Region phù hợp với KMS Key, di chuyển đến thư mục chứa mã nguồn và chạy lệnh `node test-kms.js`. Hướng dẫn cách kiểm tra và xử lý các lỗi thường gặp như thiếu credentials, sai Region hoặc lỗi AccessDenied khi gọi AWS KMS.

---

<a id="32-noi-dung-ai-sinh-ra"></a>

### 3.2. Nội dung AI sinh ra

Chào bạn! Để chạy script Node.js kiểm thử dịch vụ AWS KMS trên máy tính Windows với tài khoản AWS Academy Learner Lab, bạn cần nạp thông tin xác thực tạm thời (Credentials) và chỉ định đúng Region vào môi trường trước khi chạy mã nguồn.

Dưới đây là hướng dẫn chi tiết từng bước cấu hình và thực thi kiểm thử:

---

#### Quá trình các bước thực hiện:

- **Bước 1: Lấy thông tin xác thực tạm thời từ AWS Academy Learner Lab**
  1. Đăng nhập vào hệ thống AWS Academy, truy cập phòng thực hành Learner Lab và bấm **Start Lab**.
  2. Khi trạng thái phòng lab chuyển sang màu xanh (_Lab status: ready_), nhấn chọn nút **AWS Details** (ngay cạnh nút AWS đỏ).
  3. Tại mục **AWS CLI**, bấm chọn **Show** để hiển thị 3 thông số định danh tạm thời:
     ```ini
     aws_access_key_id=ASIA...
     aws_secret_access_key=...
     aws_session_token=...
     ```

- **Bước 2: Nạp Credentials vào môi trường chạy Node.js trên máy tính Windows**
  Bạn tạo file lưu trữ cấu hình đặt ngay trong thư mục mã nguồn backend `server/lambda/credentials` trên ổ D:

  ```ini
  [default]
  aws_access_key_id=<access_key_id_của_bạn>
  aws_secret_access_key=<secret_access_key_của_bạn>
  aws_session_token=<session_token_của_bạn>
  region=us-east-1
  ```

  _(Thêm file `credentials` vào `.gitignore` của repository để đảm bảo an toàn bí mật)._

- **Bước 3: Cấu hình AWS Region phù hợp với KMS Key**
  Đảm bảo tham số Region được đặt là `us-east-1` (khu vực mặc định của phòng thực hành AWS Academy nơi khởi tạo khóa `alias/caresync-patient-key`).

- **Bước 4: Mở Terminal, di chuyển vào thư mục chứa mã nguồn và thực thi lệnh kiểm thử**
  Mở PowerShell trong VS Code, di chuyển vào thư mục backend và chạy kiểm thử:

  ```powershell
  cd "D:\Src Code\HTML_CSS_JS\CareSync\CareSync\server\lambda"
  node test-kms.js
  ```

- **Bước 5: Kiểm tra và xử lý các lỗi thường gặp khi gọi AWS KMS**
  - **Lỗi `Could not load credentials from any providers`:** Xảy ra khi chưa nạp hoặc nạp thiếu thông tin Access Key / Session Token vào môi trường. Khắc phục bằng cách kiểm tra lại file `credentials`.
  - **Lỗi `ExpiredTokenException`:** Do Session Token của AWS Learner Lab hết hạn sau vài tiếng. Khắc phục bằng cách vào lại AWS Details, sao chép token mới và dán đè vào file `credentials`.
  - **Lỗi `NotFoundException: Key does not exist`:** Do cấu hình sai Region giữa script và nơi tạo khóa KMS. Khắc phục bằng cách đồng bộ biến `AWS_REGION=us-east-1`.
  - **Lỗi `AccessDeniedException`:** Thiếu quyền IAM. Khắc phục bằng cách đảm bảo LabRole hoặc IAM Policy đã được cấp phép action `kms:Encrypt` và `kms:Decrypt`.

---

<a id="33-sinh-vien-da-hoan-thien"></a>

### 3.3. Sinh viên đã hoàn thiện

Sinh viên thực hiện cấu hình AWS Credentials từ tài khoản AWS Academy Learner Lab, chạy script kiểm thử trong thư mục `server/lambda` và xác nhận chức năng mã hóa, giải mã hoạt động thành công với dữ liệu giả lập. Kết quả kiểm thử cho cả số điện thoại và số CCCD đều trả về `PASS`.

**Kết quả kiểm thử thực tế từ Terminal:**

```text
=== TEST PHONE ===
Encrypted: AQICAHh+YkWBneWmcmYF3VUy69BJL6tbLRZwK60vMEB3oLK0vwF/x1vjepEmA1OFMl76jVCuAAAAaDBmBgkqhkiG9w0BBwagWTBXAgEAMFIGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMBhIs0+Bdi3X6BbGaAgEQgCX7O4Clrrode96flxRvGf2tTrLcb4FLL9m52vTyxiAjb4f3RrYb
Decrypted: 0912345678
Result: PASS

=== TEST CCCD ===
Encrypted: AQICAHh+YkWBneWmcmYF3VUy69BJL6tbLRZwK60vMEB3oLK0vwHtlT/SkTbfUNbEVmWu+roZAAAAajBoBgkqhkiG9w0BBwagWzBZAgEAMFQGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM4YIA9/1fNdTnZok7AgEQgCdLtkV4Ryv4WF+0Q7usDM7/9XZ+Rtf0nEv2kmiHnaANKKq/X9V4VW8=
Decrypted: 012345678901
Result: PASS
```

**Đánh giá:**

- Cả hai chuỗi dữ liệu nhạy cảm mô phỏng đều được mã hóa thành Ciphertext Base64 và giải mã nguyên bản chính xác 100%.
- Không lộ lọt thông tin xác thực nhờ tách biệt cấu hình vào file credentials nội bộ và loại trừ qua file `.gitignore`.
