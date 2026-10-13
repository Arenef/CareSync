# Nội dung AI tạo ra

- **Công cụ:** ChatGPT
- **Model:** ChatGPT - 6

---

# Tìm hiểu EventBridge Scheduler và SNS: cơ chế tạo lịch nhắc và gửi thông báo

- **Prompt:** Hãy giúp tôi tìm hiểu thông tin về: EventBridge Scheduler và SNS: cơ chế tạo lịch nhắc và gửi thông báo

## 1. EventBridge Scheduler là gì?
EventBridge Scheduler là dịch vụ lập lịch có quản lý của AWS. Dịch vụ cho phép cấu hình thời điểm một tác vụ được thực thi mà không cần tự xây dựng bộ hẹn giờ trên máy chủ.

### Cơ chế hoạt động
1. **Tạo lịch (Schedule)**: Chọn ngày, giờ, múi giờ và kiểu lặp
2. **Scheduler chờ đến thời điểm đã đặt**: AWS quản lý việc kích hoạt lịch
3. **Gọi đích (Target)**: Ví dụ: gọi Lambda hoặc gửi yêu cầu đến SNS

### Các kiểu lịch phổ biến
| Kiểu lịch | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| One-time | Chạy một lần tại thời điểm xác định | Nhắc lịch khám ngày 20/10 lúc 08:00 |
| Rate-based | Lặp lại sau một khoảng thời gian | Chạy mỗi 5 phút |
| Cron-based | Chạy theo biểu thức lịch | Chạy mỗi ngày lúc 08:00 |

Scheduler hỗ trợ múi giờ khi sử dụng biểu thức cron. Với lịch khám tại Việt Nam, nên cấu hình múi giờ `Asia/Ho_Chi_Minh` để tránh nhầm lẫn giờ địa phương với UTC.

*Lưu ý:* việc kích hoạt không nhất thiết chính xác tuyệt đối đến từng mili giây. Có thể cấu hình Flexible time window để AWS có khoảng thời gian linh hoạt khi thực thi.

---

## 2. Amazon SNS là gì?
Amazon SNS là dịch vụ thông báo của AWS, giúp một hệ thống gửi thông điệp đến một hoặc nhiều bên nhận thông qua một Topic.

### Các thành phần chính
- **Topic**: Là kênh thông báo trung tâm để hệ thống phát thông điệp. Ví dụ: AppointmentReminderTopic.
- **Publish**: Hành động gửi thông điệp vào Topic, gồm nội dung, tiêu đề nếu cần và thông tin liên quan.
- **Subscription**: Đăng ký một điểm nhận thông báo vào Topic, ví dụ địa chỉ email, số điện thoại hoặc một dịch vụ AWS được hỗ trợ.

### Cơ chế gửi thông báo
- **Ứng dụng hoặc AWS Lambda**: Gửi nội dung thông báo
- **Amazon SNS Topic**:
  - **Email**: Gửi đến email đã đăng ký
  - **SMS**: Gửi tin nhắn đến số điện thoại

Khi có thông điệp được publish, SNS sẽ phân phối thông điệp đến các subscriber phù hợp. Email và SMS cần cấu hình đúng giao thức, quyền truy cập và điều kiện sử dụng tương ứng. Việc SNS chấp nhận thông điệp không đồng nghĩa chắc chắn người nhận đã đọc hoặc nhận được thông báo thành công.

---

## 3. Kết hợp EventBridge Scheduler và SNS như thế nào?
Đây là phần quan trọng nhất đối với chức năng nhắc lịch khám trong dự án AWS của bạn.

Có hai cách triển khai phổ biến:
- **Cách 1 — Scheduler gọi SNS trực tiếp**: phù hợp khi nội dung thông báo cố định, không cần xử lý dữ liệu phức tạp.
- **Cách 2 — Scheduler gọi Lambda, sau đó Lambda gửi SNS**: phù hợp khi cần truy vấn cơ sở dữ liệu, kiểm tra lịch khám đã bị hủy hay chưa hoặc tạo nội dung riêng cho từng bệnh nhân.

