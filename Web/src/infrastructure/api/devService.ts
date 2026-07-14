import { networkService } from './NetworkService';

export const devService = {
  async seedDemoData(): Promise<{ message: string }> {
    const response = await networkService.post<{ message: string }>('/dev/seed');
    return response.data;
  },
};
