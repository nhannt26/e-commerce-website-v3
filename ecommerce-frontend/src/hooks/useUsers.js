import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../services/user.api";
import toast from "react-hot-toast";

export const useUsers = (search) => {
  return useQuery({
    queryKey: ["users", search],
    queryFn: () => userAPI.getUsers(search),
    keepPreviousData: true,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateUserRole,
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });
};
