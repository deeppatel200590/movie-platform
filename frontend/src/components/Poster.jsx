import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Poster = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/movies/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <h2 className="text-white text-center mt-10">Loading...</h2>;

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black">

      <Link to={`/movie/${movie._id}`}>
        
        {/* Background Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-8 w-full md:w-[60%]">

          {/* Glass Card */}
          <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span>🎬 {movie.category}</span>
              <span>⭐ {movie.hero}</span>
              <span>🎥 {movie.producer}</span>
            </div>

            <p className="mt-4 text-gray-200 leading-relaxed line-clamp-3">
              {movie.description}
            </p>

            {/* Button */}
            <button className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition">
              ▶ Watch Now
            </button>

          </div>
        </div>

      </Link>
    </div>
  );
};

export default Poster;