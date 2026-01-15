import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const connectDb = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  logger.info("MongoDB connected");
};
