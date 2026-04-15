const express = require('express');
const {
  createSale,
  getSales,
  getSale,
  updatePrescriptionPdf
} = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSale);

router.patch('/:id/prescription', updatePrescriptionPdf);

module.exports = router;