import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId: string, role: "admin" | "editor") =>
  jwt.sign({ sub: userId, role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

export const createRefreshToken = (userId: string, role: "admin" | "editor") =>
  jwt.sign({ sub: userId, role }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
