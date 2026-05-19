import { Response } from "express";
import {
  validateFile,
  generateFilename,
  createUploadRecord,
  deleteUploadQuery,
  ensureUploadsDir,
} from "../../infrastructure.layer/utils/upload.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { User } from "../../domain.layer/models/user";
import path from "path";
import fs from "fs";

export async function uploadSingle(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const validationError = validateFile(req.file);
    if (validationError) {
      // Remove the uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: validationError });
    }

    const { entity_type, entity_id } = req.body;

    const upload = await createUploadRecord({
      uploader_id: req.user!.id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      entity_type: entity_type || null,
      entity_id: entity_id ? parseInt(entity_id, 10) : null,
    });

    res.status(201).json({ data: upload, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
}

export async function uploadMultiple(req: AuthenticatedRequest, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const { entity_type, entity_id } = req.body;
    const uploads = [];
    const errors = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        errors.push({ file: file.originalname, error: validationError });
        continue;
      }

      const upload = await createUploadRecord({
        uploader_id: req.user!.id,
        filename: file.filename,
        original_name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        entity_type: entity_type || null,
        entity_id: entity_id ? parseInt(entity_id, 10) : null,
      });

      uploads.push(upload);
    }

    res.status(201).json({
      data: uploads,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploads.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
}

export async function deleteUpload(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const uploadId = parseInt(id, 10);

    if (isNaN(uploadId)) {
      return res.status(400).json({ error: "Invalid upload ID" });
    }

    const upload = await deleteUploadQuery(uploadId, req.user!.id);
    if (!upload) {
      return res.status(404).json({ error: "Upload not found or unauthorized" });
    }

    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({ error: "Failed to delete upload" });
  }
}

export async function updateAvatar(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (userId !== req.user!.id) {
      return res.status(403).json({ error: "You can only update your own avatar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const validationError = validateFile(req.file);
    if (validationError) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: validationError });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Delete old avatar file if it exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await user.update({ avatar: avatarUrl });

    // Create upload record
    await createUploadRecord({
      uploader_id: req.user!.id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: avatarUrl,
      entity_type: 'user',
      entity_id: userId,
    });

    res.json({ data: { avatar: avatarUrl }, message: "Avatar updated successfully" });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
}

export async function getPublicProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstname', 'lastname', 'avatar', 'bio', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: user, message: "Public profile retrieved successfully" });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ error: "Failed to get public profile" });
  }
}
