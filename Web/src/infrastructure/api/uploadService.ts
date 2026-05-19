import { networkService } from './NetworkService';
import type { NetworkResponse } from './NetworkService';

export interface Upload {
  id: number;
  uploader_id: number;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  entity_type: string | null;
  entity_id: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  data: Upload | Upload[];
  message: string;
  errors?: { file: string; error: string }[];
}

export class UploadService {
  private baseUrl = '/uploads';

  async uploadFile(file: File, entityType?: string, entityId?: number): Promise<Upload> {
    const formData = new FormData();
    formData.append('file', file);
    if (entityType) formData.append('entity_type', entityType);
    if (entityId) formData.append('entity_id', entityId.toString());

    const response: NetworkResponse<UploadResponse> = await networkService.post(this.baseUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data as Upload;
  }

  async uploadMultiple(files: File[], entityType?: string, entityId?: number): Promise<Upload[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (entityType) formData.append('entity_type', entityType);
    if (entityId) formData.append('entity_id', entityId.toString());

    const response: NetworkResponse<UploadResponse> = await networkService.post(`${this.baseUrl}/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  async deleteUpload(id: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting upload:', error);
      return false;
    }
  }

  async updateAvatar(userId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response: NetworkResponse<{ data: { avatar: string }; message: string }> = await networkService.patch(
      `${this.baseUrl}/users/${userId}/avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data.avatar;
  }

  getFullUrl(relativePath: string): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseURL}${relativePath}`;
  }
}

export const uploadService = new UploadService();
