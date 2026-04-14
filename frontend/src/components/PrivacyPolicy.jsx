import React from "react";

const PolicyPage = () => {
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.7",
      }}
      className="mt-10"
    >
      <div style={{ maxWidth: "900px", margin: "auto" }}>

        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          Privacy Policy
        </h1>

        <p style={{ marginBottom: "30px", color: "#94a3b8" }}>
          Last Updated: 2026
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect personal information such as your name, email address,
          and login details when you register on our platform.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used to provide services such as authentication,
          content access, purchase history, and customer support.
        </p>

        <h2>3. Payments</h2>
        <p>
          All payments are securely processed via trusted payment gateway providers.
          We do not store your card or banking details on our servers.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We use secure technologies like encryption and authentication systems
          to protect your data from unauthorized access.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We may use cookies and similar technologies to enhance user experience
          and improve our services.
        </p>

        <h2>6. Changes to Policy</h2>
        <p>
          We may update this policy at any time. Continued use of the platform
          means you accept the updated policy.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          Email: <strong>vedsoniorignals@gmail.com</strong>
        </p>

        <p style={{ marginTop: "20px", color: "#94a3b8" }}>
          This platform is operated by VED PRAKASHBHAI SONI.
        </p>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "50px",
            borderTop: "1px solid #334155",
            paddingTop: "20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          © 2026 All rights reserved.
        </div>

      </div>
    </div>
  );
};

export default PolicyPage;