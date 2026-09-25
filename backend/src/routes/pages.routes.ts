import { Router } from "express";
import { z } from "zod";
import { Page } from "../models/Page.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { resolveMember, type MemberRequest } from "../middleware/member.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const sectionSchema = z.object({
  type: z.string().min(1),
  // Sections saved before member gating existed carry no `access`, so treat a
  // missing value as public rather than rejecting the page.
  access: z.enum(["PUBLIC", "MEMBERS"]).default("PUBLIC"),
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

// Fields a locked section still needs so the public site can draw its overlay.
// Everything else in `data` is withheld.
const LOCKED_PASSTHROUGH = ["lockedTitle", "lockedSubtitle"] as const;

/**
 * Removes the content of members-only sections for visitors who are not signed
 * in to the investor dashboard.
 *
 * This is the gate. The public site also blurs these sections, but that is
 * presentation -- what actually keeps fund terms private is that they are never
 * written into this response.
 */
const applyMemberAccess = (page: any, isMember: boolean) => {
  const plain = typeof page?.toObject === "function" ? page.toObject() : page;
  if (!Array.isArray(plain?.sections)) return plain;

  return {
    ...plain,
    sections: plain.sections.map((section: any) => {
      if (section?.access !== "MEMBERS" || isMember) return section;

      const data: Record<string, unknown> = {};
      for (const key of LOCKED_PASSTHROUGH) {
        if (section?.data?.[key] !== undefined) data[key] = section.data[key];
      }

      return { ...section, data, _locked: true };
    }),
  };
};

const normalizeSlug = (slug: string) => {
  const trimmed = slug.trim().toLowerCase();
  if (trimmed === "/" || trimmed === "root") return "home";
  return trimmed.replace(/^\/+/, "");
};

publicRouter.use(resolveMember);

publicRouter.get("/", async (req: MemberRequest, res) => {
  const status = req.query.status === "published" ? "published" : undefined;
  const filter = status ? { status } : { status: "published" };
  const pages = await Page.find(filter).sort({ updatedAt: -1 });
  res.json(pages.map((page) => applyMemberAccess(page, Boolean(req.member))));
});

publicRouter.get("/slug/:slug", async (req: MemberRequest, res) => {
  const rawSlug = req.params.slug;
  const normalized = normalizeSlug(rawSlug);
  const candidates = normalized === "home" ? ["/", "home"] : [normalized];
  // Exact slug match wins; otherwise fall back to old slugs (aliases) so
  // renamed pages keep working — the frontend redirects to the current slug.
  let page = await Page.findOne({ slug: { $in: candidates }, status: "published" });
  if (!page) {
    page = await Page.findOne({ aliases: { $in: candidates }, status: "published" });
  }
  if (!page) return res.status(404).json({ message: "Page not found" });
  return res.json(applyMemberAccess(page, Boolean(req.member)));
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const pages = await Page.find().sort({ updatedAt: -1 });
  res.json(pages);
});

adminRouter.post("/", validate(pageSchema), async (req: AuthRequest, res) => {
  const payload = { ...req.body, slug: normalizeSlug(req.body.slug) };
  const conflict = await Page.findOne({ slug: payload.slug });
  if (conflict) {
    return res.status(409).json({ message: `Slug "${payload.slug}" is already used by "${conflict.title}".` });
  }
  const page = await Page.create(payload);
  await logAudit({ userId: req.userId, action: "create", entity: "page", entityId: page.id });
  res.status(201).json(page);
});

adminRouter.patch("/:id", validate(pageSchema.partial()), async (req: AuthRequest, res) => {
  const existing = await Page.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Page not found" });
  const payload: Record<string, unknown> = req.body.slug
    ? { ...req.body, slug: normalizeSlug(req.body.slug) }
    : { ...req.body };
  const nextSlug = payload.slug as string | undefined;
  if (nextSlug && nextSlug !== existing.slug) {
    const conflict = await Page.findOne({ _id: { $ne: existing._id }, slug: nextSlug });
    if (conflict) {
      return res.status(409).json({ message: `Slug "${nextSlug}" is already used by "${conflict.title}".` });
    }
    // Remember the old slug so existing links redirect to the new one
    const aliases = new Set(existing.aliases || []);
    aliases.add(existing.slug);
    aliases.delete(nextSlug);
    payload.aliases = [...aliases];
  }
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
