"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const SalesHistory = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState("all")
  const [filteredSales, setFilteredSales] = useState([])
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
  })
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [customDateRange, setCustomDateRange] = useState(false)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/sales")
        setSales(res.data.data)
        setFilteredSales(res.data.data)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching sales history")
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  const calculateStats = useCallback((salesData) => {
    const totalRevenue = salesData.reduce((total, sale) => total + sale.total, 0)
    const averageSale = salesData.length > 0 ? totalRevenue / salesData.length : 0

    setStats({
      totalSales: salesData.length,
      totalRevenue,
      averageSale,
    })
  }, [])

  const filterSalesByDate = useCallback(
    (filter) => {
      setCustomDateRange(false)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      let filtered
      switch (filter) {
        case "today":
          filtered = sales.filter((sale) => new Date(sale.createdAt) >= today)
          break
        case "yesterday":
          filtered = sales.filter(
            (sale) =>
              new Date(sale.createdAt) >= yesterday && new Date(sale.createdAt) < today
          )
          break
        case "week":
          filtered = sales.filter((sale) => new Date(sale.createdAt) >= lastWeek)
          break
        case "month":
          filtered = sales.filter((sale) => new Date(sale.createdAt) >= lastMonth)
          break
        case "custom":
          setCustomDateRange(true)
          return
        default:
          filtered = sales
      }

      setFilteredSales(filtered)
      calculateStats(filtered)
    },
    [sales, calculateStats]
  )

  const filterSalesByCustomDateRange = useCallback(() => {
    if (!startDate || !endDate) return

    // Set end date to end of day
    const endOfDay = new Date(endDate)
    endOfDay.setHours(23, 59, 59, 999)

    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt)
      return saleDate >= startDate && saleDate <= endOfDay
    })

    setFilteredSales(filtered)
    calculateStats(filtered)
  }, [sales, startDate, endDate, calculateStats])

  useEffect(() => {
    if (customDateRange && startDate && endDate) {
      filterSalesByCustomDateRange()
    } else {
      filterSalesByDate(dateFilter)
    }
  }, [
    sales,
    dateFilter,
    customDateRange,
    startDate,
    endDate,
    filterSalesByCustomDateRange,
    filterSalesByDate,
  ])

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-indigo-600 font-medium">Loading...</span>
      </div>
    )

  if (error)
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

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 mr-2 text-indigo-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                clipRule="evenodd"
              />
            </svg>
            Sales History
          </h1>
          <p className="text-gray-600">View and manage your sales records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <Link
            to="/sell"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            New Sale
          </Link>
        </div>
      </div>

      {customDateRange && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Custom Date Range</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholderText="Select end date"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => filterSalesByCustomDateRange()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={!startDate || !endDate}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-100 shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Sales Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Average Sale</p>
                <p className="text-2xl font-bold text-gray-800">${stats.averageSale.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredSales.length === 0 ? (
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
          <h3 className="text-xl font-bold text-gray-700 mb-2">No sales found</h3>
          <p className="text-gray-500 mb-6">No sales found for the selected period.</p>
          <Link
            to="/sell"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Create New Sale
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                      {sale.customerGender && (
                        <div className="text-xs text-gray-500 capitalize">{sale.customerGender}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {sale.items.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sales/${sale._id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
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
                        View Details
                      </Link>
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

export default SalesHistory
