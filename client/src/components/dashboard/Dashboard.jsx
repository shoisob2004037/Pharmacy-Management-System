"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import { importSampleMedicines } from "../../utils/medicineUtils"

const Dashboard = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [importingMedicines, setImportingMedicines] = useState(false)
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  })
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0,
  })

  // Merge medicines with the same name, summing stockQuantity
  const mergeMedicines = (medicinesList) => {
    const merged = {}
    medicinesList.forEach((medicine) => {
      if (merged[medicine.name]) {
        // Sum stockQuantity for medicines with the same name
        merged[medicine.name].stockQuantity += medicine.stockQuantity
      } else {
        // Keep the first occurrence's details
        merged[medicine.name] = { ...medicine }
      }
    })
    return Object.values(merged)
  }

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await api.get("/medicines")
        const fetchedMedicines = res.data.data
        // Merge medicines with the same name
        const mergedMedicines = mergeMedicines(fetchedMedicines)
        setMedicines(mergedMedicines)
        setFilteredMedicines(mergedMedicines)

        // Calculate dashboard statistics based on merged medicines
        const totalValue = mergedMedicines.reduce(
          (sum, medicine) => sum + medicine.unitPrice * medicine.stockQuantity,
          0
        )
        const lowStockCount = mergedMedicines.filter(
          (medicine) => medicine.stockQuantity > 0 && medicine.stockQuantity <= 10
        ).length
        const outOfStockCount = mergedMedicines.filter(
          (medicine) => medicine.stockQuantity === 0
        ).length

        setStats({
          totalMedicines: mergedMedicines.length,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          totalValue: totalValue,
        })
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching medicines")
      } finally {
        setLoading(false)
      }
    }

    const fetchSalesStats = async () => {
      try {
        const res = await api.get("/sales")
        const sales = res.data.data

        // Calculate total sales stats
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

        // Calculate today's sales
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todaySales = sales.filter((sale) => new Date(sale.createdAt) >= today)
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)

        setSalesStats({
          totalSales: sales.length,
          totalRevenue,
          todaySales: todaySales.length,
          todayRevenue,
        })
      } catch (err) {
        console.error("Error fetching sales stats:", err)
      }
    }

    fetchMedicines()
    fetchSalesStats()
  }, [])

  useEffect(() => {
    if (searchTerm.length >= 1) {
      // Filter merged medicines by name (case-insensitive)
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMedicines(filtered)
    } else {
      // Show all merged medicines when search is empty
      setFilteredMedicines(medicines)
    }
  }, [searchTerm, medicines])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const loadSampleMedicines = async () => {
    setImportingMedicines(true)
    try {
      const importedMedicines = await importSampleMedicines()
      // Merge imported medicines with the same name
      const mergedMedicines = mergeMedicines(importedMedicines)
      setMedicines(mergedMedicines)
      setFilteredMedicines(mergedMedicines)

      // Update stats after importing
      const totalValue = mergedMedicines.reduce(
        (sum, medicine) => sum + medicine.unitPrice * medicine.stockQuantity,
        0
      )
      const lowStockCount = mergedMedicines.filter(
        (medicine) => medicine.stockQuantity > 0 && medicine.stockQuantity <= 10
      ).length
      const outOfStockCount = mergedMedicines.filter(
        (medicine) => medicine.stockQuantity === 0
      ).length

      setStats({
        totalMedicines: mergedMedicines.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue: totalValue,
      })
    } catch (err) {
      setError(err.response?.data?.message || "Error loading sample medicines")
    } finally {
      setImportingMedicines(false)
    }
  }

  const handleDeleteMedicine = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const response = await api.delete(`/medicines/${id}`)

        if (response.data.success) {
          // Remove the medicine from the state
          const updatedMedicines = medicines.filter((medicine) => medicine._id !== id)
          // Re-merge medicines in case deletion affects merged entries
          const mergedMedicines = mergeMedicines(updatedMedicines)
          setMedicines(mergedMedicines)
          setFilteredMedicines(
            searchTerm.length >= 1
              ? mergedMedicines.filter((medicine) =>
                  medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : mergedMedicines
          )

          // Update stats
          const totalValue = mergedMedicines.reduce(
            (sum, medicine) => sum + medicine.unitPrice * medicine.stockQuantity,
            0
          )
          const lowStockCount = mergedMedicines.filter(
            (medicine) => medicine.stockQuantity > 0 && medicine.stockQuantity <= 10
          ).length
          const outOfStockCount = mergedMedicines.filter(
            (medicine) => medicine.stockQuantity === 0
          ).length

          setStats({
            totalMedicines: mergedMedicines.length,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            totalValue: totalValue,
          })
        } else {
          setError(response.data.message || "Error deleting medicine")
        }
      } catch (err) {
        console.error("Delete error:", err)
        const errorMessage =
          err.response?.data?.message ||
          "Failed to delete medicine. It may be referenced in sales records."
        setError(errorMessage)
      }
    }
  }

  if (loading || importingMedicines) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-indigo-600 font-medium">
          {importingMedicines ? "Importing sample medicines..." : "Loading..."}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Medicine Inventory</h1>
          <p className="text-gray-600">Manage your pharmacy inventory efficiently</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
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
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          <button
            onClick={loadSampleMedicines}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
            disabled={importingMedicines}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Import Sample Medicines
          </button>
          <Link
            to="/medicines/add"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Add Medicine
          </Link>
          <Link
            to="/sell"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              />
            </svg>
            Sell Medicine
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMedicines}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-800">${stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-gray-800">{salesStats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${salesStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-800">{salesStats.todaySales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${salesStats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No medicines found</h3>
          <p className="text-gray-500 mb-6">
            No medicines match your search criteria or your inventory is empty.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadSampleMedicines}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors mx-auto sm:mx-2"
              disabled={importingMedicines}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Import Sample Medicines
            </button>
            <Link
              to="/medicines/add"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors mx-auto sm:mx-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              Add Medicine Manually
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Generic Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Group
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{medicine.genericName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{medicine.groupName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${medicine.unitPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          medicine.stockQuantity > 10
                            ? "bg-green-100 text-green-800"
                            : medicine.stockQuantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {medicine.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/medicines/${medicine._id}`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Details
                        </Link>
                        <button
                          onClick={() => handleDeleteMedicine(medicine._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard