import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  userId?: string;
  role?: "admin" | "editor";
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing access token" });
  }

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as {
      sub: string;
      role: "admin" | "editor";
    };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid user" });
    req.userId = user.id;
    req.role = user.role;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid access token" });
  }
};

export const requireRole = (roles: Array<"admin" | "editor">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};
