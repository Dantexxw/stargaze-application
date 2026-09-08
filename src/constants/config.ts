export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://102-203-116-212.sslip.io/api',
  API_TIMEOUT_MS: 15000,
  APP_NAME: 'STARGAZE ISP & Hotspot',
  APP_VERSION: '1.0.0',
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'production',
  DEFAULT_TENANT_ID: '',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'stargaze_access_token',
  REFRESH_TOKEN: 'stargaze_refresh_token',
  CURRENT_TENANT: 'stargaze_current_tenant',
  USER_PROFILE: 'stargaze_user_profile',
  THEME_MODE: 'stargaze_theme_mode',
};
