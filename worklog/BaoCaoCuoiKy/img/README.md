# Minh Chứng Giải Phóng Dữ Liệu & Hủy Tài Nguyên AWS
## Thư Mục: `img/` - Dự Án CareSync (HCMUTE)

Danh sách 15 hình ảnh minh chứng thực tế trên AWS Management Console được phân chia theo thư mục cá nhân của 2 sinh viên:

### 1. Thư mục `BuiAnhKhoi/` - Sinh viên 1: Bùi Anh Khôi (MSSV: 24110258)
- [delete_all_files_s3.jpg](./BuiAnhKhoi/delete_all_files_s3.jpg): Xóa sạch objects bên trong bucket S3 kiểm thử `demo-kms-lab-2026-abc123`.
- [delete_buckets_s3.jpg](./BuiAnhKhoi/delete_buckets_s3.jpg): Xóa hoàn toàn S3 Bucket `demo-kms-lab-2026-abc123` (Buckets: 0).
- [delete_api_gateway.jpg](./BuiAnhKhoi/delete_api_gateway.jpg): Xóa HTTP API `CareSync-TestEmail-API` (đưa danh sách về 0/0).
- [delete_lambda.jpg](./BuiAnhKhoi/delete_lambda.jpg): Xóa hàm xử lý backend `CareSync-TestEmail`.
- [delete_kms.jpg](./BuiAnhKhoi/delete_kms.jpg): Lên lịch xóa khóa mã hóa KMS `caresync-patient-key` (Pending deletion).
- [delete_sns.jpg](./BuiAnhKhoi/delete_sns.jpg): Xóa EventBridge Schedule nhắc lịch khám `DemoNhacLichSNS`.
- [delete_topic_s3.jpg](./BuiAnhKhoi/delete_topic_s3.jpg): Xóa Topic thông báo kiểm thử `DemoNhacLich` trên Amazon SNS.

### 2. Thư mục `HuynhNgocBaoKhang/` - Sinh viên 2: Huỳnh Ngọc Bảo Khang (MSSV: 24110241)
- [delete_all_tables_dynamodb.png](./HuynhNgocBaoKhang/delete_all_tables_dynamodb.png): Xóa đồng loạt 3 bảng NoSQL `Appointments`, `Doctors`, `Patients`.
- [delete_cloudwatch.png](./HuynhNgocBaoKhang/delete_cloudwatch.png): Xóa Log Group `/aws/lambda/AppointmentBookingFunction`.
- [delete_subscription_sns.png](./HuynhNgocBaoKhang/delete_subscription_sns.png): Xóa toàn bộ Email Subscriptions nhận thông báo lịch khám.
- [delete_topic_sns.png](./HuynhNgocBaoKhang/delete_topic_sns.png): Xóa Topic `CareSync-AppointmentNotice`.
- [delete_all_files_s3.png](./HuynhNgocBaoKhang/delete_all_files_s3.png): Xóa sạch 46 objects (6.7 MB) bên trong bucket S3 `appointment-booking-web-demo`.
- [delete_bucket_s3.png](./HuynhNgocBaoKhang/delete_bucket_s3.png): Xóa hoàn toàn S3 Bucket tĩnh `appointment-booking-web-demo`.
- [delete_api_gateway.png](./HuynhNgocBaoKhang/delete_api_gateway.png): Xóa HTTP API `AppointmentBookingAPI` (đưa danh sách về 0/0).
- [delete_lambda_function.png](./HuynhNgocBaoKhang/delete_lambda_function.png): Xóa hàm xử lý backend chính `AppointmentBookingFunction`.

> 📌 **Báo cáo chi tiết:** Xem tại [BaoCaoGiaiPhongTaiNguyenAWS.md](../BaoCaoGiaiPhongTaiNguyenAWS.md).
