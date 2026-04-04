import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Movieupload = () => {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [movie, setMovie] = useState(null);
  const [poster, setPoster] = useState(null);
  const [description, setDescription] = useState("");
  const [hero, setHero] = useState("");
  const [producer, setProducer] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [price, setPrice] = useState("");

  // ✅ FIX: normalize datetime-local → full ISO string
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    console.log("📅 RAW INPUT:", dateStr);
    console.log("📅 CONVERTED ISO:", date.toISOString());

    return date.toISOString();
  };

  const handleUpload = async () => {
    const formData = new FormData();

    const fixedDate = formatDate(releaseDate);

    formData.append("title", title);
    formData.append("category", category);
    formData.append("poster", poster);
    formData.append("movie", movie);
    formData.append("description", description);
    formData.append("hero", hero);
    formData.append("producer", producer);

    // 🔥 IMPORTANT FIX HERE
    formData.append("releaseDate", fixedDate);

    formData.append("price", price);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/movies/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("✅ UPLOAD SUCCESS:", res.data);
      alert("Movie Uploaded Successfully");
      navigate("/admin");

    } catch (error) {
      console.log("❌ UPLOAD ERROR:", error.response?.data);
      alert("Upload Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center mt-15">

      <div className="bg-gray-900 p-8 rounded-xl w-96 text-white">

        <h2 className="text-2xl font-bold mb-6 text-center">Movie Upload</h2>

        <input
          type="text"
          placeholder="Movie Title"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setCategory(e.target.value)}
        />

        <input 
          type="text"
          placeholder="Description"
          className="w-full p-2 mb-4 bg-gray-800 rounded" 
          onChange={(e)=>setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Caste"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setHero(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setReleaseDate(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price (₹)"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setPrice(e.target.value)}
        />

        <input 
          type="text"
          placeholder="Producer"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e)=>setProducer(e.target.value)}
        />

        <p className="mb-1">Upload Poster</p>
        <input
          type="file"
          className="mb-4"
          onChange={(e)=>setPoster(e.target.files[0])}
        />

        <p className="mb-1">Upload Movie</p>
        <input
          type="file"
          className="mb-4"
          onChange={(e)=>setMovie(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 p-2 rounded"
        >
          Upload Movie
        </button>

      </div>

    </div>
  );
};

export default Movieupload;