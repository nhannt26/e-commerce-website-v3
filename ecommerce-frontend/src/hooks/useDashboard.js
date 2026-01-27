import { useQuery } from "@tanstack/react-query";
import { adminDashboardAPI } from "../services/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () =>
      adminDashboardAPI.getStats().then((res) => {
        const data = res.data.data;

        return {
          metrics: {
            totalRevenue: data.summary.totalRevenue,
            monthlyRevenue: data.summary.totalRevenue, // tạm, hoặc tính riêng
            totalOrders: data.summary.totalTransactions,
            totalProducts: 0, // nếu chưa có
          },
          revenueByDay: data.revenueByDay,
        };
      }),
  });
}
