import express from "express";
const router = express.Router();
import {
  createHotelRoom,
  deleteHotelRoom,
  getAllHotelRoom,
  getSingleHotelRoom,
} from "../controllers/hotelController.js";
router.get("/", getAllHotelRoom);
router.post("/", createHotelRoom);
router.get("/:id", getSingleHotelRoom);
router.delete("/:id", deleteHotelRoom);
export default router;