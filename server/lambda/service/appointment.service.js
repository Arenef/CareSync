const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const {
  SchedulerClient,
  CreateScheduleCommand,
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

  // Gọi trực tiếp hàm lưu/cập nhật hồ sơ bệnh nhân song song
  const patientTask = saveOrUpdatePatient({
    patientName,
    patientPhone,
    email: patientEmail,
    patientId,
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

      const scheduleName = `CareSync-remind-${appointmentId}-${Date.now()}`
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

module.exports = {
  createAppointment,
};
