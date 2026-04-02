import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const MoviePlayer = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 1. fetch movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/movies/${id}`
        );

        setMovie(res.data);
      } catch (error) {
        console.log(error);
        alert("Something went wrong!");
      }
    };

    fetchMovie();
  }, [id]);

  // ✅ 2. check access (FIXED)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        // ✅ decode token to get userId
        const decoded = jwtDecode(token);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: decoded.id, // ✅ FIXED
              movieId: id,
            }),
          }
        );

        const data = await res.json();
        setAllowed(data.allowed);

      } catch (err) {
        console.log(err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id]);

  // loading
  if (loading)
    return (
      <div className="text-white bg-black h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  // ❌ NOT ALLOWED
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

  // ✅ ALLOWED
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      {movie && (
        <video
          src={`${import.meta.env.VITE_API_URL}/uploads/${movie.movieUrl}`}
          controls
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

export default MoviePlayer;