import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId: string, role: "admin" | "editor") =>
  jwt.sign({ sub: userId, role }, env.jwtAccessSecret as Secret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
  });

export const createRefreshToken = (userId: string, role: "admin" | "editor") =>
  jwt.sign({ sub: userId, role }, env.jwtRefreshSecret as Secret, {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  });
