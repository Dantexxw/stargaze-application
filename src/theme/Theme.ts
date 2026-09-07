/**
 * STARGAZE Mobile App - Enterprise Theme System
 * Dark-mode-first color palette matching Tailwind tokens
 */

export const COLORS = {
  // Primary Brands
  primary: '#6366F1', // Deep Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  // Secondary Accents
  violet: '#8B5CF6',
  violetLight: '#A78BFA',
  violetGlow: 'rgba(139, 92, 246, 0.25)',

  amber: '#F59E0B',
  amberDark: '#D97706',
  amberLight: '#FCD34D',
  amberGlow: 'rgba(245, 158, 11, 0.2)',

  emerald: '#10B981',
  emeraldDark: '#059669',
  emeraldLight: '#6EE7B7',
  emeraldGlow: 'rgba(16, 185, 129, 0.2)',

  rose: '#F43F5E',
  roseDark: '#E11D48',
  roseLight: '#FDA4AF',
  roseGlow: 'rgba(244, 63, 94, 0.2)',

  cyan: '#06B6D4',
  sky: '#0EA5E9',

  // Dark-Mode Surfaces (Tailwind Slate / Gray palette)
  background: '#0B0F19', // Slate Ultra Dark
  surface: '#111827',    // Card / Elevated Container
  surfaceLight: '#1F2937',
  surfaceHover: '#374151',
  glass: 'rgba(17, 24, 39, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Borders
  border: '#1F2937',
  borderLight: '#374151',
  borderHighlight: 'rgba(99, 102, 241, 0.5)',

  // Text colors
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0B0F19',

  // System Status
  online: '#10B981',
  degraded: '#F59E0B',
  offline: '#F43F5E',
  idle: '#6B7280',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  mono: 'Courier',
} as const;

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  radius: RADIUS,
  fonts: FONTS,
};

export default THEME;
