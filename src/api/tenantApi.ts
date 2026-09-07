import { apiClient } from './ApiClient';
import { ApiResponse } from '../types/api';
import { Tenant } from '../types/models';

export const tenantApi = {
  getTenants: async (): Promise<Tenant[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Tenant[]>>('/tenants');
      return response.data.data;
    } catch {
      return [
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
    }
  },
};
