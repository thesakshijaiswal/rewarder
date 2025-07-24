import Post from "../models/post.model.js";
import axios from "axios";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const RATE_LIMIT_BUFFER = 10;

// Free tier quota tracking
let monthlyQuotaUsed = 0;
const FREE_TIER_MONTHLY_LIMIT = 100;
let currentMonth = new Date().getMonth();

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

    const maxResults = 100;

    const response = await axios.get(
      "https://api.twitter.com/2/tweets/search/recent",
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          "User-Agent": "v2RecentSearchJS",
        },
        params: {
          query: query,
          max_results: maxResults,
          "tweet.fields":
            "created_at,author_id,public_metrics,entities,lang,possibly_sensitive",
          expansions: "author_id,attachments.media_keys,referenced_tweets.id",
          "user.fields": "name,username,profile_image_url,verified,description",
          "media.fields": "url,preview_image_url,type",
        },
      }
    );

    rateLimitRemaining = parseInt(
      response.headers["x-rate-limit-remaining"] || rateLimitRemaining
    );
    rateLimitReset = parseInt(response.headers["x-rate-limit-reset"] || null);

    // Track monthly quota usage
    monthlyQuotaUsed += 1;
    console.log(
      `API call made. Monthly usage: ${monthlyQuotaUsed}/${FREE_TIER_MONTHLY_LIMIT}`
    );

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
      return getMockTweets(query, count);
    }

    const users = (data.includes?.users || []).reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const allPosts = data.data.map((tweet) => {
      const user = users[tweet.author_id] || {
        username: "unknown",
        name: "Unknown User",
        profile_image_url: null,
      };

      return formatTweetAsPost(tweet, user);
    });

    await storeTweets(allPosts);

    return allPosts.slice(0, count);
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
  verified: user.verified || false,
  description: user.description || "",
});

