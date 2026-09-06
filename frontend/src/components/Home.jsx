import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Play, ShoppingCart, Clock } from "lucide-react";
import logo from "../assets/background.png";

const getSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject("Cashfree object not found after script load");
      }
    };
    script.onerror = () => reject("Failed to download Cashfree SDK");
    document.body.appendChild(script);
  });
};

const Home = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [purchasedMovies, setPurchasedMovies] = useState([]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // 🔥 State to trigger re-evaluation of date conditions every second
  const [currentTime, setCurrentTime] = useState(new Date());

  const categories = ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Horror"];

  const normalize = (str) => str?.toLowerCase().replace(/[\s-]/g, "");

  const isBeforePreBuy = (movie) => {
    if (!movie?.preBuyDate) return false;
    return currentTime < new Date(movie.preBuyDate);
  };

  const isBeforeRelease = (movie) => {
    if (!movie?.releaseDate) return false;
    return currentTime < new Date(movie.releaseDate);
  };

  // Live Timer Effect to auto-update UI states instantly when target time passes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
      })
      .catch(console.error);
  }, []);

  // Update upcoming list dynamically when source movies or current time shifts
  useEffect(() => {
    setUpcomingMovies(movies.filter((movie) => isBeforeRelease(movie)));
  }, [movies, currentTime]);

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

  const handleBuy = async (movie) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        { movieId: movie._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { payment_session_id, order_id } = res.data;

      if (!payment_session_id) {
        alert("Server did not return a Session ID");
        return;
      }

      const CashfreeSDK = await getSDK();
      const cfInstance = CashfreeSDK({ mode: "production" });

      cfInstance.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });

      localStorage.setItem("lastOrderId", order_id);
      localStorage.setItem("lastMovieId", movie._id);

    } catch (err) {
      console.error("Payment Error:", err);
      alert(err.response?.data?.message || "Payment initiation failed");
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
    const isPurchased = purchasedMovies.includes(movie._id);

    return (
      <div className="group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition">
        <Link
          to={`/poster/${movie._id}`}
          onClick={() => {
            let recent = JSON.parse(localStorage.getItem("recentMovies")) || [];
            recent = [
              movie,
              ...recent.filter((m) => m._id !== movie._id),
            ].slice(0, 10);
            localStorage.setItem("recentMovies", JSON.stringify(recent));
          }}
        >
          <div className="aspect-[2/3]">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <div className="p-3">
          <p className="text-xs text-blue-400 font-bold uppercase">
            {movie.category}
          </p>

          <h3 className="text-white font-semibold truncate">{movie.title}</h3>

          <p className="text-green-400 font-bold mt-1">₹{movie.price}</p>

          <div className="mt-3">
            {isBeforePreBuy(movie) ? (
              <button
                disabled
                className="w-full py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
              >
                <Clock size={16} /> Coming Soon
              </button>
            ) : isBeforeRelease(movie) ? (
              isPurchased ? (
                <button
                  disabled
                  className="w-full py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Clock size={16} /> Pre-Bought
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(movie)}
                  className="w-full py-2 bg-yellow-500 text-black rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <ShoppingCart size={16} /> Pre-Buy
                </button>
              )
            ) : isPurchased ? (
              <button
                onClick={() => navigate(`/movie/${movie._id}`)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
              >
                <Play size={16} /> Watch
              </button>
            ) : (
              <button
                onClick={() => handleBuy(movie)}
                className="w-full py-2 bg-white text-black rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
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
      {/* HERO */}
      <div className="relative h-[80vh] flex items-end px-6 md:px-12 pb-12 mb-8">
        <div className="absolute inset-0 mb-5">
          <img src={logo} className="w-full h-full object-cover" alt="Hero Background" />
        </div>

        <div className="relative z-10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 py-3 pl-10 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      {/* CATEGORY */}
      <div className="px-6 md:px-12 mb-6 flex gap-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MOVIE GRID SECTION */}
      <div className="px-6 md:px-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
