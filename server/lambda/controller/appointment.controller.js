const appointmentService = require("../service/appointment.service");

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

const createAppointment = async (event) => {
    try {
        // Đọc body từ event
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};

        const doctorId = body.DoctorId || body.doctorId;
        const patientName = body.PatientName || body.patientName;
        const appointmentDate = body.AppointmentDate || body.appointmentDate;
        const slotTime = body.SlotTime || body.slotTime;

        if (!doctorId || !patientName || !appointmentDate || !slotTime) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Thiếu thông tin đặt lịch bắt buộc!" })
            };
        }

        // Gọi tầng Service xử lý ghi DB
        const newAppointment = await appointmentService.createAppointment(body);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: "Đặt lịch khám thành công!",
                data: newAppointment
            })
        };
    } catch (error) {
        console.error("Lỗi createAppointment:", error);

        // Chống trùng lịch (DynamoDB ConditionalCheckFailedException)
        if (error.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    error: "Khung giờ này của bác sĩ đã có người đặt trước. Vui lòng chọn giờ khác!"
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Lỗi hệ thống: " + error.message })
        };
    }
};

/**
 * Controller xử lý tra cứu danh sách lịch hẹn theo số điện thoại (GET /appointments?phone=...)
 */
const getAppointments = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};
        const phone = queryParams.phone || queryParams.PatientPhone;

        if (!phone) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: "Vui lòng cung cấp số điện thoại (query param: ?phone=...) để tra cứu!" })
            };
        }

        const appointments = await appointmentService.getAppointmentsByPhone(phone.trim());

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: "Tra cứu danh sách lịch hẹn thành công!",
                count: appointments.length,
                data: appointments
            })
        };
    } catch (error) {
        console.error("Lỗi getAppointments:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Lỗi hệ thống khi tra cứu lịch hẹn: " + error.message })
        };
    }
};

/**
 * Controller tiếp nhận yêu cầu gửi mã OTP hủy lịch (POST /appointments/request-cancel)
 */
const requestCancel = async (event) => {
    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
        const doctorId = body.DoctorId || body.doctorId;
        const slotKey = body.SlotKey || body.slotKey;

        if (!doctorId || !slotKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Thiếu thông tin doctorId hoặc slotKey!" })
            };
        }

        const result = await appointmentService.requestCancelAppointment({ doctorId, slotKey });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Lỗi requestCancel:", error);
        return {
            statusCode: error.statusCode || 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};

/**
 * Controller tiếp nhận xác nhận mã OTP để hủy lịch (POST /appointments/confirm-cancel)
 */
const confirmCancel = async (event) => {
    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
        const doctorId = body.DoctorId || body.doctorId;
        const slotKey = body.SlotKey || body.slotKey;
        const otp = body.otp || body.Otp;

        if (!doctorId || !slotKey || !otp) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Thiếu thông tin doctorId, slotKey hoặc mã otp!" })
            };
        }

        const result = await appointmentService.confirmCancelAppointment({ doctorId, slotKey, otp });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Lỗi confirmCancel:", error);
        return {
            statusCode: error.statusCode || 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    requestCancel,
    confirmCancel
};
