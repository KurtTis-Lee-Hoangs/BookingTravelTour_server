import express from "express";
import {
  register,
  login,
  googleLogin,
} from "../controllers/authController.js";
// import passport from "passport";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

router.post("/google-login", googleLogin)

export default router;
