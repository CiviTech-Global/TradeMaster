import { TMAxios, httpService, createHttpService } from './TMAxios';
import type {
  TMAxiosConfig,
  TMRequestConfig,
  HTTPMethod,
  AxiosResponse,
  AxiosError,
} from './TMAxios';

/**
 * Network request options for enhanced flexibility
 */
export interface NetworkRequestOptions extends TMRequestConfig {
  /** Transform response data before returning */
  transformResponse?: <T>(data: any) => T;
  /** Transform request data before sending */
  transformRequest?: (data: any) => any;
  /** Include response headers in the result */
  includeHeaders?: boolean;
  /** Include full response object instead of just data */
  includeFullResponse?: boolean;
  /** Custom validation for response data */
  validateResponse?: (data: any) => boolean;
  /** Enable/disable caching for this request */
  cache?: boolean;
}

/**
 * Network response interface with optional metadata
 */
export interface NetworkResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  duration?: number;
  success: boolean;
}

/**
 * Batch request configuration
 */
export interface BatchRequestConfig {
  method: HTTPMethod;
  url: string;
  data?: any;
  options?: NetworkRequestOptions;
}

/**
 * Batch response result
 */
export interface BatchResponse<T = any> {
  results: Array<NetworkResponse<T> | Error>;
  allSucceeded: boolean;
  successCount: number;
  errorCount: number;
}

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * NetworkService - A high-level HTTP service built on top of TMAxios
 *
 * Features:
 * - Simplified API for all HTTP methods
 * - Flexible request/response transformation
 * - Type-safe operations with generics
 * - Batch request support
 * - File upload with progress tracking
 * - Response validation and error handling
 * - Authentication management
 * - Request caching capabilities
 *
 * Usage:
 * ```typescript
 * const networkService = new NetworkService();
 *
 * // Simple GET request
 * const users = await networkService.get<User[]>('/api/users');
 *
 * // POST with custom options
 * const result = await networkService.post('/api/users', userData, {
 *   validateResponse: (data) => data.success === true
 * });
 * ```
 */
export class NetworkService {
  private httpClient: TMAxios;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Creates a new NetworkService instance
   * @param config - Optional TMAxios configuration
   */
  constructor(config?: TMAxiosConfig) {
    this.httpClient = config ? createHttpService(config) : httpService;
  }

