import { Router } from "express";
import { z } from "zod";
import { Page } from "../models/Page.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const sectionSchema = z.object({
  type: z.string().min(1),
  data: z.record(z.any()).default({}),
});

const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
  sections: z.array(sectionSchema).default([]),
  status: z.enum(["draft", "published"]).optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

const normalizeSlug = (slug: string) => {
  const trimmed = slug.trim();
  if (trimmed === "/" || trimmed === "root") return "home";
  return trimmed;
};

publicRouter.get("/", async (req, res) => {
  const status = req.query.status === "published" ? "published" : undefined;
  const filter = status ? { status } : { status: "published" };
  const pages = await Page.find(filter).sort({ updatedAt: -1 });
  res.json(pages);
});

publicRouter.get("/slug/:slug", async (req, res) => {
  const rawSlug = req.params.slug;
  const normalized = normalizeSlug(rawSlug);
  const candidates = normalized === "home" ? ["/", "home"] : [normalized];
  const page = await Page.findOne({ slug: { $in: candidates }, status: "published" });
  if (!page) return res.status(404).json({ message: "Page not found" });
  return res.json(page);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const pages = await Page.find().sort({ updatedAt: -1 });
  res.json(pages);
});

adminRouter.post("/", validate(pageSchema), async (req: AuthRequest, res) => {
  const payload = { ...req.body, slug: normalizeSlug(req.body.slug) };
  const page = await Page.create(payload);
  await logAudit({ userId: req.userId, action: "create", entity: "page", entityId: page.id });
  res.status(201).json(page);
});

adminRouter.patch("/:id", validate(pageSchema.partial()), async (req: AuthRequest, res) => {
  const payload = req.body.slug ? { ...req.body, slug: normalizeSlug(req.body.slug) } : req.body;
  const page = await Page.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!page) return res.status(404).json({ message: "Page not found" });
  await logAudit({ userId: req.userId, action: "update", entity: "page", entityId: page.id });
  res.json(page);
});

adminRouter.delete("/:id", async (req: AuthRequest, res) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) return res.status(404).json({ message: "Page not found" });
  await logAudit({ userId: req.userId, action: "delete", entity: "page", entityId: page.id });
  res.json({ message: "Page deleted" });
});

adminRouter.post("/:id/publish", async (req: AuthRequest, res) => {
  const page = await Page.findByIdAndUpdate(
    req.params.id,
    { status: "published", publishedAt: new Date() },
    { new: true }
  );
  if (!page) return res.status(404).json({ message: "Page not found" });
  await logAudit({ userId: req.userId, action: "publish", entity: "page", entityId: page.id });
  res.json(page);
});
