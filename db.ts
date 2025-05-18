import mongoose, { Schema, model, type Document, models } from "mongoose"

// Connect to MongoDB
let isConnected = false

export const connectToDB = async () => {
  if (isConnected) {
    return
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    isConnected = true
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

// User Schema
export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "admin" | "provider" | "customer"
  profilePicture?: string
  bio?: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "provider", "customer"], default: "customer" },
    profilePicture: { type: String },
    bio: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true },
)

// Service Schema
export interface IService extends Document {
  title: string
  description: string
  provider: mongoose.Types.ObjectId
  category: string
  price: number
  duration: number
  images: string[]
  rating: number
  reviews: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// Order Schema
export interface IOrder extends Document {
  service: mongoose.Types.ObjectId
  customer: mongoose.Types.ObjectId
  provider: mongoose.Types.ObjectId
  status: "pending" | "in_progress" | "completed" | "cancelled"
  amount: number
  paymentStatus: "pending" | "paid" | "refunded"
  startDate: Date
  endDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
)

// Review Schema
export interface IReview extends Document {
  service: mongoose.Types.ObjectId
  customer: mongoose.Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
)

// Export Models
export const User = models.User || model<IUser>("User", userSchema)
export const Service = models.Service || model<IService>("Service", serviceSchema)
export const Order = models.Order || model<IOrder>("Order", orderSchema)
export const Review = models.Review || model<IReview>("Review", reviewSchema)
