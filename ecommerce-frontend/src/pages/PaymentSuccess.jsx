import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (orderId) {
      navigate(`/order-success?orderId=${orderId}`, { replace: true });
    } else {
      navigate("/");
    }
  }, [navigate, searchParams]);

  return (
    <Box mt={10} display="flex" flexDirection="column" alignItems="center" gap={2}>
      <CircularProgress />
      <Typography color="text.secondary">Đang xác nhận thanh toán...</Typography>
    </Box>
  );
}
