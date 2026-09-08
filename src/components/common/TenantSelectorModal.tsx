import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Tenant } from '../../types/models';
import { useTenantStore } from '../../store/useTenantStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

interface TenantSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TenantSelectorModal: React.FC<TenantSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const tenants = useTenantStore((state) => state.tenants);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const setCurrentTenant = useTenantStore((state) => state.setCurrentTenant);
  const loadTenants = useTenantStore((state) => state.loadTenants);
  const isLoading = useTenantStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible && tenants.length === 0) {
      loadTenants();
    }
  }, [visible, tenants.length, loadTenants]);

  // Filter tenants accessible to this user
  const accessibleTenants = tenants.filter((t) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.assignedTenantIds && user.assignedTenantIds.length > 0) {
      return user.assignedTenantIds.includes(t.id);
    }
    return t.id === currentTenant?.id;
  });

  const filteredTenants = accessibleTenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.region.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (tenant: Tenant) => {
    await setCurrentTenant(tenant);
    // Invalidate all active queries to fetch fresh tenant data
    queryClient.invalidateQueries();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="business" size={20} color={COLORS.primaryLight} />
              <Text style={styles.title}>Switch Active Tenant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Select the ISP branch or Hotspot territory you wish to manage.
          </Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search branch name or code..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Tenant List */}
          <ScrollView style={styles.list}>
            {isLoading ? (
              <View style={{ paddingVertical: SPACING.xl, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primaryLight} />
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: SPACING.sm }}>
                  Loading ISP branches...
                </Text>
              </View>
            ) : filteredTenants.length === 0 ? (
              <View style={{ paddingVertical: SPACING.xl, alignItems: 'center' }}>
                <Ionicons name="business-outline" size={32} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: SPACING.sm, fontWeight: '600' }}>
                  No branches found
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>
                  All network territories will appear once provisioned.
                </Text>
              </View>
            ) : (
              filteredTenants.map((t) => {
                const isSelected = currentTenant?.id === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(t)}
                    style={[styles.tenantItem, isSelected && styles.tenantItemActive]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <View style={styles.itemInfo}>
                        <View style={styles.nameRow}>
                          <Text
                            style={[
                              styles.tenantName,
                              isSelected && styles.tenantNameSelected,
                            ]}
                          >
                            {t.name}
                          </Text>
                          <Text style={styles.tenantCode}>({t.code})</Text>
                        </View>
                        <Text style={styles.tenantRegion}>{t.region}</Text>
                        <Text style={styles.tenantStats}>
                          {t.activeRouters} Routers • {t.activeSubscribers.toLocaleString()} Active
                          Subscribers
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Badge label="ACTIVE" variant="online" size="sm" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  list: {
    marginBottom: SPACING.lg,
  },
  tenantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tenantItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: COLORS.primaryLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioCircleSelected: {
    borderColor: COLORS.primaryLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryLight,
  },
  itemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tenantNameSelected: {
    color: COLORS.text,
  },
  tenantCode: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginLeft: 6,
  },
  tenantRegion: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tenantStats: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
