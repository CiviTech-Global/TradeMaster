import { Upload } from "../../domain.layer/models/upload";
import IUpload from "../../domain.layer/interfaces/upload";
import { Optional } from "sequelize";
import path from "path";
import fs from "fs";

type UploadCreationAttributes = Optional<IUpload, "id" | "createdAt" | "updatedAt" | "entity_type" | "entity_id">;

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: Express.Multer.File): string | null {
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return `File type '${file.mimetype}' is not allowed. Accepted: JPEG, PNG, WebP, GIF`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 5MB limit`;
  }
  return null;
}

export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}${ext}`;
}

export async function createUploadRecord(data: UploadCreationAttributes) {
  return await Upload.create(data);
}

export async function getUploadByIdQuery(id: number) {
  return await Upload.findByPk(id);
}

export async function getUploadsByEntityQuery(entityType: string, entityId: number) {
  return await Upload.findAll({
    where: { entity_type: entityType, entity_id: entityId },
    order: [['createdAt', 'DESC']],
  });
}

export async function deleteUploadQuery(id: number, uploaderId: number) {
  const upload = await Upload.findOne({ where: { id, uploader_id: uploaderId } });
  if (!upload) return null;

  // Delete file from disk
  const filePath = path.join(process.cwd(), 'uploads', upload.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await upload.destroy();
  return upload;
}

export function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}
