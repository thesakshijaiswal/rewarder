import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Header } from "../components";
import { Feed } from "../components/feed";
import { MdBookmark, MdAccountCircle } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { MdArrowForward } from "react-icons/md";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-center text-2xl font-bold text-gray-900 md:text-left">
              Creator Dashboard
            </h1>
            <nav
              aria-label="Profile actions"
              className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            >
              <Link
                to="/profile/edit"
                className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 sm:w-auto"
                aria-label="Edit your profile"
              >
                <MdAccountCircle className="mr-2 text-xl" aria-hidden="true" />
                Edit Profile
              </Link>
              <Link
                to="/saved-posts"
                className="flex w-full items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 sm:w-auto"
                aria-label="View saved posts"
              >
                <MdBookmark className="mr-2" aria-hidden="true" />
                Saved Posts
              </Link>
            </nav>
          </div>

          <section
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
            aria-labelledby="dashboard-stats-heading"
          >
            <h2 id="dashboard-stats-heading" className="sr-only">
              Dashboard Statistics
            </h2>

            <div
              className="rounded-lg bg-white p-6 shadow-md"
              role="region"
              aria-label="Credits section"
            >
              <h3 className="mb-4 text-xl font-semibold">Credits</h3>
              <div className="text-3xl font-bold text-indigo-600">
                {user?.credits}
              </div>
              <p className="mt-2 text-gray-600">
                Earn more credits by completing your profile and interacting
                with content.
              </p>
            </div>

            <div
              className="rounded-lg bg-white p-6 shadow-md"
              role="region"
              aria-label="Profile status section"
            >
              <h3 className="mb-4 text-xl font-semibold">Profile Status</h3>
              <div className="flex items-center" aria-live="polite">
                <div
                  className={`h-4 w-4 rounded-full ${user?.profileCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                  aria-hidden="true"
                ></div>
                <span className="ml-2">
                  {user?.profileCompleted ? "Complete" : "Incomplete"}
                </span>
              </div>
              {!user?.profileCompleted && (
                <div className="mt-2">
                  <p className="text-gray-600">
                    Complete your profile to earn 10 extra credits!
                  </p>
                  <Link
                    to="/profile/edit"
                    className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <div className="flex items-center">
                      <MdArrowForward className="mr-2" aria-hidden="true" />
                      Complete Now
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div
              className="rounded-lg bg-white p-6 shadow-md"
              role="region"
              aria-label="Daily login reward section"
            >
              <h3 className="mb-4 text-xl font-semibold">Daily Login</h3>
              <p className="text-gray-600">
                You've logged in today and earned 5 credits!
              </p>
              <p className="mt-2 text-gray-600">
                Come back tomorrow for more credits.
              </p>
            </div>
          </section>

          {user?.profile?.name && (
            <section
              className="mt-8 rounded-lg bg-white p-6 shadow-md"
              role="region"
              aria-labelledby="your-profile-heading"
            >
              <h2
                id="your-profile-heading"
                className="mb-4 text-xl font-semibold"
              >
                Your Profile
              </h2>
              <div className="flex flex-col items-start sm:flex-row sm:items-center">
                {user.profile.avatar && (
                  <img
                    src={user.profile.avatar}
                    alt={`${user.profile.name}'s avatar`}
                    className="mb-4 h-16 w-16 rounded-full object-cover sm:mr-4 sm:mb-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/150?text=Avatar";
                    }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{user.profile.name}</h3>
                  <p className="mt-1 text-gray-600">{user.profile.bio}</p>
                </div>
              </div>
              <div className="mt-4 text-right">
                <Button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-slate-800 text-sm font-medium text-white hover:bg-slate-700"
                  btnIcon={MdArrowForward}
                  aria-label="Edit your profile"
                >
                  Edit Profile
                </Button>
              </div>
            </section>
          )}

          <div className="mt-8" role="region" aria-label="Feed section">
            <Feed />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
