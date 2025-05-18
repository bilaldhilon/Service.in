"use client"

import { createContext, useState, useEffect } from "react"
import api from "../utils/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  // Load user on initial app load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.setAuthToken(token)
          const res = await api.get("/auth/me")
          setUser(res.data.user)
        } catch (err) {
          console.error("Error loading user:", err)
          logout()
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [token])

  // Login user
  const login = async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials)
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem("token", res.data.token)
      return res.data
    } catch (err) {
      throw err.response ? err.response.data : { message: "Server error" }
    }
  }

  // Admin login
  const adminLogin = async (credentials) => {
    try {
      const res = await api.post("/auth/admin-login", credentials)
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem("token", res.data.token)
      return res.data
    } catch (err) {
      throw err.response ? err.response.data : { message: "Server error" }
    }
  }

  // Logout user
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    api.setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
