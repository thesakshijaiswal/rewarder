import { getTweets, storeTweets } from "./twitter.service.js";
import {
  fetchRedditPosts,
  storeRedditPosts,
  fetchMultipleSubreddits,
} from "./reddit.service.js";
import Post from "../models/post.model.js";

export const refreshFeed = async () => {
  try {
    let totalCount = 0;
    const results = {
      twitter: { success: false, count: 0, error: null },
      reddit: { success: false, count: 0, error: null },
    };
    try {
      const tweets = await getTweets("tech", 10);
      if (tweets && tweets.length > 0) {
        await storeTweets(tweets);
        results.twitter.success = true;
        results.twitter.count = tweets.length;
        totalCount += tweets.length;
      }
    } catch (error) {
      console.error("Twitter fetch error:", error);
      results.twitter.error = error.message;
    }

    try {
      let redditPosts = [];
      try {
        redditPosts = await fetchMultipleSubreddits(
          ["programming", "technology", "webdev"],
          3
        );
        console.log(
          `Fetched ${
            redditPosts?.length || 0
          } Reddit posts from multiple subreddits`
        );
      } catch (error) {
        console.log(
          "Multiple subreddits approach failed, trying single subreddit"
        );
        redditPosts = await fetchRedditPosts("programming", 5);
        console.log(
          `Fetched ${
            redditPosts?.length || 0
          } Reddit posts from single subreddit`
        );
      }

      if (redditPosts && redditPosts.length > 0) {
        await storeRedditPosts(redditPosts);
        results.reddit.success = true;
        results.reddit.count = redditPosts.length;
        totalCount += redditPosts.length;
      }
    } catch (error) {
      console.error("Reddit fetch error:", error);
      results.reddit.error = error.message;
    }

    console.log("=== Feed refresh completed ===");
    console.log("Results:", results);

    return {
      success: totalCount > 0,
      count: totalCount,
      details: results,
      message:
        totalCount > 0
          ? `Successfully refreshed feed with ${totalCount} new items`
          : "Feed refresh completed but no new items were fetched",
    };
  } catch (error) {
    console.error("Error refreshing feed:", error);
    throw error;
  }
};

export const getFeedContent = async (page = 1, limit = 10, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = { ...filter };
    query.title = { $nin: ["[deleted]", "[removed]"] };
    query.author = { $nin: ["[deleted]", "[removed]"] };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return {
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch (error) {
    console.error("Error getting feed content:", error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    return post;
  } catch (error) {
    console.error("Error getting post by ID:", error);
    throw error;
  }
};

export const getSavedPosts = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ savedBy: userId });

    return {
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch (error) {
    console.error("Error getting saved posts:", error);
    throw error;
  }
};

export const getReportedPosts = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ "reportedBy.0": { $exists: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      "reportedBy.0": { $exists: true },
    });

    return {
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch (error) {
    console.error("Error getting reported posts:", error);
    throw error;
  }
};

export const clearOldPosts = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Post.deleteMany({
      createdAt: { $lt: cutoffDate },
      savedBy: { $size: 0 },
    });

    console.log(`Cleaned up ${result.deletedCount} old posts`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error clearing old posts:", error);
    throw error;
  }
};

export const getPostStats = async () => {
  try {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          avgShareCount: { $avg: "$shareCount" },
          totalSaved: { $sum: { $size: "$savedBy" } },
          totalReported: { $sum: { $size: "$reportedBy" } },
        },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("Error getting post stats:", error);
    throw error;
  }
};
