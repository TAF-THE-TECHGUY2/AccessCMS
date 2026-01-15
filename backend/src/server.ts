import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import { publicRouter as pagesPublicRouter, adminRouter as pagesAdminRouter } from "./routes/pages.routes.js";
import { publicRouter as propertiesPublicRouter, adminRouter as propertiesAdminRouter } from "./routes/properties.routes.js";
import { publicRouter as teamPublicRouter, adminRouter as teamAdminRouter } from "./routes/team.routes.js";
import { publicRouter as faqPublicRouter, adminRouter as faqAdminRouter } from "./routes/faq.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import { publicRouter as siteSettingsPublicRouter, adminRouter as siteSettingsAdminRouter } from "./routes/siteSettings.routes.js";
import { swaggerRouter } from "./config/swagger.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.clientUrl, env.adminUrl],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.http(msg.trim()),
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === "development" ? 2000 : 200,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (env.storageDriver === "local") {
  app.use("/uploads", express.static(path.join(__dirname, "..", env.uploadDir)));
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/docs", swaggerRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pages", pagesPublicRouter);
app.use("/api/admin/pages", pagesAdminRouter);
app.use("/api/properties", propertiesPublicRouter);
app.use("/api/admin/properties", propertiesAdminRouter);
app.use("/api/team", teamPublicRouter);
app.use("/api/admin/team", teamAdminRouter);
app.use("/api/faq", faqPublicRouter);
app.use("/api/admin/faq", faqAdminRouter);
app.use("/api/admin/media", mediaRoutes);
app.use("/api/site-settings", siteSettingsPublicRouter);
app.use("/api/admin/site-settings", siteSettingsAdminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
