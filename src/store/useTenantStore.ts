import { create } from 'zustand';
import { Tenant } from '../types/models';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/config';
import { tenantApi } from '../api/tenantApi';

interface TenantState {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setCurrentTenant: (tenant: Tenant) => Promise<void>;
  setTenants: (tenants: Tenant[]) => void;
  loadPersistedTenant: () => Promise<void>;
  loadTenants: () => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: null,
  tenants: [],
  isLoading: false,

  setCurrentTenant: async (tenant: Tenant) => {
    set({ currentTenant: tenant });
    await secureStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, JSON.stringify(tenant));
  },

  setTenants: (tenants: Tenant[]) => {
    set({ tenants });
  },

  loadPersistedTenant: async () => {
    try {
      const persisted = await secureStorage.getItem(STORAGE_KEYS.CURRENT_TENANT);
      if (persisted) {
        const parsed = JSON.parse(persisted) as Tenant;
        set({ currentTenant: parsed });
      }
    } catch (err) {
      console.warn('[useTenantStore] Failed to load persisted tenant', err);
    }
  },

  loadTenants: async () => {
    set({ isLoading: true });
    try {
      const tenants = await tenantApi.getTenants();
      set({ tenants, isLoading: false });
      // Auto-select STARGAZE pilot tenant if available, or first tenant
      const activeCurrent = get().currentTenant;
      if (!activeCurrent || activeCurrent.id === 'a9f3e6c5-16af-481c-ad23-66562c4cb217') {
        const pilot = tenants.find((t) => t.name.toUpperCase().includes('STARGAZE')) || tenants[0];
        if (pilot) {
          await get().setCurrentTenant(pilot);
        }
      }
    } catch (err) {
      console.warn('[useTenantStore] Failed to load tenants from VPS', err);
      set({ isLoading: false });
    }
  },
}));
