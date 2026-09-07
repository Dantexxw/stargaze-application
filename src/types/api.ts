import { UserRole } from './models';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface PlatformLoginRequest {
  email: string;
  password?: string;
  biometricSignature?: string;
  tenantId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    tenantId: string;
    assignedTenantIds?: string[];
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
