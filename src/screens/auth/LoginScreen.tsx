import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';
import { authApi } from '../../api/authApi';
import { checkBiometricSupport, promptBiometricAuth } from '../../utils/biometrics';
import { UserRole } from '../../types/models';
import {
  firebaseSignIn,
  firebaseSignInWithGoogleCredential,
  firebaseRegisterUser,
  firebaseSendPasswordReset,
  getFirebaseErrorMessage,
} from '../../services/firebaseConfig';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type AuthMode = 'LOGIN' | 'REGISTER' | 'RECOVERY';

const QUICK_OPERATOR_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    desc: 'Platform Owner',
    email: 'danielkgitahi@gmail.com',
    password: 'AdminSecure2026!#$',
    icon: 'shield-checkmark',
    badgeColor: '#F43F5E',
  },
  {
    role: 'TENANT_ADMIN',
    label: 'Tenant Admin',
    desc: 'Stargaze ISP',
    email: 'hnohh30@gmail.com',
    password: 'AdminSecure2026!#$',
    icon: 'business',
    badgeColor: '#6366F1',
  },
  {
    role: 'TECHNICIAN',
    label: 'NOC Tech',
    desc: 'Field Operations',
    email: 'technician@stargaze.net',
    password: 'AdminSecure2026!#$',
    icon: 'construct',
    badgeColor: '#10B981',
  },
  {
    role: 'BILLING_ADMIN',
    label: 'Billing',
    desc: 'Finance & Payments',
    email: 'billing@stargaze.net',
    password: 'AdminSecure2026!#$',
    icon: 'wallet',
    badgeColor: '#F59E0B',
  },
  {
    role: 'SUPPORT_AGENT',
    label: 'Support',
    desc: 'Helpdesk & CRM',
    email: 'support@stargaze.net',
    password: 'AdminSecure2026!#$',
    icon: 'headset',
    badgeColor: '#38BDF8',
  },
];

export interface DetectedRoleInfo {
  role: UserRole;
  label: string;
  badgeColor: string;
  icon: string;
  scopeDesc: string;
}

export function detectAccountRole(emailStr: string): DetectedRoleInfo {
  const clean = (emailStr || '').trim().toLowerCase();

  // 1. Exact matches for verified operator accounts
  if (
    clean === 'danielkgitahi@gmail.com' ||
    clean === 'superadmin@stargaze.net' ||
    clean.includes('vukalindk')
  ) {
    return {
      role: 'SUPER_ADMIN',
      label: 'Platform Super Admin',
      badgeColor: '#F43F5E',
      icon: 'shield-checkmark',
      scopeDesc: 'Platform Scope • Global Routers, Fleet & All Branches',
    };
  }
  if (clean === 'hnohh30@gmail.com' || clean === 'admin@stargaze.net') {
    return {
      role: 'TENANT_ADMIN',
      label: 'Tenant Admin',
      badgeColor: '#6366F1',
      icon: 'business',
      scopeDesc: 'Branch Manager • Stargaze ISP Subscriptions & Revenue',
    };
  }
  if (clean === 'technician@stargaze.net' || clean === 'ghostdantexxd@gmail.com') {
    return {
      role: 'TECHNICIAN',
      label: 'NOC Technician',
      badgeColor: '#10B981',
      icon: 'construct',
      scopeDesc: 'Field Engineering • Routers, Hotspots & Dispatches',
    };
  }
  if (clean === 'billing@stargaze.net') {
    return {
      role: 'BILLING_ADMIN',
      label: 'Billing Admin',
      badgeColor: '#F59E0B',
      icon: 'wallet',
      scopeDesc: 'Finance & Payments • M-Pesa Accounting & Invoices',
    };
  }
  if (clean === 'support@stargaze.net') {
    return {
      role: 'SUPPORT_AGENT',
      label: 'Support Agent',
      badgeColor: '#38BDF8',
      icon: 'headset',
      scopeDesc: 'Customer Support • CRM Tickets & Helpdesk',
    };
  }

  // 2. Domain & email keyword heuristics
  if (
    clean.includes('superadmin') ||
    clean.includes('director') ||
    clean.includes('owner') ||
    clean.includes('platform') ||
    clean.includes('executive')
  ) {
    return {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      badgeColor: '#F43F5E',
      icon: 'shield-checkmark',
      scopeDesc: 'Platform Scope • Global Network Fleet',
    };
  }
  if (
    clean.includes('admin') ||
    clean.includes('manager') ||
    clean.includes('branch') ||
    clean.includes('tenant')
  ) {
    return {
      role: 'TENANT_ADMIN',
      label: 'Tenant Admin',
      badgeColor: '#6366F1',
      icon: 'business',
      scopeDesc: 'Branch Level • Operations & Subscribers',
    };
  }
  if (
    clean.includes('billing') ||
    clean.includes('finance') ||
    clean.includes('accountant') ||
    clean.includes('ledger') ||
    clean.includes('payment')
  ) {
    return {
      role: 'BILLING_ADMIN',
      label: 'Billing Admin',
      badgeColor: '#F59E0B',
      icon: 'wallet',
      scopeDesc: 'Financial Accounts • Ledger & Payments',
    };
  }
  if (
    clean.includes('support') ||
    clean.includes('help') ||
    clean.includes('desk') ||
    clean.includes('agent') ||
    clean.includes('ticket') ||
    clean.includes('crm')
  ) {
    return {
      role: 'SUPPORT_AGENT',
      label: 'Support Agent',
      badgeColor: '#38BDF8',
      icon: 'headset',
      scopeDesc: 'Customer Support • Helpdesk Tickets',
    };
  }

  // Default for all field engineers / technicians
  return {
    role: 'TECHNICIAN',
    label: 'Field Engineer',
    badgeColor: '#10B981',
    icon: 'construct',
    scopeDesc: 'Technical Operations • Field Diagnostic Access',
  };
}

