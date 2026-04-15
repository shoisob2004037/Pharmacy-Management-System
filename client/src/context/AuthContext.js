"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"))
        try {
          const res = await api.get("/auth/me")
          setUser(res.data.data)
          setIsAuthenticated(true)
        } catch (err) {
          localStorage.removeItem("token")
          setAuthToken(null)
        }
      }
      setLoading(false)
    }

    checkLoggedIn()
  }, [])

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common["Authorization"]
    }
  }

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData)
      localStorage.setItem("token", res.data.token)
      setAuthToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setError(null)
      return true
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      return false
    }
  }

  // Login user
  const login = async (formData) => {
    try {
      const res = await api.post("/auth/login", formData)
      localStorage.setItem("token", res.data.token)
      setAuthToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setError(null)
      return true
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      return false
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    setAuthToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  // Clear errors
  const clearErrors = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
