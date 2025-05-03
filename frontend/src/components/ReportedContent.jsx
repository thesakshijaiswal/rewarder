import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { Button } from "../components";

const ReportedContent = ({
  reportedPosts = [],
  onRemovePost,
  onClearReports,
}) => {
  const [expandedPostId, setExpandedPostId] = useState(null);

  useEffect(() => {
    if (!Array.isArray(reportedPosts)) {
      toast.error("Error: Invalid data format for reported posts");
    }
  }, [reportedPosts]);

  if (!Array.isArray(reportedPosts)) {
    return null;
  }

  const toggleExpand = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-xl font-semibold">Reported Content</h2>

      {reportedPosts.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
          No reported content found
        </div>
      ) : (
        <div className="space-y-4">
          {reportedPosts.map((post) => (
            <div
              key={post._id}
              className="overflow-hidden rounded-lg border bg-white shadow-sm"
            >
              <div className="flex flex-col gap-2 border-b bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium">Source: </span>
                  <span
                    className={`inline-block rounded-2xl px-2 py-1 text-sm ${
                      post.source === "twitter"
                        ? "bg-blue-100 text-blue-800"
                        : post.source === "reddit"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.source}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    {post.reportedBy.length}{" "}
                    {post.reportedBy.length === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 font-medium">
                      {post.title || "No title"}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      {expandedPostId === post._id
                        ? post.content
                        : post.content?.length > 150
                          ? `${post.content.substring(0, 150)}...`
                          : post.content || "No content available"}
                    </p>
                    {post.content?.length > 150 && (
                      <button
                        onClick={() => toggleExpand(post._id)}
                        className="text-sm text-indigo-600"
                      >
                        {expandedPostId === post._id
                          ? "Show less"
                          : "Show more"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Report Details:</h4>
                  <div className="rounded bg-gray-50 p-3 text-sm">
                    <ul className="space-y-2">
                      {post.reportReasons.slice(0, 3).map((report, idx) => (
                        <li
                          key={idx}
                          className="border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <div>
                              <span className="font-medium">Reason: </span>
                              {report.reason || "No reason provided"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(report.createdAt)}
                            </div>
                          </div>
                          {report.comment && (
                            <div className="mt-1 text-gray-600">
                              {report.comment}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    {post.reportReasons.length > 3 && (
                      <div className="mt-2 text-center text-sm text-gray-500">
                        + {post.reportReasons.length - 3} more reports
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 px-4 py-3 sm:flex-row">
                <Button
                  onClick={() => onClearReports(post._id)}
                  className="bg-slate-800 text-white hover:bg-slate-700"
                >
                  Clear Reports
                </Button>
                <Button
                  onClick={() => onRemovePost(post._id)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Remove Content
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ReportedContent.propTypes = {
  reportedPosts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      title: PropTypes.string,
      content: PropTypes.string,
      reportedBy: PropTypes.arrayOf(PropTypes.string).isRequired,
      reportReasons: PropTypes.arrayOf(
        PropTypes.shape({
          user: PropTypes.string,
          reason: PropTypes.string,
          createdAt: PropTypes.string.isRequired,
          comment: PropTypes.string,
        }),
      ).isRequired,
    }),
  ),
  onRemovePost: PropTypes.func.isRequired,
  onClearReports: PropTypes.func.isRequired,
};

ReportedContent.defaultProps = {
  reportedPosts: [],
};

export default ReportedContent;
