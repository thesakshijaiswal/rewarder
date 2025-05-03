import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const FeedAnalytics = ({ stats }) => {
  const [lastUpdated, setLastUpdated] = useState("");

  const {
    totalPosts = 0,
    reportedPosts = 0,
    savedStats = { totalSaves: 0 },
    shareStats = { totalShares: 0 },
    sourceDistribution = {},
    interactionTrends = [],
    generatedAt = "",
  } = stats || {};

  useEffect(() => {
    if (generatedAt) {
      setLastUpdated(new Date(generatedAt).toLocaleString());
    }

    console.log("Received trends data:", interactionTrends);

    const today = new Date().toISOString().split("T")[0];
    const hasTodayData = interactionTrends.some((item) => item._id === today);
    console.log(`Today is ${today}, included in data: ${hasTodayData}`);
  }, [interactionTrends, generatedAt]);

  const interactionData = interactionTrends
    .map((trend) => {
      const parts = trend._id.split("-");
      if (parts.length !== 3) {
        console.error("Invalid date format:", trend._id);
        return null;
      }

      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      return {
        name: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: trend._id,
        saves: trend.saves,
        shares: trend.shares,
        reports: trend.reports,
        newPosts: trend.newPosts,
      };
    })
    .filter(Boolean);

  const sourceData = Object.entries(sourceDistribution).map(([name, data]) => ({
    name,
    value: data.count,
    saves: data.saves,
    shares: data.shares,
    reports: data.reports,
  }));

  const COLORS = ["#007efc", "#00c29e", "#ff7300", "#8884d8", "#82ca9d"];

  const refreshData = () => {
    const timestamp = new Date().getTime();
    window.location.href = `${window.location.pathname}?_t=${timestamp}`;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Feed Analytics</h2>
        <div className="flex items-center">
          <span className="mr-2 text-xs text-gray-500">
            {lastUpdated ? `Last updated: ${lastUpdated}` : ""}
          </span>
          <button
            onClick={refreshData}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Total Posts</div>
          <div className="text-2xl font-bold">{totalPosts}</div>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Reported Posts</div>
          <div className="text-2xl font-bold">{reportedPosts}</div>
        </div>
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Saved Posts</div>
          <div className="text-2xl font-bold">{savedStats.totalSaves}</div>
        </div>
        <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Shared Posts</div>
          <div className="text-2xl font-bold">{shareStats.totalShares}</div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-medium">
          Content Interactions (Last 7 Days)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={interactionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval="preserveStartEnd"
                tickMargin={10}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="saves"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                name="Saves"
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="#8884d8"
                name="Shares"
              />
              <Line
                type="monotone"
                dataKey="reports"
                stroke="#ff7300"
                name="Reports"
              />
              <Line
                type="monotone"
                dataKey="newPosts"
                stroke="#007efc"
                name="New Posts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-medium">
          Content Source Distribution
        </h3>
        <div className="flex h-64 justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
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
                {sourceData.map((entry, index) => (
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

export default FeedAnalytics;
