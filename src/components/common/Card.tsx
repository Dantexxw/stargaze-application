import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'elevated' | 'glass' | 'glow';
  glowColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'surface',
  glowColor = COLORS.primaryGlow,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.surfaceLight,
          borderColor: COLORS.borderLight,
        };
      case 'glass':
        return {
          backgroundColor: COLORS.glass,
          borderColor: COLORS.glassBorder,
        };
      case 'glow':
        return {
          backgroundColor: COLORS.surface,
          borderColor: COLORS.borderHighlight,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 6,
        };
      default:
        return {
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        };
    }
  };

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginVertical: SPACING.xs,
  },
});
