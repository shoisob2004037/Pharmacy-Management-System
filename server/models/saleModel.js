const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  instructions: {
    type: String
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const SaleSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    default: 'Walk-in Customer'
  },
  customerAge: {
    type: Number
  },
  customerGender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  items: [SaleItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  vat: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  prescriptionPdf: {
    type: String  // URL or path to stored PDF
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile'],
    default: 'cash'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', SaleSchema);