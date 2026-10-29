const {
  PutCommand,
  GetCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/db.js");
const { encryptData, decryptData } = require("./kms.service.js");

/**
 * Lưu hoặc cập nhật hồ sơ bệnh nhân vào bảng Patients trên DynamoDB
 * Tích hợp mã hóa bảo vệ số điện thoại bằng AWS KMS
 */
const saveOrUpdatePatient = async ({
  patientName,
  patientPhone,
  email,
  patientId,
  ...extra
} = {}) => {
  const name = patientName || extra.PatientName || extra.FullName || "";
  const phone = patientPhone || extra.PatientPhone || extra.Phone || "";
  const patientEmail = email || extra.PatientEmail || extra.Email || "";

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const id =
    patientId ||
    extra.PatientId ||
    (cleanPhone ? `PAT-${cleanPhone}` : `PAT-${Date.now()}`);

  const now = new Date().toISOString();

  // Tích hợp AWS KMS: Mã hóa số điện thoại người dùng
  let phoneEncrypted = null;
  try {
    if (phone) phoneEncrypted = await encryptData(phone);
  } catch (kmsErr) {
    console.warn(
      "[KMS Warning] Không thể mã hóa SĐT qua KMS, lưu dự phòng:",
      kmsErr.message,
    );
  }

  const patientItem = {
    PatientId: id,
    FullName: name,
    PatientName: name,
    Phone: phone,
    PhoneEncrypted: phoneEncrypted, // Lưu chuỗi Base64 mã hóa KMS
    IsKmsEncrypted: Boolean(phoneEncrypted),
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

  await docClient.send(
    new PutCommand({ TableName: TABLES.PATIENTS, Item: patientItem }),
  );
  return patientItem;
};

/**
 * Tra cứu thông tin hồ sơ bệnh nhân theo PatientId (kèm giải mã SĐT qua KMS)
 */
const getPatientById = async (patientId) => {
  if (!patientId) return null;
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.PATIENTS,
      Key: { PatientId: patientId },
    }),
  );
  const item = result.Item;
  if (item?.PhoneEncrypted) {
    try {
      item.DecryptedPhone = await decryptData(item.PhoneEncrypted);
    } catch (_) {}
  }
  return item || null;
};

/**
 * Tra cứu thông tin hồ sơ bệnh nhân theo số điện thoại (kèm giải mã SĐT qua KMS)
 */
const getPatientByPhone = async (phone) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  let item = null;
  if (cleanPhone) {
    const directResult = await docClient.send(
      new GetCommand({
        TableName: TABLES.PATIENTS,
        Key: { PatientId: `PAT-${cleanPhone}` },
      }),
    );
    if (directResult.Item) item = directResult.Item;
  }

  if (!item) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.PATIENTS,
        FilterExpression: "#phone = :phone",
        ExpressionAttributeNames: { "#phone": "Phone" },
        ExpressionAttributeValues: { ":phone": phone },
      }),
    );
    if (result.Items?.length > 0) item = result.Items[0];
  }

  if (item?.PhoneEncrypted) {
    try {
      item.DecryptedPhone = await decryptData(item.PhoneEncrypted);
    } catch (_) {}
  }

  return item;
};

module.exports = {
  saveOrUpdatePatient,
  getPatientById,
  getPatientByPhone,
};
