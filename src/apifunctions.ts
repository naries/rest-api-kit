import { FetchApiRequestType, MethodType, RequestType } from "./types";

// Enhanced types for better error handling and response management
export interface ApiResponse<T = any> {
  type: 'success' | 'error';
  data: T;
  status?: number;
  statusText?: string;
  headers?: Headers;
  info?: any;
  timestamp?: number;
  duration?: number;
}

export interface RequestConfig extends Partial<FetchApiRequestType> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  validateStatus?: (status: number) => boolean;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
  signal?: AbortSignal;
}

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
  retryDelayType?: 'fixed' | 'exponential' | 'linear';
}

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
  onResponseError?: (error: any) => any;
}

// Global configuration
export class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private defaultConfig: RequestConfig = {
    timeout: 30000,
    retries: 0,
    retryDelay: 1000,
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  constructor(config?: Partial<RequestConfig>) {
    if (config) {
      this.defaultConfig = { ...this.defaultConfig, ...config };
    }
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.requestInterceptors.push(interceptor) - 1;
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    return this.responseInterceptors.push(interceptor) - 1;
  }

  // Remove interceptor
  removeInterceptor(type: 'request' | 'response', index: number): void {
    if (type === 'request') {
      this.requestInterceptors.splice(index, 1);
    } else {
      this.responseInterceptors.splice(index, 1);
    }
  }

