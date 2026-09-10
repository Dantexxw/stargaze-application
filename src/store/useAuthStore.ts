import { create } from 'zustand';
import { User, UserRole } from '../types/models';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/config';
import { promptBiometricAuth } from '../utils/biometrics';
import { authApi } from '../api/authApi';

const BIOMETRICS_KEY = 'stargaze_biometrics_enabled';
const SAVED_EMAIL_KEY = 'stargaze_saved_login_email';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  savedEmail: string | null;

  setAuth: (payload: { user: User; accessToken: string; refreshToken?: string }) => Promise<void>;
  updateAccessToken: (accessToken: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;

  // Role Guard Helpers
  isSuperAdmin: () => boolean;
  isTenantAdmin: () => boolean;
  isBillingAdmin: () => boolean;
  isSupportAgent: () => boolean;
  isTechnician: () => boolean;
  canManageTenants: () => boolean;
  canViewRevenue: () => boolean;
  canConfigureRouters: () => boolean;
  canRebootGateways: () => boolean;
  canDispatchTechnicians: () => boolean;
  canProvisionSubscribers: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  biometricEnabled: false,
  savedEmail: null,

  setAuth: async ({ user, accessToken, refreshToken }) => {
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    await secureStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    await secureStorage.setItem(SAVED_EMAIL_KEY, user.email);

    set({
      user,
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      savedEmail: user.email,
    });
  },

  updateAccessToken: async (accessToken: string) => {
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    set({ accessToken });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await secureStorage.setItem(BIOMETRICS_KEY, enabled ? 'true' : 'false');
    set({ biometricEnabled: enabled });
  },

  loginWithBiometrics: async (): Promise<boolean> => {
    const storedUserStr = await secureStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const storedToken = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!storedUserStr || !storedToken) {
      // No previously authenticated user session exists - cannot login with biometrics
      return false;
    }

    const success = await promptBiometricAuth('Scan your Fingerprint or Face to access STARGAZE');
    if (!success) return false;

    try {
      const user = JSON.parse(storedUserStr) as User;
      set({
        user,
        accessToken: storedToken,
        isAuthenticated: true,
        biometricEnabled: true,
        savedEmail: user.email,
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const [storedToken, storedRefresh, storedUser, storedBio, storedEmail] =
        await Promise.all([
          secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          secureStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          secureStorage.getItem(BIOMETRICS_KEY),
          secureStorage.getItem(SAVED_EMAIL_KEY),
        ]);

      const biometricEnabled = storedBio === 'true';
      const savedEmail = storedEmail || null;

      if (storedToken && storedUser) {
        let isValid = true;
        try {
          // Check if JWT payload is expired
          const parts = storedToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(
              atob ? atob(parts[1]) : Buffer.from(parts[1], 'base64').toString('utf-8')
            );
            if (payload?.exp && payload.exp * 1000 < Date.now()) {
              // Token is expired; if no refresh token, session is invalid
              if (!storedRefresh) {
                isValid = false;
              }
            }
          }
        } catch {
          // If decoding fails, keep optimistic and let axios interceptor refresh
        }

        if (isValid) {
          set({
            accessToken: storedToken,
            refreshToken: storedRefresh,
            user: JSON.parse(storedUser) as User,
            isAuthenticated: true,
            biometricEnabled,
            savedEmail,
          });
        } else {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            biometricEnabled,
            savedEmail,
          });
        }
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          biometricEnabled,
          savedEmail,
        });
      }
    } catch (err) {
      console.warn('[useAuthStore] Failed to initialize auth from storage', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Role permissions
  isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
  isTenantAdmin: () => get().user?.role === 'TENANT_ADMIN',
  isBillingAdmin: () => get().user?.role === 'BILLING_ADMIN',
  isSupportAgent: () => get().user?.role === 'SUPPORT_AGENT',
  isTechnician: () => get().user?.role === 'TECHNICIAN',
  canManageTenants: () => get().user?.role === 'SUPER_ADMIN',
  canViewRevenue: () =>
    get().user?.role === 'SUPER_ADMIN' ||
    get().user?.role === 'TENANT_ADMIN' ||
    get().user?.role === 'BILLING_ADMIN',
  canConfigureRouters: () => get().user?.role === 'SUPER_ADMIN',
  canRebootGateways: () => get().user?.role === 'SUPER_ADMIN',
  canDispatchTechnicians: () => get().user?.role === 'SUPER_ADMIN',
  canProvisionSubscribers: () => !!get().user,
}));
