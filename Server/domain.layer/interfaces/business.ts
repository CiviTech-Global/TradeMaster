interface IBusiness {
  id: number;
  owner: number;
  title: string;
  longitude: number;
  latitude: number;
  address: string;
  emails: string[];
  phones: string[];
  is_active: boolean;
  logo: string;
  description: string | null;
  category_id: number | null;
  cover_image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IBusiness;
