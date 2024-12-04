import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRoute from "./routes/tours.js";
import userRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import reviewRoute from "./routes/reviews.js";
import bookingRoute from "./routes/bookings.js";
import postRoute from "./routes/posts.js";
import cloudinary from "cloudinary";
import passport from "passport";
import "./config/configPassport.js"

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const corsOptions = {
  origin: true,
  credentials: true,
};

cloudinary.config({
  cloud_name: "dmbkgg1ac",
  api_key: "617596218884563",
  api_secret: "TCEqnvZW7eGCxSljGo5wDWOvwYg",
});

// database connection
mongoose.set("strictQuery", false);
const conect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
};

app.get('/', (req, res) => {
  res.send("<button><a href='/api/v1/auth/google'>Login With Google</a></button>")
});

// middleware
app.use(passport.initialize())
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/posts", postRoute);

app.listen(port, () => {
  conect();
  console.log(`Server is running on port ${port}`);
});
