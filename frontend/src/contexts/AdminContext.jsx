import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { isAdmin } = useAuth();
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
    savedStats: { totalSaves: 0, uniquePostsSaved: 0 },
    shareStats: { totalShares: 0, uniquePostsShared: 0 },
    sourceDistribution: {},
    interactionTrends: [],
  });

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "users" || activeTab === "credits") {
          const { data } = await axiosInstance.get("/admin/users");
          if (data.success) setUsers(data.users);
          else throw new Error(data.message);
        }
        if (activeTab === "reported") {
          const { data } = await axiosInstance.get("/feed/reported");
          if (data.success) setReportedPosts(data.data.posts);
          else throw new Error(data.message);
        }
        if (activeTab === "analytics") {
          const [userStatsRes, feedStatsRes] = await Promise.all([
            axiosInstance.get("/admin/stats/users"),
            axiosInstance.get("/admin/stats/feed"),
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
  }, [activeTab, isAdmin]);

  const handleAdjustCredits = async (userId, amount, description) => {
    try {
      const { data } = await axiosInstance.post("/credits/adjust", {
        userId,
        amount,
        description,
      });
      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
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
      const { data } = await axiosInstance.delete(`/feed/post/${postId}`);
      if (data.success) {
        setReportedPosts((prev) => prev.filter((post) => post._id !== postId));
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
      const { data } = await axiosInstance.put(
        `/feed/post/${postId}/clear-reports`,
      );
      if (data.success) {
        setReportedPosts((prev) => prev.filter((post) => post._id !== postId));
        toast.success("Reports cleared successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear reports");
    }
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        loading,
        error,
        users,
        reportedPosts,
        userStats,
        feedStats,
        handleAdjustCredits,
        handleRemovePost,
        handleClearReports,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
