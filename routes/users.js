import express from "express";
import { verifyUser, verifyAdmin } from "../utils/verifyToken.js";
import {
  updateUser,
  deleteUser,
  getSingleUser,
  getAllUser,
} from "../controllers/userController.js";

const router = express.Router();

// update a user
// router.put("/:id", verifyUser, updateUser);
router.put("/:id", updateUser);

// delete a user
router.delete("/:id", verifyUser, deleteUser);

// get a single user
router.get("/:id", verifyUser, getSingleUser);

// get all users
router.get("/", verifyAdmin, getAllUser);
// router.get("/" , getAllUser);

export default router;
