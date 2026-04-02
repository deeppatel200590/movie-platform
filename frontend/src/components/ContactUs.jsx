import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/contact",
        form
      );

      if (res.data.success) {
        alert("Message sent ✅");
        setForm({ name: "", email: "", message: "" });
      }
    } catch (error) {
      alert("Error sending message ❌");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-100 flex justify-center items-center p-4">

      <div className="bg-white shadow-lg rounded-xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="bg-[#242624] text-white p-8 flex flex-col justify-center gap-4">
          <h2 className="text-2xl font-bold mb-2">Contact Us</h2>

          <p className="text-gray-300">
            Feel free to reach out to us for any queries or support.
          </p>

          <div className="mt-4 space-y-2">
            <p>📍 Address: Anjar, Gujarat</p>
            <p>📧 Email: vedsoniorignals@gmail.com</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Send Message</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="border p-2 rounded outline-none focus:ring-2 focus:ring-black"
              required
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="border p-2 rounded outline-none focus:ring-2 focus:ring-black"
              required
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows="4"
              className="border p-2 rounded outline-none focus:ring-2 focus:ring-black"
              required
            ></textarea>

            <button
              type="submit"
              className="bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Send Message
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ContactUs;