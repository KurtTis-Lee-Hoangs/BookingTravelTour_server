import express from "express";
import { createBooking, getBooking, getAllBooking, getUserBookings } from "../controllers/bookingController.js";
import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/:id", verifyUser, getBooking);
router.get("/", verifyAdmin, getAllBooking);
router.get("/user/history", verifyUser, getUserBookings);
// router.get("/user/history/:id", getUserBookings);

export default router;
