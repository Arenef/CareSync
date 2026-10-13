## Tìm hiểu EventBridge Scheduler và SNS: cơ chế tạo lịch nhắc và gửi thông báo

### Amazon EventBridge Scheduler:

- Là dịch vụ lập lịch của AWS, dịch vụ này cho phép tự động thực thi các tác vụ tại những thời điểm được xác định trước. Dịch vụ hỗ trợ lập lịch chạy một lần hoặc lặp lại theo chu kỳ thông qua biểu thức rate và cron. Nhờ đó, người dùng có thể tự động hóa các công việc mà không cần trực tiếp thực hiện thủ công.

### Amazon SNS (Amazon Simple Notification Service):

- Là dịch vụ gửi thông báo theo mô hình publish/subscribe (xuất bản/đăng ký). Dịch vụ cho phép gửi thông báo đến nhiều đối tượng hoặc hệ thống thông qua các kênh như email, SMS và các dịch vụ AWS được hỗ trợ.

### Cơ chế kết hợp và ứng dụng thực tế:

- EventBridge Scheduler có thể được cấu hình để gọi Amazon SNS theo lịch đã thiết lập. Khi đến thời điểm quy định, Scheduler thực thi tác vụ gửi thông báo đến một SNS topic. Sau đó, SNS phân phối thông báo đến các đối tượng đã đăng ký nhận tin.
- Trong CareSync, nhóm dùng cơ chế này để nhắc lịch hẹn khám cho bệnh nhân qua Email/SMS.
- Định hướng kiến trúc của nhóm là kết hợp **Scheduler ➔ Lambda ➔ SNS**: Scheduler gọi Lambda kiểm tra trạng thái lịch hẹn trong database trước (tránh gửi nhầm nếu lịch đã bị hủy), sau đó Lambda mới phát thông báo qua SNS.
- Về bảo mật, hệ thống cần cấu hình quyền IAM phù hợp để Scheduler có thể thực thi tác vụ và kiểm soát quyền truy cập vào SNS topic. Điều này giúp hạn chế việc sử dụng dịch vụ trái phép và bảo vệ thông tin được gửi đi.

## Tìm hiểu KMS và S3: mã hóa dữ liệu, lưu trữ website và bảo mật

### AWS Key Management Service (KMS):

- AWS Key Management Service (KMS) là dịch vụ quản lý khóa mã hóa, hỗ trợ tạo, quản lý và kiểm soát việc sử dụng khóa để bảo vệ dữ liệu. KMS có thể được tích hợp với nhiều dịch vụ AWS nhằm thực hiện mã hóa và giải mã dữ liệu theo các chính sách quyền hạn đã thiết lập.
- Một trong những ứng dụng phổ biến của KMS là mã hóa dữ liệu lưu trữ trên Amazon S3 bằng cơ chế SSE-KMS. Cơ chế này giúp tăng khả năng kiểm soát khóa mã hóa và hỗ trợ ghi nhận các hoạt động sử dụng khóa thông qua các dịch vụ giám sát, nhật ký phù hợp.

### Amazon Simple Storage Service (Amazon S3):

- Amazon S3 là dịch vụ lưu trữ đối tượng trên nền tảng đám mây AWS. Dịch vụ cho phép lưu trữ và truy xuất dữ liệu như hình ảnh, tài liệu, tệp tin, dữ liệu sao lưu và các thành phần của website.
- Amazon S3 có khả năng mở rộng linh hoạt, độ bền dữ liệu cao và hỗ trợ nhiều cơ chế bảo mật. Người dùng có thể thiết lập quyền truy cập bằng IAM, bucket policy, mã hóa dữ liệu và các tính năng bảo vệ quyền truy cập công khai.
- Ngoài chức năng lưu trữ, S3 còn hỗ trợ triển khai website tĩnh thông qua việc lưu trữ các tệp HTML, CSS, JavaScript và hình ảnh. Để tăng cường bảo mật và hiệu quả phân phối nội dung, có thể kết hợp S3 với Amazon CloudFront và cấu hình HTTPS.

### Cơ chế bảo mật và ứng dụng thực tế:

- KMS và S3 có thể kết hợp để bảo vệ dữ liệu trong quá trình lưu trữ. Amazon S3 đảm nhiệm việc lưu trữ đối tượng, trong khi AWS KMS hỗ trợ quản lý khóa mã hóa khi sử dụng cơ chế SSE-KMS. Việc phân quyền hợp lý giúp giới hạn những người dùng và dịch vụ được phép truy cập dữ liệu hoặc sử dụng khóa.
- Trong thực tế, sự kết hợp này phù hợp với các hệ thống cần lưu trữ tài liệu, hình ảnh, dữ liệu sao lưu hoặc nội dung website. Để tăng cường an toàn, cần bật S3 Block Public Access khi không có nhu cầu truy cập công khai, sử dụng chính sách quyền hạn tối thiểu và theo dõi các hoạt động truy cập quan trọng.
- Áp dụng vào CareSync: Website tĩnh (HTML/CSS/JS) lưu trên S3 hosting dùng mã hóa mặc định SSE-S3; còn các tệp sao lưu hoặc dữ liệu nhạy cảm lưu ở bucket riêng, kích hoạt SSE-KMS và bật S3 Block Public Access để bảo vệ an toàn.
