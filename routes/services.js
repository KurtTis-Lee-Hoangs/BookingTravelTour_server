import express from "express";
import { weatherAPI } from "../controllers/services/weatherController.js";

const router = express.Router()

router.get("/weather", weatherAPI)

export default router;