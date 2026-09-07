import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export type BadgeVariant =
  | 'online'
  | 'degraded'
  | 'offline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'online':
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: COLORS.emerald, border: 'rgba(16, 185, 129, 0.3)' };
      case 'degraded':
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: COLORS.amber, border: 'rgba(245, 158, 11, 0.3)' };
      case 'offline':
      case 'danger':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: COLORS.rose, border: 'rgba(244, 63, 94, 0.3)' };
      case 'info':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: COLORS.primaryLight, border: 'rgba(99, 102, 241, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', text: COLORS.textSecondary, border: COLORS.borderLight };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        size === 'sm' ? styles.small : styles.medium,
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.label, { color: text }, size === 'sm' && styles.smallText]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smallText: {
    fontSize: 10,
  },
});
