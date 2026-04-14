import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#181818] text-white mt-10">
      
      {/* MAIN SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">

        {/* BRAND */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Verenya</h2>
          <p className="text-gray-400">
            A digital platform providing entertainment services. 
            Enjoy seamless experience with secure payments.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <Link to="/about" className="hover:text-gray-300">About Us</Link>
          <Link to="/contact" className="hover:text-gray-300">Contact Us</Link>
          <Link to="/policy" className="hover:text-gray-300">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gray-300">Terms & Conditions</Link>
          <Link to="/refund" className="hover:text-gray-300">Refund Policy</Link>
        </div>

        {/* CONTACT INFO */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-gray-400">Email: vedsoniorignals@gmail.com</p>
          <p className="text-gray-400">Anjar, Gujarat, India</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-700 text-center py-4 text-gray-400 text-sm">
        © 2026 All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;