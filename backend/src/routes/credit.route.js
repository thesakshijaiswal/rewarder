import express from "express";
import {
  getCreditBalance,
  getCreditHistory,
  awardProfileCompletion,
  awardContentInteraction,
  adjustUserCredits,
} from "../controllers/credit.controller.js";
import { protectRoute, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

//user
router.get("/balance", protectRoute, getCreditBalance);
router.get("/history", protectRoute, getCreditHistory);
router.post("/award/profile", protectRoute, awardProfileCompletion);
router.post("/award/interaction", protectRoute, awardContentInteraction);

//admin
router.post("/adjust", protectRoute, restrictTo("admin"), adjustUserCredits);

export default router;
