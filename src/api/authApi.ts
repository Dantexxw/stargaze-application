import { apiClient } from './ApiClient';
import { ApiResponse, LoginRequest, PlatformLoginRequest, LoginResponse } from '../types/api';
import { User } from '../types/models';

export const authApi = {
  platformLogin: async (credentials: PlatformLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/platform-login',
        credentials
      );
      return response.data.data;
    } catch {
      // Fallback to standard login endpoint
      const fallbackRes = await apiClient.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        credentials
      );
      return fallbackRes.data.data;
    }
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return authApi.platformLogin(credentials);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Graceful offline ignore
    }
  },
};
