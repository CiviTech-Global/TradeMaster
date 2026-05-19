interface IUpload {
  id: number;
  uploader_id: number;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  entity_type: string | null;
  entity_id: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export default IUpload;
