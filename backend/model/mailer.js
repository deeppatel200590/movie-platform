import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  try {
    console.log("EMAIL:", process.env.EMAIL);
    console.log("PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });

    console.log("EMAIL SENT:", info.response);

  } catch (error) {
    console.log("❌ EMAIL ERROR FULL:", error);
    throw new Error("Failed to send OTP");
  }
};