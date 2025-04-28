import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken(newUser._id);

    const user = newUser.toObject();
    delete user.password;

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
      user.credits += 5;
    }

    await user.save();

    const token = generateToken(user._id);
    const userData = user.toObject();
    delete userData.password;

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
