import { useState } from "react";
import { FaBookmark, FaRegBookmark, FaShare, FaFlag } from "react-icons/fa";
import ReportModal from "./ReportModel";

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diff / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

const FeedItem = ({ post, onSave, onUnsave, onShare, onReport, saved }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSaveToggle = () => {
    if (saved) {
      onUnsave(post._id);
    } else {
      onSave(post._id);
    }
  };

  const handleShare = () => {
    onShare(post._id);
  };

  const handleReport = (reason) => {
    onReport(post._id, reason);
    setShowReportModal(false);
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.author}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold sm:text-base">{post.title}</h3>
          <div className="flex flex-wrap gap-1 text-xs text-gray-500 sm:gap-2">
            <span>{post.author}</span>
            <span>•</span>
            <span>{getRelativeTime(post.createdAt)}</span>
            <span>•</span>
            <span className="capitalize">{post.source}</span>
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm break-words text-gray-700 sm:text-base">
        {post.content}
      </p>

      <div className="flex flex-wrap justify-between gap-2 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={handleSaveToggle}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600 sm:text-sm"
          >
            {saved ? (
              <>
                <FaBookmark className="text-indigo-600" /> Saved
              </>
            ) : (
              <>
                <FaRegBookmark /> Save
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600 sm:text-sm"
          >
            <FaShare /> Share
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 sm:text-sm"
          >
            <FaFlag /> Report
          </button>
        </div>

        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline sm:text-sm"
        >
          View Post
        </a>
      </div>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
};

export default FeedItem;
