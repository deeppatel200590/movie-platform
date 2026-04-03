import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";   // ✅ ADD THIS
import logo from "../assets/varenyalogo.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        formData
      );

      alert(res.data.message);

      // 🔐 STORE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ DECODE TOKEN
      const decoded = jwtDecode(res.data.token);

      // ✅ ROLE BASED NAVIGATION
      if (decoded.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="bg-black/70 p-8 rounded-xl w-80">

        <img src={logo} alt="Logo" className="w-32 mx-auto mb-6" />

        <h2 className="text-white text-xl mb-4 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 mb-3 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 mb-4 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <button className="w-full bg-red-600 text-white p-2 rounded">
            Login
          </button>
          <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
            <div className="w-full bg-white text-black p-2 rounded text-center cursor-pointer">
              Login with Google
            </div>
          </a>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-400">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;