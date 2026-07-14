import { TMAxios, httpService } from './TMAxios';
import type { TMAxiosConfig, AxiosResponse, AxiosError } from './TMAxios';
import { serverUrlConfig } from './serverUrlConfig';

export interface NetworkResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  success: boolean;
  duration?: number;
}

export interface NetworkRequestOptions {
  skipGlobalErrorHandling?: boolean;
  customErrorMessage?: string;
  enableRetry?: boolean;
  onUploadProgress?: (progressEvent: any) => void;
}

export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

export class NetworkService {
  private httpClient: TMAxios;

  constructor(config?: TMAxiosConfig) {
    this.httpClient = config ? new TMAxios(config) : httpService;
  }

  async get<T = any>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('GET', url, undefined, options);
  }

  async post<T = any>(url: string, data?: any, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('POST', url, data, options);
  }

  async put<T = any>(url: string, data?: any, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('PUT', url, data, options);
  }

  async patch<T = any>(url: string, data?: any, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('PATCH', url, data, options);
  }

  async delete<T = any>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('DELETE', url, undefined, options);
  }

  async uploadFile<T = any>(
    url: string,
    file: File | Blob,
    options: NetworkRequestOptions & {
      fieldName?: string;
      additionalData?: Record<string, string | number>;
    } = {},
    onProgress?: UploadProgressCallback
  ): Promise<NetworkResponse<T>> {
    const { fieldName = 'file', additionalData, ...requestOptions } = options;

    if (onProgress) {
      requestOptions.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      };
    }

    try {
      const axiosResponse = await this.httpClient.uploadFile<T>(
        url, file, fieldName, additionalData, requestOptions
      );
      return this.processResponse<T>(axiosResponse);
    } catch (error) {
      throw this.processError(error as AxiosError);
    }
  }

  async downloadFile(url: string, filename?: string, options?: NetworkRequestOptions): Promise<NetworkResponse<Blob>> {
    try {
      const axiosResponse = await this.httpClient.downloadFile(url, filename, options);
      return this.processResponse<Blob>(axiosResponse);
    } catch (error) {
      throw this.processError(error as AxiosError);
    }
  }

  setAuthToken(token: string, tokenType: string = 'Bearer'): void {
    this.httpClient.setAuthToken(token, tokenType);
  }

  clearAuthToken(): void {
    this.httpClient.clearAuthToken();
  }

  setBaseURL(baseURL: string): void {
    this.httpClient.setBaseURL(baseURL);
  }

  setLogging(enabled: boolean): void {
    this.httpClient.setLogging(enabled);
  }

  getHttpClient(): TMAxios {
    return this.httpClient;
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    options?: NetworkRequestOptions
  ): Promise<NetworkResponse<T>> {
    const startTime = Date.now();

    try {
      let axiosResponse: AxiosResponse<T>;

      switch (method) {
        case 'GET':
          axiosResponse = await this.httpClient.get<T>(url, options);
          break;
        case 'POST':
          axiosResponse = await this.httpClient.post<T>(url, data, options);
          break;
        case 'PUT':
          axiosResponse = await this.httpClient.put<T>(url, data, options);
          break;
        case 'PATCH':
          axiosResponse = await this.httpClient.patch<T>(url, data, options);
          break;
        case 'DELETE':
          axiosResponse = await this.httpClient.delete<T>(url, options);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      const response = this.processResponse<T>(axiosResponse);
      response.duration = Date.now() - startTime;
      return response;
    } catch (error) {
      const processedError = this.processError(error as AxiosError);
      processedError.duration = Date.now() - startTime;
      throw processedError;
    }
  }

  private processResponse<T>(axiosResponse: AxiosResponse<T>): NetworkResponse<T> {
    return {
      data: axiosResponse.data,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
    };
  }

  private processError(error: AxiosError): Error & { status?: number; data?: any; duration?: number } {
    const enhancedError = new Error(error.message);

    if (error.response) {
      Object.assign(enhancedError, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    return enhancedError as Error & { status?: number; data?: any; duration?: number };
  }
}

export const networkService = new NetworkService({
  baseURL: serverUrlConfig.getUrl(),
});

import { AuthInterceptor } from './authInterceptor';

const authInterceptor = AuthInterceptor.getInstance();
const axiosInstance = networkService.getHttpClient().getAxiosInstance();

axiosInstance.interceptors.request.use(
  authInterceptor.requestInterceptor,
  authInterceptor.requestErrorInterceptor
);

axiosInstance.interceptors.response.use(
  authInterceptor.responseInterceptor,
  authInterceptor.responseErrorInterceptor
);

export const createNetworkService = (config: TMAxiosConfig): NetworkService => {
  return new NetworkService(config);
};
