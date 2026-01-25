import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateProduct, useUpdateProduct, useProduct } from "../../hooks/useProducts";
import ImageUpload from "../../components/admin/ImageUpload";
import toast from "react-hot-toast";
import { useCategories } from "../../hooks/useCategories";
import { useEffect } from "react";

const schema = yup.object({
  name: yup.string().required("Product name is required"),
  sku: yup.string().required("SKU is required"),
  category: yup.string().required("Category is required"),
  description: yup.string(),
  price: yup.number().typeError("Price must be a number").required("Price is required").min(0),
  discount: yup.number().typeError("Discount must be a number").min(0).max(100).default(0),
  stock: yup.number().typeError("Stock must be a number").required("Stock is required").min(0),
  isActive: yup.boolean(),
});

export default function ProductForm() {
  const { id } = useParams(); // edit mode if exists
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id);
  console.log(product);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(() => {
    navigate("/admin/products");
  });

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  console.log(categories);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 0,
      images: [],
      isActive: true,
    },
  });

  useEffect(() => {
    register("images");
  }, [register]);

  useEffect(() => {
    if (isEdit && product && categories.length) {
      reset({
        name: product.name,
        sku: product.sku,
        category: typeof product.category === "object" ? product.category._id : product.category,
        description: product.description,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        isActive: product.isActive,
      });
      console.log(product.sku);
    }
  }, [isEdit, product, categories, reset]);

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("description", formData.description || "");
      data.append("price", Number(formData.price));
      data.append("discount", Number(formData.discount || 0));
      data.append("stock", Number(formData.stock));
      data.append("isActive", formData.isActive ? "true" : "false");

      if (formData.images?.length) {
        formData.images.forEach((file) => {
          data.append("images", file);
        });
      }

      if (!isEdit) {
        data.append("sku", formData.sku);
      }

      if (isEdit) {
        await updateProduct.mutateAsync({ id, data });
        toast.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Product created successfully");
      }
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to create/update product");
    }
  };

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {isEdit ? "Edit Product" : "Create Product"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Product Name"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="SKU"
              fullWidth
              value={product?.sku}
              {...register("sku")}
              disabled={isEdit}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Category"
              fullWidth
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={loadingCategories || isEdit}
            >
              <MenuItem value="">
                <em>Select category</em>
              </MenuItem>

              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField label="Description" multiline rows={4} fullWidth {...register("description")} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              {...register("price")}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Discount (%)"
              type="number"
              fullWidth
              {...register("discount")}
              error={!!errors.discount}
              helperText={errors.discount?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Stock"
              type="number"
              fullWidth
              {...register("stock")}
              error={!!errors.stock}
              helperText={errors.stock?.message}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ImageUpload onChange={(files) => setValue("images", files)} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel control={<Checkbox {...register("isActive")} />} label="Active" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button type="submit" variant="contained" disabled={createProduct.isLoading || updateProduct.isLoading}>
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
