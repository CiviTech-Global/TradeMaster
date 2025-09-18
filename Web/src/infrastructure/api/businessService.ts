import { networkService } from './NetworkService';
import type {
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  BusinessResponse
} from '../../domain/types/business';
import type { NetworkResponse } from './NetworkService';

/**
 * Business API Service
 * Handles all business-related API operations
 */
export class BusinessService {
  private baseUrl = '/businesses';

  /**
   * Get all businesses
   */
  async getAllBusinesses(): Promise<Business[]> {
    const response: NetworkResponse<BusinessResponse> = await networkService.get(this.baseUrl);
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  /**
   * Get active businesses only
   */
  async getActiveBusinesses(): Promise<Business[]> {
    const response: NetworkResponse<BusinessResponse> = await networkService.get(`${this.baseUrl}/active`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  /**
   * Get business by ID
   */
  async getBusinessById(id: number): Promise<Business | null> {
    try {
      const response: NetworkResponse<BusinessResponse> = await networkService.get(`${this.baseUrl}/${id}`);
      return response.data.data as Business;
    } catch (error) {
      console.error('Error fetching business:', error);
      return null;
    }
  }

  /**
   * Get businesses by owner ID
   */
  async getBusinessesByOwner(ownerId: number): Promise<Business[]> {
    const response: NetworkResponse<BusinessResponse> = await networkService.get(`${this.baseUrl}/owner/${ownerId}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  /**
   * Create a new business
   */
  async createBusiness(businessData: CreateBusinessRequest): Promise<Business> {
    const response: NetworkResponse<BusinessResponse> = await networkService.post(
      this.baseUrl,
      businessData,
      {
        validateResponse: (data) => data.data && typeof data.data === 'object',
        customErrorMessage: 'Failed to create business. Please check your data and try again.'
      }
    );
    return response.data.data as Business;
  }

  /**
   * Update an existing business
   */
  async updateBusiness(id: number, businessData: UpdateBusinessRequest): Promise<Business> {
    const response: NetworkResponse<BusinessResponse> = await networkService.patch(
      `${this.baseUrl}/${id}`,
      businessData,
      {
        validateResponse: (data) => data.data && typeof data.data === 'object',
        customErrorMessage: 'Failed to update business. Please try again.'
      }
    );
    return response.data.data as Business;
  }

  /**
   * Delete a business
   */
  async deleteBusiness(id: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${id}`, {
        customErrorMessage: 'Failed to delete business. Please try again.'
      });
      return true;
    } catch (error) {
      console.error('Error deleting business:', error);
      return false;
    }
  }

  /**
   * Validate business data before submission
   */
  validateBusinessData(data: Partial<CreateBusinessRequest>): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Business title is required');
    }

    if (!data.address?.trim()) {
      errors.push('Business address is required');
    }

    if (data.longitude === undefined || data.longitude < -180 || data.longitude > 180) {
      errors.push('Valid longitude is required (-180 to 180)');
    }

    if (data.latitude === undefined || data.latitude < -90 || data.latitude > 90) {
      errors.push('Valid latitude is required (-90 to 90)');
    }

    if (!data.emails || !Array.isArray(data.emails) || data.emails.length === 0) {
      errors.push('At least one email address is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = data.emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email format: ${invalidEmails.join(', ')}`);
      }
    }

    if (!data.phones || !Array.isArray(data.phones) || data.phones.length === 0) {
      errors.push('At least one phone number is required');
    } else {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      const invalidPhones = data.phones.filter(phone =>
        !phoneRegex.test(phone.replace(/[\s\-()]/g, ''))
      );
      if (invalidPhones.length > 0) {
        errors.push(`Invalid phone format: ${invalidPhones.join(', ')}`);
      }
    }

    return errors;
  }
}

/**
 * Default business service instance
 */
export const businessService = new BusinessService();