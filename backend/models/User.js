import mongoose from "mongoose";

// Define schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  monthlyIncome: {
    type: Number,
    default: 0,
  },
  monthlySavingGoal: {
    type: Number,
    default: 0,
  },
  profilePic: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model
const User = mongoose.model("User", userSchema);

// Export default (so you can do: import User from "../models/User.js")
export default User;
