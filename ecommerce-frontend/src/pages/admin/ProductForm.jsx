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
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(id);

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  console.log(categories);
  const {
    register,
    handleSubmit,
    setValue,
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
    if (isEdit && product) {
      setValue("name", product.name);
      setValue("sku", product.sku);
      setValue("category", product.category?._id || "");
      setValue("description", product.description || "");
      setValue("price", product.price);
      setValue("discount", product.discount || 0);
      setValue("stock", product.stock);
      setValue("isActive", product.isActive);
    }
  }, [isEdit, product, setValue]);

  // Prefill when editing
  if (isEdit && product) {
    Object.entries(product).forEach(([key, value]) => {
      setValue(key, value);
    });
  }

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();

      // Text fields
      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("category", formData.category);
      data.append("description", formData.description || "");
      data.append("price", formData.price);
      data.append("discount", formData.discount || 0);
      data.append("stock", formData.stock);
      data.append("isActive", formData.isActive);

      // Images
      if (formData.images?.length) {
        formData.images.forEach((file) => {
          data.append("images", file);
        });
      }

      if (isEdit) {
        await updateProduct.mutateAsync(data);
        toast.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Product created successfully");
      }

      navigate("/admin/products");
    } catch (error) {
      console.error(error);
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
              {...register("sku")}
              error={!!errors.sku}
              helperText={errors.sku?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Category"
              fullWidth
              defaultValue=""
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={loadingCategories}
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
            <FormControlLabel control={<Checkbox defaultChecked {...register("isActive")} />} label="Active" />
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
