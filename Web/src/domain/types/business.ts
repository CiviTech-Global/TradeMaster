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
}