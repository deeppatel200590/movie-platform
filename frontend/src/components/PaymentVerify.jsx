import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the IDs directly from the URL address bar
    const orderId = searchParams.get("order_id");
    const movieId = searchParams.get("movie_id");
    const token = localStorage.getItem("token");

    if (!orderId || !movieId || !token) {
      console.error("Missing order information or user not logged in");
      return;
    }

    const verifyOnServer = async () => {
      try {
        // 2. This is the magic call that runs Purchase.create in your server.js
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/verify`,
          { orderId, movieId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          alert("Payment Verified! Unlocking movie...");
          navigate(`/movie/${movieId}`); // Send user to watch the movie
        } else {
          alert("Verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Verification Error:", err);
      }
    };

    verifyOnServer();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verifying your payment...</h2>
        <p className="text-gray-400">Please do not close this window.</p>
      </div>
    </div>
  );
};

export default PaymentVerify;