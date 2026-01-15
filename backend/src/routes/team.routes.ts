import { Router } from "express";
import { z } from "zod";
import { TeamMember } from "../models/TeamMember.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  photoUrl: z.string().optional(),
  bio: z.string().optional(),
  socials: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  order: z.number().optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get("/", async (_req, res) => {
  const team = await TeamMember.find().sort({ order: 1, createdAt: -1 });
  res.json(team);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const team = await TeamMember.find().sort({ order: 1, updatedAt: -1 });
  res.json(team);
});

adminRouter.post("/", validate(teamSchema), async (req: AuthRequest, res) => {
  const member = await TeamMember.create(req.body);
  await logAudit({ userId: req.userId, action: "create", entity: "team", entityId: member.id });
  res.status(201).json(member);
});

adminRouter.patch("/:id", validate(teamSchema.partial()), async (req: AuthRequest, res) => {
  const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!member) return res.status(404).json({ message: "Team member not found" });
  await logAudit({ userId: req.userId, action: "update", entity: "team", entityId: member.id });
  res.json(member);
});

adminRouter.delete("/:id", async (req: AuthRequest, res) => {
  const member = await TeamMember.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ message: "Team member not found" });
  await logAudit({ userId: req.userId, action: "delete", entity: "team", entityId: member.id });
  res.json({ message: "Team member deleted" });
});
