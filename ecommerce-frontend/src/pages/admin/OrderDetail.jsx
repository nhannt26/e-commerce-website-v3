import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useOrderDetail, useUpdateOrderStatus } from "../../hooks/useOrderDetail";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useOrderDetail(id);
  const updateStatus = useUpdateOrderStatus();

  const order = data?.data;
  const [editedStatus, setEditedStatus] = useState(null);

  if (isLoading) return <CircularProgress />;
  if (!order) return null;

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Order #{order.orderNumber}
      </Typography>

      <Grid container spacing={2}>
        {/* Order Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Order Information</Typography>
              <Typography>Date: {new Date(order.createdAt).toLocaleString()}</Typography>
              <Typography>
                Payment Status:{" "}
                <Chip
                  label={order.paymentStatus}
                  color={order.paymentStatus === "paid" ? "success" : "warning"}
                  size="small"
                />
              </Typography>
              <Typography>Total: {order.totalAmount.toLocaleString()}₫</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Customer Details</Typography>
              <Typography>Name: {order.user?.name}</Typography>
              <Typography>Email: {order.user?.email}</Typography>
              <Typography>Phone: {order.shippingAddress?.phone}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Address */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Shipping Address</Typography>
              <Typography>
                {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district},{" "}
                {order.shippingAddress?.city}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                Order Items
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.price.toLocaleString()}₫</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{(item.price * item.quantity).toLocaleString()}₫</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Update Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                Update Order Status
              </Typography>

              <Box display="flex" gap={2} alignItems="center">
                <Select
                  value={editedStatus ?? order.status}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  size="small"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  disabled={updateStatus.isLoading || (editedStatus ?? order.status) === order.status}
                  onClick={() =>
                    updateStatus.mutate({
                      id: order._id,
                      status: editedStatus ?? order.status,
                    })
                  }
                >
                  Update
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
