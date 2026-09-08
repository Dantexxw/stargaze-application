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
    try {
      const response = await apiClient.post<any>('/auth/login', credentials);
      const resData = response.data;
      if (resData?.accessToken && resData?.user) {
        let refreshToken = resData.refreshToken || '';
        const setCookie = response.headers?.['set-cookie'] || response.headers?.['Set-Cookie'];
        if (setCookie) {
          const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
          const match = cookieStr.match(/stargaze_refresh=([^;]+)/);
          if (match && match[1]) {
            refreshToken = match[1];
          }
        }

        return {
          accessToken: resData.accessToken,
          refreshToken,
          expiresIn: resData.expiresIn || 86400,
          user: {
            id: resData.user.id,
            email: resData.user.email,
            name: `${resData.user.firstName || ''} ${resData.user.lastName || ''}`.trim() || resData.user.email,
            role: resData.user.role === 'PLATFORM_SUPER_ADMIN' ? 'SUPER_ADMIN' : (resData.user.role === 'NOC_OPERATOR' ? 'TECHNICIAN' : (resData.user.role || 'TENANT_ADMIN')),
            phone: resData.user.phone || resData.user.phoneNumber || '+254 702 039 959',
            tenantId: resData.user.tenantId || resData.user.tenant?.id || '4bf37180-9e84-488e-9a03-fd2502933e94',
          },
        };
      }
      return resData.data || resData;
    } catch (err: any) {
      // If error from backend has a message, propagate that message
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
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
