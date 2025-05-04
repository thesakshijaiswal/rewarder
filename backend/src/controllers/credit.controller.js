import User from "../models/user.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";
import { awardCredits, handleError } from "../lib/utils.js";

export const getCreditBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    handleError(res, error, "getCreditBalance");
  }
};

export const getCreditHistory = async (req, res) => {
  try {
    const transactions = await CreditTransaction.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    handleError(res, error, "getCreditHistory");
  }
};

export const awardProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
     const { name, bio, avatar } = user.profile || {};

    const isComplete = name && bio && avatar;

    if (!isComplete) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile first",
      });
    }
    if (user.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: "Profile already completed",
      });
    }
    user.profileCompleted = true;
    const credits = await awardCredits(
      user,
      10,
      "profile_completion",
      "Credits awarded for completing profile"
    );
    res.status(200).json({
      success: true,
      credits,
      message: "Credits awarded for profile completion",
    });
  } catch (error) {
    handleError(res, error, "awardProfileCompletion");
  }
};

export const awardContentInteraction = async (req, res) => {
  try {
    const { interactionType } = req.body;
    const creditAmounts = {
      save: 2,
      share: 3,
      report: 1,
    };
    if (!Object.keys(creditAmounts).includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interaction type",
      });
    }
    const user = await User.findById(req.user.id);
    const credits = await awardCredits(
      user,
      creditAmounts[interactionType],
      "content_interaction",
      `Credits awarded for ${interactionType} interaction`
    );
    res.status(200).json({
      success: true,
      credits,
      message: `${creditAmounts[interactionType]} credits awarded for ${interactionType}`,
    });
  } catch (error) {
    handleError(res, error, "awardContentInteraction");
  }
};

//adminAction
export const adjustUserCredits = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.credits += parseInt(amount);
    await user.save();
    await CreditTransaction.create({
      user: user._id,
      amount,
      type: "admin_adjustment",
      description: description || `Admin adjustment of ${amount} credits`,
    });
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        credits: user.credits,
      },
      message: `Successfully adjusted credits for ${user.username}`,
    });
  } catch (error) {
    handleError(res, error, "adjustUserCredits");
  }
};
