import FeedItem from "./FeedItem";
import { FaSpinner } from "react-icons/fa";
import { Button } from "..";

const FeedList = ({
  posts,
  savedPostIds,
  onSave,
  onUnsave,
  onShare,
  onReport,
  loading,
  onLoadMore,
  hasMore,
}) => {
  return (
    <div>
      {loading && posts.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-indigo-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-500">No posts available. Check back later!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <FeedItem
              key={post._id}
              post={post}
              saved={savedPostIds.includes(post._id)}
              onSave={onSave}
              onUnsave={onUnsave}
              onShare={onShare}
              onReport={onReport}
            />
          ))}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={onLoadMore}
                disabled={loading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" /> Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedList;
