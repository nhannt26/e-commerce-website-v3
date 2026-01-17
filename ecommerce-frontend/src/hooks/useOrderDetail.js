import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderAPI } from "../services/order.api";
import toast from "react-hot-toast";

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderAPI.getOrderById(id),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderAPI.updateOrderStatus,
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
