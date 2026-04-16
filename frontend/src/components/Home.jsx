import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Cashfree } from "cashfree-dropjs";
import { Search, Play, ShoppingCart, Clock, Flame } from "lucide-react";

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

  // ✅ SAFE DATE CHECK
  const isUpcomingMovie = (movie) => {
    if (!movie) return false;

    const releaseDate = movie.releaseDate || movie.release_date;
    if (!releaseDate) return false;

    const releaseTime = new Date(releaseDate).getTime();
    if (isNaN(releaseTime)) return false;

    return movie.status === "coming" || releaseTime > Date.now();
  };

  // FETCH MOVIES
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setUpcomingMovies(data.filter(isUpcomingMovie));
      })
      .catch(console.error);
  }, []);

  // RECENT
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentMovies")) || [];
    setRecentMovies(stored);
  }, []);

  // PURCHASED
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

  // ✅ CASHFREE BUY FUNCTION (FIXED)
  const handleBuy = async (movie) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        { movieId: movie._id },
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ IMPORTANT
        }
      );

      const { payment_session_id, order_id } = res.data;

      if (!payment_session_id) {
        alert("Session ID missing");
        return;
      }

      const cashfree = new Cashfree({
        mode: "sandbox", // change to production later
      });

      cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });

      // OPTIONAL: after redirect you can verify
      localStorage.setItem("lastOrderId", order_id);
      localStorage.setItem("lastMovieId", movie._id);

    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment failed");
    }
  };

  // FILTER
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      normalize(movie.category) === normalize(activeCategory);

    return matchesSearch && matchesCategory;
  });

  // MOVIE CARD
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

          <h3 className="text-white font-semibold truncate">
            {movie.title}
          </h3>

          <p className="text-green-400 font-bold mt-1">
            ₹{movie.price}
          </p>

          <div className="mt-3">
            {isUpcoming ? (
              <button className="w-full py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm">
                <Clock size={16} /> Coming Soon
              </button>
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
      <div className="relative h-[60vh] flex items-end px-6 md:px-12 pb-12 mb-8">
        <div className="absolute inset-0 mb-5">
          <img
            src="https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/AD0B81B1-C8C7-4D83-B37B-2A5233E55F78.png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            ENJOY THE <span className="text-blue-500">MOVIES</span>
          </h1>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 py-3 pl-10 rounded-xl"
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

      <div className="px-6 md:px-12 space-y-12">

        {/* RECENT */}
        {!search && recentMovies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-black flex items-center gap-2">
              <Flame className="text-orange-500" /> Continue Watching
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {recentMovies.map((movie) => (
                <div key={movie._id} className="w-48 shrink-0">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING */}
        {!search && upcomingMovies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Upcoming Movies
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {upcomingMovies.map((movie) => (
                <div key={movie._id} className="w-48 shrink-0">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GRID */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-black">
            {search ? "Search Results" : "All Movies"}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Home;