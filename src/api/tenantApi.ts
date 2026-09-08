import { apiClient } from './ApiClient';
import { Tenant } from '../types/models';

/** Maps a VPS tenant record → the app Tenant type */
function mapVpsTenant(vps: any, index: number): Tenant {
  return {
    id: vps.id,
    name: vps.name || vps.slug || `Tenant ${index + 1}`,
    code: vps.slug?.toUpperCase().slice(0, 6) || `ISP-${index + 1}`,
    region: vps.city || vps.region || vps.country || 'Kenya',
    activeRouters: vps._count?.routers ?? vps.routerLimit ?? 0,
    activeSubscribers: vps._count?.customers ?? vps.customerLimit ?? 0,
    isPrimary: index === 0,
  };
}

export const tenantApi = {
  getTenants: async (): Promise<Tenant[]> => {
    try {
      const response = await apiClient.get<any>('/tenants');
      const raw: any[] = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? []);
      return raw.map(mapVpsTenant);
    } catch (err: any) {
      console.warn('[tenantApi] Failed to fetch tenants from VPS:', err?.message || err);
      return [];
    }
  },
};
