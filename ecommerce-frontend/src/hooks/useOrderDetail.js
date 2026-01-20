import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminOrderAPI } from "../services/api";

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => adminOrderAPI.getById(id),
    enabled: !!id,
    return: res => res.data,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminOrderAPI.updateStatus,
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
};
