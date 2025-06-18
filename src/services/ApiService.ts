import { generateRequestCurl } from '../utils/helpers';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  credentials?: any;
  //RequestCredentials;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * ApiService class for handling API requests
 * Provides methods for common HTTP operations with consistent error handling
 * and request/response processing.
 */
export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  // private defaultTimeout: number;

  /**
   * Initialize the API service
   * @param baseUrl - Base URL for API requests
   * @param defaultHeaders - Default headers to include with every request
   * @param defaultTimeout - Default timeout in milliseconds (0 means no timeout)
   */
  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    // defaultTimeout: number = 30000
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = defaultHeaders;
    // this.defaultTimeout = defaultTimeout;
  }

  /**
   * Perform a GET request
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param options - Request options including headers and query parameters
   * @returns Promise with typed response data
   */
  public async get<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, null, options);
  }

  /**
   * Perform a POST request
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param data - Request payload
   * @param options - Request options including headers
   * @returns Promise with typed response data
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Perform a PUT request
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param data - Request payload
   * @param options - Request options including headers
   * @returns Promise with typed response data
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Perform a PATCH request
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param data - Request payload
   * @param options - Request options including headers
   * @returns Promise with typed response data
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Perform a DELETE request
   * @param endpoint - API endpoint (will be appended to baseUrl)
   * @param options - Request options including headers
   * @returns Promise with typed response data
   */
  public async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  /**
   * Core request method that handles all HTTP requests
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint
   * @param data - Request payload for POST, PUT, PATCH
   * @param options - Additional request options
   * @returns Promise with typed response data
   * @throws ApiError on request failure or timeout
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data: any = null,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Format endpoint to ensure it starts with /
      const formattedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

      // Combine default and custom headers
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };

      // Build URL with query params if provided
      let url = `${this.baseUrl}${formattedEndpoint}`;

      if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });

        const queryString = queryParams.toString();
        if (queryString) {
          url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }
      }

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers,
        credentials: options.credentials,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && data !== null) {
        requestOptions.body =
          headers['Content-Type'] === 'application/json'
            ? JSON.stringify(data)
            : data;
      }

      if (__DEV__) {
        const curl = generateRequestCurl(url, requestOptions);
        console.log(curl);
      }

      // Handle request timeout
      // const timeout =
      //   options.timeout !== undefined ? options.timeout : this.defaultTimeout;

      let timeoutId: NodeJS.Timeout | undefined;
      let fetchPromise = fetch(url, requestOptions);

      // if (timeout > 0) {
      //   const timeoutPromise = new Promise<Response>((_, reject) => {
      //     timeoutId = setTimeout(() => {
      //       reject(new ApiError(`Request timed out after ${timeout}ms`, 408));
      //     }, timeout);
      //   });

      //   // Race between fetch and timeout
      //   fetchPromise = Promise.race([fetchPromise, timeoutPromise]);
      // }

      // Execute request
      const response = await fetchPromise;

      // Clear timeout if request completes before timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('Json Error:', error);
      }

      if (__DEV__) {
        console.log(`Status: ${response.status}`);
        console.log(`Data`, responseData);
        const curl = generateRequestCurl(url, requestOptions);
        console.log(curl);
      }

      // Throw error for non-2xx responses
      if (!response.ok) {
        throw new ApiError(
          responseData?.message !== null
            ? responseData!.message
            : `Request failed with status ${response.status}`,
          response.status,
          responseData
        );
      }

      // Create standardized response object
      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      // Handle fetch errors and timeouts
      if (error instanceof ApiError) {
        if (__DEV__) {
          console.error(`Error: ${error.message}`);
        }
        throw error;
      }

      // Handle network errors or other exceptions
      const message =
        error instanceof Error
          ? (error?.message ?? 'Unknown error occurred')
          : 'Unknown error occurred';

      throw new ApiError(message, 0);
    }
  }
}
