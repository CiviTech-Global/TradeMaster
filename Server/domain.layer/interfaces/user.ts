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
  consent_given: boolean;
  consent_given_at: Date | null;
  privacy_policy_version: string | null;
  terms_version: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export default IUser;
