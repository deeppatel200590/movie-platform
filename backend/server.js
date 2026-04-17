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
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { load } from "cashfree-dropjs";
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


const allowedOrigins = [
  "https://movie-platform-xi.vercel.app",
  "https://www.varenyafilms.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.use(express.json({ limit: "600mb" }));
app.use(express.urlencoded({ limit: "600mb", extended: true }));

app.use("/uploads", express.static("uploads"));

connectDB();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});



// Cashfree.XClientId = process.env.CASHFREE_APP_ID;
// Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

// Cashfree.XEnvironment =
//   process.env.CASHFREE_ENV === "production"
//     ? CFEnvironment.PRODUCTION
//     : CFEnvironment.SANDBOX;


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

app.post(
  "/api/movies/upload",
  auth,
  adminOnly,
  upload.single("poster"),
  async (req, res) => {
    try {
      // 1. Poster file from multer
      const posterFile = req.file;

      if (!posterFile) {
        return res.status(400).json({ message: "Poster is required" });
      }

      // 2. Upload poster to R2
      const posterKey = `posters/${Date.now()}-${posterFile.originalname}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: posterKey,
          Body: posterFile.buffer,
          ContentType: posterFile.mimetype,
        })
      );

      const posterUrl = `https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/${posterKey}`;

      // 3. Create movie in DB (movie file already uploaded via presigned URL)
      const newMovie = new Movie({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        hero: req.body.hero,
        producer: req.body.producer,
        price: Number(req.body.price),
        releaseDate: new Date(req.body.releaseDate),

        status:
          new Date(req.body.releaseDate) <= new Date()
            ? "released"
            : "coming",

        poster: posterUrl,

        // ✅ IMPORTANT: comes from frontend (R2 direct upload)
        movieUrl: req.body.movieUrl,
      });

      await newMovie.save();

      res.json({
        message: "Upload successful",
        movie: newMovie,
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

    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
        },
      }
    );

    const status = response.data.order_status;
    console.log("CASHFREE STATUS:", status); // Check your terminal to see what this says!

    // ✅ Fix: Allow "PAID" or "SUCCESS"
    if (status === "PAID" || status === "SUCCESS") {
      const movie = await Movie.findById(movieId);
      const exists = await Purchase.findOne({ userId, movieId });

      if (!exists) {
        const newPurchase = await Purchase.create({
          userId,
          movieId,
          paymentId: orderId, // Or response.data.cf_order_id
          orderId,
          amount: movie.price,
          status: "success",
        });
        console.log("PURCHASE SAVED:", newPurchase);
      }
      return res.json({ success: true });
    }

    return res.json({ success: false, message: `Status is ${status}` });
  } catch (err) {
    console.error("VERIFY ERROR:", err.response?.data || err.message);
    res.status(500).json({ success: false });
  }
});

app.post("/api/payment/order", auth, async (req, res) => {
  try {
    const { movieId } = req.body;

    const movie = await Movie.findById(movieId);
    const user = await User.findById(req.user.id);

    if (!movie || !user) {
      return res.status(404).json({ message: "Not found" });
    }

    // ✅ FIX: proper uuid
    const orderId = uuidv4();

    const request = {
  order_id: orderId,
  order_amount: movie.price.toFixed(2).toString(),
  order_currency: "INR",
  customer_details: {
    customer_id: user._id.toString(),
    customer_email: user.email,
    customer_phone: user.phone || "9999999999", // Ensure this isn't empty
  },
  order_meta: {
    // Replace with your actual frontend URL
    return_url: `https://movie-platform-xi.vercel.app/payment-verify?order_id={order_id}&movie_id=${movieId}`
  }
};

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      request,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });

  } catch (err) {
    console.error("CASHFREE ORDER ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Order failed" });
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

app.post("/api/movies/get-presigned-url", auth, adminOnly, async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    // This creates the "path" where the movie will live in R2
    const movieKey = `movies/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: movieKey,
      ContentType: fileType,
    });

    // Generate the "magic link" - valid for 1 hour
    // Even though it says 's3', it works for R2 because of your r2 client config
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    res.json({
      uploadUrl, // Frontend uses this to upload
      publicUrl: `https://pub-b7ae3ac99fe042c2b66e569f1ba04c88.r2.dev/${movieKey}` // This goes in your DB
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    res.status(500).json({ message: "Could not generate upload link" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});