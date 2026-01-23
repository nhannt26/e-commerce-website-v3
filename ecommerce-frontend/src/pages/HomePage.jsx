import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { productAPI, categoryAPI } from "../services/api";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([productAPI.getAll({featured: true, limit: 8 }), categoryAPI.getAll()]);

        setProducts(productRes.data.data || []);
        setCategories(categoryRes.data.data || []);
      } catch (error) {
        console.error("Failed to load homepage data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ================= HERO ================= */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 10,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold" mb={2}>
          Welcome to Our Store
        </Typography>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Discover Amazing Products
        </Typography>

        <Typography variant="h6" color="grey.300" mb={4}>
          Shop the best products at the best prices
        </Typography>

        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/products"
          sx={{ bgcolor: "white", color: "primary.main" }}
        >
          Shop Now
        </Button>
      </Box>

      {/* ================= FEATURED PRODUCTS ================= */}
      <Container sx={{ py: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight="bold">
            Featured Products
          </Typography>
          <Button component={RouterLink} to="/products">
            View All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {Array.isArray(products) &&
            products.map((product) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={product._id}>
                <Card
                  component={RouterLink}
                  to={`/products/${product._id}`}
                  sx={{
                    textDecoration: "none",
                    height: "100%",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Container>

      {/* ================= CATEGORIES ================= */}
      <Container sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
          Shop by Category
        </Typography>

        <Grid container spacing={3}>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={category._id}>
                <Card
                  component={RouterLink}
                  to={`/products?category=${category._id}`}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    textDecoration: "none",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="600">
                    {category.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Container>

      {/* ================= CTA ================= */}
      <Box textAlign="center" pb={8}>
        <Button variant="contained" size="large" component={RouterLink} to="/products">
          View All Products
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
