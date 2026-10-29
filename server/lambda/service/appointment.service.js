const {
  PutCommand,
  QueryCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} = require("@aws-sdk/client-scheduler");
const { docClient, TABLES } = require("../config/db.js");
const { saveOrUpdatePatient } = require("./patient.service.js");

const REGION = process.env.AWS_REGION || "us-east-1";

// Khởi tạo SNS Client và Scheduler Client
const snsClient = new SNSClient({ region: REGION });
const schedulerClient = new SchedulerClient({ region: REGION });

const createAppointment = async (data) => {
  const doctorId = data.DoctorId || data.doctorId;
  const patientName = data.PatientName || data.patientName;
  const patientPhone = data.PatientPhone || data.patientPhone || "";
  const patientEmail = data.PatientEmail || data.patientEmail || "";
  const appointmentDate = data.AppointmentDate || data.appointmentDate;
  const slotTime = data.SlotTime || data.slotTime;
  const slotKey = data.SlotKey || `${appointmentDate}#${slotTime}`;
  const appointmentId = data.AppointmentId || "APT-" + Date.now();

  const cleanPhone = patientPhone ? patientPhone.replace(/[^0-9]/g, "") : "";
  const patientId =
    data.PatientId ||
    data.patientId ||
    (cleanPhone ? `PAT-${cleanPhone}` : `PAT-${Date.now()}`);

  const newAppointmentItem = {
    DoctorId: doctorId,
    DoctorName: data.DoctorName || data.doctorName || "",          // Bổ sung lưu tên bác sĩ
    DoctorSpecialty: data.DoctorSpecialty || data.doctorSpecialty || "", // Bổ sung lưu chuyên khoa
    DoctorRoom: data.DoctorRoom || data.doctorRoom || "Phòng khám 101", // Bổ sung phòng khám
    DoctorAvatar: data.DoctorAvatar || data.doctorAvatar || "",     // Bổ sung ảnh bác sĩ
    Reason: data.Reason || data.reason || data.patientReason || "",  // Bổ sung lý do khám
    SlotKey: slotKey,
    AppointmentId: appointmentId,
    PatientId: patientId,
    PatientName: patientName,
    PatientPhone: patientPhone,
    PatientEmail: patientEmail,
    AppointmentDate: appointmentDate,
    SlotTime: slotTime,
    Status: data.Status || "CONFIRMED",
    CreatedAt: new Date().toISOString(),
  };


  // Ghi vào DynamoDB APPOINTMENTS (chặn trùng lịch khám) và ghi nhận hồ sơ PATIENTS song song
  const appointmentTask = docClient.send(
    new PutCommand({
      TableName: TABLES.APPOINTMENTS,
      Item: newAppointmentItem,
      ConditionExpression:
        "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)",
    }),
  );

  // Gọi trực tiếp hàm lưu/cập nhật hồ sơ bệnh nhân song song (có mã hóa KMS cho SĐT)
  const patientTask = saveOrUpdatePatient({
    patientName,
    patientPhone,
    email: patientEmail,
    patientId,
    ...data,
  }).catch((err) => {
    console.error("[Patient Service Save Error]:", err.message);
    return null;
  });

  // Chờ cả 2 tác vụ hoàn tất song song, ConditionalCheckFailedException ở appointmentTask vẫn được kích hoạt bình thường nếu trùng lịch
  await Promise.all([appointmentTask, patientTask]);

  // Đọc ARN linh hoạt từ biến môi trường (không hardcode ARN)
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN;
  const schedulerTargetArn = process.env.SCHEDULER_TARGET_ARN || snsTopicArn;

  // Xử lý bất đồng bộ gửi email SNS và tạo lịch nhắc Scheduler
  try {
    const asyncTasks = [];

    // Gọi lệnh PublishCommand gửi email xác nhận ngay sau khi ghi DynamoDB
    if (snsTopicArn) {
      const publishTask = snsClient
        .send(
          new PublishCommand({
            TopicArn: snsTopicArn,
            Subject: `[CareSync] Xác nhận đặt lịch khám #${appointmentId}`,
            Message: [
              `Xin chào ${patientName},`,
              ``,
              `Lịch hẹn khám bệnh của bạn đã được xác nhận thành công trên CareSync:`,
              `- Mã lịch hẹn: ${appointmentId}`,
              `- Mã bác sĩ: ${doctorId}`,
              `- Ngày khám: ${appointmentDate}`,
              `- Khung giờ: ${slotTime}`,
              `- Số điện thoại: ${patientPhone}`,
              `- Email: ${patientEmail}`,
              ``,
              `Vui lòng đến trước giờ hẹn 15 phút.`,
              `Trân trọng,`,
              `Đội ngũ CareSync.`,
            ].join("\n"),
          }),
        )
        .catch((err) => {
          console.error("[SNS Publish Error]:", err.message);
        });

      asyncTasks.push(publishTask);
    }

    // Gọi lệnh CreateScheduleCommand với biểu thức at() để hẹn giờ nhắc lịch sau vài phút
    if (schedulerRoleArn && schedulerTargetArn) {
      const delayMinutes = parseInt(
        process.env.REMINDER_DELAY_MINUTES || "2",
        10,
      );
      const remindAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      // Chuẩn hóa định dạng UTC cho EventBridge Scheduler: at(yyyy-MM-ddTHH:mm:ss)
      const atTime = remindAt.toISOString().slice(0, 19);

      const scheduleName = `CareSync-remind-${appointmentId}`
        .replace(/[^a-zA-Z0-9_.-]/g, "-")
        .slice(0, 64);

      const scheduleTask = schedulerClient
        .send(
          new CreateScheduleCommand({
            Name: scheduleName,
            ScheduleExpression: `at(${atTime})`,
            ScheduleExpressionTimezone: "UTC",
            FlexibleTimeWindow: { Mode: "OFF" },
            ActionAfterCompletion: "DELETE", // Tự động xóa lịch one-time sau khi đã kích hoạt
            Target: {
              Arn: schedulerTargetArn,
              RoleArn: schedulerRoleArn,
              Input: JSON.stringify({
                Subject: `[CareSync] Nhắc lịch hẹn khám bệnh #${appointmentId}`,
                Message: `Xin chào ${patientName},\nĐây là thông báo nhắc lịch khám bệnh từ CareSync vào lúc ${slotTime} ngày ${appointmentDate}.\nVui lòng có mặt đúng giờ!`,
              }),
            },
          }),
        )
        .catch((err) => {
          console.error("[Scheduler Create Error]:", err.message);
        });

      asyncTasks.push(scheduleTask);
    }

    // Chờ các tác vụ hoàn thành, không làm gián đoạn phản hồi tạo lịch
    if (asyncTasks.length > 0) {
      await Promise.all(asyncTasks);
    }
  } catch (asyncErr) {
    console.error("Lỗi xử lý bất đồng bộ SNS / Scheduler:", asyncErr.message);
  }

  return newAppointmentItem;
};

