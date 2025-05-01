import Post from "../models/post.model.js";
import axios from "axios";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const RATE_LIMIT_BUFFER = 10; // Number of requests to keep as buffer

// Rate limit tracking
let rateLimitRemaining = 180; // Twitter's default rate limit
let rateLimitReset = null;

/**
 * Fetches tweets from Twitter API v2
 * @param {string} query - Search query for tweets
 * @param {number} count - Number of tweets to fetch
 * @returns {Array} - Array of tweets formatted as Post objects
 */
export const fetchTweets = async (query = "tech", count = 10) => {
  try {
    // Check rate limits before making request
    if (rateLimitRemaining < RATE_LIMIT_BUFFER) {
      console.warn("Rate limit low, using mock data");
      return getMockTweets(query, count);
    }

    // Validate bearer token
    if (!TWITTER_BEARER_TOKEN) {
      console.error("Twitter API bearer token is missing");
      return getMockTweets(query, count);
    }

    const response = await axios.get(
      "https://api.twitter.com/2/tweets/search/recent",
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          "User-Agent": "v2RecentSearchJS",
        },
        params: {
          query: query,
          max_results: Math.min(count, 100),
          "tweet.fields": "created_at,author_id,public_metrics,entities",
          expansions: "author_id,attachments.media_keys",
          "user.fields": "name,username,profile_image_url,verified",
          "media.fields": "url,preview_image_url",
        },
      }
    );

    // Update rate limit info
    rateLimitRemaining = parseInt(
      response.headers["x-rate-limit-remaining"] || rateLimitRemaining
    );
    rateLimitReset = parseInt(response.headers["x-rate-limit-reset"] || null);

    if (rateLimitRemaining < RATE_LIMIT_BUFFER) {
      console.warn(
        `Twitter API rate limit critical: ${rateLimitRemaining} requests remaining`
      );
      console.warn(
        `Rate limit resets at: ${new Date(rateLimitReset * 1000).toISOString()}`
      );
    }

    const data = response.data;

    // Handle empty response
    if (!data.data || data.data.length === 0) {
      console.log("No tweets found for query:", query);
      return [];
    }

    // Create user lookup map
    const users = (data.includes?.users || []).reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Format tweets
    const posts = data.data.map((tweet) => {
      const user = users[tweet.author_id] || {
        username: "unknown",
        name: "Unknown User",
        profile_image_url: null,
      };

      return formatTweetAsPost(tweet, user);
    });

    return posts;
  } catch (error) {
    console.error(
      "Error fetching tweets:",
      error.response?.data || error.message
    );

    // Handle rate limit error specifically
    if (error.response?.status === 429) {
      console.warn("Twitter API rate limit exceeded, using mock data");
      rateLimitRemaining = 0;
      return getMockTweets(query, count);
    }

    // For development, fall back to mock data
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock tweets for development");
      return getMockTweets(query, count);
    }

    throw error;
  }
};

/**
 * Format a tweet as a Post object
 * @param {Object} tweet - Tweet data from Twitter API
 * @param {Object} user - User data from Twitter API
 * @returns {Object} - Formatted post object
 */
const formatTweetAsPost = (tweet, user) => ({
  title: `Tweet by ${user.name} (@${user.username})`,
  content: tweet.text,
  url: `https://twitter.com/${user.username}/status/${tweet.id}`,
  source: "twitter",
  originalId: tweet.id,
  author: user.username,
  authorName: user.name,
  createdAt: new Date(tweet.created_at),
  imageUrl: user.profile_image_url,
  metrics: tweet.public_metrics || {},
});

/**
 * Generate mock tweets for development/testing
 */
const getMockTweets = (query, count) => {
  const topics = {
    tech: ["AI", "Programming", "Web Dev", "Cloud Computing", "Cybersecurity"],
    news: ["Technology", "Science", "Business", "World News", "Innovation"],
    default: [
      "Technology",
      "Innovation",
      "Development",
      "Software",
      "Tech News",
    ],
  };

  return Array(count)
    .fill(null)
    .map((_, i) => ({
      title: `Mock Tweet ${i + 1}`,
      content: `This is a mock tweet about ${
        topics[query]?.[i % 5] || topics.default[i % 5]
      }. #${query}`,
      url: `https://twitter.com/mock/status/${Date.now()}_${i}`,
      source: "twitter",
      originalId: `mock_${Date.now()}_${i}`,
      author: `mockuser${i}`,
      authorName: `Mock User ${i}`,
      createdAt: new Date(Date.now() - i * 3600000),
      imageUrl: `https://via.placeholder.com/48x48?text=U${i}`,
      metrics: {
        retweet_count: Math.floor(Math.random() * 100),
        reply_count: Math.floor(Math.random() * 50),
        like_count: Math.floor(Math.random() * 500),
        quote_count: Math.floor(Math.random() * 20),
      },
      isMock: true,
    }));
};

/**
 * Store tweets in database
 */
export const storeTweets = async (tweets) => {
  try {
    if (!tweets || tweets.length === 0) {
      console.warn("No tweets to store");
      return false;
    }

    const operations = tweets.map((tweet) => ({
      updateOne: {
        filter: { originalId: tweet.originalId, source: "twitter" },
        update: { $set: tweet },
        upsert: true,
      },
    }));

    const result = await Post.bulkWrite(operations);
    console.log(
      `Stored ${result.upsertedCount} new tweets, modified ${result.modifiedCount} existing tweets`
    );
    return true;
  } catch (error) {
    console.error("Error storing tweets:", error);
    throw error;
  }
};

/**
 * Get a single tweet by ID
 */
export const getTweetById = async (tweetId) => {
  try {
    // First try to get from database
    const existingPost = await Post.findOne({
      originalId: tweetId,
      source: "twitter",
    });
    if (existingPost) return existingPost;

    if (!TWITTER_BEARER_TOKEN) {
      throw new Error("Twitter API bearer token is required");
    }

    const response = await axios.get(
      `https://api.twitter.com/2/tweets/${tweetId}`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          "User-Agent": "v2TweetLookupJS",
        },
        params: {
          "tweet.fields": "created_at,author_id,public_metrics",
          expansions: "author_id",
          "user.fields": "name,username,profile_image_url",
        },
      }
    );

    const tweet = response.data.data;
    const user = response.data.includes?.users?.[0] || {
      username: "unknown",
      name: "Unknown User",
      profile_image_url: null,
    };

    const formattedTweet = formatTweetAsPost(tweet, user);
    await storeTweets([formattedTweet]);

    return formattedTweet;
  } catch (error) {
    console.error("Error fetching tweet by ID:", error);
    throw error;
  }
};
