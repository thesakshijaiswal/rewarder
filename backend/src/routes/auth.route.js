import express from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getCurrentUser);

export default router;
