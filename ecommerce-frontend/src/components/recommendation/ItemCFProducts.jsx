import { Box, Typography, CircularProgress, Grid } from "@mui/material";
import { useEffect } from "react";
import { useRecommendation } from "../../hooks/useRecommendation";
import ProductCard from "../product/ProductCard";
import { useAuth } from "../../context/AuthContext"; // ví dụ

export default function ItemCFProducts() {
  const { user } = useAuth(); // user._id
  const { products, source, loading } = useRecommendation(user?._id, 8);

  // ✅ LOG ĐÚNG – để debug
  useEffect(() => {
    console.log("Recommend", products, source);
  }, [products, source]);

  // ❌ Chưa login → không gọi recommend
  if (!user) return null;

  // ⏳ Loading
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ❌ Không có sản phẩm
  if (!products || products.length === 0) return null;

  return (
    <Box sx={{ mt: 6 }}>
      {/* ===== TITLE ===== */}
      <Typography variant="h5" fontWeight={600} mb={2}>
        {source === "personalized" ? "Recommended for you" : "Popular products"}
      </Typography>
      {/* ===== PRODUCT LIST ===== */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
