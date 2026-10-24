/**
 * CareSync - API Client Module
 * Tầng kết nối và xử lý giao tiếp giữa Frontend và AWS API Gateway / Lambda
 */

// ============================================================================
// 1. CẤU HÌNH HỆ THỐNG (CONFIGURATION)
// ============================================================================
const API_CONFIG = {
    // Đường dẫn API Gateway thật trên AWS (hoặc http://localhost:3000 khi chạy local)
    BASE_URL: "https://2q1b3nxtkg.execute-api.us-east-1.amazonaws.com",
    TIMEOUT_MS: 10000, // Timeout sau 10 giây nếu mạng quá chậm
};

// ============================================================================
// 2. BỘ GỌI HTTP TẬP TRUNG (CORE HTTP CLIENT)
// ============================================================================
async function request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    const config = {
        method: options.method || "GET",
        headers: { ...defaultHeaders, ...options.headers },
        ...options,
    };

    // Tự động chuyển body object sang chuỗi JSON nếu có
    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        let data = {};

        try {
            data = await response.json();
        } catch {
            data = { message: "Phản hồi không phải JSON hợp lệ" };
        }

        // Nếu HTTP status không thành công (400, 404, 409, 500...)
        if (!response.ok) {
            const error = new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
            error.status = response.status; // Giữ lại mã 409 Conflict cho tầng UI
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        // Xử lý khi mất mạng hoặc không kết nối được tới server
        if (!err.status) {
            err.status = 0;
            err.message =
                "Không thể kết nối đến máy chủ AWS. Vui lòng kiểm tra lại kết nối mạng!";
        }
        throw err;
    }
}

// ============================================================================
// 3. BỘ CHUYỂN ĐỔI DỮ LIỆU (DATA ADAPTER / MAPPER)
// Đồng bộ thuộc tính DynamoDB (PascalCase) sang thuộc tính Giao diện (camelCase)
// ============================================================================
// 1. Mapper cho Bác sĩ
function mapDoctorFromDynamoDB(doc) {
    if (!doc) return null;
    return {
        id: doc.DoctorId || doc.id,
        name: doc.FullName || doc.name,
        specialty: doc.Specialty || doc.specialty,
        phone: doc.Phone || doc.phone || "1900 1234",
        email: doc.Email || doc.email || "",
        avatar:
            doc.AvatarUrl || doc.avatar || "assets/images/doctor-placeholder.jpg",
        room: doc.Room || doc.room || "Phòng khám Đa khoa",
        degree: doc.Degree || doc.degree || "Bác sĩ Chuyên khoa",
        position: doc.Position || doc.position || "Bác sĩ điều trị",
        workingSlots: doc.WorkingSlots ||
            doc.workingSlots || ["08:00", "09:00", "10:00", "14:00", "15:00"],
        isActive: doc.IsActive !== false,
        experience: doc.Experience || doc.experience || "10+ năm kinh nghiệm trong ngành Y",
        bio: doc.Bio || doc.bio || doc.Description || doc.description || "Bác sĩ giàu kinh nghiệm, tận tâm với nghề và luôn đồng hành cùng sức khỏe bệnh nhân.",
    };
}

// 2. Mapper cho Lịch khám (Tự động tách SlotKey thành Ngày và Giờ)
function mapAppointmentFromDynamoDB(appt) {
    if (!appt) return null;
    // Tách SlotKey dạng "YYYY-MM-DD#HH:mm" thành ngày và giờ
    let date = appt.AppointmentDate || "";
    let time = appt.SlotTime || "";
    if (appt.SlotKey && appt.SlotKey.includes("#")) {
        const parts = appt.SlotKey.split("#");
        date = date || parts[0];
        time = time || parts[1];
    }
    return {
        id: appt.AppointmentId || appt.id || `APT-${Date.now()}`,
        doctorId: appt.DoctorId || appt.doctorId,
        doctorName: appt.DoctorName || appt.doctorName || "Bác sĩ phụ trách",
        doctorSpecialty: appt.DoctorSpecialty || appt.doctorSpecialty || "",
        doctorRoom: appt.DoctorRoom || appt.doctorRoom || "Phòng khám 101",
        doctorAvatar: appt.DoctorAvatar || appt.doctorAvatar || "assets/images/doctor-1.jpg",
        date: date,
        time: time,
        patientName: appt.PatientName || appt.patientName,
        patientPhone: appt.PatientPhone || appt.patientPhone,
        patientEmail: appt.PatientEmail || appt.patientEmail,
        patientReason: appt.Reason || appt.patientReason || "",
        status: (appt.Status || "CONFIRMED").toLowerCase(),
        createdAt: appt.CreatedAt || appt.createdAt || new Date().toISOString(),
    };
}
// 3. Mapper cho Hồ sơ Bệnh nhân
function mapPatientFromDynamoDB(patient) {
    if (!patient) return null;
    return {
        id: patient.PatientId || patient.id,
        name: patient.FullName || patient.name,
        phone: patient.Phone || patient.phone,
        email: patient.Email || patient.email || "",
        dateOfBirth: patient.DateOfBirth || patient.dob || "",
        gender: patient.Gender || patient.gender || "Khác",
    };
}


