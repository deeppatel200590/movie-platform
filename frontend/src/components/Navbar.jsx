import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/varenyalogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-[70px] flex justify-between items-center bg-[#242624] fixed top-0 left-0 w-full z-50 px-5 shadow-md">

      {/* LOGO */}
      <div className="h-[50px] flex items-center">
        <img src={logo} alt="logo" className="h-full object-contain" />
      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-6 items-center text-white">
        <Link to="/home" className="hover:text-gray-300">Home</Link>
        <Link to="/about" className="hover:text-gray-300">About</Link>
        <Link to="/contact" className="hover:text-gray-300">Contact</Link>

        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-400 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>

      {/* MOBILE BUTTON */}
      <div className="md:hidden text-white text-2xl cursor-pointer">
        <button onClick={() => setOpen(!open)}>☰</button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="absolute top-[70px] left-0 w-full bg-[#242624] text-white flex flex-col items-center gap-4 py-5 md:hidden">

          <Link to="/home" onClick={() => setOpen(false)}>
            Home
          </Link>

          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>

          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
            className="px-3 py-1 bg-red-400 rounded"
          >
            Logout
          </button>

        </div>
      )}
    </div>
  );
};

export default Navbar;