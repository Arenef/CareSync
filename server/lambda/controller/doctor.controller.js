const doctorService = require("../service/doctor.service");

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

const getAllDoctors = async (event) => {
    try {
        const data = await doctorService.getAllDoctors();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, data })
        };
    } catch (error) {
        console.error("Lỗi getAllDoctors:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

const getDoctorById = async (event) => {
    try {
        const doctorId = event.pathParameters?.id || event.queryStringParameters?.id;
        if (!doctorId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Thiếu DoctorId" })
            };
        }

        const doctor = await doctorService.getDoctorById(doctorId);
        if (!doctor) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, message: "Không tìm thấy bác sĩ" })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, data: doctor })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

/**
 * Controller: Gửi mã OTP đăng nhập qua Email
 */
const sendDoctorOtp = async (event) => {
    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
        const email = body.email || body.Email;

        if (!email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Vui lòng nhập email bác sĩ!" })
            };
        }

        // Kiểm tra xem email có thuộc về bác sĩ nào trong hệ thống không
        const doctor = await doctorService.getDoctorByEmail(email);
        if (!doctor) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: "Email này không tồn tại trong danh sách bác sĩ của hệ thống!"
                })
            };
        }

        // Tạo và gửi OTP qua SNS
        const result = await doctorService.generateAndSendDoctorOtp(doctor);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Mã OTP đã được gửi về email của Bác sĩ ${result.doctorName}!`,
                doctorName: result.doctorName,
                email: result.doctorEmail,
                debugOtp: result.otp // Hỗ trợ test nhanh nếu email SNS chưa kích hoạt
            })
        };
    } catch (error) {
        console.error("Lỗi sendDoctorOtp:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

/**
 * Controller: Xác thực mã OTP và đăng nhập
 */
const verifyDoctorOtp = async (event) => {
    try {
        const body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : {};
        const email = body.email || body.Email;
        const otp = body.otp || body.OtpCode || body.Otp;

        if (!email || !otp) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Vui lòng cung cấp đầy đủ email và mã OTP!" })
            };
        }

        const doctorSession = await doctorService.verifyDoctorOtp(email, otp);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Đăng nhập thành công! Chào mừng Bác sĩ ${doctorSession.Name}.`,
                doctor: doctorSession
            })
        };
    } catch (error) {
        console.error("Lỗi verifyDoctorOtp:", error);
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};

/**
 * Controller: Lấy danh sách ca khám của bác sĩ
 */
const getDoctorAppointments = async (event) => {
    try {
        // Lấy doctorId từ path /doctors/{id}/appointments hoặc query /appointments?doctorId=...
        const path = event.requestContext?.http?.path || event.path || "";
        let doctorId = event.pathParameters?.id || event.queryStringParameters?.doctorId;

        if (!doctorId && path.includes("/doctors/")) {
            const parts = path.split("/doctors/")[1]?.split("/");
            if (parts && parts[0]) doctorId = parts[0];
        }

        if (!doctorId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Thiếu DoctorId!" })
            };
        }

        const appointments = await doctorService.getDoctorAppointments(doctorId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: "Lấy danh sách ca khám thành công!",
                count: appointments.length,
                data: appointments
            })
        };
    } catch (error) {
        console.error("Lỗi getDoctorAppointments:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    sendDoctorOtp,
    verifyDoctorOtp,
    getDoctorAppointments
};
