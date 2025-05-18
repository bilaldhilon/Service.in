import { cookies } from "next/headers"
import { getCollection } from "@/lib/db/mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Register a new user
export async function registerUser(userData: any) {
  const usersCollection = await getCollection("users")

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  // Create the user
  const user = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await usersCollection.insertOne(user)

  return {
    id: result.insertedId.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

// Login a user
export async function loginUser(email: string, password: string) {
  const usersCollection = await getCollection("users")

  // Find the user
  const user = await usersCollection.findOne({ email })
  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Check the password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error("Invalid credentials")
  }

  // Create a token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )

  // Set the cookie
  cookies().set({
    name: "user-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

// Get the current user from the token
export async function getCurrentUser() {
  const token = cookies().get("user-token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

// Decrypt a token
export async function decrypt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

// Clear the user cookie
export function clearUserCookie() {
  cookies().delete("user-token")
}
