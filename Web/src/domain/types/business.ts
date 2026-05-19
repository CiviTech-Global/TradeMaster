export interface Business {
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
  category?: {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateBusinessRequest {
  owner: number;
  title: string;
  longitude: number;
  latitude: number;
  address: string;
  emails: string[];
  phones: string[];
  is_active?: boolean;
  logo?: string;
  description?: string;
  category_id?: number;
  cover_image?: string;
}

export interface UpdateBusinessRequest {
  title?: string;
  longitude?: number;
  latitude?: number;
  address?: string;
  emails?: string[];
  phones?: string[];
  is_active?: boolean;
  logo?: string;
  description?: string;
  category_id?: number;
  cover_image?: string;
}

export interface BusinessResponse {
  data: Business | Business[];
  message: string;
}

export interface BusinessFormData {
  title: string;
  longitude: number;
  latitude: number;
  address: string;
  emails: string[];
  phones: string[];
  is_active: boolean;
  logo: string;
  description: string;
  category_id: number | null;
  cover_image: string;
}
