import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { productAPI } from "../services/api";
import { useCart } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      const productData = response.data.data;

      setProduct(productData);
      setSelectedImage(productData.images?.[0]);

      // Related products
      if (productData.category?._id) {
        const relatedResponse = await productAPI.getByCategory(productData.category._id, { limit: 4 });
        setRelatedProducts(relatedResponse.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box height={300} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography variant="h6">Product not found</Typography>
      </Container>
    );
  }

  /* ================= PRICE ================= */
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  /* ================= STOCK ================= */
  const stockStatus =
    product.stock === 0
      ? { label: "Out of stock", color: "error" }
      : product.stock <= 5
      ? { label: "Low stock", color: "warning" }
      : { label: "In stock", color: "success" };

  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === "inc") return Math.min(prev + 1, product.stock);
      if (type === "dec") return Math.max(prev - 1, 1);
      return prev;
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <Container sx={{ py: 6 }}>
      {/* ================= MAIN SECTION ================= */}
      <Grid container spacing={6}>
        {/* ===== LEFT: IMAGE ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box mb={2}>
            <CardMedia
              component="img"
              image={selectedImage || "/placeholder.png"}
              alt={product.name}
              sx={{
                height: 400,
                objectFit: "contain",
                borderRadius: 2,
                border: "1px solid #eee",
              }}
            />
          </Box>

          {/* Thumbnails */}
          <Stack direction="row" spacing={2}>
            {product.images?.map((img, index) => (
              <Box
                key={index}
                component="img"
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                sx={{
                  width: 70,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: selectedImage === img ? "2px solid" : "1px solid #ddd",
                  borderColor: selectedImage === img ? "primary.main" : "#ddd",
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>
        </Grid>

        {/* ===== RIGHT: INFO ===== */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {product.name}
          </Typography>

          {/* Rating */}
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Rating value={product.rating || 0} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary">
              ({product.numReviews || 0} reviews)
            </Typography>
            <Button size="small" component="a" href="#reviews">
              View reviews
            </Button>
          </Stack>

          {/* Price */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${hasDiscount ? product.discountPrice : product.price}
            </Typography>

            {hasDiscount && (
              <>
                <Typography variant="body1" sx={{ textDecoration: "line-through", color: "gray" }}>
                  ${product.price}
                </Typography>
                <Chip label={`-${discountPercent}%`} color="error" size="small" />
              </>
            )}
          </Stack>

          {/* Stock */}
          <Chip label={stockStatus.label} color={stockStatus.color} sx={{ mb: 3 }} />

          {/* Quantity */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Typography>Quantity</Typography>
            <IconButton onClick={() => handleQuantityChange("dec")}>
              <Remove />
            </IconButton>
            <Typography>{quantity}</Typography>
            <IconButton onClick={() => handleQuantityChange("inc")}>
              <Add />
            </IconButton>
          </Stack>

          {/* Add to cart */}
          <Button variant="contained" size="large" fullWidth disabled={product.stock === 0} onClick={handleAddToCart}>
            Add to Cart
          </Button>

          <Divider sx={{ my: 4 }} />

          {/* Description */}
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          {product.description?.split("\n").map((paragraph, index) => (
            <Typography key={index} paragraph>
              {paragraph}
            </Typography>
          ))}
        </Grid>
      </Grid>

      {/* ================= SPECIFICATIONS ================= */}
      {product.specifications && (
        <Box mt={8}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Specifications
          </Typography>

          <Table>
            <TableBody>
              {Object.entries(product.specifications).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ================= RELATED PRODUCTS ================= */}
      {relatedProducts.length > 0 && (
        <Box mt={10}>
          <Typography variant="h5" fontWeight="bold" mb={4}>
            Related Products
          </Typography>

          <Grid container spacing={3}>
            {relatedProducts.map((item) => (
              <Grid size={{ xs: 6, sm: 3 }} key={item._id}>
                <Card
                  component={RouterLink}
                  to={`/products/${item._id}`}
                  sx={{
                    textDecoration: "none",
                    height: "100%",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={item.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" noWrap>
                      {item.name}
                    </Typography>
                    <Typography color="primary" fontWeight="bold">
                      ${item.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailPage;
