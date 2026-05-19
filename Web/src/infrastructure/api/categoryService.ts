import { networkService } from './NetworkService';
import type { Category, CategoryResponse } from '../../domain/types/category';
import type { NetworkResponse } from './NetworkService';

export class CategoryService {
  private baseUrl = '/categories';

  async getAllCategories(parentId?: number): Promise<Category[]> {
    const params = parentId !== undefined ? `?parent_id=${parentId}` : '';
    const response: NetworkResponse<CategoryResponse> = await networkService.get(`${this.baseUrl}${params}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const response: NetworkResponse<CategoryResponse> = await networkService.get(`${this.baseUrl}/${id}`);
      return response.data.data as Category;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response: NetworkResponse<CategoryResponse> = await networkService.post(this.baseUrl, data);
    return response.data.data as Category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response: NetworkResponse<CategoryResponse> = await networkService.patch(`${this.baseUrl}/${id}`, data);
    return response.data.data as Category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await networkService.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
}

export const categoryService = new CategoryService();