const getMockTweets = (query, count) => {
  const techTopics = [
    "AI and Machine Learning",
    "Web Development",
    "Cloud Computing",
    "Cybersecurity",
    "DevOps",
    "Mobile Development",
    "Blockchain",
    "Data Science",
    "IoT",
    "AR/VR",
    "Software Architecture",
    "Open Source",
    "Programming Languages",
    "Database Management",
    "UI/UX Design",
    "API Development",
    "Microservices",
    "Containerization",
  ];

  const newsTopics = [
    "Technology Innovation",
    "Startup Funding",
    "Tech Industry",
    "Digital Transformation",
    "Remote Work",
    "Climate Tech",
    "Health Tech",
    "Fintech",
    "EdTech",
    "E-commerce",
    "Social Media Trends",
    "Digital Privacy",
    "Tech Regulation",
    "Future of Work",
  ];

  const tweetTemplates = [
    "Just spent hours debugging and realized {topic} implementation needs a completely different approach. The key insight: {insight}",
    "Working with {topic} has taught me that {lesson}. Here's what I wish I knew earlier: {tip}",
    "Hot take: {topic} is overhyped, but {counter_point}. What's your experience?",
    "After 6 months using {topic} in production, here are 3 things that surprised me: {points}",

    "The {topic} space is evolving rapidly. Seeing companies pivot from {old_way} to {new_way}",
    "Interesting trend: {topic} adoption is accelerating in {industry}. The implications are huge for {impact}",
    "Been following {topic} development for years. The recent breakthrough in {area} changes everything",
    "Market prediction: {topic} will be mainstream within {timeframe}. Here's why: {reasoning}",

    "Today I learned {topic} the hard way. Mistake: {mistake}. Solution: {solution}. Lesson learned!",
    "Switching from {old_tech} to {topic} was the best decision for our team. Performance improved by {metric}",
    "Unpopular opinion: {topic} isn't always the answer. Sometimes {alternative} works better, especially when {condition}",
    "Building with {topic} for the first time. The learning curve is steep but the possibilities are endless",

    "What's your take on {topic}? I'm seeing mixed results in {context} and wondering if others have similar experiences",
    "Developers working with {topic}: what's your biggest pain point? Looking for solutions and best practices",
    "Quick poll: For {topic} projects, do you prefer {option1} or {option2}? Why?",
    "Seeking advice on {topic} architecture. Current setup works but scaling concerns are real. Thoughts?",
  ];

  const insights = [
    "performance bottlenecks often come from unexpected places",
    "user experience should drive technical decisions",
    "simple solutions are usually the right solutions",
    "documentation is as important as the code itself",
    "testing early saves debugging time later",
  ];

  const lessons = [
    "premature optimization is the root of all evil",
    "consistency beats perfection in team environments",
    "user feedback is more valuable than internal assumptions",
    "monitoring and observability are non-negotiable",
    "code review culture improves everyone's skills",
  ];

  const tips = [
    "start with the simplest solution that works",
    "invest time in proper error handling upfront",
    "write tests before refactoring existing code",
    "document your architectural decisions",
    "monitor everything, alert on what matters",
  ];

  const names = [
    "Sarah Chen",
    "Marcus Rodriguez",
    "Priya Sharma",
    "Alex Thompson",
    "Fatima Al-Zahra",
    "David Kim",
    "Elena Petrov",
    "Raj Mehta",
    "Isabella Santos",
    "James Mitchell",
    "Aisha Okonkwo",
    "Lars Andersen",
    "Maya Gupta",
    "Carlos Mendoza",
    "Zoe Williams",
    "Ahmed Hassan",
    "Nina Kowalski",
    "Hiroshi Tanaka",
    "Sophia Dubois",
    "Omar Ali",
  ];

  const usernames = [
    "sarahc_dev",
    "marcusr_tech",
    "priya_codes",
    "alexthompson",
    "fatima_dev",
    "davidk_eng",
    "elena_builds",
    "raj_creates",
    "bella_codes",
    "james_dev",
    "aisha_tech",
    "lars_builds",
    "maya_dev",
    "carlos_codes",
    "zoe_engineer",
    "ahmed_dev",
    "nina_codes",
    "hiro_tech",
    "sophia_dev",
    "omar_builds",
  ];

  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Netflix",
    "Spotify",
    "Stripe",
    "Shopify",
    "Airbnb",
    "Uber",
    "PayPal",
    "GitHub",
    "Slack",
    "Zoom",
    "Notion",
    "Figma",
  ];

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const topics =
    query === "tech"
      ? techTopics
      : query === "news"
      ? newsTopics
      : [...techTopics, ...newsTopics];

  const baseTime = Date.now();
  const tweets = [];

  const refreshSeed = Math.floor(baseTime / (1000 * 60 * 5));
  for (let i = 0; i < count; i++) {
    const template = getRandomElement(tweetTemplates);
    const topic = getRandomElement(topics);
    const name = names[i % names.length];
    const username = usernames[i % usernames.length];

    const tweetSeed = refreshSeed + i * 7919;
    const pseudoRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const seedValue = pseudoRandom(tweetSeed);
    const templateIndex = Math.floor(seedValue * tweetTemplates.length);
    const selectedTemplate = tweetTemplates[templateIndex];

    let content = selectedTemplate
      .replace("{topic}", topic)
      .replace("{insight}", getRandomElement(insights))
      .replace("{lesson}", getRandomElement(lessons))
      .replace("{tip}", getRandomElement(tips))
      .replace(
        "{counter_point}",
        `${getRandomElement(
          topics.slice(0, 5)
        )} has real value in specific contexts`
      )
      .replace(
        "{points}",
        "1) Learning curve is steeper than expected, 2) Community support is amazing, 3) Performance gains are significant"
      )
      .replace("{old_way}", "monolithic architectures")
      .replace("{new_way}", "microservices approach")
      .replace(
        "{industry}",
        getRandomElement(["fintech", "healthcare", "e-commerce", "education"])
      )
      .replace("{impact}", "how we think about scalability")
      .replace(
        "{area}",
        getRandomElement([
          "performance optimization",
          "security",
          "user experience",
          "scalability",
        ])
      )
      .replace(
        "{timeframe}",
        getRandomElement(["2 years", "18 months", "3 years"])
      )
      .replace("{reasoning}", "the ecosystem is maturing rapidly")
      .replace("{mistake}", "not reading the documentation thoroughly")
      .replace("{solution}", "taking time to understand the fundamentals")
      .replace(
        "{old_tech}",
        getRandomElement(["jQuery", "PHP", "MySQL", "REST APIs"])
      )
      .replace("{metric}", getRandomElement(["40%", "60%", "2x", "50%"]))
      .replace(
        "{alternative}",
        getRandomElement([
          "traditional approaches",
          "simpler solutions",
          "established patterns",
        ])
      )
      .replace("{condition}", "dealing with legacy systems")
      .replace(
        "{context}",
        getRandomElement([
          "production environments",
          "large scale applications",
          "team collaboration",
        ])
      )
      .replace(
        "{option1}",
        getRandomElement(["TypeScript", "React", "Docker", "AWS"])
      )
      .replace(
        "{option2}",
        getRandomElement(["JavaScript", "Vue", "Kubernetes", "GCP"])
      );

    if (pseudoRandom(tweetSeed + 100) > 0.7) {
      const hashtags = [`#${query}`, "#coding", "#development", "#tech"];
      const hashtagIndex = Math.floor(
        pseudoRandom(tweetSeed + 200) * hashtags.length
      );
      content += ` ${hashtags[hashtagIndex]}`;
    }

    if (pseudoRandom(tweetSeed + 300) > 0.8) {
      const companyIndex = Math.floor(
        pseudoRandom(tweetSeed + 400) * companies.length
      );
      content += ` Working at @${companies[companyIndex].toLowerCase()}`;
    }

    const hoursBack = Math.floor(pseudoRandom(tweetSeed + 500) * 48 * 60);
    const tweetTime = baseTime - hoursBack * 60 * 1000;

    tweets.push({
      title: `Tweet by ${name}`,
      content: content,
      url: `https://twitter.com/${username}/status/${tweetTime}_${i}`,
      source: "twitter",
      originalId: `mock_${refreshSeed}_${i}`,
      author: username,
      authorName: name,
      createdAt: new Date(tweetTime),
      imageUrl: `https://i.pravatar.cc/48?u=${username}&seed=${tweetSeed}`,
      metrics: {
        retweet_count: Math.floor(pseudoRandom(tweetSeed + 600) * 150) + 5,
        reply_count: Math.floor(pseudoRandom(tweetSeed + 700) * 80) + 2,
        like_count: Math.floor(pseudoRandom(tweetSeed + 800) * 800) + 20,
        quote_count: Math.floor(pseudoRandom(tweetSeed + 900) * 30) + 1,
      },
      verified: pseudoRandom(tweetSeed + 1000) > 0.8,
      isMock: true,
    });
  }

  return tweets;
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

