import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });
const read = (key, fallback) => process.env[key] ?? fallback;
const requiredKeys = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
];
const missingVars = requiredKeys.filter((key) => !read(key));
if (missingVars.length > 0) {
    throw new Error(`Missing env vars: ${missingVars.join(", ")}. ` +
        `Create ${envPath} from backend/.env.example and retry.`);
}
const required = (key, fallback) => read(key, fallback);
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 5000),
    mongodbUri: required("MONGODB_URI"),
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    clientUrl: required("CLIENT_URL", "http://localhost:3000"),
    adminUrl: required("ADMIN_URL", "http://localhost:5173"),
    storageDriver: (process.env.STORAGE_DRIVER ?? "local"),
    uploadDir: process.env.UPLOAD_DIR ?? "uploads",
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    awsRegion: process.env.AWS_REGION ?? "",
    s3Bucket: process.env.S3_BUCKET ?? "",
    logLevel: process.env.LOG_LEVEL ?? "info",
};
