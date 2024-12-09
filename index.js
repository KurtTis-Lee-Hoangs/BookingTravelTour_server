import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import apiRoute from "./routes/api.js"

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

// middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/', apiRoute)

app.listen(port, () => {
  conect();
  console.log(`Server is running on port ${port}`);
});
