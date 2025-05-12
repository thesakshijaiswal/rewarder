import { useAdmin } from "../contexts/AdminContext";
import { toast } from "react-hot-toast";
import {
  UserList,
  UserCreditsForm,
  UserAnalytics,
  ReportedContent,
  FeedAnalytics,
  Header,
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
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1
          className="mb-6 text-3xl font-bold text-gray-800"
          id="admin-dashboard-heading"
        >
          Admin Dashboard
        </h1>

        <div className="mb-6 overflow-x-auto">
          <div
            className="flex min-w-full space-x-4 border-b"
            role="tablist"
            aria-labelledby="admin-dashboard-heading"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-current={activeTab === tab.id ? "page" : undefined}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-lg bg-red-50 p-4 text-red-800"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="flex h-64 items-center justify-center"
            role="status"
            aria-busy="true"
            aria-label="Loading content"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div
            className="rounded-lg bg-white p-6 shadow-md"
            role="region"
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === "users" && (
              <div id="panel-users" role="tabpanel" aria-labelledby="tab-users">
                <UserList users={users} />
              </div>
            )}
            {activeTab === "credits" && (
              <div
                id="panel-credits"
                role="tabpanel"
                aria-labelledby="tab-credits"
              >
                <UserCreditsForm
                  users={users}
                  onAdjustCredits={handleAdjustCredits}
                />
              </div>
            )}
            {activeTab === "reported" && (
              <div
                id="panel-reported"
                role="tabpanel"
                aria-labelledby="tab-reported"
              >
                <ReportedContent
                  reportedPosts={reportedPosts}
                  onRemovePost={handleRemovePost}
                  onClearReports={handleClearReports}
                />
              </div>
            )}
            {activeTab === "analytics" && (
              <div
                id="panel-analytics"
                role="tabpanel"
                aria-labelledby="tab-analytics"
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
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
