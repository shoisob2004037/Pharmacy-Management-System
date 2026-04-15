"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/layout/Navbar"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Dashboard from "./components/dashboard/Dashboard"
import MedicineDetails from "./components/medicines/MedicineDetails"
import AddMedicine from "./components/medicines/AddMedicine"
import SellMedicine from "./components/sales/SellMedicine"
import SalesHistory from "./components/sales/SalesHistory"
import SaleDetails from "./components/sales/SaleDetails"
import NotFound from "./components/layout/NotFound"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!isAuthenticated) return <Navigate to="/login" />

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medicines/:id"
                element={
                  <ProtectedRoute>
                    <MedicineDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medicines/add"
                element={
                  <ProtectedRoute>
                    <AddMedicine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sell"
                element={
                  <ProtectedRoute>
                    <SellMedicine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <SalesHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/:id"
                element={
                  <ProtectedRoute>
                    <SaleDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
