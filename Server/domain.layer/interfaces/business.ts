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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IBusiness;