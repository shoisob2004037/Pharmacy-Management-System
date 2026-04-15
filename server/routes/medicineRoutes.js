const express = require('express');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  updateStock,
  importMedicines
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.post('/import', importMedicines);
router.get('/search', searchMedicines);

router.route('/:id')
  .get(getMedicine)
  .put(updateMedicine)
  .delete(deleteMedicine);

router.patch('/:id/stock', updateStock);

module.exports = router;