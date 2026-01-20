import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminUserAPI } from "../services/api";

export const useUsers = (search) => {
  return useQuery({
    queryKey: ["users", search],
    queryFn: () => adminUserAPI.getAll(search),
    keepPreviousData: true,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminUserAPI.updateRole,
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });
};
