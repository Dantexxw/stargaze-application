import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: COLORS.surfaceLight,
            borderColor: COLORS.borderLight,
            borderWidth: 1,
          },
          text: { color: COLORS.text },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: COLORS.roseDark,
            borderColor: COLORS.rose,
            borderWidth: 1,
          },
          text: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: { color: COLORS.primaryLight },
        };
      default:
        return {
          button: {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primaryLight,
            borderWidth: 1,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 4,
          },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const { button: variantBtnStyle, text: variantTxtStyle } = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantBtnStyle,
        size === 'sm' && styles.small,
        size === 'lg' && styles.large,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantTxtStyle.color} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              variantTxtStyle,
              size === 'sm' && styles.smallText,
              size === 'lg' && styles.largeText,
              Boolean(icon) && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smallText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 17,
  },
  textWithIcon: {
    marginLeft: SPACING.sm,
  },
});
