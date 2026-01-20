import { useQuery } from "@tanstack/react-query";
import { categoryAPI } from "../services/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryAPI.getAll().then((res) => res.data.data),
  });
};
