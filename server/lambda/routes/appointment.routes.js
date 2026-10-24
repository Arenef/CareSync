const appointmentController = require("../controller/appointment.controller");

const appointmentRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    // 1. Nhánh POST đặt lịch
    if (method === "POST" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.createAppointment(event);
    }

    // 2. Nhánh GET tra cứu lịch hẹn theo SĐT (?phone=...)
    if (method === "GET" && (path.endsWith("/appointments") || path.endsWith("/appointments/"))) {
        return await appointmentController.getAppointments(event);
    }

    return null;
};

module.exports = appointmentRoutes;
