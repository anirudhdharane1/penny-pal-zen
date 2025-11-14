import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["saving", "income"], required: true },
  name: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  timelineMonths: { type: Number, required: true },
  currentSaved: { type: Number, default: 0 },
  priority: { type: Number, default: 1 },
  allocatedMonths: [{ type: String }], // Track which months have been allocated (e.g., ["2025-11", "2025-12"])
  createdAt: { type: Date, default: Date.now },
});

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
