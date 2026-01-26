import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderAPI } from "../services/api";
import toast from "react-hot-toast";

export const useOrders = (status) => {
  return useQuery({
    queryKey: ["admin-orders", status],
    queryFn: async () => {
      const res = await adminOrderAPI.getAll(status === "all" ? {} : { orderStatus: status });
      console.log("queryKey:", ["orders", status]);
      return res.data; // 🔥 BẮT BUỘC
    },
    keepPreviousData: true,
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminOrderAPI.deleteOrder(id),

    onSuccess: (_, deletedId) => {
      toast.success("Order deleted");

      // 🔥 LẤY ĐÚNG CACHE admin-orders
      const queries = queryClient.getQueryCache().findAll({ queryKey: ["admin-orders"] });

      queries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (oldData) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.filter((order) => order._id !== deletedId),
          };
        });
      });
    },

    onError: () => {
      toast.error("Delete order failed");
    },
  });
};
