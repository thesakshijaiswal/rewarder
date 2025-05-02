import express from "express";
import {
  getAllUsers,
  getUserStats,
  getFeedStats,
  getCreditStats,
  getUserDetails,
} from "../controllers/admin.controller.js";
import { protectRoute, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(restrictTo("admin"));

router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);

router.get("/stats/users", getUserStats);
router.get("/stats/feed", getFeedStats);
router.get("/stats/credits", getCreditStats);

export default router;
