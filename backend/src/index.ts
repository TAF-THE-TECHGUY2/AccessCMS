import { createServer } from "http";
import type { Server } from "http";
import app from "./server.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const listen = (server: Server, port: number) =>
  new Promise<void>((resolve, reject) => {
    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${port} is already in use. Update PORT in backend/.env or stop the process using that port.`
          )
        );
        return;
      }
      reject(err);
    };

    server.once("error", onError);
    server.listen(port, () => {
      server.off("error", onError);
      logger.info(`API listening on port ${port}`);
      resolve();
    });
  });

const start = async () => {
  await connectDb();
  const server = createServer(app);
  await listen(server, env.port);
};

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
