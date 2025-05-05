import { useEffect } from "react";
import FeedList from "./FeedList";
import SourceFilter from "./SourceFilter";
import { FaRedoAlt } from "react-icons/fa";
import { Button } from "../../components";
import { useFeed } from "../../contexts/FeedContext";

const Feed = () => {
  const {
    posts,
    savedPostIds,
    loading,
    refreshing,
    currentPage,
    totalPages,
    setSourceFilter,
    fetchFeed,
    fetchSavedPosts,
    refreshFeed,
    handleSavePost,
    handleUnsavePost,
    handleSharePost,
    handleReportPost,
    setCurrentPage,
  } = useFeed();

  useEffect(() => {
    fetchFeed();
    fetchSavedPosts();
  }, []);

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
