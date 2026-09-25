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

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number(),
      category: z.string().optional(),
    })
  ),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get("/", async (_req, res) => {
  // order ascending is the admin-defined display order; oldest-first is the
  // tie-break so untouched FAQs keep insertion order (never reversed).
  const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
  res.json(faqs);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
  res.json(faqs);
});

adminRouter.post("/", validate(faqSchema), async (req: AuthRequest, res) => {
  const body = { ...req.body };
  // New FAQs append to the end of their category so they don't jump to the top.
  if (body.order === undefined) {
    const last = await FAQ.findOne({ category: body.category ?? null }).sort({ order: -1 });
    body.order = last ? last.order + 1 : 0;
  }
  const faq = await FAQ.create(body);
  await logAudit({ userId: req.userId, action: "create", entity: "faq", entityId: faq.id });
  res.status(201).json(faq);
});

// Bulk reorder. Declared before "/:id" so "reorder" isn't treated as an id.
adminRouter.patch("/reorder", validate(reorderSchema), async (req: AuthRequest, res) => {
  const ops = req.body.items.map((it: { id: string; order: number; category?: string }) => ({
    updateOne: {
      filter: { _id: it.id },
      update: { $set: { order: it.order, ...(it.category !== undefined ? { category: it.category } : {}) } },
    },
  }));
  if (ops.length) await FAQ.bulkWrite(ops);
  await logAudit({ userId: req.userId, action: "reorder", entity: "faq" });
  const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
  res.json(faqs);
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
