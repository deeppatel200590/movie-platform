import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Poster = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <h2 className="text-white">Loading...</h2>;

  return (
    <div className="h-screen bg-black text-white overflow-hidden">

      <Link to={`/movie/${movie._id}`}>
        <div className="relative w-full h-full">

          {/* 🔥 FIXED IMAGE */}
          <img
            src={movie.poster}
            className="w-full h-full object-cover"
            alt={movie.title}
          />

          <div className="absolute bottom-0 p-6">
            <h1 className="text-4xl font-bold">{movie.title}</h1>

            <p className="mt-2">Category: {movie.category}</p>
            <p>Hero: {movie.hero}</p>
            <p>Producer: {movie.producer}</p>

            <p className="mt-4 max-w-xl line-clamp-3">
              {movie.description}
            </p>
          </div>

        </div>
      </Link>
    </div>
  );
};

export default Poster;