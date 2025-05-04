import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || "user",
    });

    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        credits: user.credits,
        lastLoginDate: user.lastLoginDate,
        savedPosts: user.savedPosts,
        reportedPosts: user.reportedPosts,
        _id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const previousLoginDate = user.lastLoginDate;
    user.lastLoginDate = new Date();

    if (
      !previousLoginDate ||
      previousLoginDate.toDateString() !== new Date().toDateString()
    ) {
      user.credits += 5; // 5 credits for daily login
    }

    await user.save();

    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      profileCompleted: user.profileCompleted,
      lastLoginDate: user.lastLoginDate,
      savedPosts: user.savedPosts,
      reportedPosts: user.reportedPosts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};
