import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const router = Router();

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "editor"]).default("editor"),
  password: z.string().min(6),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "editor"]).optional(),
  password: z.string().min(6).optional(),
});

router.use(requireAuth, requireRole(["admin"]));

router.get("/", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
});

router.post("/", validate(createSchema), async (req: AuthRequest, res) => {
  const { email, name, role, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: "Email already in use" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email.toLowerCase(), name, role, passwordHash });
  await logAudit({ userId: req.userId, action: "create", entity: "user", entityId: user.id });
  return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.patch("/:id", validate(updateSchema), async (req: AuthRequest, res) => {
  const { name, role, password } = req.body;
  const update: Record<string, unknown> = {};
  if (name) update.name = name;
  if (role) update.role = role;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  await logAudit({ userId: req.userId, action: "update", entity: "user", entityId: user.id });
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await logAudit({ userId: req.userId, action: "delete", entity: "user", entityId: user.id });
  return res.json({ message: "User deleted" });
});

export default router;
