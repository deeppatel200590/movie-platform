import axios from "axios";

export const sendEmail = async (email, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Movie App",
          email: "deepadroja09@gmail.com"
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<h2>Your OTP is: ${otp}</h2>`
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Email error:", error.response?.data || error.message);
    throw new Error("Email failed");
  }
};