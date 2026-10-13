# Hướng dẫn dựng SNS, EventBridge, KMS thử nghiệm trên AWS Learner Lab (AI hỗ trợ)

- **Công cụ:** ChatGPT
- **Model:** ChatGPT - 6
- **Prompt:** Hãy hướng dẫn tôi từng bước dựng SNS, EventBridge, KMS thử nghiệm trên AWS Learner Lab

---

## 1. Chuẩn bị AWS Learner Lab

- Đăng nhập vào AWS Academy Learner Lab.
- Nhấn **Start Lab** và đợi trạng thái lab chuyển sang màu xanh hoặc báo đã khởi động.
- Nhấn **AWS** để mở AWS Management Console.
- Chọn một Region và dùng thống nhất cho tất cả tài nguyên. Nếu nhóm chưa quy định, có thể chọn `us-east-1` (N. Virginia) nếu lab cho phép.
- _Trước khi bắt đầu:_ Learner Lab có thể giới hạn quyền IAM, KMS hoặc các loại tài nguyên nhất định. Nếu gặp `AccessDenied`, `not authorized` hoặc lỗi tạo role, đừng cố sửa policy hệ thống hay tìm cách vượt quyền; hãy ghi lại lỗi để kiểm tra giới hạn của lab.

---

## 2. Dựng AWS KMS — tạo khóa mã hóa

Mục tiêu là tạo một khóa mã hóa đối xứng để thử nghiệm bảo vệ nội dung tin nhắn của SNS.

