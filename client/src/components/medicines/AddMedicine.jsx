"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../../utils/api"

const AddMedicine = () => {
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    groupName: "",
    manufacturer: "",
    unitPrice: "",
    stripPrice: "",
    unitsPerStrip: 10,
    stockQuantity: "",
    dosage: "",
    instructions: "",
    precautions: "",
    sideEffects: "",
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "unitPrice" || name === "stripPrice" || name === "unitsPerStrip" || name === "stockQuantity"
          ? Number.parseFloat(value)
          : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/medicines", formData)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Error adding medicine")
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Medicine</h1>
        <Link to="/" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
          Back
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Medicine Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Generic Name</label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Group Name</label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Unit Price</label>
            <input
              type="number"
              step="0.01"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Strip Price</label>
            <input
              type="number"
              step="0.01"
              name="stripPrice"
              value={formData.stripPrice}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Units Per Strip</label>
            <input
              type="number"
              name="unitsPerStrip"
              value={formData.unitsPerStrip}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              required
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Precautions</label>
            <textarea
              name="precautions"
              value={formData.precautions}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Side Effects</label>
            <textarea
              name="sideEffects"
              value={formData.sideEffects}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMedicine
