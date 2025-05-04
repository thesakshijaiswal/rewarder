import {
  refreshFeed,
  getFeedContent,
  getPostById,
  getSavedPosts,
  getReportedPosts,
} from "../services/feed.service.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { awardCredits, handleError } from "../lib/utils.js";

export const updateFeed = async (req, res) => {
  try {
    const result = await refreshFeed();
    res.status(200).json({
      success: true,
      message: `Feed refreshed with ${result.count} new items`,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "updateFeed");
  }
};

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, source } = req.query;
    const filter = source ? { source } : {};
    const result = await getFeedContent(
      parseInt(page),
      parseInt(limit),
      filter
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "getFeed");
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    handleError(res, error, "getPost");
  }
};

export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    if (post.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Post already saved",
      });
    }
    post.savedBy.push(userId);
    await post.save();
    await User.findByIdAndUpdate(userId, { $push: { savedPosts: post._id } });
    const credits = await awardCredits(
      userId,
      2,
      "Credits awarded for saving content"
    );
    res.status(200).json({
      success: true,
      message: "Post saved and credits awarded",
      credits,
    });
  } catch (error) {
    handleError(res, error, "savePost");
  }
};

export const unsavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    if (!post.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Post not saved by user",
      });
    }
    post.savedBy = post.savedBy.filter((uid) => uid.toString() !== userId);
    await post.save();
    await User.findByIdAndUpdate(userId, { $pull: { savedPosts: post._id } });
    res.status(200).json({
      success: true,
      message: "Post removed from saved items",
    });
  } catch (error) {
    handleError(res, error, "unsavePost");
  }
};

export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    if (post.reportedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      });
    }
    post.reportedBy.push(userId);
    post.reportReasons.push({ user: userId, reason });
    await post.save();
    const credits = await awardCredits(
      userId,
      1,
      "Credits awarded for reporting content"
    );
    res.status(200).json({
      success: true,
      message: "Post reported and credits awarded",
      credits,
    });
  } catch (error) {
    handleError(res, error, "reportPost");
  }
};

export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    post.shareCount = (post.shareCount || 0) + 1;
    await post.save();
    const credits = await awardCredits(
      userId,
      3,
      "Credits awarded for sharing content"
    );
    res.status(200).json({
      success: true,
      message: "Post shared and credits awarded",
      shareUrl: post.url,
      credits,
    });
  } catch (error) {
    handleError(res, error, "sharePost");
  }
};

export const getUserSavedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const result = await getSavedPosts(userId, parseInt(page), parseInt(limit));
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "getUserSavedPosts");
  }
};

export const getReported = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getReportedPosts(parseInt(page), parseInt(limit));
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "getReported");
  }
};

export const removeReportedPost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    res.status(200).json({
      success: true,
      message: "Reported post removed successfully",
    });
  } catch (error) {
    handleError(res, error, "removeReportedPost");
  }
};

export const clearPostReports = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(
      id,
      {
        reportedBy: [],
        reportReasons: [],
      },
      { new: true }
    );
    if (!post)
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    res.status(200).json({
      success: true,
      message: "Reports cleared successfully",
      post,
    });
  } catch (error) {
    handleError(res, error, "clearPostReports");
  }
};
