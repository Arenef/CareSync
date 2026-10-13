# Thiết kế Database

## 1. Bảng Doctors

Lưu trữ thông tin hồ sơ và trạng thái hoạt động của các bác sĩ trong hệ thống.

- **Partition Key (PK):** DoctorId (String) – Khóa phân vùng định danh duy nhất cho từng bác sĩ.
- **Sort Key (SK):** Không sử dụng.
- **Các thuộc tính phi khóa:**
  - FullName (String): Họ và tên bác sĩ.
  - Specialty (String): Chuyên khoa khám
  - Phone (String): Số điện thoại liên hệ
  - Email (String): Email liên hệ.
  - IsActive (Boolean): Trạng thái hoạt động (cho phép đặt lịch hay đang tạm ngưng).

## 2. Bảng Patients

Lưu trữ thông tin cá nhân của người bệnh đặt lịch.

- **Partition Key (PK):** PatientId (String) – Mã định danh duy nhất của từng bệnh nhân.
- **Sort Key (SK):** Không sử dụng.
- **Các thuộc tính phi khóa:**
  - FullName (String): Họ và tên bệnh nhân.
  - Phone (String): Số điện thoại liên hệ
  - Email (String): Email liên hệ.
  - DateOfBirth (String): Ngày tháng năm sinh (định dạng YYYY-MM-DD).

## 3. Bảng Appointments

Lưu trữ thông tin các lịch khám bệnh do bệnh nhân đặt với bác sĩ.

- **Partition Key (PK):** DoctorId (String) – Mã bác sĩ tiếp nhận ca khám.
- **Sort Key (SK):** AppointmentDateTime (String) – Khung thời gian khám bệnh (định dạng ISO 8601).
- **Các thuộc tính phi khóa:**
  - AppointmentId (String): Mã phiếu đặt khám duy nhất trả về cho bệnh nhân.
  - PatientId (String): Mã định danh bệnh nhân đặt lịch.
  - PatientName (String): Họ tên bệnh nhân (phi chuẩn hóa để hiển thị ngay mà không cần tra cứu sang bảng Patients).
  - Status (String): Trạng thái phiếu khám (PENDING, CONFIRMED, CANCELLED, COMPLETED).
  - Reason (String): Lý do khám / triệu chứng ban đầu.
  - CreatedAt (String): Thời điểm thực hiện đặt lịch, định dạng ISO 8601.

## Mối quan hệ giữa các bảng:

- Doctors – Appointments: 1:N.
- Patients – Appointments: 1:N.
