"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import jsPDF from "jspdf"
import "jspdf-autotable"

const SaleDetails = () => {
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const { id } = useParams()
  const { user } = useAuth()

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await api.get(`/sales/${id}`)
        if (res.data.success) {
          setSale(res.data.data)
          // Generate PDF after sale data is loaded
          try {
            generatePdf(res.data.data)
          } catch (pdfError) {
            console.error("Error generating PDF:", pdfError)
            // Don't set error state for PDF generation failure to avoid blocking UI
          }
          setLoading(false)
        } else {
          setError(res.data.message || "Error fetching sale details")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching sale:", err)
        setError(err.response?.data?.message || "Error fetching sale details. Please check if the sale exists.")
        setLoading(false)
      }
    }

    fetchSale()
  }, [id])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Generate PDF and create a URL for download
  const generatePdf = (saleData) => {
    if (!saleData) return

    const doc = new jsPDF()

    // Add shop info
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text(user?.shopName || "MediTrack Pharmacy", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100) // Gray color
    doc.text(user?.address || "123 Health Street, Medical District", 105, 27, { align: "center" })
    doc.text(`Phone: ${user?.phone || "555-123-4567"}`, 105, 32, { align: "center" })

    // Add prescription title
    doc.setFontSize(16)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text("PRESCRIPTION", 105, 42, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100) // Gray color
    doc.text(`Date: ${formatDate(saleData.createdAt)}`, 105, 48, { align: "center" })
    doc.text(`Ref: RX-${saleData._id.substring(0, 8)}`, 105, 53, { align: "center" })

    // Add a line
    doc.setDrawColor(59, 130, 246) // Blue color
    doc.line(20, 58, 190, 58)

    // Patient information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0) // Black color
    doc.text("Patient Information", 20, 68)

    doc.setFontSize(10)
    doc.text(`Name: ${saleData.customerName}`, 20, 75)
    if (saleData.customerAge) {
      doc.text(`Age: ${saleData.customerAge} years`, 20, 80)
    }
    if (saleData.customerGender) {
      doc.text(`Gender: ${saleData.customerGender.charAt(0).toUpperCase() + saleData.customerGender.slice(1)}`, 20, 85)
    }

    // Prescriber information
    doc.setFontSize(12)
    doc.text("Prescriber", 120, 68)

    doc.setFontSize(10)
    doc.text(`Doctor: Dr. ${user?.name || "Medical Professional"}`, 120, 75)
    doc.text(`License: MED-${Math.floor(Math.random() * 10000)}`, 120, 80)

    // Medications
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text("Prescribed Medications", 20, 100)

    // Create table for medications
    const tableColumn = ["Medicine", "Quantity", "Instructions"]
    const tableRows = []

    saleData.items.forEach((item) => {
      const itemData = [item.medicineName, item.quantity, item.instructions || "Take as directed"]
      tableRows.push(itemData)
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 105,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [235, 245, 255], textColor: [59, 130, 246] },
    })

    // Payment details
    const finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text("Payment Details", 20, finalY)

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0) // Black color
    doc.text(`Subtotal: $${saleData.subtotal.toFixed(2)}`, 20, finalY + 10)
    doc.text(
      `Discount (${saleData.discount}%): -$${((saleData.discount / 100) * saleData.subtotal).toFixed(2)}`,
      20,
      finalY + 15,
    )
    doc.text(
      `VAT (${saleData.vat}%): $${((saleData.vat / 100) * (saleData.subtotal - (saleData.discount / 100) * saleData.subtotal)).toFixed(2)}`,
      20,
      finalY + 20,
    )

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold") // Use setFont instead of setFontStyle
    doc.text(`Total: $${saleData.total.toFixed(2)}`, 20, finalY + 30)

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text("Thank you for your purchase!", 105, finalY + 45, { align: "center" })

    doc.setTextColor(100, 100, 100) // Gray color
    doc.text("This is a computer-generated prescription and requires a pharmacist's verification.", 105, finalY + 50, {
      align: "center",
    })

    // Create a data URL for the PDF
    const pdfBlob = doc.output("blob")
    const url = URL.createObjectURL(pdfBlob)
    setPdfUrl(url)
  }

  // Custom print function that doesn't rely on react-to-print
  const handlePrint = () => {
    // Create a new window
    const printWindow = window.open("", "_blank", "width=800,height=600")

    // Generate prescription HTML
    const prescriptionHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription_${sale?.customerName || "Customer"}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .prescription {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .shop-info h1 {
            color: #3b82f6;
            margin: 0 0 5px 0;
            font-size: 24px;
          }
          .shop-info p {
            margin: 2px 0;
            color: #666;
          }
          .prescription-title {
            text-align: right;
          }
          .prescription-title div {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
          }
          .prescription-title p {
            margin: 2px 0;
            color: #666;
          }
          .info-section {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-box {
            flex: 1;
            background-color: #ebf5ff;
            padding: 15px;
            border-radius: 5px;
          }
          .info-box h2 {
            color: #3b82f6;
            margin-top: 0;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .info-box p {
            margin: 5px 0;
          }
          .info-box span.label {
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th {
            background-color: #ebf5ff;
            color: #3b82f6;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .payment-details {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .payment-summary {
            flex: 1;
          }
          .payment-total {
            flex: 1;
            background-color: #ebf5ff;
            padding: 15px;
            border-radius: 5px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer p.thank-you {
            color: #3b82f6;
            font-weight: bold;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
          .signature-line {
            width: 150px;
            border-bottom: 1px solid #666;
            margin-top: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
            .prescription {
              border: none;
              box-shadow: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription">
          <div class="header">
            <div class="shop-info">
              <h1>${user?.shopName || "MediTrack Pharmacy"}</h1>
              <p>${user?.address || "123 Health Street, Medical District"}</p>
              <p>Phone: ${user?.phone || "555-123-4567"}</p>
            </div>
            <div class="prescription-title">
              <div>PRESCRIPTION</div>
              <p>Date: ${sale ? formatDate(sale.createdAt) : ""}</p>
              <p>Ref: RX-${sale ? sale._id.substring(0, 8) : ""}</p>
            </div>
          </div>

          <div class="info-section">
            <div class="info-box">
              <h2>Patient Information</h2>
              <p><span class="label">Name:</span> ${sale ? sale.customerName : ""}</p>
              ${sale && sale.customerAge ? `<p><span class="label">Age:</span> ${sale.customerAge} years</p>` : ""}
              ${sale && sale.customerGender ? `<p><span class="label">Gender:</span> ${sale.customerGender.charAt(0).toUpperCase() + sale.customerGender.slice(1)}</p>` : ""}
            </div>
            <div class="info-box">
              <h2>Prescriber</h2>
              <p><span class="label">Doctor:</span> Dr. ${user?.name || "Medical Professional"}</p>
              <p><span class="label">License:</span> MED-${Math.floor(Math.random() * 10000)}</p>
              <p><span class="label">Signature:</span> ____________________</p>
            </div>
          </div>

          <h2 style="color: #3b82f6; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Prescribed Medications</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${
                sale
                  ? sale.items
                      .map(
                        (item, index) => `
                <tr>
                  <td>
                    <div style="font-weight: bold;">${item.medicineName}</div>
                  </td>
                  <td>${item.quantity}</td>
                  <td>${item.instructions || "Take as directed"}</td>
                </tr>
              `,
                      )
                      .join("")
                  : ""
              }
            </tbody>
          </table>

          <h2 style="color: #3b82f6; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment Details</h2>
          <div class="payment-details">
            <div class="payment-summary">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Subtotal:</span>
                <span>$${sale ? sale.subtotal.toFixed(2) : "0.00"}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Discount (${sale ? sale.discount : 0}%):</span>
                <span>-$${sale ? ((sale.discount / 100) * sale.subtotal).toFixed(2) : "0.00"}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>VAT (${sale ? sale.vat : 0}%):</span>
                <span>$${sale ? ((sale.vat / 100) * (sale.subtotal - (sale.discount / 100) * sale.subtotal)).toFixed(2) : "0.00"}</span>
              </div>
            </div>
            <div class="payment-total">
              <div class="total-row">
                <span>Total:</span>
                <span>$${sale ? sale.total.toFixed(2) : "0.00"}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for your purchase!</p>
            <p>This is a computer-generated prescription and requires a pharmacist's verification.</p>
            <div class="signatures">
              <div>
                <p>Patient's Signature</p>
                <div class="signature-line"></div>
              </div>
              <div>
                <p>Pharmacist's Signature</p>
                <div class="signature-line"></div>
              </div>
            </div>
          </div>
        </div>
        <script>
          // Auto print when loaded
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    // Write to the new window
    printWindow.document.open()
    printWindow.document.write(prescriptionHTML)
    printWindow.document.close()
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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mr-2 text-indigo-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          Sale Details
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Prescription
          </button>
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`Prescription_${sale.customerName}_${new Date(sale.createdAt).toLocaleDateString()}.pdf`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </a>
          )}
          <Link
            to="/sales"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sales
          </Link>
        </div>
      </div>

      {/* PDF Preview */}
      {pdfUrl && (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
              Prescription Preview
            </h2>
            <a
              href={pdfUrl}
              download={`Prescription_${sale.customerName}_${new Date(sale.createdAt).toLocaleDateString()}.pdf`}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </a>
          </div>
          <iframe src={pdfUrl} className="w-full h-96 border-none"></iframe>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-lg border border-indigo-100 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Sale Information
          </h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Sale ID:</span>
              <span className="text-gray-800">{sale._id}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Date:</span>
              <span className="text-gray-800">{formatDate(sale.createdAt)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Payment Method:</span>
              <span className="text-gray-800 capitalize">{sale.paymentMethod || "N/A"}</span>
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-lg border border-green-100 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Customer Information
          </h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Name:</span>
              <span className="text-gray-800">{sale.customerName}</span>
            </p>
            {sale.customerAge && (
              <p className="flex justify-between">
                <span className="font-medium text-gray-600">Age:</span>
                <span className="text-gray-800">{sale.customerAge}</span>
              </p>
            )}
            {sale.customerGender && (
              <p className="flex justify-between">
                <span className="font-medium text-gray-600">Gender:</span>
                <span className="text-gray-800 capitalize">{sale.customerGender}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-lg border border-blue-100 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            Payment Summary
          </h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Subtotal:</span>
              <span className="text-gray-800">${sale.subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">Discount ({sale.discount}%):</span>
              <span className="text-red-600">-${((sale.discount / 100) * sale.subtotal).toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-600">VAT ({sale.vat}%):</span>
              <span className="text-gray-800">
                ${((sale.vat / 100) * (sale.subtotal - (sale.discount / 100) * sale.subtotal)).toFixed(2)}
              </span>
            </p>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="flex justify-between font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="text-blue-700 text-lg">${sale.total.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-indigo-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          Medicines
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Medicine
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Subtotal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  Instructions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.medicineName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">${item.subtotal.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700">{item.instructions || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails
