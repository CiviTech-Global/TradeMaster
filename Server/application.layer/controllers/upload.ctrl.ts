import { Response, NextFunction } from "express";
import { InternalError } from "../../infrastructure.layer/errors/app-error";
import {
  validateFile,
  generateFilename,
  createUploadRecord,
  deleteUploadQuery,
  ensureUploadsDir,
  stripImageMetadata,
} from "../../infrastructure.layer/utils/upload.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { User } from "../../domain.layer/models/user";
import { logger } from "../../infrastructure.layer/utils/logger.util";
import { recordSuccess } from "../../application.layer/services/audit.service";
import path from "path";
import fs from "fs";

export async function uploadSingle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

    try {
      await stripImageMetadata(req.file.path, req.file.mimetype);
    } catch (error) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Failed to process uploaded image" });
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

    recordSuccess(
      {
        actorId: req.user!.id,
        action: "upload:created",
        resource: "upload",
        resourceId: upload.id,
        metadata: { filename: upload.filename, entityType: upload.entity_type },
      },
      req
    );

    res.status(201).json({ data: upload, message: "File uploaded successfully" });
  } catch (error) {
    logger.error("UPLOAD", "Error uploading file", error);
    next(new InternalError("Failed to upload file"));
  }
}

export async function uploadMultiple(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

      try {
        await stripImageMetadata(file.path, file.mimetype);
      } catch (error) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        errors.push({ file: file.originalname, error: "Failed to process uploaded image" });
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
    logger.error("UPLOAD", "Error uploading files", error);
    next(new InternalError("Failed to upload files"));
  }
}

export async function deleteUpload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

    recordSuccess(
      { actorId: req.user!.id, action: "upload:deleted", resource: "upload", resourceId: uploadId },
      req
    );

    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    logger.error("UPLOAD", "Error deleting upload", error);
    next(new InternalError("Failed to delete upload"));
  }
}

export async function updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

    try {
      await stripImageMetadata(req.file.path, req.file.mimetype);
    } catch (error) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: "Failed to process uploaded image" });
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
    logger.error("UPLOAD", "Error updating avatar", error);
    next(new InternalError("Failed to update avatar"));
  }
}

export async function getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
    logger.error("UPLOAD", "Error fetching public profile", error);
    next(new InternalError("Failed to get public profile"));
  }
}
