import { apiClient } from './ApiClient';
import { ApiResponse, LoginRequest, PlatformLoginRequest, LoginResponse } from '../types/api';
import { User, UserRole } from '../types/models';

export function normalizeUserRole(rawRole?: string): UserRole {
  const role = (rawRole || '').toUpperCase();
  if (role === 'PLATFORM_SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'DIRECTOR') {
    return 'SUPER_ADMIN';
  }
  if (role === 'BILLING_ADMIN' || role === 'FINANCE_OFFICER' || role === 'BILLING') {
    return 'BILLING_ADMIN';
  }
  if (role === 'SUPPORT_AGENT' || role === 'CUSTOMER_SUPPORT' || role === 'HELPDESK') {
    return 'SUPPORT_AGENT';
  }
  if (role === 'TENANT_ADMIN' || role === 'TENANT_OWNER' || role === 'BRANCH_MANAGER') {
    return 'TENANT_ADMIN';
  }
  // NOC_OPERATOR, FIELD_TECH, FIELD_TECHNICIAN, NETWORK_ENGINEER, TECHNICIAN, etc.
  return 'TECHNICIAN';
}

function parseLoginResponse(response: any): LoginResponse {
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
        name:
          `${resData.user.firstName || ''} ${resData.user.lastName || ''}`.trim() ||
          resData.user.name ||
          resData.user.email,
        role: normalizeUserRole(resData.user.role),
        phone: resData.user.phone || resData.user.phoneNumber || '',
        tenantId:
          resData.user.tenantId ||
          resData.user.tenant?.id ||
          '',
      },
    };
  }
  return resData?.data || resData;
}

export const authApi = {
  socialLogin: async (
    provider: 'google' | 'apple' | 'microsoft',
    token: string
  ): Promise<LoginResponse> => {
    const response = await apiClient.post<any>('/auth/social-login', {
      provider,
      token,
    });
    return parseLoginResponse(response);
  },

  platformLogin: async (credentials: PlatformLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<any>(
        '/auth/platform-login',
        credentials
      );
      return parseLoginResponse(response);
    } catch {
      // Fallback to standard login endpoint
      const fallbackRes = await apiClient.post<any>(
        '/auth/login',
        credentials
      );
      return parseLoginResponse(fallbackRes);
    }
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<any>('/auth/login', credentials);
      return parseLoginResponse(response);
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
