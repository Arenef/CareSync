const { ScanCommand, GetCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/db.js");

/**
 * Lấy danh sách tất cả bác sĩ đang hoạt động
 */
const getAllDoctors = async () => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.DOCTORS,
    })
  );

  // Lọc chỉ lấy các bác sĩ IsActive !== false và sắp xếp theo DoctorId
  const doctors = (result.Items || [])
    .filter(doc => doc.IsActive !== false)
    .sort((a, b) => (a.DoctorId || "").localeCompare(b.DoctorId || ""));

  return doctors;
};

const getDoctorById = async (doctorId) => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.DOCTORS,
      Key: { DoctorId: doctorId }
    })
  )

  return result.Item || null;
}
module.exports = {
  getAllDoctors,
  getDoctorById
}
