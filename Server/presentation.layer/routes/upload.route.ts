import express from "express";
import multer from "multer";
import path from "path";
import {
  uploadSingle,
  uploadMultiple,
  deleteUpload,
  updateAvatar,
  getPublicProfile,
} from "../../application.layer/controllers/upload.ctrl";
import { authenticateJWT } from "../../infrastructure.layer/utils/jwt.util";
import { ensureUploadsDir, generateFilename } from "../../infrastructure.layer/utils/upload.util";

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }
  },
});

const router = express.Router();

// Upload routes
router.post("/", authenticateJWT, upload.single('file'), uploadSingle);
router.post("/multiple", authenticateJWT, upload.array('files', 5), uploadMultiple);
router.delete("/:id", authenticateJWT, deleteUpload);

// User profile routes (attached here for convenience)
router.patch("/users/:id/avatar", authenticateJWT, upload.single('avatar'), updateAvatar);
router.get("/users/:id/public", getPublicProfile);

export default router;
