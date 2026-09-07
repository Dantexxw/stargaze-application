import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TenantSelectorModal } from '../../components/common/TenantSelectorModal';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';
import { checkBiometricSupport } from '../../utils/biometrics';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { UserRole } from '../../types/models';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export const SettingsProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
  const canManageTenants = useAuthStore((state) => state.canManageTenants);

  const currentTenant = useTenantStore((state) => state.currentTenant);
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [bioHardwareReady, setBioHardwareReady] = useState(true);

  const { expoPushToken, isSimulating, triggerTestSimulation } = usePushNotifications();

  useEffect(() => {
    checkBiometricSupport().then((caps) => {
      setBioHardwareReady(caps.hasHardware);
    });
  }, []);

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

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Platform Super Admin';
      case 'TENANT_ADMIN':
        return 'ISP Branch Admin';
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
                <Text style={styles.tenantName}>{currentTenant?.name}</Text>
                <Text style={styles.tenantCode}>
                  {currentTenant?.code} • {currentTenant?.region}
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
});
