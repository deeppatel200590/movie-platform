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
  try {
    const token = localStorage.getItem("token");

    // Check if movie is selected
    if (!movie) {
      alert("Please select a movie file.");
      return;
    }

    console.log("Movie Size:", movie.size);
    console.log("Movie Type:", movie.type);

    // 1. GET PRESIGNED URL
    const uploadRes = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/movies/get-presigned-url`,
      {
        fileName: movie.name,
        fileType: movie.type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { uploadUrl, publicUrl } = uploadRes.data;
    alert("Step 1: Got presigned URL");
    console.log("Uploading to R2...");

    // 2. UPLOAD TO R2
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: movie,
      headers: {
        "Content-Type": movie.type,
      },
    });

    console.log("R2 Status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log("R2 Error:", errorText);
      throw new Error(`R2 Upload Failed (${uploadResponse.status})`);
    }

    console.log("Movie uploaded successfully to R2");

    // 3. SEND METADATA
    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("hero", hero);
    formData.append("producer", producer);
    formData.append("releaseDate", formatDate(releaseDate));
    formData.append("price", price);
    formData.append("poster", poster);
    formData.append("movieUrl", publicUrl);
    alert("Step 3: Sending movie details to server");
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/movies/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Movie Uploaded Successfully");
    navigate("/admin");

    } catch (error) {
    console.error("UPLOAD ERROR:", error);

    let message = "Unknown error";

    if (error.response) {
      message =
        "Status: " +
        error.response.status +
        "\nResponse: " +
        JSON.stringify(error.response.data);
    } else if (error.message) {
      message = error.message;
    }

    alert(message);
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