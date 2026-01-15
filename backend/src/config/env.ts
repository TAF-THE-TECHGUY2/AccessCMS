import dotenv from "dotenv";

dotenv.config();

const required = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing env var ${key}`);
  }
  return value;
};

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
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "",
  logLevel: process.env.LOG_LEVEL ?? "info",
};
