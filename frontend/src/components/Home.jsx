import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { loadRazorpay } from "../utils/loadRazorpay";
import { Search, Play, ShoppingCart, Clock } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [purchasedMovies, setPurchasedMovies] = useState([]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const normalize = (str) => str?.toLowerCase().replace(/[\s-]/g, "");

  const isUpcomingMovie = (movie) => {
    const releaseDate = movie.releaseDate || movie.release_date;
    if (!releaseDate) return false;

    return new Date(releaseDate).getTime() > Date.now();
  };

  // FETCH MOVIES
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, []);

  // PURCHASED MOVIES
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

  // PAYMENT SUCCESS
  const handlePaymentSuccess = async (response, movie) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required");

      const decoded = jwtDecode(token);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/success`,
        {
          userId: decoded.id,
          movieId: movie._id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }
      );

      if (res.data.success) {
        setPurchasedMovies((prev) => [...prev, movie._id]);
      }
    } catch (err) {
      console.error(err);
      alert("Payment verification failed");
    }
  };

  // BUY MOVIE (FIXED)
  const handleBuy = async (movie) => {
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        alert("Razorpay failed to load");
        return;
      }

      // ✅ IMPORTANT: send movieId (NOT amount)
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        { movieId: movie._id }
      );

      const order = res.data;

      if (!order?.id) {
        alert("Order creation failed");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id, // ✅ MUST BE EXACT

        name: "Movie Platform",
        description: movie.title,

        handler: (response) => handlePaymentSuccess(response, movie),

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        alert("Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
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
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition">

        <Link to={`/poster/${movie._id}`}>
          <div className="aspect-[2/3]">
            <img
              src={movie.poster}
              className="w-full h-full object-cover"
              alt={movie.title}
            />
          </div>
        </Link>

        <div className="p-3">
          <h3 className="text-white font-semibold truncate">
            {movie.title}
          </h3>

          <p className="text-green-400 font-bold">₹{movie.price}</p>

          <div className="mt-3">
            {isUpcoming ? (
              <button className="w-full py-2 bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2">
                <Clock size={16} /> Coming Soon
              </button>
            ) : isPurchased ? (
              <button
                onClick={() => navigate(`/movie/${movie._id}`)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Play size={16} /> Watch
              </button>
            ) : (
              <button
                onClick={() => handleBuy(movie)}
                className="w-full py-2 bg-white text-black rounded-lg flex items-center justify-center gap-2 font-bold"
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
    <div className="bg-black min-h-screen text-white pb-20">

      {/* HERO */}
      <div className="relative h-[60vh] flex items-end px-6 pb-12 overflow-hidden">

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            UNLIMITED <span className="text-blue-500">CINEMA</span>
          </h1>

          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-gray-900 border border-gray-700 py-3 px-4 rounded-xl"
          />
        </div>
      </div>

      {/* MOVIES */}
      <div className="px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Home;