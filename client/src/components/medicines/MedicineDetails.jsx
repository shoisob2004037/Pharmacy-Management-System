"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  X,
  Pill,
  Building2,
  Layers,
  FlaskConical, 
  DollarSign,
  Package,
  Activity,
  AlertTriangle,
  ClipboardList,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import api from "../../utils/api"

const MedicineDetails = () => {
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    groupName: "",
    manufacturer: "",
    unitPrice: "",
    stripPrice: "",
    unitsPerStrip: "",
    stockQuantity: "",
    dosage: "",
    instructions: "",
    precautions: "",
    sideEffects: "",
  })

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`)
        setMedicine(res.data.data)
        setFormData(res.data.data)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching medicine details")
        setLoading(false)
      }
    }

    fetchMedicine()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        ["unitPrice", "stripPrice", "unitsPerStrip", "stockQuantity"].includes(name)
          ? Number.parseFloat(value) || 0
          : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/medicines/${id}`, formData)
      setMedicine(formData)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error updating medicine")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) {
      try {
        await api.delete(`/medicines/${id}`)
        navigate("/")
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting medicine")
      }
    }
  }

  // --- UI Helper Components ---
  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-100">
      <Icon className="w-5 h-5 text-indigo-500" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  )

  const InfoCard = ({ label, value, icon: Icon, highlight = false }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center space-x-3 mb-1">
        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
          <Icon size={18} />
        </div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-lg font-bold pl-11 ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  )

  const StatusBadge = ({ quantity }) => {
    let colorClass = "bg-red-100 text-red-700 border-red-200"
    let text = "Out of Stock"
    let Icon = AlertCircle

    if (quantity > 10) {
      colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200"
      text = "In Stock"
      Icon = CheckCircle2
    } else if (quantity > 0) {
      colorClass = "bg-amber-100 text-amber-700 border-amber-200"
      text = "Low Stock"
      Icon = AlertTriangle
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
        <Icon size={14} className="mr-1.5" />
        {text} ({quantity})
      </span>
    )
  }

  // --- Loading / Error States ---
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 mr-2" />
        <p className="font-medium">Error: {error}</p>
      </div>
      <button onClick={() => navigate("/")} className="mt-4 text-sm font-bold underline hover:text-red-800">Return Home</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <button 
            onClick={() => navigate("/")} 
            className="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200 mr-3 group-hover:border-indigo-300">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium">Back to Inventory</span>
          </button>

          {!isEditing && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all hover:shadow-md font-medium"
              >
                <Edit2 size={18} className="mr-2" /> Edit Details
              </button>
              <button 
                onClick={handleDelete} 
                className="flex items-center px-4 py-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg shadow-sm transition-all font-medium"
              >
                <Trash2 size={18} className="mr-2" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Card Title Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-white px-8 py-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {isEditing ? "Edit Medicine" : medicine.name}
                </h1>
                {!isEditing && (
                  <p className="text-gray-500 mt-1 flex items-center">
                    <FlaskConical size={16} className="mr-2" />
                    {medicine.genericName}
                  </p>
                )}
              </div>
              {!isEditing && <StatusBadge quantity={medicine.stockQuantity} />}
            </div>
          </div>

          <div className="p-8">
            {isEditing ? (
              // --- EDIT FORM ---
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Information Group */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-indigo-500" /> General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Medicine Name" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="Generic Name" name="genericName" value={formData.genericName} onChange={handleChange} required />
                    <InputField label="Group Name" name="groupName" value={formData.groupName} onChange={handleChange} required />
                    <InputField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} required />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                   <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-500" /> Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField label="Unit Price" name="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={handleChange} required />
                    <InputField label="Strip Price" name="stripPrice" type="number" step="0.01" value={formData.stripPrice} onChange={handleChange} required />
                    <InputField label="Units Per Strip" name="unitsPerStrip" type="number" value={formData.unitsPerStrip} onChange={handleChange} required />
                    <InputField label="Stock Quantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} required />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-rose-500" /> Clinical Details
                  </h3>
                   <div className="space-y-6">
                    <InputField label="Dosage" name="dosage" value={formData.dosage} onChange={handleChange} required placeholder="e.g. 1-0-1 after food"/>
                    <TextAreaField label="Instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows="3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextAreaField label="Precautions" name="precautions" value={formData.precautions} onChange={handleChange} rows="3" />
                      <TextAreaField label="Side Effects" name="sideEffects" value={formData.sideEffects} onChange={handleChange} rows="3" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setFormData(medicine); }}
                    className="flex items-center px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    <X size={18} className="mr-2" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all font-medium"
                  >
                    <Save size={18} className="mr-2" /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // --- VIEW MODE ---
              <div className="space-y-10">
                
                {/* Top Grid: Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InfoCard label="Manufacturer" value={medicine.manufacturer} icon={Building2} />
                  <InfoCard label="Group" value={medicine.groupName} icon={Layers} />
                  <InfoCard label="Generic" value={medicine.genericName} icon={FlaskConical} />
                  <InfoCard label="Dosage" value={medicine.dosage} icon={Pill} highlight />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Col: Pricing & Stock */}
                  <div className="lg:col-span-1 space-y-6">
                    <SectionHeader icon={Package} title="Inventory & Pricing" />
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-gray-500 text-sm">Unit Price</span>
                        <span className="text-gray-900 font-bold font-mono text-lg">${medicine.unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <span className="text-gray-500 text-sm">Strip Price</span>
                        <span className="text-gray-900 font-bold font-mono text-lg">${medicine.stripPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1">
                        <span className="text-gray-500 text-sm">Pack Size</span>
                        <span className="text-gray-900 font-semibold">{medicine.unitsPerStrip} units/strip</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Medical Text Data */}
                  <div className="lg:col-span-2 space-y-6">
                     <SectionHeader icon={ClipboardList} title="Clinical Information" />
                     
                     <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center">
                          <CheckCircle2 size={16} className="mr-2" /> Instructions
                        </h4>
                        <p className="text-indigo-950 leading-relaxed">{medicine.instructions}</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                          <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center">
                            <AlertTriangle size={16} className="mr-2" /> Precautions
                          </h4>
                          <p className="text-amber-900 text-sm leading-relaxed">{medicine.precautions || "No specific precautions listed."}</p>
                        </div>

                        <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                          <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center">
                            <Activity size={16} className="mr-2" /> Side Effects
                          </h4>
                          <p className="text-rose-900 text-sm leading-relaxed">{medicine.sideEffects || "No specific side effects listed."}</p>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components for Form Fields to keep JSX clean
const InputField = ({ label, name, type = "text", value, onChange, required, step, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      step={step}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
    />
  </div>
)

const TextAreaField = ({ label, name, value, onChange, rows, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <textarea
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
    ></textarea>
  </div>
)

export default MedicineDetails