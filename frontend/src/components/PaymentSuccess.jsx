import { useEffect } from "react";
import axios from "axios";

const PaymentSuccess = () => {
  useEffect(() => {
    const orderId = localStorage.getItem("lastOrderId");
    const movieId = localStorage.getItem("lastMovieId");

    if (!orderId || !movieId) return;

    axios.post(
      `${import.meta.env.VITE_API_URL}/api/payment/verify`,
      { orderId, movieId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  }, []);

  return <h2>Payment Successful...</h2>;
};

export default PaymentSuccess;