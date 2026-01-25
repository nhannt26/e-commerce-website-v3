import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminProductAPI, productAPI } from "../services/api";
import toast from "react-hot-toast";

// Get all products
export function useProducts(filters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productAPI.getAll(filters).then((res) => res.data),
  });
}

// Get single product
export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await productAPI.getById(id);
      return res.data.data; // 👈 chỉ return product
    },
    enabled: !!id, // Only run if id exists
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => adminProductAPI.create(productData),
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });
}

// Update product
export function useUpdateProduct(onSuccessCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminProductAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });

      toast.success("Product updated successfully");
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });
}
// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminProductAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
}
