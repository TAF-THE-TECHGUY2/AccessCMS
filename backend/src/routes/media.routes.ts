import { Router } from "express";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { Media } from "../models/Media.js";
import { uploadFile, deleteFile } from "../utils/storage.js";

const router = Router();

router.use(requireAuth, requireRole(["admin", "editor"]));

router.post("/upload", upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ message: "File required" });
  const { url, key } = await uploadFile(req.file);
  const media = await Media.create({
    url,
    key,
    mime: req.file.mimetype,
    size: req.file.size,
    createdBy: req.userId,
  });
  res.status(201).json(media);
});

router.get("/", async (_req, res) => {
  const items = await Media.find().sort({ createdAt: -1 });
  res.json(items);
});

router.delete("/:id", async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return res.status(404).json({ message: "Media not found" });
  await deleteFile(media.key);
  res.json({ message: "Media deleted" });
});

export default router;
