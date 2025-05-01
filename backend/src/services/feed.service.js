import { fetchTweets, storeTweets } from "./twitter.service.js";
import { fetchRedditPosts, storeRedditPosts } from "./reddit.service.js";
import Post from "../models/post.model.js";

export const refreshFeed = async () => {
  try {
    console.log("Starting feed refresh...");
    console.log("Fetching tweets...");
    const tweets = await fetchTweets("tech", 5);
    console.log(`Fetched ${tweets?.length || 0} tweets`);
    await storeTweets(tweets);

    console.log("Fetching Reddit posts...");
    const redditPosts = await fetchRedditPosts("programming", 5);
    console.log(`Fetched ${redditPosts?.length || 0} Reddit posts`);
    await storeRedditPosts(redditPosts);

    return {
      success: true,
      count: tweets.length + redditPosts.length,
    };
  } catch (error) {
    console.error(
      "Error refreshing feed details:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFeedContent = async (page = 1, limit = 10, filter = {}) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

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
      .limit(limit);

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
      .limit(limit);

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
