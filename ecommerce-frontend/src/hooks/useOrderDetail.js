import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOrderAPI } from "../services/api";

export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminOrderAPI.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => adminOrderAPI.updateStatus(id, status),

    onSuccess: (_, variables) => {
      // Refetch order detail
      queryClient.invalidateQueries({
        queryKey: ["admin-order", variables.id],
      });

      // Refetch order list nếu có
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
    },
  });
};
