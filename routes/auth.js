import express from "express";
import {
  register,
  login,
  googleCallback,
} from "../controllers/authController.js";
import passport from "passport"

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
