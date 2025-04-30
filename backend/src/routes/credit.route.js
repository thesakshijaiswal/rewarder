import express from "express";
import {
  getCreditBalance,
  getCreditHistory,
  awardProfileCompletion,
} from "../controllers/credit.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/balance", protectRoute, getCreditBalance);
router.get("/history", protectRoute, getCreditHistory);
router.post("/award/profile", protectRoute, awardProfileCompletion);

export default router;
