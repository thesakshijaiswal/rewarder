import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: today },
    });

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    const creditStats = await User.aggregate([
      {
        $group: {
          _id: null,
          averageCredits: { $avg: "$credits" },
        },
      },
    ]);
    const averageCredits =
      creditStats.length > 0 ? Math.round(creditStats[0].averageCredits) : 0;

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const dailyActivity = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: fourWeeksAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$lastLogin" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const dayMapping = {
      1: "sunday",
      2: "monday",
      3: "tuesday",
      4: "wednesday",
      5: "thursday",
      6: "friday",
      7: "saturday",
    };

    const formattedDailyActivity = {};
    dailyActivity.forEach((day) => {
      formattedDailyActivity[dayMapping[day._id]] = day.count;
    });

    res.status(200).json({
      success: true,
      totalUsers,
      adminCount,
      activeUsers,
      newUsersToday,
      averageCredits,
      dailyActivity: formattedDailyActivity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

export const getFeedStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();

    const reportedPosts = await Post.countDocuments({
      "reportedBy.0": { $exists: true },
    });

    const savedPostsCount = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalSaves: { $sum: { $size: "$savedBy" } },
        },
      },
    ]);

    const totalSaves =
      savedPostsCount.length > 0 ? savedPostsCount[0].totalSaves : 0;

    const sharedPosts = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalShares: { $sum: "$shareCount" },
        },
      },
    ]);

    const totalShares = sharedPosts.length > 0 ? sharedPosts[0].totalShares : 0;

    const sourceDistribution = await Post.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedSourceDistribution = {};
    sourceDistribution.forEach((source) => {
      formattedSourceDistribution[source._id] = source.count;
    });

    res.status(200).json({
      success: true,
      totalPosts,
      reportedPosts,
      savedPosts: totalSaves,
      sharedPosts: totalShares,
      sourceDistribution: formattedSourceDistribution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching feed statistics",
      error: error.message,
    });
  }
};

export const getCreditStats = async (req, res) => {
  try {
    const totalCreditsResult = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$credits" },
        },
      },
    ]);
    const totalCredits =
      totalCreditsResult.length > 0 ? totalCreditsResult[0].total : 0;

    const creditsByType = await CreditTransaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    const recentTransactions = await CreditTransaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username email");

    res.status(200).json({
      success: true,
      totalCredits,
      creditsByType,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching credit statistics",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const savedPosts = await Post.find({ savedBy: userId }).sort({
      createdAt: -1,
    });

    const creditTransactions = await CreditTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      user,
      savedPosts,
      creditTransactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};
