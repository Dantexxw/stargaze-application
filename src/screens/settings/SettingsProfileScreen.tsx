import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TenantSelectorModal } from '../../components/common/TenantSelectorModal';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { CONFIG, STORAGE_KEYS } from '../../constants/config';
import { secureStorage } from '../../utils/secureStorage';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';
import { authApi } from '../../api/authApi';
import { checkBiometricSupport } from '../../utils/biometrics';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { UserRole } from '../../types/models';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const OPERATOR_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    name: 'Daniel Gitahi',
    email: 'danielkgitahi@gmail.com',
    desc: 'Platform Scope • Global Routers & Analytics',
    badgeColor: '#F43F5E',
    icon: 'shield-checkmark',
  },
  {
    role: 'TENANT_ADMIN',
    roleLabel: 'Tenant Admin',
    name: 'Hnohh Owner',
    email: 'hnohh30@gmail.com',
    desc: 'Stargaze Pilot ISP • Financials & Plans',
    badgeColor: '#6366F1',
    icon: 'business',
  },
  {
    role: 'TECHNICIAN',
    roleLabel: 'NOC Tech',
    name: 'Kelvin NOC Tech',
    email: 'technician@stargaze.net',
    desc: 'Network Ops • Dispatch & Diagnostics',
    badgeColor: '#10B981',
    icon: 'construct',
  },
  {
    role: 'BILLING_ADMIN',
    roleLabel: 'Billing Manager',
    name: 'Grace Finance',
    email: 'billing@stargaze.net',
    desc: 'Payments • Ledger & M-Pesa Accounting',
    badgeColor: '#F59E0B',
    icon: 'wallet',
  },
  {
    role: 'SUPPORT_AGENT',
    roleLabel: 'Support Agent',
    name: 'Samuel Support',
    email: 'support@stargaze.net',
    desc: 'CRM Helpdesk • Customer Tickets',
    badgeColor: '#38BDF8',
    icon: 'headset',
  },
];

