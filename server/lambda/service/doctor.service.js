const { ScanCommand, GetCommand, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { docClient, TABLES } = require("../config/db.js");

const REGION = process.env.AWS_REGION || "us-east-1";
const snsClient = new SNSClient({ region: REGION });

/**
 * Lấy danh sách tất cả bác sĩ đang hoạt động
 */
const getAllDoctors = async () => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.DOCTORS,
    })
  );

  // Lọc chỉ lấy các bác sĩ IsActive !== false và sắp xếp theo DoctorId
  const doctors = (result.Items || [])
    .filter((doc) => doc.IsActive !== false)
    .sort((a, b) => (a.DoctorId || "").localeCompare(b.DoctorId || ""));

  return doctors;
};

/**
 * Lấy chi tiết bác sĩ theo DoctorId
 */
const getDoctorById = async (doctorId) => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.DOCTORS,
      Key: { DoctorId: doctorId },
    })
  );

  return result.Item || null;
};

/**
 * Tìm bác sĩ theo Email trong hệ thống
 */
const getDoctorByEmail = async (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.DOCTORS,
    })
  );

  const doctors = result.Items || [];
  return (
    doctors.find(
      (d) => (d.Email || d.email || "").trim().toLowerCase() === cleanEmail
    ) || null
  );
};

/**
 * Tạo mã OTP 6 số, lưu vào DynamoDB và gửi qua Amazon SNS cũ
 */
const generateAndSendDoctorOtp = async (doctor) => {
  const doctorId = doctor.DoctorId || doctor.id;
  const doctorEmail = doctor.Email || doctor.email;
  const doctorName = doctor.FullName || doctor.Name || doctor.name || "Bác sĩ";

  // 1. Sinh mã OTP 6 chữ số ngẫu nhiên
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // Hiệu lực 5 phút

  // 2. Lưu OTP và thời gian hết hạn vào bản ghi Bác sĩ trên DynamoDB
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.DOCTORS,
      Key: { DoctorId: doctorId },
      UpdateExpression: "SET OtpCode = :otp, OtpExpiresAt = :exp",
      ExpressionAttributeValues: {
        ":otp": otp,
        ":exp": expiresAt,
      },
    })
  );

  // 3. Tận dụng SNS Topic cũ của hệ thống để gửi email thông báo OTP
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  if (snsTopicArn) {
    const message = `[CareSync Health] Mã xác thực OTP đăng nhập hệ thống Bác sĩ của bạn là: ${otp} (Hiệu lực trong 5 phút). Vui lòng không cung cấp mã cho người khác!`;
    try {
      await snsClient.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `[CareSync] Mã OTP Đăng Nhập Bác Sĩ: ${otp}`,
          Message: message,
        })
      );
      console.log(`[SNS OTP Sent] Đã gửi OTP tới SNS Topic cho email: ${doctorEmail}`);
    } catch (snsErr) {
      console.error("[SNS OTP Error]:", snsErr.message);
    }
  }

  return {
    otp, // Trả kèm OTP về để hỗ trợ debug/test nếu môi trường Lab email chưa confirm
    doctorName,
    doctorEmail,
  };
};

/**
 * Xác thực mã OTP bác sĩ đã nhập
 */
const verifyDoctorOtp = async (email, otp) => {
  const doctor = await getDoctorByEmail(email);
  if (!doctor) {
    throw new Error("Không tìm thấy thông tin bác sĩ với email này!");
  }

  const storedOtp = doctor.OtpCode;
  const expiresAt = doctor.OtpExpiresAt || 0;

  if (!storedOtp || storedOtp !== otp.trim()) {
    throw new Error("Mã OTP không chính xác. Vui lòng kiểm tra lại!");
  }

  if (Date.now() > expiresAt) {
    throw new Error("Mã OTP đã hết hạn (chỉ có hiệu lực trong 5 phút). Vui lòng yêu cầu mã mới!");
  }

  // Xóa mã OTP sau khi xác thực thành công để bảo mật
  const doctorId = doctor.DoctorId || doctor.id;
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.DOCTORS,
      Key: { DoctorId: doctorId },
      UpdateExpression: "REMOVE OtpCode, OtpExpiresAt",
    })
  );

  return {
    DoctorId: doctorId,
    id: doctorId,
    Name: doctor.FullName || doctor.Name || doctor.name,
    Specialty: doctor.Specialty || doctor.specialty || "Bác sĩ chuyên khoa",
    Avatar: doctor.Avatar || doctor.avatar || "assets/images/doctor-1.jpg",
    Email: doctor.Email || doctor.email,
    Phone: doctor.Phone || doctor.phone || "",
    Room: doctor.Room || doctor.room || "Phòng khám",
  };
};

/**
 * Lấy danh sách các ca bệnh nhân đặt khám của bác sĩ (Query O(1) theo DoctorId)
 */
const getDoctorAppointments = async (doctorId) => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.APPOINTMENTS,
      KeyConditionExpression: "DoctorId = :did",
      ExpressionAttributeValues: {
        ":did": doctorId,
      },
    })
  );

  const list = result.Items || [];
  // Sắp xếp lịch khám theo ngày và giờ tăng dần
  return list.sort((a, b) => {
    const keyA = `${a.AppointmentDate || ""}#${a.SlotTime || ""}`;
    const keyB = `${b.AppointmentDate || ""}#${b.SlotTime || ""}`;
    return keyA.localeCompare(keyB);
  });
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorByEmail,
  generateAndSendDoctorOtp,
  verifyDoctorOtp,
  getDoctorAppointments,
};
