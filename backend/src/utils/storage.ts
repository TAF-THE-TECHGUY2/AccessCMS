import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs/promises";

const s3 = env.storageDriver === "s3"
  ? new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      },
    })
  : null;

export const uploadFile = async (
  file: Express.Multer.File
): Promise<{ url: string; key: string }> => {
  if (env.storageDriver === "s3" && s3) {
    const ext = path.extname(file.originalname);
    const key = `uploads/${nanoid()}${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: env.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    const url = `https://${env.s3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
    return { url, key };
  }

  const key = file.filename;
  const url = `/uploads/${key}`;
  return { url, key };
};

export const deleteFile = async (key: string) => {
  if (!key) return;
  if (env.storageDriver === "s3" && s3) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.s3Bucket,
        Key: key,
      })
    );
    return;
  }
  const filePath = path.resolve(env.uploadDir, key);
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing local file
  }
};
