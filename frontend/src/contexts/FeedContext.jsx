import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceFilter, setSourceFilter] = useState(null);

  const fetchFeed = useCallback(
    async (page = 1, replaceExisting = true, source = sourceFilter) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          limit: 5,
        });
        if (source) params.append("source", source);
        const response = await axiosInstance.get(`/feed?${params}`);
        if (replaceExisting) {
          setPosts(response.data.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.data.posts]);
        }
        setCurrentPage(response.data.data.currentPage);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        toast.error("Failed to load feed");
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    },
    [sourceFilter],
  );

  const fetchSavedPosts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/feed/saved");
      const savedPosts = response.data.data.posts;
      const savedIds = savedPosts.map((post) => post._id);
      setSavedPostIds(savedIds);

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = savedPosts.filter(
          (post) => !existingIds.has(post._id),
        );
        return [...prev, ...newPosts];
      });
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      setRefreshing(true);
      await axiosInstance.post("/feed/refresh");
      await fetchFeed(1, true);
      toast.success("Feed refreshed with new content!");
    } catch (error) {
      toast.error("Failed to refresh feed");
      console.error("Error refreshing feed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFeed]);

  const handleSavePost = async (postId) => {
    try {
      await axiosInstance.post(`/feed/post/${postId}/save`);
      setSavedPostIds((prev) => [...prev, postId]);
      toast.success("Post saved! +2 credits");
    } catch (error) {
      toast.error("Failed to save post");
      console.error("Error saving post:", error);
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      await axiosInstance.delete(`/feed/post/${postId}/unsave`);
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      toast.success("Post removed from saved items");
    } catch (error) {
      toast.error("Failed to unsave post");
      console.error("Error unsaving post:", error);
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/feed/post/${postId}/share`);
      navigator.clipboard.writeText(response.data.shareUrl);
      toast.success("Link copied to clipboard! +3 credits");
    } catch (error) {
      toast.error("Failed to share post");
      console.error("Error sharing post:", error);
    }
  };

  const handleReportPost = async (postId, reason) => {
    try {
      if (!reason || reason.trim() === "") {
        toast.error("Please provide a reason for reporting");
        return;
      }
      if (!postId) {
        toast.error("Invalid post");
        return;
      }
      await axiosInstance.post(`/feed/post/${postId}/report`, {
        reason: reason.trim(),
      });
      toast.success(
        "Post reported. Thank you for helping keep our community safe! +1 credit",
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to report post";
      toast.error(errorMessage);
      console.error("Error reporting post:", error);
    }
  };

  return (
    <FeedContext.Provider
      value={{
        posts,
        setPosts,
        savedPostIds,
        setSavedPostIds,
        loading,
        refreshing,
        currentPage,
        totalPages,
        sourceFilter,
        setSourceFilter,
        fetchFeed,
        fetchSavedPosts,
        refreshFeed,
        handleSavePost,
        handleUnsavePost,
        handleSharePost,
        handleReportPost,
        setCurrentPage,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);
