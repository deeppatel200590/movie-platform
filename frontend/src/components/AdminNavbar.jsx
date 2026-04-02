import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-[70px] flex justify-between items-center bg-[#242624] fixed top-0 left-0 w-full z-50 px-5 shadow-md text-white">

      {/* LOGO / TITLE */}
      <h1 className="text-lg font-semibold">Admin Panel</h1>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-6 items-center">

        <Link
          to="/upload"
          className="px-3 py-1 rounded hover:bg-white hover:text-black transition"
        >
          Upload
        </Link>

        <Link
          to="/admin/contact"
          className="px-3 py-1 rounded hover:bg-white hover:text-black transition"
        >
          Messages
        </Link>

        <Link
          to="/admin"
          className="px-3 py-1 rounded hover:bg-white hover:text-black transition"
        >
          Home
        </Link>

      </div>

      {/* MOBILE BUTTON */}
      <div className="md:hidden text-2xl cursor-pointer">
        <button onClick={() => setOpen(!open)}>☰</button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="absolute top-[70px] left-0 w-full bg-[#242624] flex flex-col items-center gap-4 py-5 md:hidden">

          <Link
            to="/upload"
            onClick={() => setOpen(false)}
            className="hover:text-gray-300"
          >
            Upload
          </Link>

          <Link
            to="/admin/contact"
            onClick={() => setOpen(false)}
            className="hover:text-gray-300"
          >
            Messages
          </Link>

          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="hover:text-gray-300"
          >
            Home
          </Link>

        </div>
      )}
    </div>
  );
};

export default AdminNavbar;