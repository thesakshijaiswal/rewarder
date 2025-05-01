import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import FeedList from "./FeedList";
import SourceFilter from "./SourceFilter";
import { FaRedoAlt } from "react-icons/fa";
import { Button } from "../../components";
import api from "../../../../backend/src/services/api";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceFilter, setSourceFilter] = useState(null);

  const fetchFeed = async (
    page = 1,
    replaceExisting = true,
    source = sourceFilter,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 5,
      });

      if (source) {
        params.append("source", source);
      }

      const response = await api.get(`/feed?${params}`);

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
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await api.get("/feed/saved");
      const savedIds = response.data.data.posts.map((post) => post._id);
      setSavedPostIds(savedIds);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const refreshFeed = async () => {
    try {
      setRefreshing(true);
      await api.post("/feed/refresh");
      await fetchFeed(1, true);
      toast.success("Feed refreshed with new content!");
    } catch (error) {
      toast.error("Failed to refresh feed");
      console.error("Error refreshing feed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = (source) => {
    setSourceFilter(source);
    setCurrentPage(1);
    fetchFeed(1, true, source);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchFeed(currentPage + 1, false);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      await api.post(`/feed/post/${postId}/save`);
      setSavedPostIds((prev) => [...prev, postId]);
      toast.success("Post saved! +2 credits");
    } catch (error) {
      toast.error("Failed to save post");
      console.error("Error saving post:", error);
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      await api.delete(`/feed/post/${postId}/unsave`);
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      toast.success("Post removed from saved items");
    } catch (error) {
      toast.error("Failed to unsave post");
      console.error("Error unsaving post:", error);
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const response = await api.post(`/feed/post/${postId}/share`);
      navigator.clipboard.writeText(response.data.shareUrl);
      toast.success("Link copied to clipboard! +3 credits");
    } catch (error) {
      toast.error("Failed to share post");
      console.error("Error sharing post:", error);
    }
  };

  const handleReportPost = async (postId, reason) => {
    try {
      await api.post(`/feed/post/${postId}/report`, { reason });
      toast.success(
        "Post reported. Thank you for helping keep our community safe! +1 credit",
      );
    } catch (error) {
      toast.error("Failed to report post");
      console.error("Error reporting post:", error);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSavedPosts();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Feed</h2>
        <Button
          onClick={refreshFeed}
          disabled={refreshing}
          className="flex items-center gap-2 bg-indigo-600 whitespace-nowrap text-white hover:bg-indigo-700"
        >
          <FaRedoAlt className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Feed"}
        </Button>
      </div>

      <SourceFilter onFilterChange={handleFilterChange} />

      <FeedList
        posts={posts}
        savedPostIds={savedPostIds}
        onSave={handleSavePost}
        onUnsave={handleUnsavePost}
        onShare={handleSharePost}
        onReport={handleReportPost}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={currentPage < totalPages}
      />
    </div>
  );
};

export default Feed;
