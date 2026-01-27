import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";

export default function VNPayReturn() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);

      const res = await orderAPI.confirmVNPay({
        vnp_Amount: params.get("vnp_Amount"),
        vnp_ResponseCode: params.get("vnp_ResponseCode"),
        vnp_TxnRef: params.get("vnp_TxnRef"),
        vnp_SecureHash: params.get("vnp_SecureHash"),
      });

      navigate(`/order-success?orderId=${res.data.orderId}`);
    };

    confirmPayment();
  }, []);

  return <p>Đang xử lý thanh toán...</p>;
}