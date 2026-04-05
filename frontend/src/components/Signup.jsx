import React, { useState } from "react";
import axios from "axios";
import logo from "../assets/varenyalogo.png";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/signup`,
        formData
      );

      alert(res.data.message || "OTP sent to your email");

      // 👉 redirect to OTP page with email
      navigate("/verify-otp", {
        state: { email: formData.email }
      });

    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      
      <div className="bg-black/70 p-8 rounded-xl w-80 backdrop-blur-md shadow-lg">

        {/* LOGO */}
        <img 
          src={logo} 
          alt="Logo" 
          className="w-32 mx-auto mb-6"
        />

        <h2 className="text-white text-xl mb-4 text-center">
          Create Account
        </h2>

        {/* SIGNUP FORM */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="👤 Name"
            className="w-full p-2 mb-3 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="📩 Email"
            className="w-full p-2 mb-3 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="🔑 Password"
            className="w-full p-2 mb-4 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white transition ${
              loading ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        {/* GOOGLE SIGNUP */}
        <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
          <div className="w-full bg-white text-black p-2 rounded text-center cursor-pointer hover:bg-gray-200 transition">
            Sign up with Google
          </div>
        </a>

        {/* LOGIN LINK */}
        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;