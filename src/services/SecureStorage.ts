import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, Tenant } from '../types/models';
import { STORAGE_KEYS } from '../constants/config';

const memoryFallback = new Map<string, string>();

/**
 * Low-level SecureStore accessor with web/emulator fallback
 */
export const rawSecureStore = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          memoryFallback.set(key, value);
        }
        return;
      }
      memoryFallback.set(key, value);
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));
      await Promise.race([
        SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }),
        timeout,
      ]);
    } catch (err) {
      console.warn(`[SecureStorage] Error setting key ${key}:`, err);
      memoryFallback.set(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryFallback.get(key) || null;
      }
      const timeout = new Promise<string | null>((resolve) =>
        setTimeout(() => resolve(memoryFallback.get(key) || null), 1500)
      );
      const res = await Promise.race([SecureStore.getItemAsync(key), timeout]);
      return res ?? (memoryFallback.get(key) || null);
    } catch (err) {
      console.warn(`[SecureStorage] Error getting key ${key}:`, err);
      return memoryFallback.get(key) || null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      memoryFallback.delete(key);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));
      await Promise.race([SecureStore.deleteItemAsync(key), timeout]);
    } catch (err) {
      console.warn(`[SecureStorage] Error deleting key ${key}:`, err);
      memoryFallback.delete(key);
    }
  },
};

/**
 * Enterprise Secure Storage Service
 * Type-safe accessors for JWT tokens, Tenant configurations, and User Sessions
 */
export class SecureStorageService {
  /**
   * Retrieves the stored JWT Access Token
   */
  static async getAuthToken(): Promise<string | null> {
    return rawSecureStore.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Retrieves the stored Refresh Token
   */
  static async getRefreshToken(): Promise<string | null> {
    return rawSecureStore.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Saves full authenticated user session
   */
  static async saveAuthSession(
    user: User,
    token: string,
    tenantId: string,
    refreshToken?: string
  ): Promise<void> {
    const defaultTenant: Tenant = {
      id: tenantId,
      name: 'Nairobi Central Gateway',
      code: 'MAIN',
      region: 'Nairobi',
      activeRouters: 12,
      activeSubscribers: 1840,
      isPrimary: true,
    };

    await Promise.all([
      rawSecureStore.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
      rawSecureStore.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)),
      rawSecureStore.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(defaultTenant)),
      refreshToken
        ? rawSecureStore.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        : Promise.resolve(),
    ]);
  }

  /**
   * Retrieves the active tenant context
   */
  static async getActiveTenant(): Promise<Tenant | null> {
    const raw = await rawSecureStore.getItem(STORAGE_KEYS.CURRENT_TENANT);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Tenant;
    } catch {
      return {
        id: raw,
        name: 'Default Tenant',
        code: 'MAIN',
        region: 'Default',
        activeRouters: 1,
        activeSubscribers: 0,
      };
    }
  }

  /**
   * Sets the active tenant context
   */
  static async saveActiveTenant(tenant: Tenant): Promise<void> {
    await rawSecureStore.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(tenant));
  }

  /**
   * Clears all session and security credentials from Keychain / EncryptedPrefs
   */
  static async clearSession(): Promise<void> {
    await Promise.all([
      rawSecureStore.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      rawSecureStore.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      rawSecureStore.removeItem(STORAGE_KEYS.USER_PROFILE),
      rawSecureStore.removeItem(STORAGE_KEYS.CURRENT_TENANT),
    ]);
  }
}

export const SecureStorage = SecureStorageService;
export default SecureStorage;
