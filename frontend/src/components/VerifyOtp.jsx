import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("otpEmail");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verify-otp`,
        { email, otp }
      );

      alert(res.data.message);

      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="bg-black/70 p-8 rounded-xl w-80">

        <h2 className="text-white text-xl mb-4 text-center">
          Enter OTP
        </h2>

        <p className="text-gray-400 text-sm mb-4 text-center">
          OTP sent to {email}
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 mb-4 rounded bg-gray-500 text-white"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button
            className={`w-full p-2 rounded text-white ${
              loading ? "bg-gray-600" : "bg-green-600"
            }`}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default VerifyOtp;