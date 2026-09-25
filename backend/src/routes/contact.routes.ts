import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { ContactMessage } from "../models/ContactMessage.js";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../utils/audit.js";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("A valid email is required").max(320),
  subject: z.string().trim().min(1, "Subject is required").max(300),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  topic: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

const statusSchema = z.object({
  status: z.enum(["new", "read", "archived"]),
});

export const publicRouter = Router();
export const adminRouter = Router();

// Throttle public submissions to blunt spam/abuse: 5 per 10 minutes per IP.
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages sent. Please try again later." },
});

publicRouter.post("/", submitLimiter, validate(contactSchema), async (req, res) => {
  const { name, email, subject, phone, topic, message } = req.body as z.infer<
    typeof contactSchema
  >;

  await ContactMessage.create({
    name,
    email,
    subject,
    phone: phone || undefined,
    topic: topic || undefined,
    message,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(201).json({ message: "Message sent successfully." });
});

adminRouter.use(requireAuth, requireRole(["admin", "editor"]));

adminRouter.get("/", async (req, res) => {
  const { status } = req.query as { status?: string };
  const filter =
    status && ["new", "read", "archived"].includes(status) ? { status } : {};
  const [messages, unread] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).limit(500),
    ContactMessage.countDocuments({ status: "new" }),
  ]);
  res.json({ messages, unread });
});

adminRouter.get("/:id", async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ message: "Message not found" });
  res.json(message);
});

adminRouter.patch("/:id", validate(statusSchema), async (req: AuthRequest, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!message) return res.status(404).json({ message: "Message not found" });
  await logAudit({
    userId: req.userId,
    action: "update",
    entity: "contactMessage",
    entityId: message.id,
    metadata: { status: req.body.status },
  });
  res.json(message);
});

adminRouter.delete("/:id", async (req: AuthRequest, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ message: "Message not found" });
  await logAudit({
    userId: req.userId,
    action: "delete",
    entity: "contactMessage",
    entityId: message.id,
  });
  res.json({ message: "Message deleted" });
});
