import React from "react";
import { Routes, Route } from "react-router-dom";
import PolicyPage from "./components/PrivacyPolicy";
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
import Footer from "./components/Footer"; // ✅ added

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import VerifyOtp from "./components/VerifyOtp";
import PaymentSuccess from "./components/PaymentSuccess";

// 👉 ADD THESE if you created them
import TermsConditions from "./components/TermsConditions";
import RefundPolicy from "./components/RefundPolicy";

const App = () => {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/social-login" element={<SocialLogin />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* USER ROUTES */}
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
              <Footer /> {/* optional but good */}
            </>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: made PUBLIC + added Footer */}
      <Route
        path="/about"
        element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        }
      />

      <Route
        path="/contact"
        element={
          <>
            <Navbar />
            <ContactUs />
            <Footer />
          </>
        }
      />

      <Route
        path="/policy"
        element={
          <>
            <Navbar />
            <PolicyPage />
            <Footer />
          </>
        }
      />

      {/* ✅ NEW REQUIRED PAGES */}
      <Route
        path="/terms"
        element={
          <>
            <Navbar />
            <TermsConditions />
            <Footer />
          </>
        }
      />

      <Route
        path="/refund"
        element={
          <>
            <Navbar />
            <RefundPolicy />
            <Footer />
          </>
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