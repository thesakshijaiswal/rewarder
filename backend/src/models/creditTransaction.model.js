import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "daily_login",
        "profile_completion",
        "content_interaction",
        "admin_adjustment",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CreditTransaction = mongoose.model(
  "CreditTransaction",
  creditTransactionSchema
);

export default CreditTransaction;
