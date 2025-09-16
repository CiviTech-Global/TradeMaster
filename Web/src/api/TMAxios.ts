import axios, { AxiosError } from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Configuration interface for the TMAxios HTTP service
 * Provides flexible options for customizing the HTTP client behavior
 */
export interface TMAxiosConfig {
  /** Base URL for all requests */
  baseURL?: string;
  /** Default timeout for requests in milliseconds */
  timeout?: number;
  /** Default headers to include with all requests */
  headers?: Record<string, string>;
  /** Whether to include credentials (cookies) in requests */
  withCredentials?: boolean;
  /** Custom retry configuration */
  retry?: {
    /** Number of retry attempts (default: 3) */
    attempts?: number;
    /** Delay between retries in milliseconds (default: 1000) */
    delay?: number;
    /** Status codes that should trigger a retry */
    retryCondition?: (error: AxiosError) => boolean;
  };
  /** Enable request/response logging for debugging */
  enableLogging?: boolean;
  /** Custom authentication token */
  authToken?: string;
  /** Token type (Bearer, etc.) */
  tokenType?: string;
}

/**
 * Standard API response interface for consistent response handling
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

/**
 * HTTP method types for type safety
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration interface extending Axios config with custom options
 */
/**
 * Extended InternalAxiosRequestConfig with metadata support
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

/**
 * Request configuration interface extending Axios config with custom options
 */
export interface TMRequestConfig extends AxiosRequestConfig {
  /** Skip global error handling for this request */
  skipGlobalErrorHandling?: boolean;
  /** Custom error message to show on failure */
  customErrorMessage?: string;
  /** Enable/disable retry for this specific request */
  enableRetry?: boolean;
}

/**
 * TMAxios - A comprehensive HTTP service built on top of Axios
 *
 * Features:
 * - Flexible configuration with sensible defaults
 * - Request/Response interceptors for authentication and error handling
 * - Automatic retry mechanism with exponential backoff
 * - Comprehensive error handling and logging
 * - Type-safe request methods
 * - Token-based authentication support
 * - Request/Response transformation
 * - Debugging and monitoring capabilities
 *
 * Usage:
 * ```typescript
 * const httpService = new TMAxios({
 *   baseURL: 'https://api.example.com',
 *   timeout: 5000,
 *   authToken: 'your-jwt-token'
 * });
 *
 * const response = await httpService.get<User[]>('/users');
 * ```
 */
export class TMAxios {
  private instance: AxiosInstance;
  private config: TMAxiosConfig;
  private retryCount: Map<string, number> = new Map();

