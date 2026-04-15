const Sale = require('../models/saleModel');
const Medicine = require('../models/medicineModel');

exports.createSale = async (req, res, next) => {
  try {
    const { items, customerName, customerAge, customerGender, discount, vat } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sale items'
      });
    }

    // Calculate totals and update stock
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      // Find medicine to verify it exists and belongs to this shop
      const medicine = await Medicine.findOne({
        _id: item.medicine,
        shop: req.user.id
      });

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine with ID ${item.medicine} not found or doesn't belong to your shop`
        });
      }

      // Check if enough stock is available
      if (medicine.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${medicine.name}. Available: ${medicine.stockQuantity}`
        });
      }

      // Calculate subtotal for this item
      const itemSubtotal = medicine.unitPrice * item.quantity;
      subtotal += itemSubtotal;

      // Add to processed items
      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        unitPrice: medicine.unitPrice,
        quantity: item.quantity,
        instructions: item.instructions || medicine.instructions,
        subtotal: itemSubtotal
      });

      // Update stock
      await Medicine.findByIdAndUpdate(medicine._id, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Calculate final total
    const discountAmount = (discount / 100) * subtotal;
    const vatAmount = (vat / 100) * (subtotal - discountAmount);
    const total = subtotal - discountAmount + vatAmount;

    // Create sale record
    const sale = await Sale.create({
      shop: req.user.id,
      customerName,
      customerAge,
      customerGender,
      items: processedItems,
      subtotal,
      discount,
      vat,
      total
    });

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales for current shop
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find({ shop: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private (authenticated user)
exports.getSale = async (req, res, next) => {
  try {
    // Validate ObjectId format first (prevents unnecessary DB query)
    const { ObjectId } = require('mongoose').Types
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sale ID format'
      })
    }

    // Populate medicine details (name, genericName, unitPrice, etc.)
    const sale = await Sale.findOne({
      _id: req.params.id,
      shop: req.user.id   // Security: only fetch if belongs to this user
    })
    .populate({
      path: 'items.medicine',
      select: 'name genericName unitPrice dosage'
    })
    .lean() // Faster + cleaner object

    // Not found
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found or access denied'
      })
    }

    // Success
    res.status(200).json({
      success: true,
      data: sale
    })

  } catch (error) {
    // Handle CastError (invalid ObjectId) gracefully
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid sale ID'
      })
    }

    // For any other error, pass to error handler
    console.error('Get sale error:', error)
    next(error)
  }
}

// @desc    Update prescription PDF for a sale
// @route   PATCH /api/sales/:id/prescription
// @access  Private
exports.updatePrescriptionPdf = async (req, res, next) => {
  try {
    const { prescriptionPdf } = req.body;
    
    if (!prescriptionPdf) {
      return res.status(400).json({
        success: false,
        message: 'Please provide prescriptionPdf'
      });
    }

    let sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Make sure user owns the sale
    if (sale.shop.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this sale'
      });
    }

    sale = await Sale.findByIdAndUpdate(
      req.params.id, 
      { prescriptionPdf }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};