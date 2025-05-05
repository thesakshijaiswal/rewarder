import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Branding } from "../components";
import { FeedList } from "../components/feed";
import { MdOutlineLogout, MdArrowBack } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { useFeed } from "../contexts/FeedContext";

const SavedPostsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    savedPostIds,
    fetchSavedPosts,
    handleUnsavePost,
    loading,
    currentPage,
    totalPages,
    posts,
  } = useFeed();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchSavedPosts(currentPage + 1, false);
    }
  };

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
            <Button
              onClick={handleBack}
              className="mr-4 flex items-center bg-slate-800 text-white hover:bg-slate-700"
              btnIcon={MdArrowBack}
            >
              Back
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Saved Posts</h2>
          </div>

          {loading && savedPostIds.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : savedPostIds.length === 0 ? (
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
                posts={posts.filter((post) => savedPostIds.includes(post._id))}
                savedPostIds={savedPostIds}
                onUnsave={handleUnsavePost}
                loading={loading}
                onLoadMore={handleLoadMore}
                hasMore={false}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedPostsPage;
