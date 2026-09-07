import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { TenantProvider } from './src/state/TenantContext';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});

function MainApp() {
  // Initialize Push Notification listeners and device registration at root
  usePushNotifications();

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" backgroundColor="#0B0F19" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <MainApp />
        </TenantProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
