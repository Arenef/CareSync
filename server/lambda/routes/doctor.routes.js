const doctorController = require("../controller/doctor.controller");

const doctorRoutes = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path || "";

    if (method === "GET" && (path.endsWith("/doctors") || path.endsWith("/doctors/"))) {
        return await doctorController.getAllDoctors(event);
    }

    if (method === "GET" && path.includes("/doctors/")) {
        return await doctorController.getDoctorById(event);
    }

    return null;
};

module.exports = doctorRoutes;
