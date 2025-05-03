import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const UserAnalytics = ({ stats }) => {
  // Sample data for daily activity chart (typically this would come from API)
  const dailyActivityData = [
    { name: "Mon", users: stats.dailyActivity?.monday || 20 },
    { name: "Tue", users: stats.dailyActivity?.tuesday || 32 },
    { name: "Wed", users: stats.dailyActivity?.wednesday || 45 },
    { name: "Thu", users: stats.dailyActivity?.thursday || 39 },
    { name: "Fri", users: stats.dailyActivity?.friday || 52 },
    { name: "Sat", users: stats.dailyActivity?.saturday || 30 },
    { name: "Sun", users: stats.dailyActivity?.sunday || 25 },
  ];

  // Sample data for user roles pie chart
  const userRoleData = [
    { name: "Admin", value: stats.adminCount || 2 },
    {
      name: "Regular Users",
      value: stats.totalUsers - (stats.adminCount || 2),
    },
  ];

  const COLORS = ["#6366f1", "#4abea1"];

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">User Analytics</h2>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Active Today</div>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
        </div>
        <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">New Users Today</div>
          <div className="text-2xl font-bold">{stats.newUsersToday}</div>
        </div>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Avg. Credits Per User</div>
          <div className="text-2xl font-bold">{stats.averageCredits}</div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-medium">Daily User Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyActivityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#818cf8" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-medium">User Roles</h3>
        <div className="flex h-64 justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {userRoleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
