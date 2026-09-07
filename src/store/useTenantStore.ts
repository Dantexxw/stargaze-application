import { create } from 'zustand';
import { Tenant } from '../types/models';
import { secureStorage } from '../utils/secureStorage';
import { STORAGE_KEYS } from '../constants/config';

interface TenantState {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setCurrentTenant: (tenant: Tenant) => Promise<void>;
  setTenants: (tenants: Tenant[]) => void;
  loadPersistedTenant: () => Promise<void>;
}

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tenant-main-nairobi',
    name: 'Nairobi Central Core ISP',
    code: 'NBO-01',
    region: 'Nairobi CBD & Westlands',
    activeRouters: 24,
    activeSubscribers: 1420,
    isPrimary: true,
  },
  {
    id: 'tenant-coast-mombasa',
    name: 'Mombasa Coastal Hub',
    code: 'MBA-02',
    region: 'Coast & Nyali Beach',
    activeRouters: 12,
    activeSubscribers: 680,
  },
  {
    id: 'tenant-rift-eldoret',
    name: 'Eldoret Agri-Net Hotspots',
    code: 'ELD-03',
    region: 'Rift Valley & University Area',
    activeRouters: 8,
    activeSubscribers: 410,
  },
];

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: DEFAULT_TENANTS[0],
  tenants: DEFAULT_TENANTS,
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
}));
