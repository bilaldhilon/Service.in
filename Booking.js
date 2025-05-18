const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BookingSchema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Booking", BookingSchema)
