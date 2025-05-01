import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Branding } from "../components";
import { FeedList } from "../components/feed";
import { MdOutlineLogout, MdArrowBack } from "react-icons/md";
import { Link } from "react-router";
import api from "../services/api";

const SavedPosts = () => {
  const { user, logout } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSavedPosts = async (page = 1, replaceExisting = true) => {
    try {
      setLoading(true);
      const response = await api.get(`/feed/saved?page=${page}&limit=10`);

      if (response.data.success) {
        if (replaceExisting) {
          setSavedPosts(response.data.data.posts);
        } else {
          setSavedPosts((prev) => [...prev, ...response.data.data.posts]);
        }
        setCurrentPage(response.data.data.currentPage);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      setError("Failed to load saved posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchSavedPosts(currentPage + 1, false);
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      await api.delete(`/feed/post/${postId}/unsave`);
      setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
          <Branding />
          <div className="flex items-center gap-3">
            <span className="mr-4 text-gray-700 capitalize">
              Welcome, {user?.username}! ({user?.credits} credits)
            </span>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              btnIcon={MdOutlineLogout}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center">
            <Link
              to="/dashboard"
              className="mr-4 flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <MdArrowBack className="mr-1" />
              Back to Dashboard
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Saved Posts</h2>
          </div>

          {loading && savedPosts.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <h3 className="text-xl font-medium text-gray-700">
                No saved posts yet
              </h3>
              <p className="mt-2 text-gray-500">
                Start saving interesting posts from your feed to find them here.
              </p>
              <Link
                to="/dashboard"
                className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Browse Feed
              </Link>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <FeedList
                posts={savedPosts}
                savedPostIds={savedPosts.map((post) => post._id)}
                onUnsave={handleUnsavePost}
                loading={loading}
                onLoadMore={handleLoadMore}
                hasMore={currentPage < totalPages}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedPosts;