Với hệ thống đặt lịch khám, mình khuyên dùng Cách 2 nếu bạn muốn mô phỏng quy trình thực tế.

- **DynamoDB**: Lưu thông tin lịch khám và trạng thái đặt lịch
- **EventBridge Scheduler**: Kích hoạt vào thời điểm cần nhắc
- **AWS Lambda**: Kiểm tra lịch khám và chuẩn bị nội dung
- **Amazon SNS**: Phát thông báo qua email hoặc SMS
- **Bệnh nhân nhận lời nhắc**

Sơ đồ minh họa một phương án kiến trúc; DynamoDB không trực tiếp tạo lịch Scheduler trong luồng này. Ứng dụng đặt lịch cần chủ động tạo lịch nhắc khi lịch khám được tạo hoặc cập nhật.

### Ví dụ thực tế
- Giả sử bệnh nhân đặt lịch khám vào ngày 20/10/2026 lúc 08:00.
- Ứng dụng lưu lịch khám vào DynamoDB.
- Ứng dụng tạo một lịch EventBridge Scheduler chạy vào ngày 19/10/2026 lúc 08:00, tức trước giờ khám 24 tiếng.
- Đến thời điểm đã đặt, Scheduler gọi Lambda và truyền mã lịch khám cần kiểm tra.
- Lambda đọc DynamoDB để xác minh lịch vẫn còn hiệu lực, sau đó lấy thông tin cần thiết để tạo nội dung nhắc.
- Lambda publish thông báo vào SNS Topic; SNS phân phối đến kênh nhận đã cấu hình.
- Nếu lịch khám bị hủy hoặc thay đổi, ứng dụng cần cập nhật hoặc xóa lịch nhắc cũ để tránh gửi thông báo sai.

**Ví dụ nội dung thông báo:**
> **Nhắc lịch khám**  
> Xin chào! Bạn có lịch khám vào lúc 08:00 ngày 20/10/2026. Vui lòng đến đúng giờ theo lịch hẹn.  
> *(Nội dung minh họa, không chứa thông tin bệnh nhân thực tế).*

---

## 4. So sánh hai dịch vụ
| Tiêu chí | EventBridge Scheduler | Amazon SNS |
| :--- | :--- | :--- |
| **Nhiệm vụ chính** | Xác định thời điểm thực thi | Phân phối thông báo |
| **Cơ chế** | Theo lịch một lần hoặc định kỳ | Publish/subscribe |
| **Dữ liệu đầu vào** | Lịch, thời gian, target và dữ liệu truyền đi | Nội dung thông báo và thông tin Topic/đích |
| **Có tự lập lịch không?** | Có | Không phải chức năng chính |
| **Có trực tiếp gửi email/SMS không?** | Không phải chức năng chính | Có, khi cấu hình endpoint phù hợp |
| **Ví dụ** | Kích hoạt lúc 08:00 ngày trước lịch khám | Gửi nội dung nhắc đến người đăng ký |

Tài liệu AWS: [EventBridge Scheduler](https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html) và [Amazon SNS Publish](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html).

---

# Tìm hiểu KMS và S3: mã hóa dữ liệu, lưu trữ website và bảo mật

- **Prompt:** Hãy giúp tôi tìm hiểu thông tin về: KMS và S3: mã hóa dữ liệu, lưu trữ website và bảo mật

## 1. AWS KMS là gì?
AWS Key Management Service (KMS) là dịch vụ quản lý khóa mã hóa do AWS cung cấp.
KMS hỗ trợ tạo và quản lý khóa, kiểm soát quyền sử dụng khóa, cũng như theo dõi hoạt động mã hóa và giải mã. Dịch vụ này thường được tích hợp với S3 và nhiều dịch vụ AWS khác.

