const appointmentController = require("../controller/appointment.controller");

const appointmentRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    // 1. Nhánh yêu cầu gửi mã OTP hủy lịch (POST /appointments/request-cancel)
    if (method === "POST" && path.includes("/appointments/request-cancel")) {
        return await appointmentController.requestCancel(event);
    }

    // 2. Nhánh xác nhận mã OTP hủy lịch (POST /appointments/confirm-cancel)
    if (method === "POST" && path.includes("/appointments/confirm-cancel")) {
        return await appointmentController.confirmCancel(event);
    }

    // 3. Nhánh POST đặt lịch
    if (method === "POST" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.createAppointment(event);
    }

    // 4. Nhánh GET tra cứu lịch hẹn theo SĐT (?phone=...)
    if (method === "GET" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.getAppointments(event);
    }

    return null;
};

module.exports = appointmentRoutes;
