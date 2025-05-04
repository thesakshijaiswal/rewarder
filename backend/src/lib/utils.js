import User from "../models/user.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";

export const handleError = (res, error, location) => {
  console.log(`Error in ${location}: `, error.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: error.message,
  });
};

export const awardCredits = async (userId, amount, description) => {
  const user = await User.findById(userId);
  user.credits += amount;
  await user.save();
  await CreditTransaction.create({
    user: userId,
    amount,
    type: "content_interaction",
    description,
  });
  return user.credits;
};
