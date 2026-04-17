import React from "react";

const TermsConditions = () => {
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
          Terms & Conditions
        </h1>

        <p style={{ marginBottom: "30px", color: "#94a3b8" }}>
          Last Updated: 2026
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this platform, you agree to comply with and be
          bound by these Terms & Conditions.
        </p>

        <h2>2. Platform Usage</h2>
        <p>
          Users must use the platform only for lawful purposes. Any misuse,
          unauthorized access, or attempt to harm the platform is strictly prohibited.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          Users are responsible for maintaining the confidentiality of their
          account credentials and for all activities under their account.
        </p>

        <h2>4. Content Ownership</h2>
        <p>
          All content available on this platform is provided by independent creators
          who hold the rights to their content. We do not claim ownership of such content.
        </p>

        <h2>5. Anti-Piracy Policy</h2>
        <p>
          Users are strictly prohibited from copying, recording, downloading,
          distributing, or reproducing any content without proper authorization.
        </p>

        <h2>6. Payments</h2>
        <p>
          All payments made on this platform are processed through secure payment
          gateway providers. Users must ensure accurate payment details while making transactions.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          We are not liable for any indirect, incidental, or consequential damages
          arising from the use of the platform.
        </p>

        <h2>8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate user accounts in case of
          violation of these terms.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms & Conditions at any time. Continued use of
          the platform means you accept the updated terms.
        </p>

        <h2>10. Content Availability & Expiry</h2>
        <p>
          Please review the movie description associated with your purchase to check
          the expiry date, after which the movie may be removed from the platform.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          Email: <strong>vedsoniorignals@gmail.com</strong>
        </p>

        {/* LEGAL NAME (IMPORTANT) */}
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

export default TermsConditions;