1. Mở dịch vụ [AWS KMS Console](https://console.aws.amazon.com/kms/).
2. Ở menu bên trái, chọn **Customer managed keys** ➔ **Create key**.
3. Cấu hình loại khóa:
   - **Key type:** Symmetric
   - **Key usage:** Encrypt and decrypt
   - **Regionality:** Single-Region key, nếu màn hình có lựa chọn này.
4. Nhấn **Next**.
5. Đặt tên alias là `alias/gamehub-test-sns-key` hoặc `alias/cloudlab-test-sns-key`.
6. Phần Description, nhập: `KMS key for SNS notification testing`.
7. Ở phần **Key administrators** và **Key users**, chọn tài khoản hoặc vai trò được phép quản lý/sử dụng khóa theo các lựa chọn mà Learner Lab cho phép. Không cấp quyền rộng hơn mức cần thiết.
8. Kiểm tra lại và nhấn **Finish**.

_Lưu ý:_ Cấu hình trên tạo khóa do bạn quản lý (customer managed key). AWS yêu cầu khóa đối xứng cho tính năng mã hóa phía máy chủ của SNS. Nếu Learner Lab báo không có quyền tạo khóa, bạn có thể chuyển sang dùng khóa AWS quản lý sẵn `alias/aws/sns` ở bước SNS bên dưới. Đây vẫn là một cách thử nghiệm mã hóa KMS, dù bạn không tự tạo khóa riêng.

---

## 3. Dựng Amazon SNS — tạo chủ đề và đăng ký email

### Bước 3.1. Tạo Topic

1. Mở [Amazon SNS Console](https://console.aws.amazon.com/sns/v3/home).
2. Chọn **Topics** ➔ **Create topic**.
3. Chọn loại **Standard**. Không cần FIFO cho bài thử nghiệm này.
4. Nhập Name: `cloudlab-test-notification`.
5. Mở mục **Encryption** hoặc **Server-side encryption**, tùy giao diện hiện tại.
6. Bật mã hóa. Ở danh sách KMS key, chọn khóa `alias/gamehub-test-sns-key` vừa tạo nếu được phép; nếu không, chọn khóa AWS managed `alias/aws/sns` nếu tùy chọn này xuất hiện.
7. Nhấn **Create topic** hoặc **Save changes** để hoàn tất.

_Lưu ý:_ SNS hỗ trợ mã hóa nội dung tin nhắn khi lưu trữ. Với khóa do bạn tự quản lý, quyền và key policy phải cho phép SNS sử dụng khóa. Nếu chọn khóa tùy chỉnh mà SNS không thể mã hóa, hãy kiểm tra quyền KMS trước khi chuyển sang khóa AWS quản lý sẵn.

### Bước 3.2. Tạo subscription nhận thông báo

1. Vào topic `cloudlab-test-notification` vừa tạo.
2. Chọn **Create subscription**.
3. Cấu hình:
   - **Protocol:** Email
   - **Endpoint:** Địa chỉ email bạn có thể mở để xác nhận.
4. Nhấn **Create subscription**.
5. Mở hộp thư email, tìm thư xác nhận của AWS SNS và nhấn **Confirm subscription**.
6. Quay lại SNS, kiểm tra trạng thái subscription là **Confirmed**.

### Bước 3.3. Thử gửi tin nhắn thủ công

Trước khi thiết lập lịch tự động, hãy kiểm tra riêng SNS:

1. Mở topic vừa tạo.
2. Chọn **Publish message**.
3. Nhập Subject: `SNS Test`.
4. Nhập Message body: `Day la tin nhan kiem thu SNS tren AWS Learner Lab.`
5. Nhấn **Publish message**.
6. Kiểm tra email nhận được.

_Lưu ý:_ Nếu email đến thành công, bạn đã kiểm tra được SNS và đường nhận thông báo. Nếu topic bật KMS, hãy đảm bảo tin nhắn được publish sau khi bật mã hóa; tin nhắn cũ không được tự động mã hóa ngược lại.

---

## 4. Dựng Amazon EventBridge Scheduler — gửi thông báo tự động

Mục tiêu: cấu hình lịch chạy định kỳ để EventBridge tự gọi SNS, không cần bạn bấm Publish mỗi lần.

### Bước 4.1. Mở Scheduler

1. Mở [Amazon EventBridge Scheduler](https://console.aws.amazon.com/scheduler/home).
2. Chọn **Schedules** ➔ **Create schedule**.
3. Nhập các thông tin:

| Trường                   | Giá trị                           |
| :----------------------- | :-------------------------------- |
| **Schedule name**        | `cloudlab-test-sns-schedule`      |
| **Description**          | `Test scheduled SNS notification` |
| **Schedule group**       | `default`                         |
| **Schedule pattern**     | Recurring schedule                |
| **Schedule type**        | Rate-based schedule               |
| **Rate expression**      | `rate(5 minutes)`                 |
| **Flexible time window** | Off                               |

_Lưu ý:_ Lịch này sẽ yêu cầu gửi thông báo khoảng mỗi 5 phút, phù hợp để thử nghiệm trong thời gian ngắn. Khi hoàn tất kiểm tra, hãy tắt hoặc xóa lịch để tránh gửi email liên tục.

### Bước 4.2. Chọn SNS làm đích nhận

1. Ở bước **Select target** hoặc **Target details**:
2. Chọn nhóm dịch vụ **AWS templated targets** nếu giao diện có phân nhóm.
3. Chọn **Amazon SNS Publish**.
4. Chọn topic `cloudlab-test-notification` trong danh sách.
5. Tại phần **Input**, nhập nội dung JSON sau nếu trường này yêu cầu thông điệp:
   ```json
   {
     "Subject": "Nhắc lịch tự động",
     "Message": "Day la thong bao tu dong tu EventBridge Scheduler tren AWS Learner Lab."
   }
   ```
   _Nếu giao diện chỉ yêu cầu trường Message, hãy nhập riêng nội dung thông báo vào trường đó, không dán toàn bộ JSON._

### Bước 4.3. Cấp quyền thực thi

1. Ở phần **Permissions** hoặc **Execution role**:
2. Chọn **Create new role for this schedule** nếu tùy chọn này xuất hiện.
3. Đặt tên role, chẳng hạn `cloudlab-test-scheduler-role`.
4. Để AWS tự cấu hình quyền gọi SNS theo target đã chọn, nếu lab cho phép.

_Lưu ý:_ Role cần cho phép dịch vụ Scheduler đảm nhận vai trò đó và có quyền `sns:Publish` lên topic đích. Đây là quyền gọi dịch vụ, khác với quyền quản lý khóa KMS.

### Bước 4.4. Hoàn tất

1. Chọn **Next** để xem lại cấu hình.
2. Kiểm tra schedule, SNS topic và execution role.
3. Chọn **Create schedule**.
4. Quay về danh sách Schedules và kiểm tra trạng thái là **Enabled**.
5. Chờ lịch chạy, sau đó kiểm tra email.

_Lưu ý:_ `rate(5 minutes)` không có nghĩa là email chắc chắn đến đúng từng giây; việc thực thi và gửi email có thể có độ trễ ngắn. Nếu không nhận được thư, hãy kiểm tra trạng thái schedule, execution role và subscription SNS.
