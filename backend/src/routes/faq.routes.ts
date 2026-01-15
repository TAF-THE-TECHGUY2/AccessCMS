import { Router } from "express";
import { z } from "zod";
import { FAQ } from "../models/FAQ.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const faqSchema = z.object({
  question: z.string().min(1),
  answerHtml: z.string().min(1),
  category: z.string().optional(),
  order: z.number().optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get("/", async (_req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
  res.json(faqs);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, updatedAt: -1 });
  res.json(faqs);
});

adminRouter.post("/", validate(faqSchema), async (req: AuthRequest, res) => {
  const faq = await FAQ.create(req.body);
  await logAudit({ userId: req.userId, action: "create", entity: "faq", entityId: faq.id });
  res.status(201).json(faq);
});

adminRouter.patch("/:id", validate(faqSchema.partial()), async (req: AuthRequest, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) return res.status(404).json({ message: "FAQ not found" });
  await logAudit({ userId: req.userId, action: "update", entity: "faq", entityId: faq.id });
  res.json(faq);
});

adminRouter.delete("/:id", async (req: AuthRequest, res) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) return res.status(404).json({ message: "FAQ not found" });
  await logAudit({ userId: req.userId, action: "delete", entity: "faq", entityId: faq.id });
  res.json({ message: "FAQ deleted" });
});
