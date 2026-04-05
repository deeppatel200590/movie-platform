import axios from "axios";

export const sendEmail = async (receiverEmail) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Your App",
          email: "deepadroja09@gmail.com"
        },
        to: [
          {
            email: receiverEmail
          }
        ],
        subject: "Test Email from Brevo API",
        htmlContent: "<h1>Hello! Email works 🚀</h1>"
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
  }
};