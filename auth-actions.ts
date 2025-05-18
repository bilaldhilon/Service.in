"use server"
import { redirect } from "next/navigation"
import { loginUser, registerUser, clearUserCookie } from "../auth/auth"

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string

    if (!email || !password || !role) {
      return { error: "Email, password, and role are required" }
    }

    const user = await loginUser(email, password)

    if (user.role !== role) {
      return { error: "Invalid credentials for this role" }
    }

    // Redirect based on role
    switch (role) {
      case "admin":
        redirect("/admin/dashboard")
      case "customer":
        redirect("/customer/dashboard")
      case "provider":
        redirect("/provider/dashboard")
      default:
        redirect("/")
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Invalid email or password" }
  }
}

export async function register(formData: FormData) {
  try {
    const role = formData.get("role") as string

    const userData: any = {
      name: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      role,
    }

    // Add provider-specific fields
    if (role === "provider") {
      userData.serviceType = formData.get("serviceType") as string
      userData.experience = formData.get("experience") as string
      userData.address = formData.get("address") as string
      userData.city = formData.get("city") as string
      userData.isVerified = false
      userData.rating = 0
      userData.totalReviews = 0
    }

    const user = await registerUser(userData)

    // Login the user after registration
    await loginUser(userData.email, formData.get("password") as string)

    // Redirect based on role
    if (role === "customer") {
      redirect("/customer/dashboard")
    } else if (role === "provider") {
      redirect("/provider/dashboard")
    } else {
      redirect("/")
    }
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message === "User already exists") {
      return { error: "Email already in use" }
    }

    return { error: "Failed to register user" }
  }
}

export async function logout() {
  clearUserCookie()
  redirect("/")
}
