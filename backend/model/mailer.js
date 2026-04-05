import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  try {
    console.log("Trying to send OTP...");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
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