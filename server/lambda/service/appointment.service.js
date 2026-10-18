const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/db.js");

const createAppointment = async (data) => {
    const doctorId = data.DoctorId || data.doctorId;
    const patientName = data.PatientName || data.patientName;
    const patientPhone = data.PatientPhone || data.patientPhone || "";
    const appointmentDate = data.AppointmentDate || data.appointmentDate;
    const slotTime = data.SlotTime || data.slotTime;
    const slotKey = data.SlotKey || `${appointmentDate}#${slotTime}`;
    const appointmentId = data.AppointmentId || ("APT-" + Date.now());

    const newAppointmentItem = {
        DoctorId: doctorId,
        SlotKey: slotKey,
        AppointmentId: appointmentId,
        PatientName: patientName,
        PatientPhone: patientPhone,
        AppointmentDate: appointmentDate,
        SlotTime: slotTime,
        Status: data.Status || "CONFIRMED",
        CreatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
        TableName: TABLES.APPOINTMENTS,
        Item: newAppointmentItem,
        ConditionExpression: "attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)"
    }));

    return newAppointmentItem;
};

module.exports = {
    createAppointment
};
