// Updated Register.jsx with new color palette
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    shopName: "",
    address: "",
    phone: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { name, email, password, password2, shopName, address, phone } = formData
  const { register, isAuthenticated, error, clearErrors } = useAuth()
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
    if (!name) errors.name = "Name is required"
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    if (password !== password2) errors.password2 = "Passwords do not match"
    if (password && password.length < 6) errors.password = "Password must be at least 6 characters"
    if (!shopName) errors.shopName = "Shop name is required"
    if (!address) errors.address = "Address is required"
    if (!phone) errors.phone = "Phone number is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    clearErrors()
    setIsLoading(true)

    if (validate()) {
      const registerData = {
        name,
        email,
        password,
        shopName,
        address,
        phone,
      }

      const success = await register(registerData)
      if (success) {
        navigate("/")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl border border-primary-200">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-50 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-800 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Register your pharmacy with MediTrack</p>
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                Owner Name
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
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.name ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                  placeholder="Owner Name"
                />
              </div>
              {formErrors.name && <p className="text-danger-500 text-xs italic mt-1">{formErrors.name}</p>}
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password2">
                Confirm Password
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
                  id="password2"
                  name="password2"
                  value={password2}
                  onChange={onChange}
                  className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.password2 ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                  placeholder="••••••••"
                />
              </div>
              {formErrors.password2 && <p className="text-danger-500 text-xs italic mt-1">{formErrors.password2}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="shopName">
                Shop Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={shopName}
                  onChange={onChange}
                  className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.shopName ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                  placeholder="Shop Name"
                />
              </div>
              {formErrors.shopName && <p className="text-danger-500 text-xs italic mt-1">{formErrors.shopName}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.phone ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                  placeholder="Phone Number"
                />
              </div>
              {formErrors.phone && <p className="text-danger-500 text-xs italic mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="address">
              Shop Address
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
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={onChange}
                className={`pl-10 w-full py-3 px-4 text-gray-700 bg-primary-50 rounded-lg focus:outline-none focus:ring-2 ${formErrors.address ? "border-danger-500 focus:ring-danger-500" : "border-primary-300 focus:ring-primary-500"}`}
                placeholder="Shop Address"
              />
            </div>
            {formErrors.address && <p className="text-danger-500 text-xs italic mt-1">{formErrors.address}</p>}
          </div>

          <div className="mt-6">
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
                  Registering...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Register
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register