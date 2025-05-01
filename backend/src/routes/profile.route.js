import express from "express";
import {
  updateProfile,
  getProfile,
} from "../controllers/profile.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProfile);
router.put("/update", protectRoute, updateProfile);

export default router;
