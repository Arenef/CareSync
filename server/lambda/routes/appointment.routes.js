const appointmentController = require("../controller/appointment.controller");

const appointmentRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    if (method === "POST" && path.endsWith("/appointments")) {
        return await appointmentController.createAppointment(event);
    }

    return null;
};

module.exports = appointmentRoutes;
