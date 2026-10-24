const { PutCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/db.js");

/**
 * Lưu hoặc cập nhật hồ sơ bệnh nhân vào bảng Patients trên DynamoDB
 * @param {Object} patientData - Dữ liệu bệnh nhân
 * @param {string} patientData.patientName - Họ tên bệnh nhân
 * @param {string} patientData.patientPhone - Số điện thoại liên hệ
 * @param {string} [patientData.email] - Email liên hệ
 * @param {string} [patientData.patientId] - Mã định danh bệnh nhân (tùy chọn)
 * @returns {Promise<Object>} Thông tin hồ sơ bệnh nhân đã được ghi
 */
const saveOrUpdatePatient = async ({
  patientName,
  patientPhone,
  email,
  patientId,
  ...extra
} = {}) => {
  // Chuẩn hóa dữ liệu đầu vào (hỗ trợ cả camelCase và PascalCase)
  const name = patientName || extra.PatientName || extra.FullName || "";
  const phone = patientPhone || extra.PatientPhone || extra.Phone || "";
  const patientEmail = email || extra.PatientEmail || extra.Email || "";

  // Chuẩn hóa số điện thoại để tạo PatientId duy nhất theo định danh bệnh nhân: PAT-<cleanPhone>
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const id =
    patientId ||
    extra.PatientId ||
    (cleanPhone ? `PAT-${cleanPhone}` : `PAT-${Date.now()}`);

  const now = new Date().toISOString();

  const patientItem = {
    PatientId: id,
    FullName: name,
    PatientName: name, // Phi chuẩn hóa thuộc tính để tương thích cả 2 chuẩn giao diện và DB
    Phone: phone,
    Email: patientEmail,
    UpdatedAt: now,
    CreatedAt: extra.CreatedAt || now,
    ...(extra.DateOfBirth || extra.dateOfBirth
      ? { DateOfBirth: extra.DateOfBirth || extra.dateOfBirth }
      : {}),
    ...(extra.Gender || extra.gender
      ? { Gender: extra.Gender || extra.gender }
      : {}),
  };

  // Sử dụng PutCommand ghi dữ liệu vào bảng TABLES.PATIENTS trong db.js
  const command = new PutCommand({
    TableName: TABLES.PATIENTS,
    Item: patientItem,
  });

  await docClient.send(command);

  return patientItem;
};

/**
 * Tra cứu thông tin hồ sơ bệnh nhân theo PatientId
 * @param {string} patientId 
 * @returns {Promise<Object|null>}
 */
const getPatientById = async (patientId) => {
  if (!patientId) return null;
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.PATIENTS,
      Key: { PatientId: patientId },
    })
  );
  return result.Item || null;
};

/**
 * Tra cứu thông tin hồ sơ bệnh nhân theo số điện thoại
 * @param {string} phone 
 * @returns {Promise<Object|null>}
 */
const getPatientByPhone = async (phone) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  // Tra cứu trực tiếp theo Partition Key định danh nếu có
  if (cleanPhone) {
    const directResult = await docClient.send(
      new GetCommand({
        TableName: TABLES.PATIENTS,
        Key: { PatientId: `PAT-${cleanPhone}` },
      })
    );
    if (directResult.Item) return directResult.Item;
  }

  // Quét bảng tìm theo thuộc tính Phone nếu PatientId được tạo theo format khác
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.PATIENTS,
      FilterExpression: "#phone = :phone",
      ExpressionAttributeNames: { "#phone": "Phone" },
      ExpressionAttributeValues: { ":phone": phone },
    })
  );

  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

module.exports = {
  saveOrUpdatePatient,
  getPatientById,
  getPatientByPhone,
};
