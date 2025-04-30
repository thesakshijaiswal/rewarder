import { useAuth } from "../contexts/AuthContext";
import { Button, Branding } from "../components";
import { MdOutlineLogout } from "react-icons/md";

const Dashboard = () => {
  const { user, logout } = useAuth();

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
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Creator Dashboard
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Credits</h2>
              <div className="text-3xl font-bold text-indigo-600">
                {user?.credits}
              </div>
              <p className="mt-2 text-gray-600">
                Earn more credits by completing your profile and logging in
                daily.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Profile Status</h2>
              <div className="flex items-center">
                <div
                  className={`h-4 w-4 rounded-full ${user?.profileCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="ml-2">
                  {user?.profileCompleted ? "Complete" : "Incomplete"}
                </span>
              </div>
              {!user?.profileCompleted && (
                <p className="mt-2 text-gray-600">
                  Complete your profile to earn 10 extra credits!
                </p>
              )}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Daily Login</h2>
              <p className="text-gray-600">
                You've logged in today and earned 5 credits!
              </p>
              <p className="mt-2 text-gray-600">
                Come back tomorrow for more credits.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Your Feed</h2>
            <p className="text-gray-600">
              Content feed will be displayed here soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
