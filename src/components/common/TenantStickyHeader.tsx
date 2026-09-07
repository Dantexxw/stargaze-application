import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { useTenantStore } from '../../store/useTenantStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TenantSelectorModal } from './TenantSelectorModal';
import { Ionicons } from '@expo/vector-icons';

export const TenantStickyHeader: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const user = useAuthStore((state) => state.user);

  const canSwitchTenants =
    user?.role === 'SUPER_ADMIN' ||
    (user?.assignedTenantIds && user.assignedTenantIds.length > 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={canSwitchTenants ? 0.7 : 1}
        onPress={() => canSwitchTenants && setModalVisible(true)}
        style={styles.headerButton}
        disabled={!canSwitchTenants}
      >
        <View style={styles.left}>
          <View style={styles.branchIconBox}>
            <Ionicons name="business" size={16} color={COLORS.primaryLight} />
          </View>
          <View style={styles.branchInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.branchName} numberOfLines={1}>
                {currentTenant?.name || 'Nairobi Central Core ISP'}
              </Text>
              <Text style={styles.branchCode}>({currentTenant?.code || 'NBO-01'})</Text>
            </View>
            <Text style={styles.regionText}>
              {currentTenant?.region || 'Central ISP Hub'} • {currentTenant?.activeRouters || 24} Gateways
            </Text>
          </View>
        </View>

        {canSwitchTenants && (
          <View style={styles.switchBadge}>
            <Text style={styles.switchText}>SWITCH</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.primaryLight} />
          </View>
        )}
      </TouchableOpacity>

      <TenantSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  branchIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  branchInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 4,
  },
  branchCode: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  regionText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginRight: 2,
    letterSpacing: 0.5,
  },
});

export default TenantStickyHeader;
