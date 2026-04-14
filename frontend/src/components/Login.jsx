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
            <div className="w-full bg-white text-black p-2 rounded flex items-center justify-center gap-3 cursor-pointer mt-2 border border-gray-300 hover:bg-gray-100 transition">

              {/* Google SVG Logo */}
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.94 0 7.14 1.36 9.29 3.59l6.93-6.93C36.64 2.36 30.74 0 24 0 14.64 0 6.48 5.48 2.69 13.44l8.06 6.26C12.69 13.03 17.88 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.21-.43-4.73H24v9.05h12.7c-.55 2.96-2.2 5.47-4.7 7.17l7.23 5.62C43.98 36.82 46.5 30.87 46.5 24z"/>
                <path fill="#FBBC05" d="M10.75 28.7c-.48-1.43-.75-2.95-.75-4.7s.27-3.27.75-4.7l-8.06-6.26C1 16.06 0 19.92 0 24s1 7.94 2.69 10.96l8.06-6.26z"/>
                <path fill="#34A853" d="M24 48c6.74 0 12.64-2.23 16.85-6.06l-7.23-5.62c-2.01 1.35-4.59 2.15-9.62 2.15-6.12 0-11.31-3.53-13.25-8.2l-8.06 6.26C6.48 42.52 14.64 48 24 48z"/>
              </svg>

              <span className="font-medium">Continue with Google</span>
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