import express from "express";
import {
  updateUser,
  deleteUser,
  getSingleUser,
  getAllUser,
} from "../controllers/userController.js";
const router = express.Router();

import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";

// update a user
router.put("/:id", verifyUser, updateUser);

// delete a user
router.delete("/:id", verifyUser, deleteUser);

// get a single user
router.get("/:id", verifyUser, getSingleUser);

// get all users
router.get("/", verifyAdmin, getAllUser);

export default router;
