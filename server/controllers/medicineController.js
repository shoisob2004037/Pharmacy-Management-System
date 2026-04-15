const Medicine = require('../models/medicineModel');

// @desc    Get all medicines for current shop
// @route   GET /api/medicines
// @access  Private
exports.getMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ shop: req.user.id });
    
    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Make sure user owns the medicine
    if (medicine.shop.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this medicine'
      });
    }

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Private
exports.searchMedicines = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const medicines = await Medicine.find({
      shop: req.user.id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } }
      ],
      stockQuantity: { $gt: 0 } // Only return in-stock medicines
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private
exports.createMedicine = async (req, res, next) => {
  try {
    // Add shop to body
    req.body.shop = req.user.id;
    
    const medicine = await Medicine.create(req.body);
    
    res.status(201).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
exports.updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Make sure user owns the medicine
    if (medicine.shop.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this medicine'
      });
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock quantity
// @route   PATCH /api/medicines/:id/stock
// @access  Private
exports.updateStock = async (req, res, next) => {
  try {
    const { stockQuantity } = req.body;
    
    if (stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stockQuantity'
      });
    }

    let medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Make sure user owns the medicine
    if (medicine.shop.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this medicine'
      });
    }

    medicine = await Medicine.findByIdAndUpdate(
      req.params.id, 
      { stockQuantity }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id)

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      })
    }

    // Make sure user owns the medicine
    if (medicine.shop.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this medicine",
      })
    }

    // Use findByIdAndDelete instead of medicine.remove()
    await Medicine.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting medicine",
      error: error.message,
    })
  }
}
// @desc    Bulk import medicines from JSON
// @route   POST /api/medicines/import
// @access  Private
exports.importMedicines = async (req, res, next) => {
  try {
    const medicines = req.body;
    
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of medicines'
      });
    }

    // Add shop to each medicine
    const medicinesWithShop = medicines.map(medicine => ({
      ...medicine,
      shop: req.user.id
    }));
    
    const importedMedicines = await Medicine.insertMany(medicinesWithShop);
    
    res.status(201).json({
      success: true,
      count: importedMedicines.length,
      data: importedMedicines
    });
  } catch (error) {
    next(error);
  }
};