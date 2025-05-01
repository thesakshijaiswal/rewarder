import express from "express";
import {
  updateFeed,
  getFeed,
  getPost,
  savePost,
  unsavePost,
  reportPost,
  sharePost,
  getUserSavedPosts,
  getReported,
  removeReportedPost,
  clearPostReports,
} from "../controllers/feed.controller.js";
import { protectRoute, restrictTo } from "../middleware/auth.middleware.js";
import { fetchTweets } from "../services/twitter.service.js";

const router = express.Router();

// Public routes
router.get("/", getFeed);
router.get("/post/:id", getPost);
router.get("/test-twitter", async (req, res) => {
  try {
    const tweets = await fetchTweets("tech", 2);
    res.json({
      success: true,
      tweets,
      message: "Twitter test endpoint",
    });
  } catch (error) {
    console.error("Twitter test error:", error);
    res.status(500).json({
      success: false,
      message: "Twitter test failed",
      error: error.response?.data || error.message,
      details: error.stack,
    });
  }
});

// protected user routes
router.use(protectRoute);
router.post("/refresh", updateFeed);
router.get("/saved", getUserSavedPosts);
router.post("/post/:id/save", savePost);
router.delete("/post/:id/unsave", unsavePost);
router.post("/post/:id/report", reportPost);
router.post("/post/:id/share", sharePost);

// admin
router.get("/reported", protectRoute, restrictTo("admin"), getReported);
router.delete(
  "/post/:id",
  protectRoute,
  restrictTo("admin"),
  removeReportedPost
);
router.put(
  "/post/:id/clear-reports",
  protectRoute,
  restrictTo("admin"),
  clearPostReports
);

export default router;
