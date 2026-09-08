import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Tenant } from '../../types/models';
import { tenantApi } from '../../api/tenantApi';
import { useTenantStore } from '../../store/useTenantStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const PlatformDashboardScreen: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentTenant = useTenantStore((state) => state.currentTenant);
  const setCurrentTenant = useTenantStore((state) => state.setCurrentTenant);

  const fetchTenants = async () => {
    try {
      const data = await tenantApi.getTenants();
      setTenants(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenants();
  };

  const handleSelectTenant = async (t: Tenant) => {
    await setCurrentTenant(t);
    Alert.alert('Tenant Switched', 'Active scope changed to ' + t.name + ' (' + t.code + ').');
  };

  const totalSubscribers = tenants.reduce((acc, t) => acc + (t.activeSubscribers || 0), 0);
  const totalRouters = tenants.reduce((acc, t) => acc + (t.activeRouters || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="PLATFORM OVERVIEW"
        subtitle="Multi-Tenant Global ISP Fleet & Revenue"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
          />
        }
      >
        {/* Global Summary KPIs */}
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <Ionicons name="business" size={16} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.kpiValue}>{tenants.length}</Text>
            <Text style={styles.kpiLabel}>Total Tenants</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="people" size={16} color={COLORS.emerald} />
            </View>
            <Text style={styles.kpiValue}>{totalSubscribers.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>Total Clients</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <MaterialCommunityIcons name="router-network" size={16} color={COLORS.amber} />
            </View>
            <Text style={styles.kpiValue}>{totalRouters}</Text>
            <Text style={styles.kpiLabel}>Core Routers</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>REGISTERED ISP TENANTS ({tenants.length})</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primaryLight} style={{ marginTop: 24 }} />
        ) : (
          tenants.map((tenant) => {
            const isSelected = currentTenant?.id === tenant.id;
            return (
              <TouchableOpacity
                key={tenant.id}
                activeOpacity={0.8}
                onPress={() => handleSelectTenant(tenant)}
              >
                <Card style={[styles.tenantCard, isSelected && styles.tenantCardActive]}>
                  <View style={styles.tenantHeader}>
                    <View style={styles.tenantLeft}>
                      <View style={[styles.tenantIcon, isSelected && styles.tenantIconActive]}>
                        <Ionicons
                          name="business"
                          size={20}
                          color={isSelected ? '#FFFFFF' : COLORS.primaryLight}
                        />
                      </View>
                      <View style={styles.tenantMeta}>
                        <View style={styles.nameRow}>
                          <Text style={styles.tenantName}>{tenant.name}</Text>
                          {isSelected && (
                            <Badge label="ACTIVE SCOPE" variant="online" size="sm" />
                          )}
                        </View>
                        <Text style={styles.tenantCode}>
                          CODE: {tenant.code} • {tenant.region}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Subscribers</Text>
                      <Text style={styles.metricValue}>
                        {tenant.activeSubscribers.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Routers</Text>
                      <Text style={styles.metricValue}>{tenant.activeRouters}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Status</Text>
                      <Text style={[styles.metricValue, { color: COLORS.emerald }]}>
                        ONLINE
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  kpiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  tenantCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  tenantCardActive: {
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tenantIconActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tenantMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  tenantCode: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
});

export default PlatformDashboardScreen;
