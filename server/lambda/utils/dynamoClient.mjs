import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";

// Tái sử dụng kết nối DynamoDB client (tránh tạo lại mỗi lần Lambda invoke)
const client = new DynamoDBClient({ region: REGION });

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLES = {
  DOCTORS: process.env.DOCTORS_TABLE || "Doctors",
  APPOINTMENTS: process.env.APPOINTMENTS_TABLE || "Appointments",
  PATIENTS: process.env.PATIENTS_TABLE || "Patients"
};
