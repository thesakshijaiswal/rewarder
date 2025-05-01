import User from "../models/user.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const avatar = req.file ? req.file.path : req.body.avatar;

    if (!name || !bio) {
      return res.status(400).json({
        success: false,
        message: "Name and bio are required to complete your profile",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profile = {
      name,
      bio,
      avatar: avatar || user.profile.avatar,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = {
      name: user.profile?.name || "",
      email: user.email,
      credits: user.credits || 0,
      bio: user.profile?.bio || "",
      avatar: user.profile?.avatar || "",
      createdAt: user.createdAt,
      username: user.username,
    };

    // Check profileCompleted based on nested profile fields
    const profileCompleted = Boolean(
      user.profile?.name && user.profile?.bio && user.profile?.avatar
    );

    res.json({
      success: true,
      profile,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
