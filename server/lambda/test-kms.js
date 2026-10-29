const fs = require("fs");
const path = require("path");

// Kiểm tra nhanh file credentials trong thư mục
const credPath = path.join(__dirname, "credentials");
if (fs.existsSync(credPath)) {
  const raw = fs.readFileSync(credPath, "utf-8");
  if (raw.includes("DÁN_ACCESS_KEY_VÀO_ĐÂY")) {
    console.warn("⚠️  LƯU Ý: File credentials vẫn đang chứa nội dung mẫu. Vui lòng mở file credentials và dán key của bạn vào!");
  }
}

const {
  encryptData,
  decryptData
} = require("./service/kms.service");

async function testKMS() {
  // Dữ liệu giả lập số điện thoại
  const phone = "0912345678";

  try {
    // Kiểm thử số điện thoại
    const encryptedPhone = await encryptData(phone);
    const decryptedPhone = await decryptData(encryptedPhone);

    console.log("=== TEST PHONE ===");
    console.log("Encrypted:", encryptedPhone);
    console.log("Decrypted:", decryptedPhone);
    console.log("Result:", phone === decryptedPhone ? "PASS" : "FAIL");
  } catch (error) {
    console.error("KMS test failed:", error.message);
  }
}

testKMS();
