"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { email, password } = formData
  const { login, isAuthenticated, error, clearErrors } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null })
    }
  }

  const validate = () => {
    const errors = {}
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    clearErrors()
    setIsLoading(true)

    if (validate()) {
      const success = await login(formData)
      if (success) {
        navigate("/")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-primary-200">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-50 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your MediTrack account</p>
        </div>

        {error && (
          <div className="bg-danger-100 border-l-4 border-danger-500 text-danger-700 p-4 rounded mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.email ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                placeholder="you@example.com"
              />
            </div>
            {formErrors.email && <p className="text-danger-500 text-xs italic mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.password ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                placeholder="••••••••"
              />
            </div>
            {formErrors.password && <p className="text-danger-500 text-xs italic mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 01-1 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login