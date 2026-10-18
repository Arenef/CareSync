const doctorRoutes = require("./routes/doctor.routes");
const appointmentRoutes = require("./routes/appointment.routes");

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

// 1. Chạy gộp 1 Lambda duy nhất
exports.handler = async (event) => {
    const method = event.requestContext?.http?.method || event.httpMethod;
    if (method === "OPTIONS") return { statusCode: 200, headers };

    const docRes = await doctorRoutes(event);
    if (docRes) return docRes;

    const apptRes = await appointmentRoutes(event);
    if (apptRes) return apptRes;

    return { statusCode: 404, headers, body: JSON.stringify({ message: "Route không tồn tại" }) };
};

// 2. Chạy riêng từng Lambda nếu muốn tách
exports.doctorHandler = async (event) => (await doctorRoutes(event)) || { statusCode: 404, headers, body: JSON.stringify({ message: "Not found" }) };
exports.appointmentHandler = async (event) => (await appointmentRoutes(event)) || { statusCode: 404, headers, body: JSON.stringify({ message: "Not found" }) };
