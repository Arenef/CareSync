# Thiết kế luồng nhắc lịch và bảo mật

Hệ thống có thể sử dụng Amazon EventBridge Scheduler kết hợp với Amazon SNS để tự động gửi thông báo nhắc lịch khám bệnh.

Quy trình hoạt động được thiết kế như sau:

1. Bệnh nhân tạo lịch hẹn và hệ thống lưu thông tin vào bảng Appointments.
2. Sau khi lịch hẹn được xác nhận, hệ thống tạo lịch nhắc tự động tương ứng.
3. EventBridge Scheduler kích hoạt tác vụ tại thời điểm đã thiết lập.
4. Tác vụ gửi thông báo thông qua Amazon SNS đến kênh nhận tin đã đăng ký.
5. Hệ thống ghi nhận kết quả gửi thông báo để phục vụ kiểm tra và xử lý khi có lỗi.
6. Khi lịch hẹn bị hủy hoặc thay đổi, lịch nhắc cũ cần được cập nhật hoặc hủy để tránh gửi thông báo sai.

Đối với các trường hợp cần gửi thông báo qua email hoặc SMS, hệ thống cần cấu hình đúng kênh nhận tin, quyền truy cập và thông tin liên hệ của bệnh nhân. Trạng thái gửi thông báo cũng nên được lưu trữ riêng để hỗ trợ theo dõi và gửi lại khi cần thiết.

Hệ thống xử lý thông tin cá nhân và thông tin liên quan đến khám chữa bệnh, bảo mật cần được triển khai ở cả tầng API, cơ sở dữ liệu và dịch vụ AWS.

- Xác thực và phân quyền: Sử dụng cơ chế đăng nhập an toàn, token xác thực và phân quyền theo vai trò bệnh nhân, bác sĩ và quản trị viên.
- Bảo vệ API: Kiểm tra dữ liệu đầu vào, giới hạn tần suất yêu cầu, xác minh quyền sở hữu lịch hẹn và ngăn truy cập trái phép.
- Bảo vệ cơ sở dữ liệu: Sử dụng tài khoản có quyền tối thiểu, truy vấn có tham số, mã hóa dữ liệu và sao lưu định kỳ.
- Bảo mật trên AWS: Sử dụng IAM để phân quyền cho các dịch vụ (trong môi trường AWS Learner Lab: dùng LabRole/LabInstanceProfile có sẵn, không tạo IAM user/role mới), AWS KMS để quản lý khóa mã hóa và AWS Secrets Manager để lưu trữ thông tin bí mật như thông tin xác thực kết nối cơ sở dữ liệu.
- Bảo vệ thông báo: Hạn chế đưa thông tin nhạy cảm vào nội dung email hoặc SMS; chỉ sử dụng dữ liệu cần thiết để nhắc lịch.
- Giám sát hệ thống: Ghi nhật ký hoạt động, theo dõi lỗi và cảnh báo những truy cập bất thường; không ghi mật khẩu, token hoặc dữ liệu nhạy cảm vào log.
