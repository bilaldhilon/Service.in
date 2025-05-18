const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["customer", "provider", "admin"],
    default: "customer",
  },
  providerDetails: {
    serviceType: String,
    experience: String,
    address: String,
    city: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  adminRole: {
    type: String,
    enum: ["super_admin", "admin", "moderator", "support"],
    default: "admin",
  },
  resetToken: String,
  resetTokenExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("User", UserSchema)
