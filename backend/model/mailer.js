import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  try {
    console.log("Trying to send OTP...");

    const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // ✅ FIXED
    port: 587,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
    }
    });

    const info = await transporter.sendMail({
      from: `"Movie App" <${process.env.EMAIL}>`,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });

    console.log("✅ EMAIL SENT:", info.response);

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);
    throw new Error("Failed to send OTP");
  }
};