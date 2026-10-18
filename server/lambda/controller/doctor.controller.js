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
        // Đọc doctorId từ path /doctors/{id} hoặc queryString ?id=...
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

module.exports = {
    getAllDoctors,
    getDoctorById
};