/**
 * Tra cứu danh sách lịch hẹn theo số điện thoại thông qua GSI PatientPhone-index
 * @param {string} phone - Số điện thoại của bệnh nhân
 */
const getAppointmentsByPhone = async (phone) => {
  const params = {
    TableName: TABLES.APPOINTMENTS,
    IndexName: "PatientPhone-index",
    KeyConditionExpression: "PatientPhone = :phone",
    ExpressionAttributeValues: {
      ":phone": phone,
    },
  };

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
};

/**
 * Yêu cầu mã OTP hủy lịch hẹn và gửi qua Amazon SNS về email bệnh nhân (Kịch bản 1)
 * @param {Object} params
 * @param {string} params.doctorId - Mã bác sĩ (Partition Key)
 * @param {string} params.slotKey - Ngày và giờ khám (Sort Key)
 */
const requestCancelAppointment = async ({ doctorId, slotKey }) => {
  if (!doctorId || !slotKey) {
    const err = new Error("Vui lòng cung cấp đầy đủ doctorId và slotKey!");
    err.statusCode = 400;
    throw err;
  }

  // 1. Kiểm tra sự tồn tại của lịch hẹn trong DynamoDB
  const getResult = await docClient.send(
    new GetCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: {
        DoctorId: doctorId,
        SlotKey: slotKey,
      },
    })
  );

  const appointment = getResult.Item;
  if (!appointment) {
    const err = new Error("Không tìm thấy lịch hẹn này trong hệ thống!");
    err.statusCode = 404;
    throw err;
  }

  if (appointment.Status === "CANCELLED") {
    const err = new Error("Lịch hẹn này đã được hủy trước đó!");
    err.statusCode = 400;
    throw err;
  }

  // 2. Sinh mã OTP 6 chữ số ngẫu nhiên
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Thời gian hiệu lực: 5 phút
  const otpExpiry = Date.now() + 5 * 60 * 1000;

  // 3. Cập nhật mã OTP vào DynamoDB
  await docClient.send(
    new UpdateCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: {
        DoctorId: doctorId,
        SlotKey: slotKey,
      },
      UpdateExpression: "SET CancelOtp = :otp, OtpExpiry = :expiry",
      ExpressionAttributeValues: {
        ":otp": otp,
        ":expiry": otpExpiry,
      },
    })
  );

  // 4. Gửi email chứa mã OTP qua Amazon SNS Topic
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  if (snsTopicArn) {
    try {
      await snsClient.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `[CareSync] Mã xác nhận OTP hủy lịch khám #${appointment.AppointmentId}`,
          Message: [
            `Xin chào ${appointment.PatientName || "quý khách"},`,
            ``,
            `Hệ thống CareSync nhận được yêu cầu HỦY LỊCH HẸN KHÁM BỆNH của bạn:`,
            `- Mã phiếu khám: ${appointment.AppointmentId}`,
            `- Bác sĩ: ${appointment.DoctorName || appointment.DoctorId}`,
            `- Thời gian: ${appointment.SlotTime} ngày ${appointment.AppointmentDate}`,
            ``,
            `MÃ XÁC NHẬN (OTP) CỦA BẠN LÀ:`,
            `========================`,
            `        ${otp}        `,
            `========================`,
            ``,
            `Mã OTP có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.`,
            `Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email và lịch hẹn của bạn vẫn được giữ nguyên.`,
            ``,
            `Trân trọng,`,
            `Đội ngũ CareSync.`,
          ].join("\n"),
        })
      );
    } catch (snsErr) {
      console.error("[SNS Cancel OTP Publish Error]:", snsErr.message);
    }
  }

  // 5. Che mờ email (Masked Email) để hiển thị an toàn trên giao diện
  const rawEmail = appointment.PatientEmail || "";
  let maskedEmail = "email của bạn";
  if (rawEmail && rawEmail.includes("@")) {
    const [userPart, domainPart] = rawEmail.split("@");
    const visibleLen = Math.min(2, userPart.length);
    maskedEmail = `${userPart.substring(0, visibleLen)}***@${domainPart}`;
  }

  return {
    success: true,
    message: "Mã OTP đã được gửi đến email của bạn!",
    maskedEmail,
    appointmentId: appointment.AppointmentId,
  };
};

