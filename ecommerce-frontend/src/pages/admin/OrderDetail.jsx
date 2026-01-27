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
import { useEffect } from "react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrderDetail(id);
  console.log(order);

  const updateStatus = useUpdateOrderStatus();

  const [editedStatus, setEditedStatus] = useState("");

  const handleUpdateStatus = () => {
    updateStatus.mutate(
      { id, status: editedStatus },
      {
        onSuccess: () => toast.success("Order status updated"),
        onError: () => toast.error("Update failed"),
      },
    );
  };

  useEffect(() => {
    if (!editedStatus && order?.orderStatus) {
      setEditedStatus(order.orderStatus);
    }
  }, [order?.orderStatus, editedStatus]);

  if (isLoading) return <CircularProgress />;
  if (!order) return <Typography>No order found</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Order #{order.orderNumber}
      </Typography>

      <Grid container spacing={2}>
        {/* Order Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Order Information</Typography>
              <Typography>Date: {new Date(order.createdAt).toLocaleString()}</Typography>
              <Typography component="div">
                Payment Status:
                <Chip
                  label={order.paymentStatus}
                  color={order.paymentStatus === "paid" ? "success" : "warning"}
                  size="small"
                />
              </Typography>
              <Typography>Total: {order.pricing?.total?.toLocaleString()}$</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Customer Details</Typography>
              <Typography>
                Name: {order.user?.firstName} {order.user?.lastName}
              </Typography>
              <Typography>Email: {order.user?.email}</Typography>
              <Typography>Phone: {order.shippingAddress?.phone}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Address */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Shipping Address</Typography>
              <Typography>
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode},{" "}
                {order.shippingAddress?.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid size={{ xs: 12 }}>
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
                  {(order.items ?? []).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.price.toLocaleString()}$</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{(item.price * item.quantity).toLocaleString()}$</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Update Status */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1}>
                Update Order Status
              </Typography>

              <Box display="flex" gap={2} alignItems="center">
                <Select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  size="small"
                  disabled={updateStatus.isLoading}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  onClick={handleUpdateStatus}
                  disabled={updateStatus.isLoading || !editedStatus || editedStatus === order?.orderStatus}
                >
                  {updateStatus.isLoading ? "Updating..." : "Update"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
