import { useQuery } from "@tanstack/react-query";
import { adminOrderAPI } from "../services/api";

export const useOrders = (status) => {
  return useQuery({
    queryKey: ["admin-orders", status],
    queryFn: async () => {
      const res = await adminOrderAPI.getAll(
        status === "all" ? {} : { orderStatus: status }
      );
      return res.data; // 🔥 BẮT BUỘC
    },
    keepPreviousData: true,
  });
};