const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";

// Khởi tạo DynamoDB Client
const client = new DynamoDBClient({ region: REGION });

// Tái sử dụng kết nối DynamoDB DocumentClient
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

// Tên các bảng DynamoDB trong hệ thống
const TABLES = {
    DOCTORS: process.env.DOCTORS_TABLE || "Doctors",
    APPOINTMENTS: process.env.APPOINTMENTS_TABLE || "Appointments",
    PATIENTS: process.env.PATIENTS_TABLE || "Patients"
};

module.exports = {
    docClient,
    TABLES
};
