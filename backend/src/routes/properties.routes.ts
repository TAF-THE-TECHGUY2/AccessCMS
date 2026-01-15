import { Router } from "express";
import { z } from "zod";
import { Property } from "../models/Property.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const imageSchema = z.object({
  url: z.string().min(1),
  key: z.string().optional(),
  caption: z.string().optional(),
  alt: z.string().optional(),
  order: z.number().optional(),
});

const propertySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  type: z.string().min(1),
  beds: z.number().optional(),
  baths: z.number().optional(),
  parking: z.string().optional(),
  sqft: z.number().optional(),
  lotSqft: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(["coming_soon", "active", "sold"]).optional(),
  featured: z.boolean().optional(),
  highlights: z.array(z.string()).optional(),
  facts: z.array(z.string()).optional(),
  galleries: z
    .object({
      beforeImages: z.array(imageSchema).optional(),
      duringImages: z.array(imageSchema).optional(),
      afterImages: z.array(imageSchema).optional(),
    })
    .optional(),
});

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.get("/", async (_req, res) => {
  const properties = await Property.find({ status: { $in: ["active", "coming_soon"] } }).sort({
    createdAt: -1,
  });
  res.json(properties);
});

publicRouter.get("/slug/:slug", async (req, res) => {
  const property = await Property.findOne({ slug: req.params.slug });
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json(property);
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (_req, res) => {
  const properties = await Property.find().sort({ updatedAt: -1 });
  res.json(properties);
});

adminRouter.post("/", validate(propertySchema), async (req: AuthRequest, res) => {
  const property = await Property.create(req.body);
  await logAudit({ userId: req.userId, action: "create", entity: "property", entityId: property.id });
  res.status(201).json(property);
});

adminRouter.patch("/:id", validate(propertySchema.partial()), async (req: AuthRequest, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!property) return res.status(404).json({ message: "Property not found" });
  await logAudit({ userId: req.userId, action: "update", entity: "property", entityId: property.id });
  res.json(property);
});

adminRouter.delete("/:id", async (req: AuthRequest, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  await logAudit({ userId: req.userId, action: "delete", entity: "property", entityId: property.id });
  res.json({ message: "Property deleted" });
});