export const LoginScreen: React.FC = () => {
  // Navigation mode
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  // Automatic role resolution from active input
  const detectedRole = detectAccountRole(email);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+254 ');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regRole, setRegRole] = useState<'TECHNICIAN' | 'TENANT_ADMIN'>('TECHNICIAN');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Password recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Google sign-in loading state (no modal needed — native picker handles UI)
  const [googleLoading, setGoogleLoading] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bioSupported, setBioSupported] = useState(true);

  const setAuth = useAuthStore((state) => state.setAuth);
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
  const isBiometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const savedEmail = useAuthStore((state) => state.savedEmail);
  const loginWithBiometrics = useAuthStore((state) => state.loginWithBiometrics);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const loadTenants = useTenantStore((state) => state.loadTenants);

  useEffect(() => {
    checkBiometricSupport().then(() => {
      setBioSupported(true);
    });

    // Configure native Google Sign-In safely
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    GoogleSignin.configure({
      webClientId: webClientId && webClientId.trim().length > 0 ? webClientId.trim() : undefined,
      offlineAccess: Boolean(webClientId && webClientId.trim().length > 0),
      forceCodeForRefreshToken: Boolean(webClientId && webClientId.trim().length > 0),
      scopes: ['profile', 'email'],
    });
  }, []);

  // Format Kenya phone number (+254 7XX XXX XXX)
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+254')) {
      if (clean.startsWith('0')) clean = '+254' + clean.substring(1);
      else if (clean.startsWith('254')) clean = '+' + clean;
      else if (!clean.startsWith('+')) clean = '+254' + clean;
    }
    setRegPhone(clean);
  };

  // Switch tabs & clear temporary notices
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Native Google Sign-In — launches Android system account picker
  const openGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response: any = await GoogleSignin.signIn();
      const userData = response?.data?.user ?? response?.user ?? response;
      const idToken = response?.data?.idToken ?? response?.idToken;
      const userEmail = (userData?.email || '').toLowerCase();
      if (!idToken || !userEmail) {
        throw new Error('Google sign-in did not return a usable identity token.');
      }

      // Convert the native Google token into a Firebase token, then exchange it
      // for the VPS access and refresh tokens used by protected API requests.
      const firebaseUser = await firebaseSignInWithGoogleCredential(idToken);
      const firebaseIdToken = await firebaseUser.getIdToken(true);
      const vpsRes = await authApi.socialLogin('google', firebaseIdToken);

      // Automatically detect and assign role based on authenticated account
      const detected = detectAccountRole(userEmail);
      const userRole: UserRole = vpsRes.user?.role || detected.role;

      await setAuth({
        user: {
          id: vpsRes.user?.id || firebaseUser.uid,
          email: vpsRes.user?.email || firebaseUser.email || userEmail,
          name:
            vpsRes.user?.name ||
            firebaseUser.displayName ||
            userData?.name ||
            userEmail.split('@')[0],
          role: userRole,
          avatarUrl: userData?.photo || firebaseUser.photoURL || undefined,
          phone: vpsRes.user?.phone || '',
          tenantId:
            vpsRes.user?.tenantId ||
            currentTenant?.id ||
            '4bf37180-9e84-488e-9a03-fd2502933e94',
        },
        accessToken: vpsRes.accessToken,
        refreshToken: vpsRes.refreshToken,
      });

      setSuccessMessage(
        `Signed In As ${vpsRes.user?.name || firebaseUser.displayName || userEmail} • ${
          detected.label
        }`
      );
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled picker
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setErrorMessage('Sign-In Already In Progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage('Google Play Services Not Available');
      } else if (err.message && err.message.includes('DEVELOPER_ERROR')) {
        setErrorMessage('Google Account detected. Register your debug SHA-1 in Firebase Console to finalize cloud token.');
      } else {
        setErrorMessage(err.message || 'Google Authentication Failed. Please Try Again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Live Platform (hotspotwispman) + Operator Email & Password Login
  const handleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !password || password.length < 6) {
      setErrorMessage('Please Enter A Valid Email / Password');
      return;
    }

    setLoading(true);
    try {
      let loggedIn = false;

      // 1. Authenticate against Live VPS Backend (hotspotwispman production system)
      try {
        const vpsRes = await authApi.platformLogin({ email: cleanEmail, password });
        if (vpsRes?.accessToken && vpsRes?.user) {
          await setAuth({
            user: vpsRes.user,
            accessToken: vpsRes.accessToken,
            refreshToken: vpsRes.refreshToken,
          });
          // Load real tenants from VPS after login
          loadTenants().catch(() => {});
          const detected = detectAccountRole(cleanEmail);
          setSuccessMessage(`Signed In As ${vpsRes.user.name || vpsRes.user.email} • ${detected.label}`);
          loggedIn = true;
        }
      } catch (vpsErr: any) {
        console.log('[Auth] Live VPS auth notice:', vpsErr.message);
      }

      // 2. Fallback to Firebase / Authorized Operator Registry
      if (!loggedIn) {
        const fbUser = await firebaseSignIn(cleanEmail, password);
        const detected = detectAccountRole(cleanEmail);
        const userRole: UserRole = fbUser.role || detected.role;
        const displayName = fbUser.displayName || cleanEmail.split('@')[0];
        const userPhone = fbUser.phoneNumber || '+254 700 000 000';

        const idToken = (await fbUser.getIdToken?.()) || `fb-tok-${Date.now()}`;
        await setAuth({
          user: {
            id: fbUser.uid,
            email: fbUser.email || cleanEmail,
            name: displayName,
            role: userRole,
            phone: userPhone,
            tenantId: currentTenant?.id || '4bf37180-9e84-488e-9a03-fd2502933e94',
          },
          accessToken: idToken,
          refreshToken: fbUser.refreshToken,
        });
        setSuccessMessage(`Signed In As ${displayName} • ${detected.label}`);
      }

      // Prompt for biometric setup if hardware supported and not already enabled
      if (bioSupported && !isBiometricEnabled) {
        Alert.alert(
          'Enable Biometric Login?',
          'Would you like to enable Face ID / Fingerprint authentication for instant sign-in next time?',
          [
            { text: 'Skip', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async () => {
                const bioSuccess = await promptBiometricAuth(
                  'Verify biometric identity to enable fast login'
                );
                if (bioSuccess) {
                  await setBiometricEnabled(true);
                }
              },
            },
          ]
        );
      }
    } catch (err: any) {
      // Extract a human-readable message from VPS or Firebase errors
      let msg = 'Authentication failed. Please verify your credentials.';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        // Map common VPS error messages to user-friendly text
        const raw: string = err.message;
        if (raw.includes('locked')) {
          msg = '⚠️ Too many failed attempts. Account is temporarily locked — try again in 15 minutes.';
        } else if (raw.includes('Invalid email or password')) {
          msg = 'Invalid email or password. Please try again.';
        } else if (raw.includes('deactivated')) {
          msg = 'Your account has been deactivated. Contact the administrator.';
        } else if (raw.includes('awaiting')) {
          msg = 'Your account is pending approval by the Platform Administrator.';
        } else if (err.code) {
          msg = getFirebaseErrorMessage(err.code);
        } else {
          msg = raw;
        }
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase User Registration
  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid work email.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPass) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const user = await firebaseRegisterUser(
        regFullName,
        regEmail,
        regPassword,
        regPhone
      );

      // Sync with local session store
      await setAuth({
        user: {
          id: user.uid,
          email: user.email || regEmail,
          name: regFullName,
          role: regRole,
          phone: regPhone || '+254 700 000 000',
          tenantId: currentTenant?.id || '',
        },
        accessToken: (await user.getIdToken?.()) || `fb-tok-${Date.now()}`,
        refreshToken: user.refreshToken || `fb-ref-${Date.now()}`,
      });

      setSuccessMessage('Account registered successfully! Redirecting...');
    } catch (err: any) {
      const msg = err.code ? getFirebaseErrorMessage(err.code) : err.message;
      setErrorMessage(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase Password Recovery
  const handlePasswordRecovery = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive reset instructions.');
      return;
    }

    setLoading(true);
    try {
      await firebaseSendPasswordReset(recoveryEmail);
      setRecoverySent(true);
      setSuccessMessage(
        `A password reset link has been dispatched to ${recoveryEmail}. Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      // If demo mode or firebase mock, show pleasant confirmation
      if (err.code === 'auth/user-not-found') {
        setErrorMessage('No STARGAZE operator account found matching that email.');
      } else {
        const msg = err.code ? getFirebaseErrorMessage(err.code) : err.message;
        setErrorMessage(msg || 'Failed to dispatch reset email. Please contact NOC support.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Biometric Instant Unlock
  const handleBiometricUnlock = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      if (!isBiometricEnabled) {
        setErrorMessage('Please Sign In With Your Password Once To Enable Biometrics');
        return;
      }
      const success = await loginWithBiometrics();
      if (!success) {
        setErrorMessage('Biometric Authentication Failed Or Canceled');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Biometric Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo & Branding */}
          <View style={styles.brandingBox}>
            <View style={styles.iconGlowRing}>
              <Ionicons name="planet" size={38} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.brandTitle}>STARGAZE</Text>
            <Text style={styles.brandTagline}>ISP & Hotspot Enterprise Platform</Text>

            {/* Gateway & Tenant Indicator */}
            <View style={styles.badgeRow}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {currentTenant ? currentTenant.name : 'Nairobi Central Core ISP'}
                </Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => switchMode('LOGIN')}
              style={[styles.tabButton, authMode === 'LOGIN' && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-in-outline"
                size={16}
                color={authMode === 'LOGIN' ? COLORS.primaryLight : COLORS.textSecondary}
              />
              <Text
                style={[styles.tabButtonText, authMode === 'LOGIN' && styles.tabButtonTextActive]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchMode('REGISTER')}
              style={[styles.tabButton, authMode === 'REGISTER' && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-add-outline"
                size={16}
                color={authMode === 'REGISTER' ? COLORS.primaryLight : COLORS.textSecondary}
              />
              <Text
                style={[styles.tabButtonText, authMode === 'REGISTER' && styles.tabButtonTextActive]}
              >
                Register
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchMode('RECOVERY')}
              style={[styles.tabButton, authMode === 'RECOVERY' && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="key-outline"
                size={16}
                color={authMode === 'RECOVERY' ? COLORS.primaryLight : COLORS.textSecondary}
              />
              <Text
                style={[styles.tabButtonText, authMode === 'RECOVERY' && styles.tabButtonTextActive]}
              >
                Recovery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Banners */}
          {authMode !== 'LOGIN' && errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.rose} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: LOGIN VIEW */}
          {/* ========================================================================= */}
          {authMode === 'LOGIN' && (
            <Card variant="glass" style={styles.formCard}>
              <Text style={styles.cardHeader}>Operator Authentication</Text>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={openGoogleSignIn}
                disabled={loading || googleLoading}
                style={styles.googleButton}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                    <Text style={styles.googleButtonText}>Sign In with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Visual Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR SIGN IN WITH EMAIL</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Automatic Role Assignment Indicator */}
              <View
                style={[
                  styles.autoRoleBanner,
                  email.trim().length > 0 && {
                    borderColor: `${detectedRole.badgeColor}60`,
                    backgroundColor: `${detectedRole.badgeColor}12`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.autoRoleIconBox,
                    {
                      backgroundColor:
                        email.trim().length > 0
                          ? `${detectedRole.badgeColor}25`
                          : 'rgba(99, 102, 241, 0.15)',
                    },
                  ]}
                >
                  <Ionicons
                    name={email.trim().length > 0 ? (detectedRole.icon as any) : 'shield-checkmark'}
                    size={16}
                    color={email.trim().length > 0 ? detectedRole.badgeColor : COLORS.primaryLight}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.autoRoleHeaderRow}>
                    <Text style={styles.autoRoleTitle}>
                      {email.trim().length > 0 ? 'AUTOMATIC ROLE DETECTED:' : 'AUTOMATIC ROLE ASSIGNMENT'}
                    </Text>
                    {email.trim().length > 0 && (
                      <View style={[styles.autoRoleTag, { backgroundColor: detectedRole.badgeColor }]}>
                        <Text style={styles.autoRoleTagText}>{detectedRole.label.toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.autoRoleDesc} numberOfLines={1}>
                    {email.trim().length > 0
                      ? detectedRole.scopeDesc
                      : 'Role & permissions are determined automatically from your verified account.'}
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Engineer / Admin Email</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
                    <TextInput
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setErrorMessage(null);
                      }}
                      placeholder="operator@stargaze.net"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TouchableOpacity onPress={() => switchMode('RECOVERY')}>
                      <Text style={styles.forgotLink}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
                    <TextInput
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        setErrorMessage(null);
                      }}
                      placeholder="Enter secure password"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inline Error Presented Directly Under Email / Password Inputs */}
                {errorMessage && (
                  <View style={styles.inlineErrorBox}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.rose} />
                    <Text style={styles.inlineErrorText}>{errorMessage}</Text>
                  </View>
                )}

                <Button
                  title="SIGN IN"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.actionBtn}
                />

                {/* Biometric Quick Login (Available whenever device has biometric hardware) */}
                {bioSupported && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleBiometricUnlock}
                    disabled={loading}
                    style={styles.bioButton}
                  >
                    <View style={styles.bioIconBox}>
                      <MaterialCommunityIcons
                        name="fingerprint"
                        size={24}
                        color={COLORS.emerald}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bioTitle}>Unlock With Biometrics</Text>
                      <Text style={styles.bioSub}>Instant One Touch Sign In</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}

                {/* Collapsible Quick-Fill for Demo / Testing */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowQuickFill(!showQuickFill)}
                  style={styles.quickFillToggle}
                >
                  <Ionicons
                    name={showQuickFill ? 'chevron-up-circle-outline' : 'flash-outline'}
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.quickFillToggleText}>
                    {showQuickFill
                      ? 'Hide Quick-Fill Test Accounts'
                      : 'Need to test a role? Quick-fill test credentials'}
                  </Text>
                </TouchableOpacity>

                {showQuickFill && (
                  <View style={styles.quickAccountsContainer}>
                    <Text style={styles.quickAccountsHeader}>
                      TAP AN ACCOUNT TO QUICK-FILL (ROLE APPLIES AUTOMATICALLY):
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.quickAccountsScroll}
                    >
                      {QUICK_OPERATOR_ACCOUNTS.map((acc) => {
                        const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={acc.email}
                            activeOpacity={0.75}
                            onPress={() => {
                              setEmail(acc.email);
                              setPassword(acc.password);
                              setErrorMessage(null);
                            }}
                            style={[
                              styles.quickAccountCard,
                              isSelected && {
                                borderColor: acc.badgeColor,
                                backgroundColor: `${acc.badgeColor}20`,
                              },
                            ]}
                          >
                            <View style={styles.quickAccountTop}>
                              <Ionicons name={acc.icon as any} size={14} color={acc.badgeColor} />
                              <Text
                                style={[
                                  styles.quickAccountRole,
                                  { color: isSelected ? acc.badgeColor : COLORS.text },
                                ]}
                              >
                                {acc.label}
                              </Text>
                            </View>
                            <Text style={styles.quickAccountDesc}>{acc.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.footerPrompt}>Need a new field account? </Text>
                  <TouchableOpacity onPress={() => switchMode('REGISTER')}>
                    <Text style={styles.footerLink}>Register here</Text>
                  </TouchableOpacity>
                </View>
              </Card>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REGISTER VIEW */}
          {/* ========================================================================= */}
          {authMode === 'REGISTER' && (
            <Card variant="glass" style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.primaryLight} />
                <Text style={[styles.cardHeader, { marginBottom: 0, marginLeft: 8 }]}>
                  New Operator Registration
                </Text>
              </View>
              <Text style={styles.cardSubheader}>
                Create an authorized technician or tenant admin profile
              </Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regFullName}
                    onChangeText={setRegFullName}
                    placeholder="e.g. Kiprono Kimani"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Organization / Tenant */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ISP Organization / Branch</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regOrgName}
                    onChangeText={setRegOrgName}
                    placeholder="e.g. Stargaze Westlands NOC"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Work Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Official Work Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regEmail}
                    onChangeText={setRegEmail}
                    placeholder="engineer@stargaze.net"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Technician Mobile (SMS Dispatch)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regPhone}
                    onChangeText={handlePhoneChange}
                    placeholder="+254 700 000 000"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Permission Tier</Text>
                <View style={styles.rolePickerRow}>
                  <TouchableOpacity
                    onPress={() => setRegRole('TECHNICIAN')}
                    style={[
                      styles.roleChip,
                      regRole === 'TECHNICIAN' && styles.roleChipActive,
                    ]}
                  >
                    <Ionicons
                      name="construct-outline"
                      size={16}
                      color={regRole === 'TECHNICIAN' ? COLORS.primaryLight : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleChipText,
                        regRole === 'TECHNICIAN' && styles.roleChipTextActive,
                      ]}
                    >
                      Field Engineer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRegRole('TENANT_ADMIN')}
                    style={[
                      styles.roleChip,
                      regRole === 'TENANT_ADMIN' && styles.roleChipActive,
                    ]}
                  >
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={regRole === 'TENANT_ADMIN' ? COLORS.primaryLight : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleChipText,
                        regRole === 'TENANT_ADMIN' && styles.roleChipTextActive,
                      ]}
                    >
                      Branch Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Create Password (Min 6 Chars)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regPassword}
                    onChangeText={setRegPassword}
                    placeholder="Choose secure passphrase"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showRegPassword}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowRegPassword(!showRegPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    value={regConfirmPass}
                    onChangeText={setRegConfirmPass}
                    placeholder="Re-enter password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showRegPassword}
                    style={styles.input}
                  />
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.actionBtn}
              />

              <View style={styles.cardFooter}>
                <Text style={styles.footerPrompt}>Already have credentials? </Text>
                <TouchableOpacity onPress={() => switchMode('LOGIN')}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PASSWORD RECOVERY VIEW */}
          {/* ========================================================================= */}
          {authMode === 'RECOVERY' && (
            <Card variant="glass" style={styles.formCard}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="key" size={22} color={COLORS.amber} />
                <Text style={[styles.cardHeader, { marginBottom: 0, marginLeft: 8 }]}>
                  Password Recovery
                </Text>
              </View>
              <Text style={styles.cardSubheader}>
                Enter your registered ISP engineer email to receive an automated password reset link
              </Text>

              {!recoverySent ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Registered Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
                      <TextInput
                        value={recoveryEmail}
                        onChangeText={(val) => {
                          setRecoveryEmail(val);
                          setErrorMessage(null);
                        }}
                        placeholder="operator@stargaze.net"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <Button
                    title="Send Reset Link"
                    onPress={handlePasswordRecovery}
                    loading={loading}
                    style={styles.actionBtn}
                  />
                </>
              ) : (
                <View style={styles.recoverySuccessBox}>
                  <View style={styles.recoveryIconCircle}>
                    <Ionicons name="mail-open-outline" size={36} color={COLORS.emerald} />
                  </View>
                  <Text style={styles.recoverySuccessTitle}>Reset Email Dispatched</Text>
                  <Text style={styles.recoverySuccessText}>
                    Instructions have been sent to <Text style={{ color: COLORS.text, fontWeight: '700' }}>{recoveryEmail}</Text>.
                    Open the link on your mobile browser or PC to configure a new password.
                  </Text>
                  <Button
                    title="Resend Link"
                    variant="secondary"
                    onPress={() => setRecoverySent(false)}
                    style={{ marginTop: SPACING.md }}
                  />
                </View>
              )}

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => switchMode('LOGIN')}
                  style={styles.backToLoginRow}
                >
                  <Ionicons name="arrow-back" size={16} color={COLORS.primaryLight} />
                  <Text style={styles.backToLoginText}>Return to Sign In</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <Text style={styles.securityNote}>
            🔒 Secured with Enterprise Role-Based Access Control & AES-256 Storage
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 0,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : SPACING.xl,
    paddingBottom: 48,
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconGlowRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 8,
  },
  firebaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 130, 13, 0.12)',
    borderColor: 'rgba(245, 130, 13, 0.35)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    gap: 4,
  },
  firebaseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F5820D',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 3,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.primaryLight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.emerald,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  formCard: {
    padding: SPACING.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  cardSubheader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    height: 44,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  eyeBtn: {
    padding: 6,
  },
  actionBtn: {
    marginTop: SPACING.sm,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    gap: 6,
  },
  roleChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: COLORS.primaryLight,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    color: COLORS.primaryLight,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  bioIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  bioSub: {
    fontSize: 10,
    color: COLORS.emerald,
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerPrompt: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  recoverySuccessBox: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  recoveryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  recoverySuccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  recoverySuccessText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  backToLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  securityNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  googleModalContent: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  googleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: 8,
  },
  modalErrorText: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: SPACING.xs,
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  inlineErrorText: {
    color: COLORS.rose,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    flex: 1,
  },
  googleAccountsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  googleAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleAvatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  googleAccountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  googleAccountName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  googleAccountEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  googleAccountSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 62,
  },
  googleCustomSection: {
    marginTop: SPACING.xs,
  },
  googleUseAnotherText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  quickAccountsContainer: {
    marginBottom: SPACING.md,
  },
  quickAccountsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  quickAccountsScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  quickAccountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 112,
  },
  quickAccountTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  quickAccountRole: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickAccountDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  autoRoleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 10,
  },
  autoRoleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoRoleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  autoRoleTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  autoRoleTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  autoRoleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  autoRoleDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  quickFillToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickFillToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default LoginScreen;