  /**
   * Creates a new TMAxios instance with the provided configuration
   * @param config - Configuration options for the HTTP service
   */
  constructor(config: TMAxiosConfig = {}) {
    this.config = {
      timeout: 10000,
      withCredentials: false,
      enableLogging: false,
      tokenType: 'Bearer',
      retry: {
        attempts: 3,
        delay: 1000,
        retryCondition: (error: AxiosError) => {
          return !error.response || (error.response.status >= 500 && error.response.status < 600);
        },
      },
      ...config,
    };

    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      withCredentials: this.config.withCredentials,
      headers: this.config.headers,
    });

    this.setupInterceptors();
  }

  /**
   * Sets up request and response interceptors for the Axios instance
   * Handles authentication, logging, error handling, and retry logic
   */
  private setupInterceptors(): void {
    // Request interceptor - handles authentication and request logging
    this.instance.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Add authentication token if available
        if (this.config.authToken && config.headers) {
          config.headers.set(
            'Authorization',
            `${this.config.tokenType} ${this.config.authToken}`
          );
        }

        // Add request timestamp for performance monitoring
        config.metadata = { startTime: Date.now() };

        // Log request details if logging is enabled
        if (this.config.enableLogging) {
          console.group(`🚀 HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('Config:', config);
          console.log('Headers:', config.headers?.toJSON());
          console.groupEnd();
        }

        return config;
      },
      (error: AxiosError) => {
        if (this.config.enableLogging) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor - handles response logging and error processing
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const extendedConfig = response.config as ExtendedAxiosRequestConfig;
        const duration = Date.now() - (extendedConfig.metadata?.startTime || 0);

        // Log response details if logging is enabled
        if (this.config.enableLogging) {
          console.group(`✅ HTTP Response: ${response.status} ${response.config.url}`);
          console.log(`Duration: ${duration}ms`);
          console.log('Data:', response.data);
          console.log('Headers:', response.headers);
          console.groupEnd();
        }

        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handles response errors with retry logic and comprehensive error processing
   * @param error - The Axios error object
   * @returns Promise that resolves with retry attempt or rejects with processed error
   */
  private async handleResponseError(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as TMRequestConfig;
    const requestId = this.generateRequestId(config);

    // Log error details if logging is enabled
    if (this.config.enableLogging) {
      console.group(`❌ HTTP Error: ${error.response?.status || 'Network Error'}`);
      console.log('Error:', error.message);
      console.log('Config:', config);
      if (error.response) {
        console.log('Response Data:', error.response.data);
        console.log('Response Headers:', error.response.headers);
      }
      console.groupEnd();
    }

    // Check if retry is enabled and should be attempted
    if (
      this.config.retry &&
      config?.enableRetry !== false &&
      this.shouldRetry(error, requestId)
    ) {
      return this.retryRequest(config, requestId);
    }

    // Process and enhance the error
    const enhancedError = this.processError(error);
    return Promise.reject(enhancedError);
  }

  /**
   * Determines if a request should be retried based on error conditions
   * @param error - The Axios error object
   * @param requestId - Unique identifier for the request
   * @returns Boolean indicating if retry should be attempted
   */
  private shouldRetry(error: AxiosError, requestId: string): boolean {
    const currentRetryCount = this.retryCount.get(requestId) || 0;
    const maxRetries = this.config.retry?.attempts || 3;
    const retryCondition = this.config.retry?.retryCondition;

    return (
      currentRetryCount < maxRetries &&
      (!retryCondition || retryCondition(error))
    );
  }

  /**
   * Retries a failed request with exponential backoff
   * @param config - Request configuration
   * @param requestId - Unique identifier for the request
   * @returns Promise resolving to the response
   */
  private async retryRequest(
    config: TMRequestConfig,
    requestId: string
  ): Promise<AxiosResponse> {
    const currentRetryCount = this.retryCount.get(requestId) || 0;
    const delay = (this.config.retry?.delay || 1000) * Math.pow(2, currentRetryCount);

    this.retryCount.set(requestId, currentRetryCount + 1);

    if (this.config.enableLogging) {
      console.log(`🔄 Retrying request (attempt ${currentRetryCount + 1}) in ${delay}ms`);
    }

    // Wait for delay before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const response = await this.instance.request(config);
      this.retryCount.delete(requestId);
      return response;
    } catch (retryError) {
      return this.handleResponseError(retryError as AxiosError);
    }
  }

  /**
   * Processes and enhances error objects for better error handling
   * @param error - The original Axios error
   * @returns Enhanced error object with additional context
   */
  private processError(error: AxiosError): AxiosError {
    const config = error.config as TMRequestConfig;

    // Add custom error message if provided
    if (config?.customErrorMessage) {
      error.message = config.customErrorMessage;
    } else if (error.response) {
      // Create meaningful error messages based on status codes
      switch (error.response.status) {
        case 400:
          error.message = 'Bad Request: Please check your request data';
          break;
        case 401:
          error.message = 'Unauthorized: Please log in again';
          break;
        case 403:
          error.message = 'Forbidden: You do not have permission to access this resource';
          break;
        case 404:
          error.message = 'Not Found: The requested resource was not found';
          break;
        case 422:
          error.message = 'Validation Error: Please check your input data';
          break;
        case 429:
          error.message = 'Too Many Requests: Please wait and try again';
          break;
        case 500:
          error.message = 'Internal Server Error: Please try again later';
          break;
        case 502:
          error.message = 'Bad Gateway: Server is temporarily unavailable';
          break;
        case 503:
          error.message = 'Service Unavailable: Server is temporarily down';
          break;
        case 504:
          error.message = 'Gateway Timeout: Request took too long to process';
          break;
        default:
          error.message = `HTTP Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      error.message = 'Network Error: Unable to connect to the server';
    }

    return error;
  }

  /**
   * Generates a unique identifier for a request (used for retry tracking)
   * @param config - Request configuration
   * @returns Unique request identifier
   */
  private generateRequestId(config?: TMRequestConfig): string {
    if (!config) return Math.random().toString(36);
    return `${config.method || 'GET'}-${config.url || ''}-${Date.now()}`;
  }

  /**
   * Updates the authentication token for all subsequent requests
   * @param token - The new authentication token
   * @param tokenType - The token type (default: 'Bearer')
   */
  public setAuthToken(token: string, tokenType: string = 'Bearer'): void {
    this.config.authToken = token;
    this.config.tokenType = tokenType;
  }

  /**
   * Removes the authentication token
   */
  public clearAuthToken(): void {
    this.config.authToken = undefined;
  }

  /**
   * Updates the base URL for all subsequent requests
   * @param baseURL - The new base URL
   */
  public setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.instance.defaults.baseURL = baseURL;
  }

  /**
   * Updates default headers for all subsequent requests
   * @param headers - Headers to merge with existing defaults
   */
  public setDefaultHeaders(headers: Record<string, string>): void {
    this.config.headers = { ...this.config.headers, ...headers };
    Object.assign(this.instance.defaults.headers.common, headers);
  }

  /**
   * Enables or disables request/response logging
   * @param enabled - Whether to enable logging
   */
  public setLogging(enabled: boolean): void {
    this.config.enableLogging = enabled;
  }

  /**
   * Performs a GET request
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(
    url: string,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  /**
   * Performs a POST request
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  /**
   * Performs a PUT request
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  /**
   * Performs a PATCH request
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  /**
   * Performs a DELETE request
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async delete<T = any>(
    url: string,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  /**
   * Performs a generic HTTP request with full control over the configuration
   * @param config - Complete request configuration
   * @returns Promise resolving to the response data
   */
  public async request<T = any>(config: TMRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.request<T>(config);
  }

  /**
   * Downloads a file from the specified URL
   * @param url - File URL
   * @param filename - Optional filename for the download
   * @param config - Optional request configuration
   * @returns Promise resolving to the response with blob data
   */
  public async downloadFile(
    url: string,
    filename?: string,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<Blob>> {
    const response = await this.instance.get<Blob>(url, {
      ...config,
      responseType: 'blob',
    });

    // If filename is provided, trigger browser download
    if (filename && typeof window !== 'undefined') {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }

    return response;
  }

  /**
   * Uploads a file using FormData
   * @param url - Upload endpoint URL
   * @param file - File to upload
   * @param fieldName - Form field name for the file (default: 'file')
   * @param additionalData - Additional form fields
   * @param config - Optional request configuration
   * @returns Promise resolving to the response data
   */
  public async uploadFile<T = any>(
    url: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalData?: Record<string, string | number>,
    config?: TMRequestConfig
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Add additional form data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    return this.instance.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  /**
   * Creates a new instance with a different configuration
   * Useful for different API endpoints or authentication schemes
   * @param config - Configuration for the new instance
   * @returns New TMAxios instance
   */
  public createInstance(config: TMAxiosConfig): TMAxios {
    return new TMAxios({
      ...this.config,
      ...config,
    });
  }

  /**
   * Gets the current configuration
   * @returns Current TMAxios configuration
   */
  public getConfig(): TMAxiosConfig {
    return { ...this.config };
  }

  /**
   * Gets the underlying Axios instance for advanced usage
   * @returns The Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

/**
 * Default TMAxios instance with basic configuration
 * Can be used directly or as a starting point for customization
 */
export const httpService = new TMAxios({
  timeout: 10000,
  enableLogging: typeof window !== 'undefined' && window.location.hostname === 'localhost',
  retry: {
    attempts: 3,
    delay: 1000,
  },
});

/**
 * Utility function to create a configured TMAxios instance
 * @param config - Configuration options
 * @returns Configured TMAxios instance
 */
export const createHttpService = (config: TMAxiosConfig): TMAxios => {
  return new TMAxios(config);
};

// Export types for external use
export type { AxiosResponse, AxiosError, AxiosRequestConfig };

// Re-export common Axios utilities
export { isAxiosError } from 'axios';