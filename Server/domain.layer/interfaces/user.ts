interface IUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  default_latitude: number | null;
  default_longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IUser;
