const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ========== CORS ==========
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ==========
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working'
  });
});

// ========== TRY TO LOAD ROUTES SAFELY ==========
try {
  const medicineRoutes = require('./routes/medicineRoutes');
  app.use('/api/medicines', medicineRoutes);
  console.log('[Routes] Medicines loaded');
} catch (err) {
  console.error('[Routes] Failed to load medicines:', err.message);
  app.use('/api/medicines', (req, res) => {
    res.status(500).json({ error: 'Medicines route not available', details: err.message });
  });
}

try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('[Routes] Auth loaded');
} catch (err) {
  console.error('[Routes] Failed to load auth:', err.message);
  app.use('/api/auth', (req, res) => {
    res.status(500).json({ error: 'Auth route not available', details: err.message });
  });
}

try {
  const salesRoutes = require('./routes/salesRoutes');
  app.use('/api/sales', salesRoutes);
  console.log('[Routes] Sales loaded');
} catch (err) {
  console.error('[Routes] Failed to load sales:', err.message);
  app.use('/api/sales', (req, res) => {
    res.status(500).json({ error: 'Sales route not available', details: err.message });
  });
}

// ========== DATABASE (Optional) ==========
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('[MongoDB] Connected'))
    .catch(err => console.error('[MongoDB Error]', err.message));
}

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    url: req.url 
  });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});

// ========== EXPORT ==========
module.exports = app;

// ========== LOCAL DEVELOPMENT ==========
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}