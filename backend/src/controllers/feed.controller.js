import {
  refreshFeed,
  getFeedContent,
  getPostById,
  getSavedPosts,
  getReportedPosts,
} from "../services/feed.service.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";

export const updateFeed = async (req, res) => {
  try {
    const result = await refreshFeed();

    res.status(200).json({
      success: true,
      message: `Feed refreshed with ${result.count} new items`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error refreshing feed",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Error fetching feed",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Post already saved",
      });
    }

    post.savedBy.push(userId);
    await post.save();

    await User.findByIdAndUpdate(userId, {
      $push: { savedPosts: post._id },
    });

    const user = await User.findById(userId);
    user.credits += 2;
    await user.save();

    await CreditTransaction.create({
      user: userId,
      amount: 2,
      type: "content_interaction",
      description: "Credits awarded for saving content",
    });

    res.status(200).json({
      success: true,
      message: "Post saved and credits awarded",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving post",
      error: error.message,
    });
  }
};

export const unsavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!post.savedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Post not saved by user",
      });
    }

    post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
    await post.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { savedPosts: post._id },
    });

    res.status(200).json({
      success: true,
      message: "Post removed from saved items",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unsaving post",
      error: error.message,
    });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason for report is required",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.reportedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Post already reported by you",
      });
    }

    post.reportedBy.push(userId);
    post.reportReasons.push({
      user: userId,
      reason,
    });
    await post.save();

    const user = await User.findById(userId);
    user.credits += 1;
    await user.save();

    await CreditTransaction.create({
      user: userId,
      amount: 1,
      type: "content_interaction",
      description: "Credits awarded for reporting content",
    });

    res.status(200).json({
      success: true,
      message: "Post reported and credits awarded",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting post",
      error: error.message,
    });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(userId);
    user.credits += 3;
    await user.save();

    await CreditTransaction.create({
      user: userId,
      amount: 3,
      type: "content_interaction",
      description: "Credits awarded for sharing content",
    });

    res.status(200).json({
      success: true,
      message: "Post shared and credits awarded",
      shareUrl: post.url,
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sharing post",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Error fetching saved posts",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Error fetching reported posts",
      error: error.message,
    });
  }
};

export const removeReportedPost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reported post removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing reported post",
      error: error.message,
    });
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

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reports cleared successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing reports",
      error: error.message,
    });
  }
};
