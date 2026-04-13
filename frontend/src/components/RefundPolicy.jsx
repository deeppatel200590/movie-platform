import React from "react";

const RefundPolicy = () => {
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
          Refund Policy
        </h1>

        <p style={{ marginBottom: "30px", color: "#94a3b8" }}>
          Last Updated: 2026
        </p>

        <h2>1. General Policy</h2>
        <p>
          All payments made on this platform are final and non-refundable.
        </p>

        <h2>2. Exception for Failed Service</h2>
        <p>
          In case a user successfully completes a payment but does not receive
          access to the purchased movie or content due to a technical issue,
          the user is eligible for a refund.
        </p>

        <h2>3. Refund Process</h2>
        <p>
          To request a refund, users must contact our support team with payment
          details and proof of transaction. After verification, the refund will
          be processed within a reasonable time.
        </p>

        <h2>4. Non-Refundable Cases</h2>
        <p>
          Refunds will not be provided in cases where the user has successfully
          accessed or viewed the content, or due to change of mind.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          Email: <strong>vedsonioriginals@gmail.com</strong>
        </p>

        <p style={{ marginTop: "20px", color: "#94a3b8" }}>
          This platform is operated by VED PRAKASHBHAI SONI.
        </p>

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

export default RefundPolicy;