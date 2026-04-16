import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./model/connection.js";
import cors from "cors";
import upload from "./model/multer.js";
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
import { generateOTP } from "./model/otp.js";
import { sendEmail } from "./model/sendEmail.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2 from "./model/r2.js";
import { Cashfree, CFEnvironment } from "cashfree-pg";
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
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



Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

Cashfree.XEnvironment =
  process.env.CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;


  app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();

  } catch (err) {
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

app.get("/test-email", async (req, res) => {
  try {
    const email = req.query.email;

    const otp = "123456"; // test OTP

    await sendEmail(email, otp);

    res.json({
      success: true,
      message: `Email sent to ${email}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

app.post("/api/movies/upload",
  auth,
  adminOnly,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "movie", maxCount: 1 }
  ]),
  async (req, res) => {
    try {

      const posterFile = req.files.poster[0];
      const movieFile = req.files.movie[0];

      // 🔥 Upload Poster
      const posterKey = `posters/${Date.now()}-${posterFile.originalname}`;

      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: posterKey,   // ✅ correct
        Body: posterFile.buffer,
        ContentType: posterFile.mimetype,
      }));

      // 🔥 Upload Movie
      const movieKey = `movies/${Date.now()}-${movieFile.originalname}`;

      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: movieKey,
        Body: movieFile.buffer,
        ContentType: movieFile.mimetype,
      }));

      // ✅ Generate URLs
      // ✅ Use PUBLIC R2 URL (IMPORTANT)
      const posterUrl = `https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/${posterKey}`;
      const movieUrl = `https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/${movieKey}`;
      const releaseDate = new Date(req.body.releaseDate);
      let status = "coming";

      if (!isNaN(releaseDate.getTime()) && releaseDate <= new Date()) {
        status = "released";
      }

      const newMovie = new Movie({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        hero: req.body.hero,
        price: Number(req.body.price),
        releaseDate,
        status,
        producer: req.body.producer,
        poster: posterUrl,
        movieUrl: movieUrl
      });

      await newMovie.save();

      res.json({
        message: "Upload successful",
        movie: newMovie
      });

    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

app.get("/api/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.get("/api/movies/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  res.json(movie);
});

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate OTP
    const otp = generateOTP();

    // 4. Send email FIRST (important)
    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    // 5. Save user AFTER email success
    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      isVerified: false
    });

    // 6. Response
    res.json({ message: "OTP sent to your email" });

  } catch (error) {
    console.log("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ 3. CHECK EMAIL VERIFIED (THIS IS YOUR MAIN FIX)
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    // ✅ 4. Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ 5. Send response
    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
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

app.delete("/api/contact/:id", auth,adminOnly, async (req, res) => {
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

app.post("/api/payment/check", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    const purchase = await Purchase.findOne({ userId, movieId });

    res.json({ allowed: !!purchase });

  } catch {
    res.status(500).json({ allowed: false });
  }
});

// app.post("/api/payment/success", async (req, res) => {
//   try {
//     const {
//       userId,
//       movieId,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid payment" });
//     }

//     const exists = await Purchase.findOne({ userId, movieId });

//     if (exists) {
//       return res.json({ success: false, message: "Already purchased" });
//     }

//     await Purchase.create({
//       userId,
//       movieId,
//       paymentId: razorpay_payment_id,
//       status: "success"
//     });

//     await Movie.findByIdAndUpdate(movieId, {
//       $inc: { purchaseCount: 1 }
//     });

//     res.json({
//       success: true,
//       message: "Payment verified"
//     });

//   } catch {
//     res.status(500).json({ success: false });
//   }
// });

app.post("/api/payment/verify", auth, async (req, res) => {
  try {
    const { orderId, movieId } = req.body;
    const userId = req.user.id;

   const response = await Cashfree.PGFetchOrder(orderId);

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ success: false });

    const status = response.data.order_status;

    if (status === "PAID") {
      const exists = await Purchase.findOne({ userId, movieId });

      if (!exists) {
        await Purchase.create({
          userId,
          movieId,
          paymentId: orderId,
          orderId,
          amount: movie.price,
          status: "success",
        });

        await Movie.findByIdAndUpdate(movieId, {
          $inc: { purchaseCount: 1 },
        });
      }

      return res.json({ success: true });
    }

    return res.json({ success: false });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/payment/order", auth, async (req, res) => {
  try {
    console.log("ORDER ROUTE HIT");
    const { movieId } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const orderId = "order_" + Date.now();

    const request = {
      order_id: orderId,
      order_amount: Number(movie.price),
      order_currency: "INR",
      customer_details: {
        customer_id: user._id.toString(),
        customer_email: user.email,
        customer_phone: "9999999999",
      },
    };

    const response = await Cashfree.PGCreateOrder(request);

    return res.json({
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });

  } catch (err) {
  console.error("ORDER ERROR FULL:", err?.response?.data || err);
  res.status(500).json({ message: "Order creation failed" });
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

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});