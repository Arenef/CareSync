const { KMSClient, EncryptCommand, DecryptCommand } = require("@aws-sdk/client-kms");

const REGION = process.env.AWS_REGION || "us-east-1";
const kmsClient = new KMSClient({ region: REGION });

// Đọc ARN khóa KMS từ biến môi trường
const KMS_KEY_ARN = process.env.KMS_KEY_ARN || process.env.KMS_KEY_ID;

/**
 * Mã hóa dữ liệu nhạy cảm (SĐT, CCCD, Email) bằng AWS KMS Customer Managed Key (CMK)
 * @param {string} text - Chuỗi văn bản gốc cần mã hóa
 * @returns {Promise<string>} Chuỗi mã hóa dạng Base64
 */
const encryptData = async (text) => {
  if (!text) return "";
  if (!KMS_KEY_ARN) {
    console.warn("[KMS] Chưa cấu hình KMS_KEY_ARN trong biến môi trường!");
    return text;
  }

  try {
    const command = new EncryptCommand({
      KeyId: KMS_KEY_ARN,
      Plaintext: Buffer.from(text, "utf-8"),
    });

    const response = await kmsClient.send(command);
    return Buffer.from(response.CiphertextBlob).toString("base64");
  } catch (error) {
    console.error("[KMS Encrypt Error]:", error.message);
    throw error;
  }
};

/**
 * Giải mã chuỗi Base64 bằng AWS KMS về lại văn bản gốc
 * @param {string} cipherTextBase64 - Chuỗi Base64 đã mã hóa
 * @returns {Promise<string>} Chuỗi văn bản gốc sau khi giải mã
 */
const decryptData = async (cipherTextBase64) => {
  if (!cipherTextBase64) return "";
  if (!KMS_KEY_ARN) {
    return cipherTextBase64;
  }

  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(cipherTextBase64, "base64"),
    });

    const response = await kmsClient.send(command);
    return Buffer.from(response.Plaintext).toString("utf-8");
  } catch (error) {
    console.error("[KMS Decrypt Error]:", error.message);
    throw error;
  }
};

module.exports = {
  encryptData,
  decryptData,
};
