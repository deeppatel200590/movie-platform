import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const MoviePlayer = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Fetch movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/movies/${id}`
        );
        console.log("Movie:", res.data);
        setMovie(res.data);
      } catch (error) {
        console.log("Movie Fetch Error:", error);
      }
    };

    fetchMovie();
  }, [id]);

  // ✅ 2. Check access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");

        // ❌ No token → no access
        if (!token) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        // ✅ Decode token
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded);

        // ⚠️ handle different possible field names
        const userId = decoded.id || decoded._id || decoded.userId;

        // ✅ API call
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // IMPORTANT
            },
            body: JSON.stringify({
              userId: userId,
              movieId: id,
            }),
          }
        );

        // ✅ FIX: define data
        const data = await res.json();
        console.log("Payment Check Response:", data);

        // ✅ Set access
        setAllowed(data.allowed === true);

      } catch (err) {
        console.log("Access Check Error:", err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id]);

  // ⏳ Loading screen
  if (loading) {
    return (
      <div className="text-white bg-black h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Not allowed
  if (!allowed) {
    return (
      <div className="text-white bg-black h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          🚫 You must purchase this movie to watch it
        </h1>
        <p className="mt-2 text-gray-400">
          Go back and complete payment
        </p>
      </div>
    );
  }

  // ✅ Allowed → play video
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      {movie && movie.movieUrl ? (
        <video controls autoPlay className="w-full h-full object-contain">
          <source src={movie.movieUrl} type="video/mp4" />
        </video>
      ) : (
        <p className="text-white">Video not available</p>
      )}
    </div>
  );
};

export default MoviePlayer;