/**
 * Xác thực mã OTP và tiến hành hủy lịch hẹn trên DynamoDB, đồng thời thu hồi lịch nhắc EventBridge
 * @param {Object} params
 * @param {string} params.doctorId
 * @param {string} params.slotKey
 * @param {string} params.otp
 */
const confirmCancelAppointment = async ({ doctorId, slotKey, otp }) => {
  if (!doctorId || !slotKey || !otp) {
    const err = new Error("Vui lòng cung cấp đầy đủ doctorId, slotKey và mã otp!");
    err.statusCode = 400;
    throw err;
  }

  // 1. Kiểm tra lịch hẹn
  const getResult = await docClient.send(
    new GetCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: {
        DoctorId: doctorId,
        SlotKey: slotKey,
      },
    })
  );

  const appointment = getResult.Item;
  if (!appointment) {
    const err = new Error("Không tìm thấy lịch hẹn này trong hệ thống!");
    err.statusCode = 404;
    throw err;
  }

  // 2. Kiểm tra OTP
  if (!appointment.CancelOtp || appointment.CancelOtp !== String(otp).trim()) {
    const err = new Error("Mã xác nhận OTP không chính xác. Vui lòng kiểm tra lại!");
    err.statusCode = 400;
    throw err;
  }

  if (Date.now() > (appointment.OtpExpiry || 0)) {
    const err = new Error("Mã OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới!");
    err.statusCode = 400;
    throw err;
  }

  // 3. Xóa bản ghi trong DynamoDB Appointments để giải phóng khung giờ
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.APPOINTMENTS,
      Key: {
        DoctorId: doctorId,
        SlotKey: slotKey,
      },
    })
  );

  // 4. Thu hồi lịch nhắc EventBridge Scheduler nếu còn tồn tại
  const schedulerRoleArn = process.env.SCHEDULER_ROLE_ARN;
  if (schedulerRoleArn && appointment.AppointmentId) {
    try {
      const scheduleName = `CareSync-remind-${appointment.AppointmentId}`
        .replace(/[^a-zA-Z0-9_.-]/g, "-")
        .slice(0, 64);
      await schedulerClient.send(
        new DeleteScheduleCommand({
          Name: scheduleName,
        })
      );
    } catch (schedErr) {
      console.warn("[Scheduler Cancel Warning]:", schedErr.message);
    }
  }

  // 5. Gửi email xác nhận đã hủy thành công qua Amazon SNS
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  if (snsTopicArn) {
    try {
      await snsClient.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `[CareSync] Xác nhận đã hủy thành công lịch khám #${appointment.AppointmentId}`,
          Message: [
            `Xin chào ${appointment.PatientName || "quý khách"},`,
            ``,
            `Lịch hẹn khám bệnh của bạn đã được HỦY THÀNH CÔNG trên CareSync:`,
            `- Mã phiếu khám: ${appointment.AppointmentId}`,
            `- Bác sĩ: ${appointment.DoctorName || appointment.DoctorId}`,
            `- Ngày khám: ${appointment.AppointmentDate}`,
            `- Khung giờ: ${appointment.SlotTime}`,
            ``,
            `Khung giờ khám này hiện đã được giải phóng trên hệ thống.`,
            `Khi có nhu cầu thăm khám lại, bạn có thể truy cập website CareSync để đặt lịch mới bất cứ lúc nào.`,
            ``,
            `Trân trọng cảm ơn,`,
            `Đội ngũ CareSync.`,
          ].join("\n"),
        })
      );
    } catch (snsErr) {
      console.error("[SNS Cancel Confirmed Publish Error]:", snsErr.message);
    }
  }

  return {
    success: true,
    message: `Đã hủy lịch hẹn #${appointment.AppointmentId} thành công và giải phóng khung giờ!`,
    appointmentId: appointment.AppointmentId,
  };
};

module.exports = {
  createAppointment,
  getAppointmentsByPhone,
  requestCancelAppointment,
  confirmCancelAppointment,
};
