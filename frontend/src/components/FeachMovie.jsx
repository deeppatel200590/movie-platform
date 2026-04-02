import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FeachMovie = () => {

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Deleted successfully");
        setMovies(movies.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert("Error deleting");
    }
  };

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-15">
      
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🎬 Movies
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
          >

            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={`http://localhost:5000/uploads/${movie.poster}`}
                alt={movie.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h2 className="font-semibold text-gray-800 truncate">
                {movie.title}
              </h2>
              <p className="text-sm text-gray-500">{movie.category}</p>
              <p className="text-sm text-gray-500">
                {movie.purchaseCount > 0 && (
                  <p className="text-sm text-gray-500">
                    Purchases: {movie.purchaseCount}
                  </p>
                )}
                </p>

              {/* ✅ PRICE */}
              <p className="text-green-600 font-semibold mt-1">
                ₹{movie.price}
              </p>

              {/* ✅ BUTTONS */}
              <div className="mt-3">
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default FeachMovie;