### 1.1. Cơ chế hoạt động
Mã hóa là quá trình chuyển dữ liệu có thể đọc được thành dữ liệu khó hiểu nếu không có khả năng giải mã phù hợp.
Ví dụ, giả sử bạn lưu một tệp chứa thông tin lịch khám bệnh. Khi sử dụng S3 kết hợp với KMS, quy trình mã hóa phía máy chủ (SSE-KMS) có thể diễn ra như sau:
1. **Tệp dữ liệu ban đầu**: Thông tin lịch khám có thể đọc được
2. **Amazon S3 yêu cầu khóa dữ liệu từ KMS**: KMS tạo khóa dữ liệu và bảo vệ khóa đó bằng KMS key
3. **S3 mã hóa tệp và lưu trữ**: Dữ liệu được mã hóa trước khi lưu trên hệ thống lưu trữ
4. **Khi người có quyền tải tệp**: S3 sử dụng KMS để giải mã khóa dữ liệu rồi giải mã tệp

Cơ chế này được gọi là mã hóa phong bì (Envelope Encryption): khóa dữ liệu mã hóa nội dung, còn KMS key bảo vệ khóa dữ liệu. Nhờ vậy, không cần sử dụng trực tiếp KMS key để mã hóa toàn bộ tệp.

### 1.2. Các loại khóa KMS cần biết
| Loại khóa | Đặc điểm |
| :--- | :--- |
| **AWS managed key** | AWS quản lý khóa cho dịch vụ, ví dụ khóa `aws/s3` |
| **Customer managed key** | Người dùng tạo và kiểm soát chính sách, quyền truy cập, việc vô hiệu hóa và lịch xoay vòng khóa theo cấu hình |

Với SSE-KMS, bạn có thể chọn khóa do AWS quản lý hoặc khóa do mình quản lý. Khóa do khách hàng quản lý cho phép kiểm soát chi tiết hơn, nhưng cũng đòi hỏi cấu hình quyền và quản lý cẩn thận.

---

## 2. Amazon S3 là gì?
Amazon Simple Storage Service (S3) là dịch vụ lưu trữ đối tượng trên nền tảng AWS.
S3 phù hợp để lưu hình ảnh, tài liệu, tệp sao lưu, dữ liệu ứng dụng và các tài nguyên tĩnh của website như HTML, CSS, JavaScript. Dữ liệu được lưu trong các bucket, mỗi tệp được lưu dưới dạng một object.

### 2.1. Các thành phần cơ bản
- **Bucket**: Là vùng chứa các object. Ví dụ: `clinic-website-demo`.
- **Object**: Là tệp được lưu trong bucket, ví dụ `index.html`, `style.css`, `logo.png`.
- **Bucket policy và quyền truy cập**: Kiểm soát ai được đọc, tải lên hoặc xóa object; có thể kết hợp IAM và các cơ chế bảo mật khác.

### 2.2. S3 dùng để lưu trữ website như thế nào?
Với một website tĩnh được xây dựng bằng HTML, CSS và JavaScript, bạn có thể tải các tệp lên bucket S3 rồi cấu hình tính năng Static website hosting.

- **Người dùng mở website** ➔ **Amazon S3** (Trả về HTML, CSS, JavaScript, hình ảnh) ➔ **Trình duyệt hiển thị website**

Ví dụ, website giới thiệu phòng khám có thể bao gồm:
- `index.html`: giao diện trang chủ.
- `style.css`: định dạng giao diện.
- `script.js`: xử lý tương tác trên trình duyệt.
- `images/`: hình ảnh minh họa.

**Giới hạn quan trọng:** S3 static website hosting chỉ phục vụ nội dung tĩnh, không tự chạy backend Node.js, không tự xử lý API hoặc kết nối trực tiếp cơ sở dữ liệu. Nếu website có đăng nhập, đặt lịch khám hay nghiệp vụ phía máy chủ, bạn cần backend riêng, chẳng hạn API Gateway và Lambda.

Tài liệu: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html).

---

## 3. Kết hợp KMS và S3 để mã hóa dữ liệu
Khi kết hợp hai dịch vụ, S3 chịu trách nhiệm lưu trữ và thực hiện mã hóa dữ liệu phía máy chủ, còn KMS quản lý khóa mã hóa được sử dụng trong quá trình đó.

