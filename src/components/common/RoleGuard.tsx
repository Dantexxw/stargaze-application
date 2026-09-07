import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { UserRole } from '../../types/models';
import { useAuthStore } from '../../store/useAuthStore';
import { Card } from './Card';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRestrictedCard?: boolean;
  featureTitle?: string;
  style?: ViewStyle;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  showRestrictedCard = false,
  featureTitle = 'Administrative Feature',
  style,
}) => {
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role || 'TECHNICIAN';

  const hasAccess = allowedRoles.includes(currentRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showRestrictedCard) {
    return (
      <Card style={[styles.restrictedCard, style]}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={18} color={COLORS.amber} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.restrictedTitle}>{featureTitle}</Text>
            <Text style={styles.restrictedSubtitle}>
              Restricted to {allowedRoles.join(' / ')} roles. Your active role is{' '}
              <Text style={{ fontWeight: '700', color: COLORS.text }}>{currentRole}</Text>.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  restrictedCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderStyle: 'dashed',
    marginVertical: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  restrictedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amber,
  },
  restrictedSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
