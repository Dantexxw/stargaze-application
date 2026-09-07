import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { OperationsScreen } from '../screens/operations/OperationsScreen';
import { CustomersPaymentsScreen } from '../screens/customers/CustomersPaymentsScreen';
import { SettingsProfileScreen } from '../screens/settings/SettingsProfileScreen';
import { COLORS, SPACING } from '../theme/Theme';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Operations"
        component={OperationsScreen}
        options={{
          tabBarLabel: 'Live Operations',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'git-network' : 'git-network-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Customers"
        component={CustomersPaymentsScreen}
        options={{
          tabBarLabel: 'M-Pesa Revenue',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="money-bill-wave" size={size - 4} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsProfileScreen}
        options={{
          tabBarLabel: 'Settings & Dispatch',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.sm,
    paddingTop: SPACING.xs,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

export default TabNavigator;
