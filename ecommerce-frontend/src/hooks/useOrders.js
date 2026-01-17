import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "../services/api";

export const useOrders = (status) => {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => orderAPI.getAll(status),
    keepPreviousData: true,
  });
};
