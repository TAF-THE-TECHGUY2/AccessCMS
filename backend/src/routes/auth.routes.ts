import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = createRefreshToken(user.id, user.role);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Missing refresh token" });

  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret) as {
      sub: string;
      role: "admin" | "editor";
    };
    const accessToken = createAccessToken(payload.sub, payload.role);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
  });
  return res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing access token" });
  }
  try {
    const payload = jwt.verify(auth.split(" ")[1], env.jwtAccessSecret) as {
      sub: string;
    };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Invalid user" });
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch {
    return res.status(401).json({ message: "Invalid access token" });
  }
});

export default router;
