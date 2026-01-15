import { createServer } from "http";
import app from "./server.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const start = async () => {
  await connectDb();
  const server = createServer(app);
  server.listen(env.port, () => {
    logger.info(`API listening on port ${env.port}`);
  });
};

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
