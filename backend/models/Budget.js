import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  budgetAmount: { type: Number, default: 0, min: 0 }, // ✅ default 0 only
  spentAmount: { type: Number, default: 0, min: 0 },
  month: { type: String, required: true },
});


const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