// ============================================================================
// 4. CÁC HÀM NGHIỆP VỤ API (API SERVICES)
// ============================================================================
const doctorApi = {
    /**
     * Lấy danh sách tất cả bác sĩ đang hoạt động từ DynamoDB
     * @returns {Promise<Array>} Danh sách bác sĩ đã được chuẩn hóa
     */
    async getAll() {
        const res = await request("/doctors", { method: "GET" });
        const rawList = res.data || res.Items || res || [];
        return Array.isArray(rawList) ? rawList.map(mapDoctorFromDynamoDB) : [];
    },

    /**
     * Lấy chi tiết một bác sĩ theo mã DoctorId
     * @param {string} doctorId - Ví dụ: 'DOC01'
     */
    async getById(doctorId) {
        const res = await request(`/doctors/${doctorId}`, { method: "GET" });
        return mapDoctorFromDynamoDB(res.data || res);
    },
};

const appointmentApi = {
    /**
     * Gửi phiếu đặt lịch khám mới lên DynamoDB (kèm chống trùng lịch)
     * @param {Object} bookingData - Thông tin người bệnh và lịch khám
     * @returns {Promise<Object>} Kết quả phiếu khám đã tạo (chứa AppointmentId)
     */
    async create(bookingData) {
        // 1. Chuẩn hóa payload gửi lên Backend
        const payload = {
            DoctorId: bookingData.doctorId || bookingData.DoctorId,
            DoctorName: bookingData.doctorName || bookingData.DoctorName,
            DoctorSpecialty:
                bookingData.doctorSpecialty || bookingData.DoctorSpecialty,
            AppointmentDate:
                bookingData.appointmentDate || bookingData.AppointmentDate,
            SlotTime: bookingData.slotTime || bookingData.SlotTime,
            PatientName: bookingData.patientName || bookingData.PatientName,
            PatientPhone: bookingData.patientPhone || bookingData.PatientPhone,
            PatientEmail: bookingData.patientEmail || bookingData.PatientEmail,
            Reason:
                bookingData.reason ||
                bookingData.patientReason ||
                "Khám sức khỏe định kỳ",
        };
        // 2. Gửi request POST lên API Gateway / Lambda
        const res = await request("/appointments", {
            method: "POST",
            body: payload,
        });
        // 3. Chuẩn hóa dữ liệu trả về từ DynamoDB qua Mapper trước khi đưa cho giao diện
        return {
            ...res,
            data: mapAppointmentFromDynamoDB(res.data || res.Item || res),
        };
    },

    /**
     * Tra cứu danh sách lịch hẹn theo số điện thoại người bệnh từ AWS API Gateway / Lambda (SV2)
     * @param {string} phone - Số điện thoại cần tra cứu (ví dụ: '0912345678')
     * @returns {Promise<Array>} Danh sách các lịch hẹn đã chuẩn hóa
     */
    async getByPhone(phone) {
        if (!phone) return [];
        const cleanPhone = phone.trim();
        const res = await request(`/appointments?phone=${encodeURIComponent(cleanPhone)}`, {
            method: "GET",
        });
        const rawList = res.data || res.Items || res.appointments || (Array.isArray(res) ? res : []);
        return Array.isArray(rawList) ? rawList.map(mapAppointmentFromDynamoDB) : [];
    },
};

const patientApi = {
    // Tra cứu hồ sơ bệnh nhân theo PatientId (ví dụ: 'PAT01')
    async getById(patientId) {
        const res = await request(`/patients/${patientId}`, { method: "GET" });
        return mapPatientFromDynamoDB(res.data || res);
    },
    // Tra cứu theo số điện thoại bệnh nhân
    async getByPhone(phone) {
        const res = await request(`/patients?phone=${encodeURIComponent(phone)}`, { method: "GET" });
        return mapPatientFromDynamoDB(res.data || res);
    },
};

// ============================================================================
// 5. XUẤT RA BIẾN TOÀN CỤC CHO TRÌNH DUYỆT (GLOBAL EXPORT)
// ============================================================================
window.CareSyncAPI = {
    doctorApi,
    appointmentApi,
    patientApi,
    API_CONFIG,
};
