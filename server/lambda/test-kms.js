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
  // Dữ liệu giả lập, không dùng thông tin thật
  const phone = "0912345678";
  const cccd = "012345678901";

  try {
    // Kiểm thử số điện thoại
    const encryptedPhone = await encryptData(phone);
    const decryptedPhone = await decryptData(encryptedPhone);

    console.log("=== TEST PHONE ===");
    console.log("Encrypted:", encryptedPhone);
    console.log("Decrypted:", decryptedPhone);
    console.log("Result:", phone === decryptedPhone ? "PASS" : "FAIL");

    // Kiểm thử CCCD
    const encryptedCCCD = await encryptData(cccd);
    const decryptedCCCD = await decryptData(encryptedCCCD);

    console.log("\n=== TEST CCCD ===");
    console.log("Encrypted:", encryptedCCCD);
    console.log("Decrypted:", decryptedCCCD);
    console.log("Result:", cccd === decryptedCCCD ? "PASS" : "FAIL");
  } catch (error) {
    console.error("KMS test failed:", error.message);
  }
}

testKMS();
