"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"

const SellMedicine = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "Walk-in Customer",
    age: "",
    gender: "male",
  });
  const [discount, setDiscount] = useState(0);
  const [vat, setVat] = useState(5); // Default VAT 5%
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saleId, setSaleId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Merge medicines with the same name, summing stockQuantity
  const mergeMedicines = (medicinesList) => {
    const merged = {};
    medicinesList.forEach((medicine) => {
      if (merged[medicine.name]) {
        merged[medicine.name].stockQuantity += medicine.stockQuantity;
      } else {
        merged[medicine.name] = { ...medicine };
      }
    });
    return Object.values(merged);
  };

  useEffect(() => {
    if (searchTerm.length >= 1) {
      const searchMedicines = async () => {
        try {
          const res = await api.get(`/medicines/search?query=${searchTerm}`);
          // Merge search results by name
          const mergedResults = mergeMedicines(res.data.data);
          setSearchResults(mergedResults);
        } catch (err) {
          setError(err.response?.data?.message || "Error searching medicines");
        }
      };
      searchMedicines();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Show prescription preview when medicines are selected
    if (selectedMedicines.length > 0) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [selectedMedicines]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectMedicine = (medicine) => {
    // Check if medicine is already selected
    const existingIndex = selectedMedicines.findIndex(
      (m) => m.medicine._id === medicine._id
    );

    if (existingIndex !== -1) {
      // Update quantity if already selected
      const updatedMedicines = [...selectedMedicines];
      updatedMedicines[existingIndex].quantity += 1;
      setSelectedMedicines(updatedMedicines);
    } else {
      // Add new medicine to selected list
      setSelectedMedicines([
        ...selectedMedicines,
        {
          medicine,
          quantity: 1,
          instructions: medicine.instructions || "",
        },
      ]);
    }

    // Clear search
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveMedicine = (index) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines.splice(index, 1);
    setSelectedMedicines(updatedMedicines);
  };

  const handleQuantityChange = (index, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index].quantity = Number.parseInt(value) || 1;
    setSelectedMedicines(updatedMedicines);
  };

  const handleInstructionsChange = (index, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index].instructions = value;
    setSelectedMedicines(updatedMedicines);
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value,
    });
  };

  const calculateSubtotal = () => {
    return selectedMedicines.reduce((total, item) => {
      return total + item.medicine.unitPrice * item.quantity;
    }, 0);
  };

  const calculateDiscountAmount = () => {
    return (discount / 100) * calculateSubtotal();
  };

  const calculateVatAmount = () => {
    return (vat / 100) * (calculateSubtotal() - calculateDiscountAmount());
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() - calculateDiscountAmount() + calculateVatAmount()
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (selectedMedicines.length === 0) {
    setError("Please select at least one medicine")
    return
  }

  setLoading(true)
  setError(null)
  setSuccess(false)

  try {
    const saleData = {
      items: selectedMedicines.map((item) => ({
        medicine: item.medicine._id,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
      customerName: customerInfo.name,
      customerAge: customerInfo.age ? Number.parseInt(customerInfo.age) : undefined,
      customerGender: customerInfo.gender,
      discount,
      vat,
    }

    const res = await api.post("/sales", saleData)

    // THIS IS THE PERFECT CHECK (matches your backend 100%)
    if (res.data?.success && res.data?.data?._id) {
      setSaleId(res.data.data._id)
      setSuccess(true)
      generatePdf(res.data.data)
    } else {
      throw new Error("Sale created but invalid response format")
    }
  } catch (err) {
    console.error("Sale creation failed:", err)
    setError(
      err.response?.data?.message || 
      "Failed to complete sale. Please check your connection and try again."
    )
  } finally {
    setLoading(false)
  }
};
 const generatePdf = (saleData) => {
  if (!saleData) return

  const doc = new jsPDF()

  // === HEADER - Shop Info ===
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246)
  doc.text(user?.shopName || "MediTrack Pharmacy", 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(user?.address || "123 Health Street, Medical District", 105, 27, { align: "center" })
  doc.text(`Phone: ${user?.phone || "555-123-4567"}`, 105, 32, { align: "center" })

  // === PRESCRIPTION TITLE ===
  doc.setFontSize(16)
  doc.setTextColor(59, 130, 246)
  doc.text("PRESCRIPTION", 105, 42, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Date: ${formatDate(new Date())}`, 105, 48, { align: "center" })
  doc.text(`Ref: RX-${saleData._id.substring(0, 8).toUpperCase()}`, 105, 53, { align: "center" })

  // Line separator
  doc.setDrawColor(59, 130, 246)
  doc.line(20, 58, 190, 58)

  // === PATIENT INFO ===
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Patient Information", 20, 68)

  doc.setFontSize(10)
  doc.text(`Name: ${customerInfo.name}`, 20, 75)
  if (customerInfo.age) doc.text(`Age: ${customerInfo.age} years`, 20, 80)
  if (customerInfo.gender) {
    const gender = customerInfo.gender.charAt(0).toUpperCase() + customerInfo.gender.slice(1)
    doc.text(`Gender: ${gender}`, 20, customerInfo.age ? 85 : 80)
  }

  // === PRESCRIBER INFO ===
  doc.setFontSize(12)
  doc.text("Prescriber", 120, 68)

  doc.setFontSize(10)
  doc.text(`Doctor: Dr. ${user?.name || "Medical Professional"}`, 120, 75)
  doc.text(`License: MED-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`, 120, 80)

  // === MEDICINES TABLE ===
  doc.setFontSize(12)
  doc.setTextColor(59, 130, 246)
  doc.text("Prescribed Medications", 20, 100)

  const tableColumn = ["Medicine", "Quantity", "Instructions"]
  const tableRows = selectedMedicines.map(item => [
    item.medicine.name,
    item.quantity.toString(),
    item.instructions || "Take as directed"
  ])

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 105,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [235, 245, 255],
      textColor: [59, 130, 246],
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 }
  })

  // === PAYMENT DETAILS ===
  const finalY = doc.lastAutoTable.finalY + 15

  doc.setFontSize(12)
  doc.setTextColor(59, 130, 246)
  doc.text("Payment Details", 20, finalY)

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 20, finalY + 10)
  doc.text(`Discount (${discount}%): -$${calculateDiscountAmount().toFixed(2)}`, 20, finalY + 16)
  doc.text(`VAT (${vat}%): $${calculateVatAmount().toFixed(2)}`, 20, finalY + 22)

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text(`Total: $${calculateTotal().toFixed(2)}`, 20, finalY + 32)

  // === FOOTER ===
  doc.setFontSize(10)
  doc.setTextColor(59, 130, 246)
  doc.text("Thank you for trusting us with your health!", 105, finalY + 50, { align: "center" })

  doc.setTextColor(100, 100, 100)
  doc.text("This is a computer-generated prescription. Pharmacist verification required.", 105, finalY + 56, { align: "center" })

  // Generate blob URL for preview/download
  const pdfBlob = doc.output("blob")
  const url = URL.createObjectURL(pdfBlob)
  setPdfUrl(url)
}

  // Custom print function
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${customerInfo.name}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 20px; color: #1f2937; background: #f9fafb; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 24px; margin-bottom: 24px; }
          .shop h1 { color: #2563eb; font-size: 2rem; margin: 0; }
          .shop p { color: #4b5563; margin: 4px 0; font-size: 0.95rem; }
          .title { text-align: right; }
          .title div { color: #2563eb; font-size: 1.4rem; font-weight: bold; }
          .title p { color: #4b5563; margin: 4px 0; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .info-box { background: #eff6ff; padding: 16px; border-radius: 8px; }
          .info-box h2 { color: #1d4ed8; font-size: 1.15rem; margin: 0 0 12px; }
          .info-box p { margin: 6px 0; }
          .label { font-weight: 600; }
          h2.section { color: #1d4ed8; font-size: 1.25rem; margin: 0 0 16px; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #eff6ff; color: #1d4ed8; text-align: left; padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #bfdbfe; }
          td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          .medicine-name { font-weight: 600; }
          .generic { font-size: 0.875rem; color: #4b5563; }
          .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .total-box { background: #eff6ff; padding: 16px; border-radius: 8px; font-size: 1.15rem; font-weight: bold; display: flex; justify-content: space-between; }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #d1d5db; text-align: center; }
          .thank-you { color: #2563eb; font-weight: 600; font-size: 1.1rem; margin-bottom: 8px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 24px; max-width: 500px; margin-left: auto; margin-right: auto; }
          .sig { text-align: center; }
          .sig-line { border-bottom: 1px solid #4b5563; width: 180px; margin: 12px auto 4px; }
          .small { font-size: 0.875rem; color: #4b5563; }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border-radius: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="shop">
              <h1>${user?.shopName || "MediTrack Pharmacy"}</h1>
              <p>${user?.address || "123 Health Street, Medical District"}</p>
              <p>Phone: ${user?.phone || "555-123-4567"}</p>
            </div>
            <div class="title">
              <div>PRESCRIPTION</div>
              <p>Date: ${formatDate(new Date())}</p>
              <p>Ref: RX-${saleId ? saleId.slice(-8).toUpperCase() : Math.floor(Math.random()*100000).toString().padStart(5,'0')}</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="info-box">
              <h2>Patient Information</h2>
              <p><span class="label">Name:</span> ${customerInfo.name}</p>
              ${customerInfo.age ? `<p><span class="label">Age:</span> ${customerInfo.age} years</p>` : ""}
              <p><span class="label">Gender:</span> ${customerInfo.gender.charAt(0).toUpperCase() + customerInfo.gender.slice(1)}</p>
            </div>
            <div class="info-box">
              <h2>Prescriber</h2>
              <p><span class="label">Sold by:</span> Dr. ${user?.name || "Medical Professional"}</p>
              <p><span class="label">License:</span> MED-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}</p>
              <p><span class="label">Signature:</span> ____________________</p>
            </div>
          </div>

          <h2 class="section">Prescribed Medications</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${selectedMedicines
                .map(
                  (item) => `
              <tr>
                <td>
                  <div class="medicine-name">${item.medicine.name}</div>
                  <div class="generic">${item.medicine.genericName || "—"}</div>
                </td>
                <td>${item.medicine.dosage || "—"}</td>
                <td>${item.quantity}</td>
                <td>${item.instructions || "—"}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2 class="section">Payment Details</h2>
          <div class="payment-grid">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>Subtotal:</span><span>$${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>Discount (${discount}%):</span><span>-$${calculateDiscountAmount().toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>VAT (${vat}%):</span><span>$${calculateVatAmount().toFixed(2)}</span>
              </div>
            </div>
            <div class="total-box">
              <span>Total:</span>
              <span>$${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for your purchase!</p>
            <p class="small">This is a computer-generated prescription and requires a pharmacist's verification.</p>
            <div class="signatures">
              <div class="sig">
                <div>Patient's Signature</div>
                <div class="sig-line"></div>
              </div>
              <div class="sig">
                <div>Pharmacist's Signature</div>
                <div class="sig-line"></div>
              </div>
            </div>
          </div>
        </div>

        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const resetForm = () => {
    setSelectedMedicines([]);
    setCustomerInfo({
      name: "Walk-in Customer",
      age: "",
      gender: "male",
    });
    setDiscount(0);
    setVat(5);
    setSuccess(false);
    setSaleId(null);
    setShowPreview(false);
    setPdfUrl(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 mr-2 text-indigo-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        Sell Medicine
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold text-lg mb-2">
            Sale completed successfully!
          </h3>
          <p className="mb-4">
            You can now print the prescription or create a new sale.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            

            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Sale
            </button>
            <button
              onClick={() => navigate(`/sales/${saleId}`)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Sale Details
            </button>
          </div>

          {/* PDF Preview */}
          {pdfUrl && (
            <p></p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Search Medicine
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Type at least 1 character to search..."
                />

                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {searchResults.map((medicine) => (
                        <li
                          key={medicine._id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                          onClick={() => handleSelectMedicine(medicine)}
                        >
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-sm text-gray-600">
                            {medicine.genericName} - $
                            {medicine.unitPrice.toFixed(2)} - Stock:{" "}
                            {medicine.stockQuantity}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Selected Medicines
                </h2>
                {selectedMedicines.length === 0 ? (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No medicines selected. Search and select medicines above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medicine
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instructions
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedMedicines.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <div className="font-medium">
                                {item.medicine.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.medicine.genericName}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              ${item.medicine.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                max={item.medicine.stockQuantity}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(index, e.target.value)
                                }
                                className="shadow appearance-none border rounded w-20 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              />
                            </td>
                            <td className="px-4 py-2">
                              $
                              {(
                                item.medicine.unitPrice * item.quantity
                              ).toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.instructions}
                                onChange={(e) =>
                                  handleInstructionsChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Customer Information
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={customerInfo.age}
                    onChange={handleCustomerInfoChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={customerInfo.gender}
                    onChange={handleCustomerInfoChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <h2 className="text-lg font-semibold text-gray-700 mb-4 mt-6">
                  Payment Information
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(Number.parseFloat(e.target.value) || 0)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    VAT (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vat}
                    onChange={(e) =>
                      setVat(Number.parseFloat(e.target.value) || 0)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Discount ({discount}%):</span>
                    <span>-${calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">VAT ({vat}%):</span>
                    <span>${calculateVatAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-6 flex items-center justify-center"
                  disabled={loading || selectedMedicines.length === 0}
                >
                  {loading ? (
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Prescription Preview */}
      {showPreview && !success && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Prescription Preview
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center justify-between border-b-2 border-blue-500 pb-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600">
                    {user?.shopName || "MediTrack Pharmacy"}
                  </h1>
                  <p className="text-gray-600">
                    {user?.address || "123 Health Street, Medical District"}
                  </p>
                  <p className="text-gray-600">
                    Phone: {user?.phone || "555-123-4567"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    PRESCRIPTION
                  </div>
                  <p className="text-gray-600">
                    Date: {formatDate(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Ref: RX-
                    {Math.floor(Math.random() * 10000)
                      .toString()
                      .padStart(4, "0")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">
                    Patient Information
                  </h2>
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {customerInfo.name}
                  </p>
                  {customerInfo.age && (
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {customerInfo.age} years
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {customerInfo.gender.charAt(0).toUpperCase() +
                      customerInfo.gender.slice(1)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">
                    Prescriber
                  </h2>
                  <p>
                    <span className="font-medium">Sold by:</span> Dr.{" "}
                    {user?.name || "Medical Professional"}
                  </p>
                  <p>
                    <span className="font-medium">License:</span> MED-
                    {Math.floor(Math.random() * 10000)}
                  </p>
                  <p>
                    <span className="font-medium">Signature:</span>{" "}
                    ____________________
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 border-b border-blue-200 pb-2">
                  Prescribed Medications
                </h2>
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="text-left py-2 px-4 text-blue-700 border-b border-blue-200">
                        Medicine
                      </th>
                      <th className="text-left py-2 px-4 text-blue-700 border-b border-blue-200">
                        Dosage
                      </th>
                      <th className="text-left py-2 px-4 text-blue-700 border-b border-blue-200">
                        Quantity
                      </th>
                      <th className="text-left py-2 px-4 text-blue-700 border-b border-blue-200">
                        Instructions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMedicines.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {item.medicine.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.medicine.genericName}
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.medicine.dosage}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold  mb-4 border-b border-blue-200 pb-2">
                  Payment Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Discount ({discount}%):</span>
                      <span>-${calculateDiscountAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>VAT ({vat}%):</span>
                      <span>${calculateVatAmount().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                <p className="text-blue-600 font-medium">
                  Thank you for your purchase!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This is a computer-generated prescription and requires a
                  pharmacist's verification.
                </p>
                <div className="mt-4 flex justify-between">
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Patient's Signature</p>
                    <div className="mt-2 border-b border-gray-400 w-40"></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Pharmacist's Signature
                    </p>
                    <div className="mt-2 border-b border-gray-400 w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellMedicine;
