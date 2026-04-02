import React, { useEffect, useState } from "react";

const AdminContact = () => {
  const [messages, setMessages] = useState([]);

  // Fetch messages
  useEffect(() => {
    fetch("http://localhost:5000/api/contact")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ Delete function
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setMessages(messages.filter((m) => m._id !== id));
      }
    } catch {
      alert("Error deleting");
    }
  };

  return (
    <div className="pt-20 p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">
        📩 Contact Messages
      </h1>

      <div className="space-y-4">

        {messages.length === 0 ? (
          <p>No messages found</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h2 className="font-semibold text-lg">
                {msg.name}
              </h2>

              <p className="text-sm text-gray-500">
                {msg.email}
              </p>

              <p className="mt-2 text-gray-700">
                {msg.message}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(msg.createdAt).toLocaleString()}
              </p>

              {/* ✅ DELETE BUTTON */}
              <button
                onClick={() => handleDelete(msg._id)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default AdminContact;