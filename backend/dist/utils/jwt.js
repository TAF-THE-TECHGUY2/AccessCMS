import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const createAccessToken = (userId, role) => jwt.sign({ sub: userId, role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
});
export const createRefreshToken = (userId, role) => jwt.sign({ sub: userId, role }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
});
