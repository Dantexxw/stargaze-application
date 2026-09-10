import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore } from '../store/useTenantStore';
import { SubscriberDetailScreen } from '../screens/details/SubscriberDetailScreen';
import { TransactionDetailScreen } from '../screens/details/TransactionDetailScreen';
import { setOnAuthExpired } from '../api/ApiClient';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const logout = useAuthStore((state) => state.logout);
  const loadPersistedTenant = useTenantStore((state) => state.loadPersistedTenant);
  const loadTenants = useTenantStore((state) => state.loadTenants);

  useEffect(() => {
    setOnAuthExpired(() => {
      logout();
    });
    const initialize = async () => {
      await initializeAuth();
      await loadPersistedTenant();
      if (useAuthStore.getState().isAuthenticated) {
        await loadTenants();
      }
    };
    void initialize();
  }, [initializeAuth, loadPersistedTenant, loadTenants, logout]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SubscriberDetail" component={SubscriberDetailScreen} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
