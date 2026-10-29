const doctorController = require("../controller/doctor.controller");

const doctorRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    // 1. Nhánh gửi mã OTP đăng nhập Bác sĩ
    if (method === "POST" && path.includes("/auth/doctor/send-otp")) {
        return await doctorController.sendDoctorOtp(event);
    }

    // 2. Nhánh xác thực mã OTP đăng nhập Bác sĩ
    if (method === "POST" && path.includes("/auth/doctor/verify-otp")) {
        return await doctorController.verifyDoctorOtp(event);
    }

    // 3. Nhánh lấy danh sách ca khám của một bác sĩ: GET /doctors/{id}/appointments
    if (method === "GET" && path.includes("/appointments") && path.includes("/doctors/")) {
        return await doctorController.getDoctorAppointments(event);
    }

    // 4. Lấy danh sách tất cả bác sĩ: GET /doctors
    if (method === "GET" && (path.endsWith("/doctors") || path.endsWith("/doctors/"))) {
        return await doctorController.getAllDoctors(event);
    }

    // 5. Lấy chi tiết 1 bác sĩ: GET /doctors/{id}
    if (method === "GET" && path.includes("/doctors/")) {
        return await doctorController.getDoctorById(event);
    }

    return null;
};

module.exports = doctorRoutes;
