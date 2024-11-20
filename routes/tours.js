import express from "express";
import {
  createTour,
  updateTour,
  deleteTour,
  getSingleTour,
  getAllTourByUser,
  getAllTourByAdmin,
  getTourBySearch,
  getFeaturedTour,
  getTourCount,
} from "../controllers/tourController.js";

import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// create a new tour
router.post("/", verifyAdmin, createTour);

// update a tour
router.put("/:id", verifyAdmin, updateTour);

// delete a tour
router.delete("/:id", verifyAdmin, deleteTour);

// get a single tour
router.get("/:id", getSingleTour);

// get all tours user
router.get("/user/getAllTourByUser", getAllTourByUser);

// get all tours admin
router.get("/", verifyAdmin, getAllTourByAdmin);

// get tour by search
router.get("/search/getTourBySearch", getTourBySearch);

// get featured tour
router.get("/search/getFeaturedTours", getFeaturedTour);

// get tour counts
router.get("/search/getTourCount", getTourCount);

export default router;