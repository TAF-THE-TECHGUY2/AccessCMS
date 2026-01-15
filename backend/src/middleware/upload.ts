import multer from "multer";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const ensureUploadDir = () => {
  const dir = path.resolve(env.uploadDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload =
  env.storageDriver === "local"
    ? multer({ storage: diskStorage })
    : multer({ storage: multer.memoryStorage() });
