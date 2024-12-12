import express from "express";

const router = express.Router();
import {
  createHotel,
  createHotelBooking,
  deleteHotel,
  getAllHotel,
  getHotelCount,
  getHotelRoomCount,
  getSingleHotel,
  getUserBookings,
  updateHotel,
  updateHotelRoom,
} from "../controllers/hotelController.js";

import {
  createHotelRoom,
  deleteHotelRoom,
  getAllHotelRoom,
  getSingleHotelRoom,
} from "../controllers/hotelController.js";
import { vnpayReturn } from "../controllers/paymentController.js";

router.get("/", getAllHotel);
router.get("/:id", getSingleHotel);
router.get("/search/getHotelCount", getHotelCount);
router.post("/", createHotel);
router.put("/:id", updateHotel)
router.delete("/:id", deleteHotel);

router.get("/history/:id", getUserBookings)
router.post("/payment", createHotelBooking)
router.get("/payment/vnpay_return", vnpayReturn)

router.get("/rooms/:id", getAllHotelRoom);
router.get("/room/:id", getSingleHotelRoom);
router.get("/room/search/getHotelRoomCount", getHotelRoomCount)
router.post("/room", createHotelRoom);
router.put("/room/:id", updateHotelRoom)
router.delete("/room/:id", deleteHotelRoom);

export default router;
