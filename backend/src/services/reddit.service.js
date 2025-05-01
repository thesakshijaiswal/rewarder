import Post from "../models/post.model.js";

const REDDIT_API_BASE_URL =
  process.env.REDDIT_API_BASE_URL || "https://www.reddit.com";

export const fetchRedditPosts = async (subreddit = "all", limit = 10) => {
  try {
    const response = await fetch(
      `${REDDIT_API_BASE_URL}/r/${subreddit}/hot.json?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching Reddit posts: ${response.statusText}`);
    }

    const data = await response.json();

    const posts = data.data.children.map((post) => {
      const postData = post.data;

      return {
        title: postData.title,
        content: postData.selftext || postData.title,
        url: `https://reddit.com${postData.permalink}`,
        source: "reddit",
        originalId: postData.id,
        author: postData.author,
        createdAt: new Date(postData.created_utc * 1000),
        imageUrl:
          postData.thumbnail &&
          postData.thumbnail !== "self" &&
          postData.thumbnail !== "default"
            ? postData.thumbnail
            : null,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);

    return getMockRedditPosts(subreddit, limit);
  }
};

const getMockRedditPosts = (subreddit, limit) => {
  const mockPosts = [];

  for (let i = 0; i < limit; i++) {
    mockPosts.push({
      title: `Sample post from r/${subreddit} - #${i + 1}`,
      content: `This is sample content for a mock Reddit post from r/${subreddit}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      url: `https://reddit.com/r/${subreddit}/comments/sample${i}`,
      source: "reddit",
      originalId: `reddit_${Date.now()}_${i}`,
      author: `redditor${i + 1}`,
      createdAt: new Date(Date.now() - i * 5400000),
      imageUrl:
        i % 3 === 0
          ? `https://via.placeholder.com/300x200?text=r/${subreddit}`
          : null,
    });
  }

  return mockPosts;
};

export const storeRedditPosts = async (posts) => {
  try {
    const operations = posts.map((post) => ({
      updateOne: {
        filter: { originalId: post.originalId, source: "reddit" },
        update: post,
        upsert: true,
      },
    }));

    await Post.bulkWrite(operations);
    return true;
  } catch (error) {
    console.error("Error storing Reddit posts:", error);
    throw error;
  }
};
