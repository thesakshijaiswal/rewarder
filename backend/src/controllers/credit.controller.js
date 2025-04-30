import User from "../models/user.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";

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
      message: "Error in fetching credit balance",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Error in fetching credit history",
      error: error.message,
    });
  }
};

export const awardProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: "Profile already completed",
      });
    }

    user.credits += 10; //10 credit for completion
    user.profileCompleted = true;
    await user.save();

    await CreditTransaction.create({
      user: user._id,
      amount: 10,
      type: "profile_completion",
      description: "Credits awarded for completing profile",
    });

    res.status(200).json({
      success: true,
      credits: user.credits,
      message: "Credits awarded for profile completion",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Unable to process credit rewards at this time. Please try again later",
      error: error.message,
    });
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

    const creditAmount = creditAmounts[interactionType];
    const user = await User.findById(req.user.id);

    user.credits += creditAmount;
    await user.save();

    await CreditTransaction.create({
      user: user._id,
      amount: creditAmount,
      type: "content_interaction",
      description: `Credits awarded for ${interactionType} interaction`,
    });

    res.status(200).json({
      success: true,
      credits: user.credits,
      message: `${creditAmount} credits awarded for ${interactionType}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Unable to process credit rewards at this time. Please try again later",
      error: error.message,
    });
  }
};
