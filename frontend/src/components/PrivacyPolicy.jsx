import React from "react";

const PolicyPage = () => {
  return (
    <div style={{
      backgroundColor: "#0f172a",
      color: "#e2e8f0",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.7"
    }}
    className="mt-10">
      <div style={{ maxWidth: "900px", margin: "auto" }}>

        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          Privacy Policy & User Terms
        </h1>

        <p style={{ marginBottom: "30px", color: "#94a3b8" }}>
          Last Updated: 2026
        </p>

        {/* PRIVACY POLICY */}
        <h2 style={{ marginTop: "30px" }}>1. Information We Collect</h2>
        <p>
          We collect personal information such as your name, email address,
          and login details when you register on our platform.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used to provide services such as authentication,
          movie access, purchase history, and customer support.
        </p>

        <h2>3. Payments</h2>
        <p>
          All payments are securely processed via Razorpay. We do not store
          your card or banking details on our servers.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We use secure technologies like encryption and authentication systems
          (JWT, OTP, Google Login) to protect your data.
        </p>

        {/* USER POLICY */}
        <h2 style={{ marginTop: "40px" }}>5. No Refund Policy</h2>
        <p>
          All payments made to access or watch content are final and
          non-refundable once successfully completed.
        </p>

        <h2>6. Anti-Piracy Policy</h2>
        <p>
          Users are strictly prohibited from recording, downloading, copying,
          or redistributing any content from this platform.
        </p>
        <p>
          Violation may result in account suspension and legal action.
        </p>

        <h2>7. Copyright Complaints</h2>
        <p>
          If you believe any content infringes your copyright, please contact us
          with proper proof and details.
        </p>

        <h2>8. Action on Violations</h2>
        <p>
          Upon receiving a valid complaint, we will investigate and remove
          infringing content and take action against the responsible party.
        </p>

        <h2>9. Platform Liability</h2>
        <p>
          All content is uploaded by independent filmmakers. We do not claim
          ownership but will take action if violations are reported.
        </p>

        <h2>10. User Responsibility</h2>
        <p>
          Users must use the platform lawfully and must not attempt to hack,
          misuse, or exploit the system.
        </p>

        <h2>11. Changes to Policy</h2>
        <p>
          We may update these policies at any time. Continued use of the platform
          means you accept the updated terms.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          Email: <strong>vedsonioriginals@gmail.com</strong>
        </p>

        {/* FOOTER */}
        <div style={{
          marginTop: "50px",
          borderTop: "1px solid #334155",
          paddingTop: "20px",
          textAlign: "center",
          color: "#64748b"
        }}>
          © 2026 Movie Platform. All rights reserved.
        </div>

      </div>
    </div>
  );
};

export default PolicyPage;