import Post from "../models/post.model.js";

const REDDIT_API_BASE_URL =
  process.env.REDDIT_API_BASE_URL || "https://www.reddit.com";

export const fetchRedditPosts = async (subreddit = "all", limit = 10) => {
  try {
    console.log(`Fetching Reddit posts from r/${subreddit}...`);

    // Add proper headers to mimic a browser request
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const response = await fetch(
      `${REDDIT_API_BASE_URL}/r/${subreddit}/hot.json?limit=${limit}`,
      {
        method: "GET",
        headers: headers,
        timeout: 10000, // 10 second timeout
      }
    );

    console.log(`Reddit API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Reddit API error: ${response.status} - ${errorText}`);
      throw new Error(
        `Reddit API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `Reddit API returned ${data.data?.children?.length || 0} posts`
    );

    if (!data.data || !data.data.children) {
      console.error("Invalid Reddit API response structure:", data);
      throw new Error("Invalid Reddit API response structure");
    }

    const posts = data.data.children
      .map((post) => {
        const postData = post.data;

        // Filter out deleted/removed posts
        if (
          postData.removed_by_category ||
          postData.title === "[deleted]" ||
          postData.title === "[removed]"
        ) {
          return null;
        }

        return {
          title: postData.title,
          content: postData.selftext || postData.title,
          url:
            postData.url_overridden_by_dest ||
            `https://reddit.com${postData.permalink}`,
          source: "reddit",
          originalId: postData.id,
          author: postData.author,
          createdAt: new Date(postData.created_utc * 1000),
          imageUrl: getValidImageUrl(postData),
          subreddit: postData.subreddit,
          score: postData.score,
          num_comments: postData.num_comments,
        };
      })
      .filter((post) => post !== null); // Remove null entries

    console.log(`Successfully processed ${posts.length} Reddit posts`);
    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);

    // Log more details about the error
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("Network error - possibly CORS or connectivity issue");
    }

    // Return mock posts as fallback
    console.log("Falling back to mock Reddit posts");
    return getMockRedditPosts(subreddit, limit);
  }
};

// Helper function to get valid image URL
const getValidImageUrl = (postData) => {
  // Check for preview images first
  if (
    postData.preview &&
    postData.preview.images &&
    postData.preview.images[0]
  ) {
    const preview = postData.preview.images[0];
    if (preview.source && preview.source.url) {
      return preview.source.url.replace(/&amp;/g, "&");
    }
  }

  // Check thumbnail
  if (
    postData.thumbnail &&
    postData.thumbnail !== "self" &&
    postData.thumbnail !== "default" &&
    postData.thumbnail !== "spoiler" &&
    postData.thumbnail !== "nsfw" &&
    postData.thumbnail.startsWith("http")
  ) {
    return postData.thumbnail;
  }

  // Check if it's an image URL
  if (postData.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(postData.url)) {
    return postData.url;
  }

  return null;
};

const getMockRedditPosts = (subreddit, limit) => {
  console.log(`Generating ${limit} mock Reddit posts for r/${subreddit}`);
  const mockPosts = [];

  const sampleTitles = [
    "TIL: Interesting fact about technology",
    "Discussion: What's your favorite programming language?",
    "Show and Tell: My latest project",
    "Question: Need help with a coding problem",
    "News: Latest updates in the tech world",
    "Tutorial: How to improve your coding skills",
    "Opinion: Thoughts on remote work",
    "Review: New framework/library overview",
  ];

  const sampleContent = [
    "This is a detailed discussion about various aspects of programming and technology. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Looking for community input on best practices and methodologies. What has worked for you in similar situations?",
    "Sharing my experience and lessons learned from a recent project. Hope this helps others in the community.",
    "Technical question about implementation details. Any suggestions or similar experiences would be appreciated.",
    "Breaking news and updates from the tech industry. What are your thoughts on these developments?",
    "Step-by-step guide and tutorial content. Follow along and let me know if you have any questions.",
    "Opinion piece on current trends and future directions. Would love to hear different perspectives.",
    "Comprehensive review and analysis. Pros, cons, and real-world usage examples included.",
  ];

  for (let i = 0; i < limit; i++) {
    const titleIndex = i % sampleTitles.length;
    const contentIndex = i % sampleContent.length;

    mockPosts.push({
      title: sampleTitles[titleIndex],
      content: sampleContent[contentIndex],
      url: `https://reddit.com/r/${subreddit}/comments/sample${i}`,
      source: "reddit",
      originalId: `mock_reddit_${Date.now()}_${i}`,
      author: `user_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(Date.now() - i * 3600000), // 1 hour intervals
      imageUrl:
        i % 4 === 0 ? `https://picsum.photos/300/200?random=${i}` : null,
      subreddit: subreddit,
      score: Math.floor(Math.random() * 1000),
      num_comments: Math.floor(Math.random() * 100),
    });
  }

  return mockPosts;
};

export const storeRedditPosts = async (posts) => {
  try {
    if (!posts || posts.length === 0) {
      console.log("No Reddit posts to store");
      return true;
    }

    console.log(`Storing ${posts.length} Reddit posts to database...`);

    const operations = posts.map((post) => ({
      updateOne: {
        filter: { originalId: post.originalId, source: "reddit" },
        update: {
          $set: {
            ...post,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await Post.bulkWrite(operations);
    console.log(
      `Successfully stored Reddit posts. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`
    );

    return true;
  } catch (error) {
    console.error("Error storing Reddit posts:", error);
    throw error;
  }
};

// Alternative function to fetch from multiple subreddits
export const fetchMultipleSubreddits = async (
  subreddits = ["programming", "technology", "webdev"],
  limit = 5
) => {
  try {
    const allPosts = [];

    for (const subreddit of subreddits) {
      const posts = await fetchRedditPosts(subreddit, limit);
      allPosts.push(...posts);
    }

    // Sort by creation time and limit total results
    return allPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit * subreddits.length);
  } catch (error) {
    console.error("Error fetching from multiple subreddits:", error);
    return getMockRedditPosts("programming", limit);
  }
};
