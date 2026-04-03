import { logger } from "../config/logger.js";
export const notFound = (_req, res) => {
    res.status(404).json({ message: "Not found" });
};
export const errorHandler = (err, _req, res, _next) => {
    logger.error(err.message, err);
    res.status(err.status ?? 500).json({ message: err.message || "Server error" });
};
