import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
};

export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, err);
  res.status(err.status ?? 500).json({ message: err.message || "Server error" });
};