export const getTweets = async (query = "tech", count = 10, maxAge = 180) => {
  try {
    const cutoffTime = new Date(Date.now() - maxAge * 60 * 1000);

    const cachedTweets = await Post.find({
      source: "twitter",
      createdAt: { $gte: cutoffTime },
      $or: [
        { content: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(count * 2);

    if (cachedTweets.length >= Math.floor(count * 0.5)) {
      console.log(
        `Using ${Math.min(
          cachedTweets.length,
          count
        )} cached tweets to preserve API quota`
      );

      const selectedCached = cachedTweets.slice(0, Math.floor(count * 0.6));
      const mockCount = count - selectedCached.length;

      if (mockCount > 0) {
        const mockTweets = getMockTweets(query, mockCount);
        return [...selectedCached, ...mockTweets].slice(0, count);
      }

      return cachedTweets.slice(0, count);
    }

    console.log(
      `Only ${cachedTweets.length} cached tweets found, checking API quota...`
    );

    if (new Date().getMonth() !== currentMonth) {
      monthlyQuotaUsed = 0;
      currentMonth = new Date().getMonth();
      console.log("New month detected, resetting quota counter");
    }

    if (monthlyQuotaUsed >= FREE_TIER_MONTHLY_LIMIT) {
      console.log(
        `Monthly quota exhausted (${monthlyQuotaUsed}/${FREE_TIER_MONTHLY_LIMIT}), using mock data`
      );
      return getMockTweets(query, count);
    }

    if (rateLimitRemaining < 5) {
      console.log("Preserving remaining API quota, using mock data");
      return getMockTweets(query, count);
    }

    return await fetchTweets(query, count);
  } catch (error) {
    console.error("Error getting tweets:", error);
    return getMockTweets(query, count);
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
          "tweet.fields": "created_at,author_id,public_metrics,lang",
          expansions: "author_id",
          "user.fields": "name,username,profile_image_url,verified,description",
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
