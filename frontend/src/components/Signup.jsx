import React, { useState } from "react";
import axios from "axios";
import logo from "../assets/varenyalogo.png";
import { Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/signup",
        formData
      );
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      
      <div className="bg-black/70 p-8 rounded-xl w-80 backdrop-blur-md shadow-lg">

        {/* LOGO */}
        <img 
            src={logo} 
            alt="Vernya Logo" 
            className="w-32 mx-auto mb-6"
        />

        <h2 className="text-white text-xl mb-4 text-center">Create Account</h2>

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
            placeholder="🔑 Password "
            className="w-full p-2 mb-4 rounded bg-gray-500 text-white"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link 
            to="/" 
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;