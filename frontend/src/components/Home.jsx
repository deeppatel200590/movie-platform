import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Play, ShoppingCart, Clock, Flame } from "lucide-react";
import { load } from "cashfree-dropjs";

/* ✅ CASHFREE SINGLETON (FIXED) */
let cashfreePromise = null;

const getCashfree = async () => {
  if (!cashfreePromise) {
    cashfreePromise = load({ mode: "sandbox" });
  }
  return cashfreePromise;
};

const Home = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [purchasedMovies, setPurchasedMovies] = useState([]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Horror"];

  const normalize = (str) =>
    str?.toLowerCase().replace(/[\s-]/g, "");

  const isUpcomingMovie = (movie) => {
    if (!movie) return false;
    const releaseDate = movie.releaseDate;
    if (!releaseDate) return false;

    const time = new Date(releaseDate).getTime();
    if (isNaN(time)) return false;

    return movie.status === "coming" || time > Date.now();
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setUpcomingMovies(data.filter(isUpcomingMovie));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentMovies")) || [];
    setRecentMovies(stored);
  }, []);

  useEffect(() => {
    const fetchPurchased = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/purchase/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPurchasedMovies(res.data.map((p) => p.movieId));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPurchased();
  }, []);

  /* ✅ FIXED CASHFREE BUY FUNCTION */
  const handleBuy = async (movie) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        { movieId: movie._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { payment_session_id, order_id } = res.data;

      if (!payment_session_id) {
        alert("Payment session missing");
        return;
      }

      const cashfree = await getCashfree();

      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });

      localStorage.setItem("lastOrderId", order_id);
      localStorage.setItem("lastMovieId", movie._id);

    } catch (err) {
      console.error("PAYMENT ERROR:", err.response?.data || err.message);
      alert("Payment failed");
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      normalize(movie.category) === normalize(activeCategory);

    return matchesSearch && matchesCategory;
  });

  const MovieCard = ({ movie }) => {
    const isUpcoming = isUpcomingMovie(movie);
    const isPurchased = purchasedMovies.includes(movie._id);

    return (
      <div className="group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition">

        <Link
          to={`/poster/${movie._id}`}
          onClick={() => {
            let recent =
              JSON.parse(localStorage.getItem("recentMovies")) || [];

            recent = [
              movie,
              ...recent.filter((m) => m._id !== movie._id),
            ].slice(0, 10);

            localStorage.setItem("recentMovies", JSON.stringify(recent));
          }}
        >
          <div className="aspect-[2/3]">
            <img src={movie.poster} className="w-full h-full object-cover" />
          </div>
        </Link>

        <div className="p-3">
          <h3 className="text-white font-semibold truncate">{movie.title}</h3>
          <p className="text-green-400 font-bold mt-1">₹{movie.price}</p>

          <div className="mt-3">
            {isUpcoming ? (
              <button className="w-full py-2 bg-gray-700 text-white rounded-lg">
                <Clock size={16} /> Coming Soon
              </button>
            ) : isPurchased ? (
              <button
                onClick={() => navigate(`/movie/${movie._id}`)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg"
              >
                <Play size={16} /> Watch
              </button>
            ) : (
              <button
                onClick={() => handleBuy(movie)}
                className="w-full py-2 bg-white text-black rounded-lg"
              >
                <ShoppingCart size={16} /> Buy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen text-gray-100 pb-20">

      <div className="relative h-[60vh] flex items-end px-6 pb-12 mb-8">
        <div className="absolute inset-0">
          <img
            src="https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/AD0B81B1-C8C7-4D83-B37B-2A5233E55F78.png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-4">
            ENJOY THE <span className="text-blue-500">MOVIES</span>
          </h1>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-500" />
            <input
              className="w-full bg-gray-900 py-3 pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
            />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-10">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Home;