import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function navigateToTab(tabName: 'Dashboard' | 'Operations' | 'Customers' | 'Settings') {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: tabName } as any);
  }
}
