import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { useTenantStore } from '../../store/useTenantStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TenantSelectorModal } from './TenantSelectorModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showTenantPill?: boolean;
  onTenantPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'STARGAZE',
  subtitle,
  showTenantPill = true,
  onTenantPress,
  rightAction,
}) => {
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const user = useAuthStore((state) => state.user);
  const canManageTenants = useAuthStore((state) => state.canManageTenants);

  const [modalVisible, setModalVisible] = useState(false);

  const handlePillPress = () => {
    if (onTenantPress) {
      onTenantPress();
    } else if (canManageTenants()) {
      setModalVisible(true);
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return COLORS.rose;
      case 'TENANT_ADMIN':
        return COLORS.primaryLight;
      case 'BILLING_ADMIN':
        return COLORS.amber;
      case 'SUPPORT_AGENT':
        return COLORS.cyan;
      default:
        return COLORS.emerald;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>

            {user?.role && (
              <View
                style={[
                  styles.rolePill,
                  { borderColor: `${getRoleBadgeColor()}40`, backgroundColor: `${getRoleBadgeColor()}15` },
                ]}
              >
                <Text style={[styles.roleText, { color: getRoleBadgeColor() }]}>
                  {user.role === 'SUPER_ADMIN'
                    ? 'SUPER'
                    : user.role === 'TENANT_ADMIN'
                    ? 'ADMIN'
                    : user.role === 'BILLING_ADMIN'
                    ? 'BILLING'
                    : user.role === 'SUPPORT_AGENT'
                    ? 'SUPPORT'
                    : 'TECH'}
                </Text>
              </View>
            )}
          </View>

          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {showTenantPill && currentTenant && (
            <TouchableOpacity
              activeOpacity={canManageTenants() ? 0.7 : 1}
              onPress={handlePillPress}
              style={[
                styles.tenantPill,
                !canManageTenants() && styles.tenantPillLocked,
              ]}
            >
              <Ionicons name="business" size={13} color={COLORS.primaryLight} />
              <Text style={styles.tenantText} numberOfLines={1}>
                {currentTenant.name} ({currentTenant.code})
              </Text>
              {canManageTenants() && (
                <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
      </View>

      <TenantSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    marginLeft: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 0.5,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginLeft: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tenantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  tenantPillLocked: {
    opacity: 0.9,
  },
  tenantText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
});
