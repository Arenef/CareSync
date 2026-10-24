const fs = require("fs");
const path = require("path");
const {
  KMSClient,
  EncryptCommand,
  DecryptCommand
} = require("@aws-sdk/client-kms");

// Tự động nạp file credentials trên ổ D (server/lambda/credentials) nếu có
if (!process.env.AWS_ACCESS_KEY_ID) {
  const credPaths = [
    path.join(__dirname, "../credentials"),
    path.join(__dirname, "credentials")
  ];
  for (const cp of credPaths) {
    if (fs.existsSync(cp)) {
      const content = fs.readFileSync(cp, "utf-8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[")) return;
        const [key, ...vals] = trimmed.split("=");
        if (key && vals.length > 0) {
          const val = vals.join("=").trim().replace(/^["']|["']$/g, "");
          const k = key.trim().toLowerCase();
          if (k === "aws_access_key_id" && !val.includes("DÁN_")) process.env.AWS_ACCESS_KEY_ID = val;
          if (k === "aws_secret_access_key" && !val.includes("DÁN_")) process.env.AWS_SECRET_ACCESS_KEY = val;
          if (k === "aws_session_token" && !val.includes("DÁN_")) process.env.AWS_SESSION_TOKEN = val;
          if (k === "region") process.env.AWS_REGION = val;
        }
      });
      break;
    }
  }
}

const REGION = process.env.AWS_REGION || "us-east-1";

const kms = new KMSClient({
  region: REGION
});

const KEY_ID = process.env.KMS_KEY_ID || "alias/caresync-patient-key";

// Mã hóa chuỗi thành ciphertext dạng Base64
async function encryptData(text) {
  const result = await kms.send(
    new EncryptCommand({
      KeyId: KEY_ID,
      Plaintext: Buffer.from(text, "utf8")
    })
  );

  return Buffer.from(result.CiphertextBlob).toString("base64");
}

// Giải mã ciphertext dạng Base64 về chuỗi ban đầu
async function decryptData(cipherText) {
  const result = await kms.send(
    new DecryptCommand({
      CiphertextBlob: Buffer.from(cipherText, "base64")
    })
  );

  return Buffer.from(result.Plaintext).toString("utf8");
}

module.exports = {
  encryptData,
  decryptData
};