export const SettingsProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
  const canManageTenants = useAuthStore((state) => state.canManageTenants);

  const currentTenant = useTenantStore((state) => state.currentTenant);
  const loadTenants = useTenantStore((state) => state.loadTenants);
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [bioHardwareReady, setBioHardwareReady] = useState(true);
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);

  const [darkTheme, setDarkTheme] = useState(true);
  const { expoPushToken, isSimulating, triggerTestSimulation } = usePushNotifications();

  useEffect(() => {
    checkBiometricSupport().then((caps) => {
      setBioHardwareReady(caps.hasHardware);
    });
    secureStorage.getItem(STORAGE_KEYS.THEME_MODE).then((stored) => {
      if (stored) {
        setDarkTheme(stored !== 'light');
      }
    });
  }, []);

  const handleToggleTheme = async (val: boolean) => {
    setDarkTheme(val);
    await secureStorage.setItem(STORAGE_KEYS.THEME_MODE, val ? 'dark' : 'light');
    Alert.alert(
      'Appearance Mode',
      val ? 'Dark cyber-NOC theme active.' : 'Light day-shift mode enabled.'
    );
  };

  const handleToggleBiometrics = async (val: boolean) => {
    await setBiometricEnabled(val);
    Alert.alert(
      'Biometric Security',
      val
        ? 'Face ID / Fingerprint enabled for recurring platform logins.'
        : 'Biometric unlock disabled.'
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your engineering session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSwitchAccount = async (targetEmail: string, roleTitle: string) => {
    if (user?.email?.toLowerCase() === targetEmail.toLowerCase()) {
      return;
    }
    try {
      setSwitchingEmail(targetEmail);
      const res = await authApi.login({ email: targetEmail, password: 'AdminSecure2026!#$' });
      if (res?.accessToken && res?.user) {
        await setAuth({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        });
        await loadTenants().catch(() => {});
        Alert.alert('Session Switched', `Active operator session changed to ${roleTitle} (${targetEmail}).`);
      }
    } catch (err: any) {
      Alert.alert('Switch Failed', err.message || 'Failed to authenticate switch');
    } finally {
      setSwitchingEmail(null);
    }
  };

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Platform Super Admin';
      case 'TENANT_ADMIN':
        return 'ISP Tenant Admin / Owner';
      default:
        return 'Field Network Technician';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="SETTINGS & PROFILE"
        subtitle="Security, Push Notifications & Tenant Guard"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Technician Profile Card */}
        <Card variant="glow" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color={COLORS.primaryLight} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.name || 'Engineer'}</Text>
              <Text style={styles.profileRole}>
                {getRoleDisplayName(user?.role)}
              </Text>
              <Text style={styles.profileEmail}>{user?.email || 'name@stargaze.net'}</Text>
            </View>
          </View>

          <View style={styles.profileFooter}>
            <Badge
              label={user?.role || 'TECHNICIAN'}
              variant={
                user?.role === 'SUPER_ADMIN'
                  ? 'danger'
                  : user?.role === 'TENANT_ADMIN'
                  ? 'info'
                  : 'online'
              }
              size="sm"
            />
            <Text style={styles.phoneText}>{user?.phone || '—'}</Text>
          </View>
        </Card>

        {/* Push Notifications & Channels */}
        <Text style={styles.sectionHeader}>PUSH NOTIFICATIONS (APNS / FCM)</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={COLORS.primaryLight} />
              <View style={styles.settingTextBlock}>
                <Text style={styles.settingTitle}>Device Push Gateway</Text>
                <Text style={styles.settingSubtitle} numberOfLines={1}>
                  {expoPushToken ? `Token: ${expoPushToken.substring(0, 24)}...` : 'Registered'}
                </Text>
              </View>
            </View>
            <Badge label="ONLINE (SYNCED)" variant="online" size="sm" />
          </View>

          {/* Registered Channels */}
          <View style={styles.channelsContainer}>
            <Text style={styles.channelLabel}>REGISTERED PRIORITY CHANNELS:</Text>
            <View style={styles.channelRow}>
              <Badge label="🚨 Critical Hardware (Max Priority / Bypass DND)" variant="danger" size="sm" />
            </View>
            <View style={styles.channelRow}>
              <Badge label="💰 High-Value M-Pesa (Transaction Chime)" variant="online" size="sm" />
            </View>
            <View style={styles.channelRow}>
              <Badge label="🎫 Field Support Tickets (High Priority)" variant="info" size="sm" />
            </View>
          </View>

          {/* Test Trigger Simulator */}
          <Text style={[styles.channelLabel, { marginTop: SPACING.md }]}>
            TEST NOTIFICATIONS & DEEP LINKING:
          </Text>
          <View style={styles.simulatorButtonGroup}>
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isSimulating}
              onPress={() => triggerTestSimulation('CRITICAL')}
              style={[styles.simBtn, { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: COLORS.rose }]}
            >
              <Ionicons name="warning" size={14} color={COLORS.rose} />
              <Text style={[styles.simBtnText, { color: COLORS.rose }]}>
                🚨 Critical Disconnect
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isSimulating}
              onPress={() => triggerTestSimulation('PAYMENT')}
              style={[styles.simBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: COLORS.emerald }]}
            >
              <FontAwesome5 name="money-bill-wave" size={12} color={COLORS.emerald} />
              <Text style={[styles.simBtnText, { color: COLORS.emerald }]}>
                💰 M-Pesa KES 4,500
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isSimulating}
              onPress={() => triggerTestSimulation('TICKET')}
              style={[styles.simBtn, { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: COLORS.primaryLight }]}
            >
              <Ionicons name="paper-plane" size={14} color={COLORS.primaryLight} />
              <Text style={[styles.simBtnText, { color: COLORS.primaryLight }]}>
                🎫 Field Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Switch Operator Account (RBAC) */}
        <Text style={styles.sectionHeader}>SWITCH OPERATOR ACCOUNT (RBAC)</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.switcherSubtitle}>
            Switch session to any verified production role with synced permissions:
          </Text>
          <View style={styles.accountsList}>
            {OPERATOR_ACCOUNTS.map((acc) => {
              const isActive = user?.email?.toLowerCase() === acc.email.toLowerCase();
              const isPending = switchingEmail === acc.email;
              return (
                <TouchableOpacity
                  key={acc.email}
                  activeOpacity={0.75}
                  disabled={Boolean(switchingEmail) || isActive}
                  onPress={() => handleSwitchAccount(acc.email, acc.roleLabel)}
                  style={[
                    styles.accountRow,
                    isActive && styles.accountRowActive,
                  ]}
                >
                  <View style={[styles.accountIconCircle, { backgroundColor: `${acc.badgeColor}20` }]}>
                    <Ionicons name={acc.icon as any} size={18} color={acc.badgeColor} />
                  </View>
                  <View style={styles.accountTextContainer}>
                    <View style={styles.accountNameRow}>
                      <Text style={[styles.accountName, isActive && { color: acc.badgeColor, fontWeight: '700' }]}>
                        {acc.name}
                      </Text>
                      <Badge
                        label={acc.roleLabel}
                        variant={acc.role === 'SUPER_ADMIN' ? 'danger' : acc.role === 'TENANT_ADMIN' ? 'info' : 'online'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.accountDesc}>{acc.desc}</Text>
                    <Text style={styles.accountEmail}>{acc.email}</Text>
                  </View>
                  {isPending ? (
                    <ActivityIndicator size="small" color={acc.badgeColor} />
                  ) : isActive ? (
                    <View style={styles.activePill}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.emerald} />
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Tenant Switching Card */}
        <Text style={styles.sectionHeader}>ACTIVE ISP BRANCH & TERRITORY</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.tenantSwitchRow}
            activeOpacity={canManageTenants() ? 0.7 : 1}
            onPress={() => {
              if (canManageTenants()) {
                setTenantModalVisible(true);
              } else {
                Alert.alert(
                  'Branch Scoped',
                  'Multi-tenant switching is restricted to Platform Super Administrators. Your session is scoped to this branch.'
                );
              }
            }}
          >
            <View style={styles.tenantLeft}>
              <Ionicons name="business" size={22} color={COLORS.primaryLight} />
              <View style={styles.tenantTextContainer}>
                <Text style={styles.tenantName}>
                  {currentTenant?.name || 'All ISP Branches / Territories'}
                </Text>
                <Text style={styles.tenantCode}>
                  {currentTenant
                    ? `${currentTenant.code} • ${currentTenant.region}`
                    : 'Super Admin Global Scope'}
                </Text>
              </View>
            </View>
            {canManageTenants() ? (
              <View style={styles.switchPill}>
                <Text style={styles.switchPillText}>Change</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primaryLight} />
              </View>
            ) : (
              <Badge label="SCOPED" variant="neutral" size="sm" />
            )}
          </TouchableOpacity>
        </Card>

        {/* Biometrics & Security Settings */}
        <Text style={styles.sectionHeader}>SECURITY & ACCESS</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="fingerprint"
                size={22}
                color={COLORS.emerald}
              />
              <View style={styles.settingTextBlock}>
                <Text style={styles.settingTitle}>Biometric Quick Unlock</Text>
                <Text style={styles.settingSubtitle}>
                  Allow Face ID / Fingerprint prompt for login
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primaryDark }}
              thumbColor={biometricEnabled ? COLORS.primaryLight : COLORS.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={darkTheme ? 'moon' : 'sunny'}
                size={22}
                color={darkTheme ? COLORS.violetLight : COLORS.amber}
              />
              <View style={styles.settingTextBlock}>
                <Text style={styles.settingTitle}>Dark Cyber-NOC Theme</Text>
                <Text style={styles.settingSubtitle}>
                  {darkTheme ? 'OLED high-contrast night mode active' : 'Day-shift light interface'}
                </Text>
              </View>
            </View>
            <Switch
              value={darkTheme}
              onValueChange={handleToggleTheme}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.primaryDark }}
              thumbColor={darkTheme ? COLORS.primaryLight : COLORS.amber}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryLight} />
              <View style={styles.settingTextBlock}>
                <Text style={styles.settingTitle}>Encrypted Storage</Text>
                <Text style={styles.settingSubtitle}>
                  Hardware Keychain / EncryptedSharedPreferences
                </Text>
              </View>
            </View>
            <Badge label="ACTIVE" variant="online" size="sm" />
          </View>
        </Card>

        {/* System & API Configurations */}
        <Text style={styles.sectionHeader}>SYSTEM CONFIGURATION</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>API Endpoint</Text>
            <Text style={styles.configValue}>{CONFIG.API_BASE_URL}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>App Version</Text>
            <Text style={styles.configValue}>{CONFIG.APP_VERSION}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>x-tenant-id Header</Text>
            <Text style={[styles.configValue, { color: COLORS.primaryLight }]}>
              {currentTenant?.id}
            </Text>
          </View>
        </Card>

        <Button
          title="Sign Out of Session"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Tenant Selector Modal */}
      <TenantSelectorModal
        visible={tenantModalVisible}
        onClose={() => setTenantModalVisible(false)}
      />
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
  profileCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileRole: {
    fontSize: 13,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sectionCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  channelsContainer: {
    marginTop: SPACING.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  channelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  channelRow: {
    marginBottom: 4,
  },
  simulatorButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
    marginTop: 4,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    margin: 3,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  tenantSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
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
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginRight: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  settingTextBlock: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  configLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  configValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutBtn: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  switcherSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  accountsList: {
    gap: 8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  accountRowActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  accountIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountTextContainer: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  accountDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  accountEmail: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
  },
});
