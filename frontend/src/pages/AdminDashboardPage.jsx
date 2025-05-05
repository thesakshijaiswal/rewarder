import { useAdmin } from "../contexts/AdminContext";
import { toast } from "react-hot-toast";
import {
  UserList,
  UserCreditsForm,
  UserAnalytics,
  ReportedContent,
  FeedAnalytics,
  Branding,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const {
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
  } = useAdmin();

  if (!isAdmin) {
    toast.error("Unauthorized access");
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { id: "users", label: "Users" },
    { id: "credits", label: "Manage Credits" },
    { id: "reported", label: "Reported Content" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Branding className="justify-start" />
        <h1 className="mt-5 mb-6 text-3xl font-bold text-gray-800">
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
