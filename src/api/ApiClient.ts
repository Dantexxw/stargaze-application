import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { CONFIG, STORAGE_KEYS } from '../constants/config';
import { SecureStorage, rawSecureStore } from '../services/SecureStorage';
import { RefreshTokenResponse } from '../types/api';

// Maximum retry attempts for idempotent requests
const MAX_GET_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

/**
 * Singleton Axios Instance
 * Configured with 15-second timeout, keep-alive headers, and enterprise interceptors
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT_MS, // 15000 ms
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Connection: 'keep-alive',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Utility helper for exponential backoff delay with jitter
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Optional callback hook for auth state sync
let onAuthExpiredCallback: (() => void) | null = null;
export function setOnAuthExpired(cb: () => void) {
  onAuthExpiredCallback = cb;
}

/**
 * Request Interceptor:
 * Automatically extracts JWT `accessToken` & `x-tenant-id` from Secure Storage
 * and attaches them to every outgoing request.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1. Extract and inject Authorization Bearer token
      const token = await SecureStorage.getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Extract and inject x-tenant-id header
      const storedTenant = await SecureStorage.getActiveTenant();
      const tenantId = storedTenant?.id || 'tenant-main-nairobi';

      if (tenantId && config.headers) {
        config.headers['x-tenant-id'] = tenantId;
      }
    } catch (err) {
      console.warn('[ApiClient] Request interceptor header injection warning:', err);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * 1. Exponential backoff retry for idempotent GET requests on network failure/5xx.
 * 2. 401 Unauthorized handling with silent refresh queue and graceful session clearing.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 1. Exponential Backoff for idempotent GET requests on network dropouts / server 5xx
    const isGetRequest = originalRequest.method?.toLowerCase() === 'get';
    const isNetworkOrServerError =
      !error.response || (error.response.status >= 500 && error.response.status <= 599);

    if (isGetRequest && isNetworkOrServerError) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_GET_RETRIES) {
        originalRequest._retryCount += 1;
        const backoffDelay =
          INITIAL_RETRY_DELAY_MS * Math.pow(2, originalRequest._retryCount - 1) +
          Math.random() * 200;

        console.warn(
          `[ApiClient] Retrying GET ${originalRequest.url} (Attempt ${originalRequest._retryCount}/${MAX_GET_RETRIES}) in ${Math.round(
            backoffDelay
          )}ms`
        );

        await delay(backoffDelay);
        return apiClient(originalRequest);
      }
    }

    // 2. Intercept 401 Unauthorized for Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const storedTenant = await SecureStorage.getActiveTenant();

        // Refresh request without interceptor loop
        const refreshResponse = await axios.post<RefreshTokenResponse>(
          `${CONFIG.API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': storedTenant?.id || 'tenant-main-nairobi',
            },
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        await rawSecureStore.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        console.warn('[ApiClient] Token refresh failed. Clearing session.', refreshErr);
        await SecureStorage.clearSession();
        if (onAuthExpiredCallback) {
          onAuthExpiredCallback();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient as ApiClient };
export default apiClient;
