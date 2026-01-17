import { useQuery } from '@tanstack/react-query';
import { adminDashboardAPI } from '../services/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminDashboardAPI.getStats().then(res => res.data)
  });
}
