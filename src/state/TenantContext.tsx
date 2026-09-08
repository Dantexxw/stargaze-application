import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { useAuthStore } from '../store/useAuthStore';
import { Tenant } from '../types/models';
import { useQueryClient } from '@tanstack/react-query';

interface TenantContextValue {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  switchTenant: (tenant: Tenant) => Promise<void>;
  accessibleTenants: Tenant[];
  isSuperAdmin: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const tenants = useTenantStore((state) => state.tenants);
  const isLoading = useTenantStore((state) => state.isLoading);
  const setCurrentTenant = useTenantStore((state) => state.setCurrentTenant);
  const loadPersistedTenant = useTenantStore((state) => state.loadPersistedTenant);
  const loadTenants = useTenantStore((state) => state.loadTenants);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    loadPersistedTenant().then(() => {
      if (isAuthenticated) {
        loadTenants();
      }
    });
  }, [loadPersistedTenant, loadTenants, isAuthenticated]);

  const accessibleTenants = tenants.filter((t) => {
    if (isSuperAdmin) return true;
    if (user?.assignedTenantIds && user.assignedTenantIds.length > 0) {
      return user.assignedTenantIds.includes(t.id);
    }
    return t.id === currentTenant?.id;
  });

  const switchTenant = async (tenant: Tenant) => {
    await setCurrentTenant(tenant);
    // Instantly invalidate TanStack Query cache across all active screens/tabs
    await queryClient.invalidateQueries();
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenants,
        isLoading,
        switchTenant,
        accessibleTenants,
        isSuperAdmin,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextValue => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;
