import express from "express";
import { createBooking, getBooking, getAllBooking, getUserBookings, callback } from "../controllers/bookingController.js";
import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", createBooking);
router.get("/:id", verifyUser, getBooking);
router.get("/", verifyAdmin, getAllBooking);
router.get("/user/history", verifyUser, getUserBookings);
// router.get("/user/history/:id", getUserBookings);
router.post("/callback", callback)

export default router;
