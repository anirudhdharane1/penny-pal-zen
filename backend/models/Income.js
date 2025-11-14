import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, required: true }, // Salary, Business, etc.
  records: [
    {
      month: { type: String, required: true }, // e.g. "2025-11"
      amount: { type: Number, default: 0 },
    },
  ],
});

// Check if model exists before creating it
const Income = mongoose.models.Income || mongoose.model("Income", incomeSchema);

export default Income;
