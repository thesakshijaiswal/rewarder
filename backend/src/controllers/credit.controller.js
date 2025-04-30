import User from "../models/user.model.js";

export const getCreditBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching credit balance",
      error: error.message,
    });
  }
};