### 3.1. So sánh SSE-S3 và SSE-KMS
| Tiêu chí | SSE-S3 | SSE-KMS |
| :--- | :--- | :--- |
| **Cách mã hóa** | S3 sử dụng khóa do S3 quản lý | S3 sử dụng khóa dữ liệu được bảo vệ bởi KMS |
| **Mã hóa mặc định** | Có | Phải lựa chọn hoặc cấu hình |
| **Kiểm soát khóa** | Đơn giản hơn | Kiểm soát quyền dùng khóa chi tiết hơn |
| **Theo dõi hoạt động dùng khóa** | Không có nhật ký thao tác KMS tương ứng | Có thể kiểm tra hoạt động KMS qua CloudTrail |
| **Chi phí KMS** | Không phát sinh phí KMS cho SSE-S3 | Có thể phát sinh phí khóa và yêu cầu KMS |

S3 hiện tự động mã hóa các object mới bằng SSE-S3 theo mặc định. Vì vậy, không bắt buộc phải dùng KMS chỉ để có mã hóa cơ bản. SSE-KMS phù hợp hơn khi bài tập yêu cầu tìm hiểu quản lý khóa tập trung, phân quyền và theo dõi hoạt động mã hóa.

### 3.2. Ví dụ với dữ liệu lịch khám
Giả sử dự án có hai nhóm dữ liệu:
- **Tệp website công khai**: HTML, CSS, JavaScript và hình ảnh giới thiệu phòng khám.
- **Dữ liệu nhạy cảm**: tệp sao lưu chứa thông tin lịch khám hoặc dữ liệu giả lập bệnh nhân.

Bạn có thể cân nhắc:
| Nhóm dữ liệu | Phương án |
| :--- | :--- |
| **Tệp website tĩnh** | S3 với SSE-S3 mặc định |
| **Tệp sao lưu cần kiểm soát khóa chặt chẽ** | S3 với SSE-KMS |
| **Thông tin đặt lịch trong DynamoDB** | Sử dụng tính năng mã hóa và kiểm soát truy cập của DynamoDB phù hợp với yêu cầu |

Đây là phương án minh họa, không phải yêu cầu bắt buộc. Cần đánh giá mức độ nhạy cảm của dữ liệu và yêu cầu bài tập trước khi lựa chọn.

---

## 4. Các biện pháp bảo mật quan trọng
Mã hóa không đồng nghĩa với việc dữ liệu đã an toàn hoàn toàn. Nếu cấu hình quyền truy cập sai, dữ liệu vẫn có thể bị người không được phép xem hoặc sửa.

### 4.1. Chặn truy cập công khai không cần thiết
Giữ tùy chọn Block Public Access bật đối với bucket lưu dữ liệu riêng tư. Chỉ cho phép truy cập công khai khi thực sự cần cho website và đã cân nhắc phương án phân phối an toàn hơn.

### 4.2. Phân quyền theo nguyên tắc tối thiểu
Chỉ cấp cho IAM user hoặc role các quyền cần thiết. Ví dụ, Lambda tải tệp lên S3 không nhất thiết phải có quyền xóa toàn bộ bucket.

### 4.3. Bảo vệ KMS key
Giới hạn principal được phép sử dụng khóa, tránh vô hiệu hóa hoặc lên lịch xóa khóa đang bảo vệ dữ liệu quan trọng. Nếu khóa bị vô hiệu hóa hoặc không còn quyền sử dụng, việc giải mã dữ liệu có thể thất bại.

### 4.4. Bảo vệ dữ liệu khi truyền
Sử dụng HTTPS/TLS để bảo vệ dữ liệu trên đường truyền. Mã hóa khi lưu trữ không thay thế cho việc bảo vệ kết nối mạng.

### 4.5. Theo dõi và kiểm tra
Có thể sử dụng CloudTrail để theo dõi hoạt động API liên quan đến KMS và S3, kết hợp với các tính năng giám sát phù hợp.
Các biện pháp này phù hợp với hướng dẫn bảo mật S3 của AWS.
