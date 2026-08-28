import { networkService } from '../api/NetworkService';
import type { NetworkResponse, NetworkRequestOptions } from '../api/NetworkService';

export interface IUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IUserCreationRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  consent_given: boolean;
  privacy_policy_version?: string;
  terms_version?: string;
}

export interface IUserUpdateRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ISigninRequest {
  email: string;
  password: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface APIResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class UserRepository {
  private readonly baseUrl = '/users';

  async getAllUsers(options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<IUser[]>>> {
    return await networkService.get<APIResponse<IUser[]>>(`${this.baseUrl}`, options);
  }

  async getUserById(id: number, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<IUser>>> {
    return await networkService.get<APIResponse<IUser>>(`${this.baseUrl}/${id}`, options);
  }

  async createUser(userData: IUserCreationRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<{ user: IUser; accessToken: string; refreshToken: string }>>> {
    return await networkService.post<APIResponse<{ user: IUser; accessToken: string; refreshToken: string }>>(`/auth/signup`, userData, { enableRetry: false, ...options });
  }

  async updateUser(id: number, userData: IUserUpdateRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<IUser>>> {
    return await networkService.patch<APIResponse<IUser>>(`${this.baseUrl}/${id}`, userData, options);
  }

  async changePassword(id: number, passwordData: IChangePasswordRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<void>>> {
    return await networkService.patch<APIResponse<void>>(`${this.baseUrl}/change-password/${id}`, passwordData, options);
  }

  async deleteUser(id: number, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<void>>> {
    return await networkService.delete<APIResponse<void>>(`${this.baseUrl}/${id}`, options);
  }

  async signin(credentials: ISigninRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<{ user: IUser; accessToken: string; refreshToken: string }>>> {
    const response = await networkService.post<APIResponse<{ user: IUser; accessToken: string; refreshToken: string }>>(`/auth/signin`, credentials, { enableRetry: false, ...options });
    return response;
  }

  async forgotPassword(data: IForgotPasswordRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<void>>> {
    return await networkService.post<APIResponse<void>>(`/auth/forgot-password`, data, { enableRetry: false, ...options });
  }

  async resetPassword(data: IResetPasswordRequest, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<void>>> {
    return await networkService.post<APIResponse<void>>(`/auth/reset-password`, data, { enableRetry: false, ...options });
  }

  async refreshToken(refreshToken: string, options?: NetworkRequestOptions): Promise<NetworkResponse<APIResponse<{ accessToken: string; refreshToken: string }>>> {
    return await networkService.post<APIResponse<{ accessToken: string; refreshToken: string }>>(`/auth/refresh-token`, { refreshToken }, { enableRetry: false, ...options });
  }
}

export const userRepository = new UserRepository();

export default userRepository;