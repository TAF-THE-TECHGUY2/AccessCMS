import { Router } from "express";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { Media } from "../models/Media.js";
import { uploadFile, deleteFile } from "../utils/storage.js";
import { invalidateUploadAccess } from "../middleware/protectedUploads.js";
import { env } from "../config/env.js";

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

router.patch("/:id/access", async (req, res) => {
  const access = req.body?.access;
  if (access !== "PUBLIC" && access !== "MEMBERS") {
    return res.status(400).json({ message: 'access must be "PUBLIC" or "MEMBERS"' });
  }

  // On S3 the file is served straight from the bucket and never passes through
  // this API, so marking it members-only here would protect nothing. Say so
  // rather than hand back a false sense of security.
  if (access === "MEMBERS" && env.storageDriver === "s3") {
    return res.status(409).json({
      message:
        "Members-only files require STORAGE_DRIVER=local. On S3 the file is served directly by the bucket and cannot be gated by this API.",
    });
  }

  const media = await Media.findByIdAndUpdate(
    req.params.id,
    { access },
    { new: true }
  );
  if (!media) return res.status(404).json({ message: "Media not found" });

  invalidateUploadAccess(media.key);
  res.json(media);
});

router.delete("/:id", async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return res.status(404).json({ message: "Media not found" });
  await deleteFile(media.key);
  invalidateUploadAccess(media.key);
  res.json({ message: "Media deleted" });
});

export default router;
