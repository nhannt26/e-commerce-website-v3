import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import DescriptionIcon from "@mui/icons-material/Description";

import { orderAPI, paymentAPI } from "../services/api";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) return navigate("/");

    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderId);
        setOrder(res.data.data || res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // =========================
  // Retry VNPay
  // =========================
  const handleRetryPayment = async () => {
    try {
      setRetryLoading(true);
      const res = await paymentAPI.retry(order._id);
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      console.error(err);
    } finally {
      setRetryLoading(false);
    }
  };

  // =========================
  // Download Invoice
  // =========================
  const handleDownloadInvoice = async () => {
    const res = await orderAPI.downloadInvoice(order._id);

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderNumber}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box mt={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={8} display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 700, width: "100%" }}>
        <CardContent>
          <Stack spacing={2}>
            {/* HEADER */}
            <Stack alignItems="center" spacing={1}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
              <Typography variant="h5" fontWeight="bold">
                Đặt hàng thành công
              </Typography>
              <Typography color="text.secondary">
                Mã đơn: <b>{order.orderNumber}</b>
              </Typography>
            </Stack>

            <Divider />

            {/* ORDER INFO */}
            <Stack direction="row" spacing={2}>
              <Chip label={order.paymentMethod.toUpperCase()} />
              <Chip label={order.paymentStatus} color={order.paymentStatus === "paid" ? "success" : "warning"} />
              <Chip label={order.orderStatus} />
            </Stack>

            <Typography variant="h6">
              Tổng tiền: <span style={{ color: "#1976d2" }}>{order.pricing.total.toLocaleString()}$</span>
            </Typography>

            {/* ================= ITEMS ================= */}
            <Divider />
            <Typography fontWeight="bold">📦 Sản phẩm đã đặt</Typography>

            <List>
              {order.items.map((item) => (
                <ListItem key={item._id}>
                  <ListItemAvatar>
                    <Avatar src={item.product.images?.[0]} variant="rounded" />
                  </ListItemAvatar>

                  <ListItemText
                    primary={item.product.name}
                    secondary={`Số lượng: ${item.quantity} × ${item.price.toLocaleString()}$`}
                  />

                  <Typography fontWeight="bold">{(item.quantity * item.price).toLocaleString()}$</Typography>
                </ListItem>
              ))}
            </List>

            {/* ================= ACTIONS ================= */}
            <Divider />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {/* Retry VNPay */}
              {order.paymentMethod === "vnpay" &&
                order.paymentStatus === "unpaid" &&
                order.orderStatus === "pending" && (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<ReplayIcon />}
                    onClick={handleRetryPayment}
                    disabled={retryLoading}
                  >
                    Thanh toán lại
                  </Button>
                )}

              {/* Invoice */}
              {order.orderStatus === "delivered" && (
                <Button variant="outlined" startIcon={<DescriptionIcon />} onClick={handleDownloadInvoice}>
                  Tải hóa đơn
                </Button>
              )}

              <Button onClick={() => navigate("/orders")}>Đơn hàng của tôi</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
