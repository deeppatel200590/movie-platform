import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./model/connection.js";
import cors from "cors";
import Movie from "./model/Movie.js";
import bcrypt from "bcrypt";
import User from "./model/Signup.js";
import Contact from "./model/Contact.js";
import Purchase from "./model/Purchase.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import passport from "./model/passport.js";
import session from "express-session";

import { cloudinary } from "./model/cloudinary.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());

connectDB();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});


const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1]; // ✅ FIX

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


app.post("/api/movies/upload", auth, adminOnly, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      hero,
      price,
      releaseDate,
      producer,
      poster,
      movie
    } = req.body;

    // 🔥 DEBUG (VERY IMPORTANT on Render)
    console.log("UPLOAD BODY:", req.body);

    // 🔥 VALIDATION
    if (
      !title ||
      !category ||
      !poster?.url ||
      !poster?.publicId ||
      !movie?.url ||
      !movie?.publicId
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const newMovie = new Movie({
      title,
      category,
      description,
      hero,
      producer,
      price: Number(price) || 0,
      releaseDate,
      status: "coming",

      poster: {
        url: poster.url,
        publicId: poster.publicId
      },

      movie: {
        url: movie.url,
        publicId: movie.publicId
      }
    });

    await newMovie.save();

    res.json({
      message: "Movie saved successfully",
      movie: newMovie
    });

  } catch (error) {
    console.log("🔥 UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});



app.get("/api/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.delete("/api/movies/:id", auth, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // delete poster
    if (movie.poster?.publicId) {
      await cloudinary.uploader.destroy(movie.poster.publicId);
    }

    // delete video
    if (movie.movie?.publicId) {
      await cloudinary.uploader.destroy(movie.movie.publicId, {
        resource_type: "video"
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Movie deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "Signup successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role   // ✅ ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();

    res.json({ success: true, message: "Message saved" });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/contact", auth, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

app.delete("/api/contact/:id", auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/movies/:id", auth, adminOnly, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Movie deleted" });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/payment/check", async (req, res) => {
  try {
    const { userId, movieId } = req.body;

    const purchase = await Purchase.findOne({ userId, movieId });

    if (purchase) {
      res.json({ allowed: true });
    } else {
      res.json({ allowed: false });
    }

  } catch {
    res.status(500).json({ allowed: false });
  }
});

app.post("/api/payment/success", async (req, res) => {
  try {
    const {
      userId,
      movieId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment" });
    }

    const exists = await Purchase.findOne({ userId, movieId });

    if (exists) {
      return res.json({ success: false, message: "Already purchased" });
    }

    await Purchase.create({
      userId,
      movieId,
      paymentId: razorpay_payment_id,
      status: "success"
    });

    await Movie.findByIdAndUpdate(movieId, {
      $inc: { purchaseCount: 1 }
    });

    res.json({
      success: true,
      message: "Payment verified"
    });

  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/payment/order", async (req, res) => {
  try {
    const { amount } = req.body;

    // ✅ STRONG VALIDATION
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount required"
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
    });

    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/purchase/my", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const purchases = await Purchase.find({ userId })
      .select("movieId");

    res.json(purchases);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching purchases" });
  }
});



app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {

    // create JWT token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect with token
    res.redirect(`https://movie-platform-xi.vercel.app/social-login?token=${token}`);
  }
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});