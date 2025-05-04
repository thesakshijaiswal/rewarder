import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  UserList,
  UserCreditsForm,
  UserAnalytics,
  ReportedContent,
  FeedAnalytics,
  Branding,
  Header,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    averageCredits: 0,
  });
  const [feedStats, setFeedStats] = useState({
    totalPosts: 0,
    reportedPosts: 0,
    savedStats: {
      totalSaves: 0,
      uniquePostsSaved: 0,
    },
    shareStats: {
      totalShares: 0,
      uniquePostsShared: 0,
    },
    sourceDistribution: {},
    interactionTrends: [],
  });

  if (!isAdmin) {
    toast.error("Unauthorized access");
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    axios.defaults.baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:5000";
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${localStorage.getItem("token")}`;
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "users" || activeTab === "credits") {
          const { data } = await axios.get("/api/admin/users");
          if (data.success) {
            setUsers(data.users);
          } else {
            throw new Error(data.message);
          }
        }

        if (activeTab === "reported") {
          const { data } = await axios.get("/api/feed/reported");
          if (data.success) {
            setReportedPosts(data.data.posts);
          } else {
            throw new Error(data.message);
          }
        }

        if (activeTab === "analytics") {
          const [userStatsRes, feedStatsRes] = await Promise.all([
            axios.get("/api/admin/stats/users"),
            axios.get("/api/admin/stats/feed"),
          ]);

          if (userStatsRes.data.success && feedStatsRes.data.success) {
            setUserStats(userStatsRes.data);
            setFeedStats(feedStatsRes.data.stats);
          } else {
            throw new Error("Failed to fetch analytics data");
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab]);

  const handleAdjustCredits = async (userId, amount, description) => {
    try {
      const { data } = await axios.post("/api/credits/adjust", {
        userId,
        amount,
        description,
      });

      if (data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId
              ? { ...user, credits: data.user.credits }
              : user,
          ),
        );
        toast.success(data.message);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to adjust credits");
    }
  };

  const handleRemovePost = async (postId) => {
    try {
      const { data } = await axios.delete(`/api/feed/post/${postId}`);
      if (data.success) {
        setReportedPosts(reportedPosts.filter((post) => post._id !== postId));
        toast.success("Post removed successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove post");
    }
  };

  const handleClearReports = async (postId) => {
    try {
      const { data } = await axios.put(
        `/api/feed/post/${postId}/clear-reports`,
      );
      if (data.success) {
        setReportedPosts(reportedPosts.filter((post) => post._id !== postId));
        toast.success("Reports cleared successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear reports");
    }
  };

  const tabs = [
    { id: "users", label: "Users" },
    { id: "credits", label: "Manage Credits" },
    { id: "reported", label: "Reported Content" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        {/* Responsive tab bar */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-full space-x-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow-md">
            {activeTab === "users" && <UserList users={users} />}

            {activeTab === "credits" && (
              <UserCreditsForm
                users={users}
                onAdjustCredits={handleAdjustCredits}
              />
            )}

            {activeTab === "reported" && (
              <ReportedContent
                reportedPosts={reportedPosts}
                onRemovePost={handleRemovePost}
                onClearReports={handleClearReports}
              />
            )}

            {activeTab === "analytics" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <UserAnalytics stats={userStats} />
                <FeedAnalytics stats={feedStats} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
