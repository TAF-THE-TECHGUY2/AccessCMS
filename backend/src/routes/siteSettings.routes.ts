import { Router } from "express";
import { z } from "zod";
import { SiteSettings } from "../models/SiteSettings.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const settingsSchema = z.object({
  siteName: z.string().min(1),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().optional(),
  navLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  footer: z
    .object({
      address: z.string().optional(),
      phones: z.array(z.string()).optional(),
      emails: z.array(z.string()).optional(),
      socialLinks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
      quickLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      ctaLine: z.string().optional(),
    })
    .optional(),
  defaultSeo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
  analytics: z
    .object({
      gaId: z.string().optional(),
      gtmId: z.string().optional(),
    })
    .optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get("/", async (_req, res) => {
  const settings = await SiteSettings.findOne();
  if (!settings) return res.json(null);
  res.json(settings);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.patch("/", validate(settingsSchema.partial()), async (req: AuthRequest, res) => {
  const settings = await SiteSettings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
  });
  await logAudit({ userId: req.userId, action: "update", entity: "siteSettings" });
  res.json(settings);
});
