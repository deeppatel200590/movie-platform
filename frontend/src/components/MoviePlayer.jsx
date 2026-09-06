import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const MoviePlayer = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notReleased, setNotReleased] = useState(false);

  // 1. Fetch movie
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

  // 2. Check access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");

        // No login
        if (!token) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        // Movie not loaded yet
        if (!movie) {
          return;
        }

        // 🔒 IMPORTANT:
        // Pre-buyers cannot watch before official release
        if (
          movie.releaseDate &&
          new Date() < new Date(movie.releaseDate)
        ) {
          setNotReleased(true);
          setAllowed(false);
          setLoading(false);
          return;
        }

        // Check purchase
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              movieId: id,
            }),
          }
        );

        const data = await res.json();

        console.log("Payment Check Response:", data);

        setAllowed(data.allowed === true);

      } catch (err) {
        console.log("Access Check Error:", err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [id, movie]);

  // Loading
  if (loading) {
    return (
      <div className="text-white bg-black h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔒 Purchased but movie hasn't released
  if (notReleased) {
    return (
      <div className="text-white bg-black h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold">
          🎬 Movie has not been released yet
        </h1>

        <p className="mt-3 text-gray-400">
          You have pre-bought this movie.
        </p>

        <p className="mt-2 text-gray-400">
          Official release:
        </p>

        <p className="mt-1 text-lg font-semibold">
          {new Date(movie.releaseDate).toLocaleString()}
        </p>
      </div>
    );
  }

  // Not purchased
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

  // Allowed → play video
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      {movie && movie.movieUrl ? (
        <video
          controls
          autoPlay
          className="w-full h-full object-contain"
        >
          <source src={movie.movieUrl} type="video/mp4" />
        </video>
      ) : (
        <p className="text-white">
          Video not available
        </p>
      )}
    </div>
  );
};

export default MoviePlayer;