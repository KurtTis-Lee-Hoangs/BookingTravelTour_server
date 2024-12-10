import express from "express";

import tourRoute from "./tours.js";
import userRoute from "./users.js";
import authRoute from "./auth.js";
import reviewRoute from "./reviews.js";
import bookingRoute from "./bookings.js";
import blogRoute from "./blogs.js";
import servicesRoute from "./services.js"
import hotelRoute from "./hotel.js"

const app = express()

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/blogs", blogRoute);
app.use("/api/v1/services", servicesRoute)
app.use("/api/v1/hotels", hotelRoute)

export default app;