const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add medicine name'],
    trim: true
  },
  genericName: {
    type: String,
    required: false,
    trim: true
  },
  groupName: {
    type: String,
    required: [true, 'Please add group name'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add manufacturer name']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Please add unit price']
  },
  stripPrice: {
    type: Number,
    required: [true, 'Please add strip price']
  },
  unitsPerStrip: {
    type: Number,
    required: [true, 'Please add number of units per strip'],
    default: 10
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0
  },
  dosage: {
    type: String,
    required: [true, 'Please add dosage information']
  },
  instructions: {
    type: String,
    required: [true, 'Please add usage instructions']
  },
  precautions: {
    type: String,
    default: ''
  },
  sideEffects: {
    type: String,
    default: ''
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for name search to optimize search performance
MedicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);