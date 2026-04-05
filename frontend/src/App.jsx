import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import MoviePlayer from "./components/MoviePlayer";
import Poster from "./components/Poster";
import SocialLogin from "./components/SocialLogin";
import Admin from "./components/Admin";
import AdminContact from "./components/AdminContact";
import Movieupload from "./components/Movieupload";

import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import VerifyOtp from "./components/VerifyOtp";


const App = () => {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/social-login" element={<SocialLogin />} />
      {/* USER ROUTES */}
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <About />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <ContactUs />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute>
            <MoviePlayer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/poster/:id"
        element={
          <ProtectedRoute>
            <Poster />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/contact"
        element={
          <AdminRoute>
            <>
              <AdminNavbar />
              <AdminContact />
            </>
          </AdminRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <AdminRoute>
            <>
              <AdminNavbar />
              <Movieupload />
            </>
          </AdminRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Login />} />

    </Routes>
  );
};

export default App;