  /**
   * Performs a GET request with enhanced options
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(
    url: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    // Check cache first if enabled
    if (options.cache !== false) {
      const cached = this.getCachedResponse<T>(url);
      if (cached) return cached;
    }

    const response = await this.executeRequest<T>('GET', url, undefined, options);

    // Cache the response if successful
    if (response.success && options.cache !== false) {
      this.cacheResponse(url, response);
    }

    return response;
  }

  /**
   * Performs a POST request with enhanced options
   * @param url - Request URL
   * @param data - Request payload
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(
    url: string,
    data?: any,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    // Transform request data if transformer provided
    const transformedData = options.transformRequest ? options.transformRequest(data) : data;
    return this.executeRequest<T>('POST', url, transformedData, options);
  }

  /**
   * Performs a PUT request with enhanced options
   * @param url - Request URL
   * @param data - Request payload
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async put<T = any>(
    url: string,
    data?: any,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const transformedData = options.transformRequest ? options.transformRequest(data) : data;
    return this.executeRequest<T>('PUT', url, transformedData, options);
  }

  /**
   * Performs a PATCH request with enhanced options
   * @param url - Request URL
   * @param data - Request payload
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const transformedData = options.transformRequest ? options.transformRequest(data) : data;
    return this.executeRequest<T>('PATCH', url, transformedData, options);
  }

  /**
   * Performs a DELETE request with enhanced options
   * @param url - Request URL
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async delete<T = any>(
    url: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    return this.executeRequest<T>('DELETE', url, undefined, options);
  }

  /**
   * Executes multiple requests in parallel
   * @param requests - Array of batch request configurations
   * @returns Promise resolving to batch response results
   */
  public async batchRequests<T = any>(
    requests: BatchRequestConfig[]
  ): Promise<BatchResponse<T>> {
    const promises = requests.map(async (request) => {
      try {
        return await this.executeRequest<T>(
          request.method,
          request.url,
          request.data,
          request.options || {}
        );
      } catch (error) {
        return error as Error;
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(result => !(result instanceof Error)).length;
    const errorCount = results.length - successCount;

    return {
      results,
      allSucceeded: errorCount === 0,
      successCount,
      errorCount,
    };
  }

  /**
   * Uploads a file with progress tracking
   * @param url - Upload endpoint URL
   * @param file - File to upload
   * @param options - Upload options
   * @param onProgress - Progress callback function
   * @returns Promise resolving to the upload response
   */
  public async uploadFile<T = any>(
    url: string,
    file: File | Blob,
    options: NetworkRequestOptions & {
      fieldName?: string;
      additionalData?: Record<string, string | number>;
    } = {},
    onProgress?: UploadProgressCallback
  ): Promise<NetworkResponse<T>> {
    const { fieldName = 'file', additionalData, ...requestOptions } = options;

    // Add progress tracking if callback provided
    if (onProgress) {
      requestOptions.onUploadProgress = (progressEvent) => {
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
        url,
        file,
        fieldName,
        additionalData,
        requestOptions
      );

      return this.processResponse<T>(axiosResponse, options);
    } catch (error) {
      throw this.processError(error as AxiosError);
    }
  }

  /**
   * Downloads a file from the server
   * @param url - File URL
   * @param filename - Optional filename for download
   * @param options - Request options
   * @returns Promise resolving to the file response
   */
  public async downloadFile(
    url: string,
    filename?: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<Blob>> {
    try {
      const axiosResponse = await this.httpClient.downloadFile(url, filename, options);
      return this.processResponse<Blob>(axiosResponse, options);
    } catch (error) {
      throw this.processError(error as AxiosError);
    }
  }

  /**
   * Sets the authentication token for all requests
   * @param token - Authentication token
   * @param tokenType - Token type (default: 'Bearer')
   */
  public setAuthToken(token: string, tokenType: string = 'Bearer'): void {
    this.httpClient.setAuthToken(token, tokenType);
  }

  /**
   * Clears the authentication token
   */
  public clearAuthToken(): void {
    this.httpClient.clearAuthToken();
  }

  /**
   * Updates the base URL for all requests
   * @param baseURL - New base URL
   */
  public setBaseURL(baseURL: string): void {
    this.httpClient.setBaseURL(baseURL);
  }

  /**
   * Sets default headers for all requests
   * @param headers - Default headers
   */
  public setDefaultHeaders(headers: Record<string, string>): void {
    this.httpClient.setDefaultHeaders(headers);
  }

  /**
   * Enables or disables request logging
   * @param enabled - Whether to enable logging
   */
  public setLogging(enabled: boolean): void {
    this.httpClient.setLogging(enabled);
  }

  /**
   * Clears the request cache
   */
  public clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Sets the cache timeout duration
   * @param timeout - Cache timeout in milliseconds
   */
  public setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }

  /**
   * Creates a new NetworkService instance with different configuration
   * @param config - TMAxios configuration
   * @returns New NetworkService instance
   */
  public createInstance(config: TMAxiosConfig): NetworkService {
    return new NetworkService(config);
  }

  /**
   * Gets the underlying TMAxios instance
   * @returns TMAxios instance
   */
  public getHttpClient(): TMAxios {
    return this.httpClient;
  }

  /**
   * Executes an HTTP request with the specified method
   * @private
   */
  private async executeRequest<T>(
    method: HTTPMethod,
    url: string,
    data?: any,
    options: NetworkRequestOptions = {}
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

      const response = this.processResponse<T>(axiosResponse, options);
      response.duration = Date.now() - startTime;

      // Validate response if validator provided
      if (options.validateResponse && !options.validateResponse(response.data)) {
        throw new Error('Response validation failed');
      }

      return response;
    } catch (error) {
      const processedError = this.processError(error as AxiosError);
      processedError.duration = Date.now() - startTime;
      throw processedError;
    }
  }

  /**
   * Processes an Axios response into a NetworkResponse
   * @private
   */
  private processResponse<T>(
    axiosResponse: AxiosResponse<T>,
    options: NetworkRequestOptions
  ): NetworkResponse<T> {
    let responseData = axiosResponse.data;

    // Transform response data if transformer provided
    if (options.transformResponse) {
      responseData = options.transformResponse(responseData);
    }

    const response: NetworkResponse<T> = {
      data: responseData,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      success: axiosResponse.status >= 200 && axiosResponse.status < 300,
    };

    // Include headers if requested
    if (options.includeHeaders) {
      response.headers = axiosResponse.headers as Record<string, string>;
    }

    return response;
  }

  /**
   * Processes and enhances errors
   * @private
   */
  private processError(error: AxiosError): Error & { duration?: number } {
    const enhancedError = new Error(error.message);

    // Copy relevant properties from the original error
    if (error.response) {
      Object.assign(enhancedError, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    Object.assign(enhancedError, {
      code: error.code,
      config: error.config,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
    });

    return enhancedError as Error & { duration?: number };
  }

  /**
   * Retrieves cached response if available and not expired
   * @private
   */
  private getCachedResponse<T>(url: string): NetworkResponse<T> | null {
    const cached = this.requestCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.requestCache.delete(url);
    }
    return null;
  }

  /**
   * Caches a response for future use
   * @private
   */
  private cacheResponse<T>(url: string, response: NetworkResponse<T>): void {
    this.requestCache.set(url, {
      data: response,
      timestamp: Date.now(),
    });
  }
}

/**
 * Default NetworkService instance for immediate use
 */
export const networkService = new NetworkService();

/**
 * Utility function to create a configured NetworkService instance
 * @param config - TMAxios configuration
 * @returns Configured NetworkService instance
 */
export const createNetworkService = (config: TMAxiosConfig): NetworkService => {
  return new NetworkService(config);
};

/**
 * Convenience functions for direct HTTP requests using the default instance
 */

/**
 * Performs a GET request using the default NetworkService instance
 */
export const get = <T = any>(
  url: string,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<T>> => {
  return networkService.get<T>(url, options);
};

/**
 * Performs a POST request using the default NetworkService instance
 */
export const post = <T = any>(
  url: string,
  data?: any,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<T>> => {
  return networkService.post<T>(url, data, options);
};

/**
 * Performs a PUT request using the default NetworkService instance
 */
export const put = <T = any>(
  url: string,
  data?: any,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<T>> => {
  return networkService.put<T>(url, data, options);
};

/**
 * Performs a PATCH request using the default NetworkService instance
 */
export const patch = <T = any>(
  url: string,
  data?: any,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<T>> => {
  return networkService.patch<T>(url, data, options);
};

/**
 * Performs a DELETE request using the default NetworkService instance
 */
export const del = <T = any>(
  url: string,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<T>> => {
  return networkService.delete<T>(url, options);
};

/**
 * Uploads a file using the default NetworkService instance
 */
export const uploadFile = <T = any>(
  url: string,
  file: File | Blob,
  options?: NetworkRequestOptions & {
    fieldName?: string;
    additionalData?: Record<string, string | number>;
  },
  onProgress?: UploadProgressCallback
): Promise<NetworkResponse<T>> => {
  return networkService.uploadFile<T>(url, file, options, onProgress);
};

/**
 * Downloads a file using the default NetworkService instance
 */
export const downloadFile = (
  url: string,
  filename?: string,
  options?: NetworkRequestOptions
): Promise<NetworkResponse<Blob>> => {
  return networkService.downloadFile(url, filename, options);
};

/**
 * Executes multiple requests in parallel using the default NetworkService instance
 */
export const batchRequests = <T = any>(
  requests: BatchRequestConfig[]
): Promise<BatchResponse<T>> => {
  return networkService.batchRequests<T>(requests);
};