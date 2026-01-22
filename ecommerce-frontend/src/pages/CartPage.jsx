import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, ShoppingCart as CartIcon } from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  console.log(cart);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      await removeItem(productId);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CartIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add some products to get started!
          </Typography>
          <Button variant="contained" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item._id}>
                    {/* Product Info */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={item.product?.images?.[0] || "/placeholder.jpg"}
                          alt={item.product?.name || "Product"}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            marginRight: 16,
                            borderRadius: 4,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1">{item.product?.name || "Loading..."}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.product?.sku || ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>

                    {/* Quantity */}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                          inputProps={{
                            min: 1,
                            max: item.product?.stock ?? 99,
                            style: { textAlign: "center" },
                          }}
                          sx={{ width: 60, mx: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={item.product ? item.quantity >= item.product.stock : false}
                        >
                          +
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </TableCell>

                    {/* Remove */}
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleRemove(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
            <Button color="error" onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatPrice(cart.pricing?.subtotal || 0)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>{formatPrice(cart.pricing?.shipping || 0)}</Typography>
              </Box>
              {cart.pricing?.discount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="error">Discount:</Typography>
                  <Typography color="error">-{formatPrice(cart.pricing.discount)}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(cart.pricing?.total)}
              </Typography>
            </Box>

            <Button variant="contained" fullWidth size="large" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
