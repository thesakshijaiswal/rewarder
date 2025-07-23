import Post from "../models/post.model.js";
import axios from "axios";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const RATE_LIMIT_BUFFER = 10;

let rateLimitRemaining = 180;
let rateLimitReset = null;

export const fetchTweets = async (query = "tech", count = 10) => {
  try {
    if (rateLimitRemaining < RATE_LIMIT_BUFFER) {
      console.warn("Rate limit low, using mock data");
      return getMockTweets(query, count);
    }

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
          max_results: Math.max(10, Math.min(count, 100)),
          "tweet.fields": "created_at,author_id,public_metrics,entities",
          expansions: "author_id,attachments.media_keys",
          "user.fields": "name,username,profile_image_url,verified",
          "media.fields": "url,preview_image_url",
        },
      }
    );

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

    if (!data.data || data.data.length === 0) {
      console.log("No tweets found for query:", query);
      return [];
    }

    const users = (data.includes?.users || []).reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

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

    if (error.response?.status === 429) {
      console.warn("Twitter API rate limit exceeded, using mock data");
      rateLimitRemaining = 0;
      return getMockTweets(query, count);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Using mock tweets for development");
      return getMockTweets(query, count);
    }

    throw error;
  }
};

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

  const names = [
    "Alice Johnson",
    "Raj Patel",
    "Emily Chen",
    "Carlos Reyes",
    "Fatima Khan",
    "Liam Smith",
    "Nina Gupta",
    "Tomoko Sato",
    "Jamal Brooks",
    "Isla Davies",
  ];

  const usernames = [
    "alicej",
    "raj_p",
    "emchen",
    "carlosr",
    "fatik",
    "liam_s",
    "nina_g",
    "tomos",
    "jamal_b",
    "isla_d",
  ];

  const tweetPhrases = [
    "I've been reflecting on this topic lately, and I think it's worth a deeper look into",
    "There's a lot of noise around this, but here's a perspective I believe deserves more attention:",
    "After digging into this subject for a while, I wanted to share some key insights I found about",
    "This might not be talked about enough, but it's something that really made me think deeply about",
    "In a world full of quick takes, here’s a more nuanced thought I’ve been forming on",
  ];

  return Array(count)
    .fill(null)
    .map((_, i) => {
      const topic = topics[query]?.[i % 5] || topics.default[i % 5];
      const phrase = tweetPhrases[i % tweetPhrases.length];
      const name = names[i % names.length];
      const username = usernames[i % usernames.length];

      return {
        title: `Tweet by ${name}`,
        content: `${phrase} ${topic}. #${query}`,
        url: `https://twitter.com/${username}/status/${Date.now()}_${i}`,
        source: "twitter",
        originalId: `mock_${Date.now()}_${i}`,
        author: username,
        authorName: name,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 37),
        imageUrl: `https://i.pravatar.cc/48?u=${username}`,
        metrics: {
          retweet_count: Math.floor(Math.random() * 100),
          reply_count: Math.floor(Math.random() * 50),
          like_count: Math.floor(Math.random() * 500),
          quote_count: Math.floor(Math.random() * 20),
        },
        isMock: true,
      };
    });
};

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

export const getTweetById = async (tweetId) => {
  try {
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