  // Execute request interceptors
  private async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          finalConfig = await interceptor.onRequest(finalConfig);
        } catch (error) {
          if (interceptor.onRequestError) {
            await interceptor.onRequestError(error);
          }
          throw error;
        }
      }
    }
    
    return finalConfig;
  }

  // Execute response interceptors
  private async executeResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let finalResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponse) {
        try {
          finalResponse = await interceptor.onResponse(finalResponse);
        } catch (error) {
          if (interceptor.onResponseError) {
            await interceptor.onResponseError(error);
          }
          throw error;
        }
      }
    }
    
    return finalResponse;
  }

  // Create timeout controller
  private createTimeoutController(timeout?: number): AbortController {
    const controller = new AbortController();
    
    if (timeout && timeout > 0) {
      setTimeout(() => {
        controller.abort();
      }, timeout);
    }
    
    return controller;
  }

  // Calculate retry delay
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const { retryDelay, retryDelayType = 'fixed' } = config;
    
    switch (retryDelayType) {
      case 'exponential':
        return retryDelay * Math.pow(2, attempt);
      case 'linear':
        return retryDelay * (attempt + 1);
      case 'fixed':
      default:
        return retryDelay;
    }
  }

  // Check if error should trigger retry
  private shouldRetry(error: any, attempt: number, config: RetryConfig): boolean {
    if (attempt >= config.retries) return false;
    
    if (config.retryCondition) {
      return config.retryCondition(error);
    }
    
    // Default retry conditions
    if (error.name === 'AbortError') return false; // Don't retry timeouts
    if (error.name === 'TypeError') return true;   // Network errors
    if (error.status >= 500) return true;          // Server errors
    if (error.status === 429) return true;         // Rate limiting
    
    return false;
  }

  // Sleep utility for retries
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced request method with full feature set
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    // Merge with default config
    const finalConfig: RequestConfig = {
      ...this.defaultConfig,
      ...config,
    };

    // Execute request interceptors
    const interceptedConfig = await this.executeRequestInterceptors(finalConfig);

    // Setup retry configuration
    const retryConfig: RetryConfig = {
      retries: interceptedConfig.retries || 0,
      retryDelay: interceptedConfig.retryDelay || 1000,
      retryCondition: interceptedConfig.retryCondition,
      retryDelayType: 'exponential',
    };

    let lastError: any;
    
    // Retry loop
    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        // Create timeout controller if not provided
        const timeoutController = interceptedConfig.signal ? 
          null : this.createTimeoutController(interceptedConfig.timeout);
        
        const signal = interceptedConfig.signal || timeoutController?.signal;

        // Prepare request parameters
        const requestParams: RequestInit = {
          method: interceptedConfig.method || 'GET',
          mode: interceptedConfig.mode || 'cors',
          cache: interceptedConfig.cache || 'no-cache',
          credentials: interceptedConfig.credentials || 'same-origin',
          headers: interceptedConfig.headers,
          redirect: interceptedConfig.redirect || 'follow',
          referrerPolicy: interceptedConfig.referrerPolicy || 'no-referrer',
          signal,
        };

        // Add body for non-GET requests
        if (interceptedConfig.method && interceptedConfig.method !== 'GET' && interceptedConfig.body) {
          let transformedBody = interceptedConfig.body;
          
          // Apply request transformation
          if (interceptedConfig.transformRequest) {
            transformedBody = interceptedConfig.transformRequest(transformedBody);
          }
          
          // Handle different body types
          if (typeof transformedBody === 'object' && transformedBody !== null && 
              !((transformedBody as any) instanceof FormData)) {
            requestParams.body = JSON.stringify(transformedBody);
            // Ensure Content-Type is set for JSON
            if (!requestParams.headers) {
              requestParams.headers = {};
            }
            if (!(requestParams.headers as any)['Content-Type']) {
              (requestParams.headers as any)['Content-Type'] = 'application/json';
            }
          } else {
            requestParams.body = transformedBody as BodyInit;
          }
        }

        // Make the actual request
        const response = await fetch(interceptedConfig.url || '', requestParams);
        
        // Calculate duration
        const duration = Date.now() - startTime;

        // Validate status
        const isValidStatus = interceptedConfig.validateStatus 
          ? interceptedConfig.validateStatus(response.status)
          : response.status >= 200 && response.status < 300;

        if (!isValidStatus) {
          const errorResponse: ApiResponse<T> = {
            type: 'error',
            data: `Request failed with status: ${response.status} ${response.statusText}` as T,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            timestamp: Date.now(),
            duration,
          };

          // Try to parse error response body
          try {
            const errorText = await response.text();
            if (errorText) {
              try {
                errorResponse.data = JSON.parse(errorText);
              } catch {
                errorResponse.data = errorText as T;
              }
            }
          } catch {
            // Ignore parsing errors for error responses
          }

          const finalErrorResponse = await this.executeResponseInterceptors(errorResponse);
          
          // Check if we should retry this error
          if (this.shouldRetry({ status: response.status, response: errorResponse }, attempt, retryConfig)) {
            lastError = finalErrorResponse;
            await this.sleep(this.calculateRetryDelay(attempt, retryConfig));
            continue;
          }
          
          return finalErrorResponse;
        }

        // Parse successful response
        let responseData: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text() as T;
        }

        // Apply response transformation
        if (interceptedConfig.transformResponse) {
          responseData = interceptedConfig.transformResponse(responseData);
        }

        const successResponse: ApiResponse<T> = {
          type: 'success',
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          timestamp: Date.now(),
          duration,
        };

        return await this.executeResponseInterceptors(successResponse);

      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (this.shouldRetry(error, attempt, retryConfig)) {
          await this.sleep(this.calculateRetryDelay(attempt, retryConfig));
          continue;
        }
        
        // Final error response
        const errorResponse: ApiResponse<T> = {
          type: 'error',
          data: this.formatError(error) as T,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          info: error,
        };

        try {
          return await this.executeResponseInterceptors(errorResponse);
        } catch (interceptorError) {
          // If interceptor fails, return original error
          return errorResponse;
        }
      }
    }

    // Should never reach here, but return last error just in case
    const finalErrorResponse: ApiResponse<T> = {
      type: 'error',
      data: this.formatError(lastError) as T,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      info: lastError,
    };

    return finalErrorResponse;
  }

  // Format error messages consistently
  private formatError(error: any): string {
    if (error.name === 'AbortError') {
      return 'Request timeout';
    }
    if (error.name === 'TypeError') {
      return 'Network error or CORS issue';
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}

// Create default client instance
const defaultClient = new ApiClient();

// Enhanced createRequest function (backward compatible)
export async function createRequest<T = any>(
  url = "",
  headers = {},
  method?: MethodType,
  body: any = {},
  rest?: Partial<Omit<RequestType, "headers" | "url" | "method" | "body">>
): Promise<ApiResponse<T>> {
  return defaultClient.request<T>({
    url,
    headers,
    method,
    body,
    ...rest,
  });
}

// Enhanced makeRequest function (backward compatible)
export function makeRequest<T = any>(
  payload: string | Partial<RequestType>,
  headers: Headers
): Promise<ApiResponse<T> | undefined> {
  if (!payload) {
    return Promise.resolve(undefined);
  }
  
  if (typeof payload === "string") {
    return createRequest<T>(payload, headers);
  }
  
  const { url, method, body, ...rest } = payload;
  return createRequest<T>(url, headers, method, body, rest);
}

// Utility functions for common HTTP methods
export const api = {
  get: <T = any>(url: string, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'GET' }),
    
  post: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'POST', body: data }),
    
  put: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'PUT', body: data }),
    
  patch: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'PATCH', body: data }),
    
  delete: <T = any>(url: string, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'DELETE' }),
    
  head: <T = any>(url: string, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'HEAD' }),
    
  options: <T = any>(url: string, config?: RequestConfig) => 
    defaultClient.request<T>({ ...config, url, method: 'OPTIONS' }),
};

// Request cancellation utilities
export class RequestCancellation {
  private static controllers = new Map<string, AbortController>();

  static create(key: string): AbortController {
    // Cancel existing request with same key
    const existing = this.controllers.get(key);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  static cancel(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  static cancelAll(): void {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }

  static cleanup(key: string): void {
    this.controllers.delete(key);
  }
}

// Export the default client
export { defaultClient as apiClient };
