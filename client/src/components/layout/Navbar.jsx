"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)

  // Close mobile menu and profile dropdown when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const onLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const isActive = (path) => {
    return location.pathname === path ? "bg-indigo-800 text-white" : "text-indigo-100"
  }

  const authLinks = (
    <>
      <Link
        to="/"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Dashboard
      </Link>
      <Link
        to="/medicines/add"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/medicines/add")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        Add Medicine
      </Link>
      <Link
        to="/sell"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/sell")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        Sell Medicine
      </Link>
      <Link
        to="/sales"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/sales")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        Sales History
      </Link>
    </>
  )

  const guestLinks = (
    <>
      <Link
        to="/login"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/login")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 01-1 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        Login
      </Link>
      <Link
        to="/register"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:text-white ${isActive("/register")}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        Register
      </Link>
    </>
  )

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
            <Link to="/" className="flex items-center text-white font-bold text-xl hover:text-indigo-200 transition-colors duration-200">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 transform hover:scale-110 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H9 8.172z" clipRule="evenodd" />
  </svg>
  MediTrack
</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-2">{isAuthenticated ? authLinks : guestLinks}</div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated && user && (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center hover:bg-indigo-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    {user.shopName}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        {user.shopName}
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 12.586V6z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-indigo-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white transform hover:scale-105 transition-transform duration-200"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden transition-all duration-300 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-700 shadow-inner">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/medicines/add"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/medicines/add")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Medicine
              </Link>
              <Link
                to="/sell"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/sell")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Sell Medicine
              </Link>
              <Link
                to="/sales"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/sales")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Sales History
              </Link>
              {user && (
                <div className="flex items-center px-4 py-2 text-sm font-medium text-white border-t border-indigo-600 mt-2 pt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  {user.shopName}
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center w-full text-left px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 12.586V6z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/login")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 01-1 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Login
              </Link>
              <Link
                to="/register"
                className={`flex items-center px-4 py-2 text-base font-medium text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 ${isActive("/register")}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar