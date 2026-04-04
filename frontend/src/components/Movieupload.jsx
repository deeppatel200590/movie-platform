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

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

  const handleUpload = async () => {
    if (!movie || !poster) {
      alert("Please select movie and poster");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // =========================
      // 1. UPLOAD POSTER
      // =========================
      const posterData = new FormData();
      posterData.append("file", poster);
      posterData.append("upload_preset", UPLOAD_PRESET);

      const posterRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        posterData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent / 2); // first half
          }
        }
      );

      const posterUrl = posterRes.data.secure_url;

      // =========================
      // 2. UPLOAD MOVIE
      // =========================
      const movieData = new FormData();
      movieData.append("file", movie);
      movieData.append("upload_preset", UPLOAD_PRESET);

      const movieRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        movieData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(50 + percent / 2); // second half
          }
        }
      );

      const movieUrl = movieRes.data.secure_url;

      // =========================
      // 3. SEND TO BACKEND
      // =========================
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/movies/upload`,
        {
          title,
          category,
          description,
          hero,
          producer,
          releaseDate,
          price,
          poster: posterUrl,
          movieUrl: movieUrl
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProgress(100);

      alert("Movie Uploaded Successfully");
      navigate("/admin");

    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center mt-15">

      <div className="bg-gray-900 p-8 rounded-xl w-96 text-white">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Movie Upload
        </h2>

        <input
          type="text"
          placeholder="Movie Title"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Hero"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setHero(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setReleaseDate(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price (₹)"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Producer"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          onChange={(e) => setProducer(e.target.value)}
        />

        <p className="mb-1">Upload Poster</p>
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setPoster(e.target.files[0])}
        />

        <p className="mb-1">Upload Movie</p>
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setMovie(e.target.files[0])}
        />

        {/* PROGRESS BAR */}
        {uploading && (
          <div className="w-full bg-gray-700 rounded mb-4">
            <div
              className="bg-green-500 text-xs text-white text-center p-1 rounded"
              style={{ width: `${progress}%` }}
            >
              {progress.toFixed(0)}%
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full p-2 rounded ${
            uploading ? "bg-gray-500" : "bg-blue-600"
          }`}
        >
          {uploading ? "Uploading..." : "Upload Movie"}
        </button>

      </div>
    </div>
  );
};

export default Movieupload;