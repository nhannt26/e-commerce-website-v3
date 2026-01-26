import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminOrderAPI } from "../services/api";

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => adminOrderAPI.getById(id),
    enabled: !!id,
    select: res => res.data.data,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      adminOrderAPI.updateStatus(id, status), // ✅ unwrap đúng
    onSuccess: (_, variables) => {
      toast.success("Order status updated");

      // refetch list & detail
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
};