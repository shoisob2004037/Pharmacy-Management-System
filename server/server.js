const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const medicineRoutes = require('./routes/medicineRoutes');
const authRoutes = require('./routes/authRoutes');
const salesRoutes = require('./routes/salesRoutes');

const app = express();

// ========== CORS CONFIGURATION (FIXED) ==========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://pharmacy-management-system-78if.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS policy does not allow access from this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ROUTES ==========
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'API is working',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ========== API ROUTES ==========
app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.url 
  });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      message: 'CORS error: ' + err.message 
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// ========== DATABASE CONNECTION ==========
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('[MongoDB] Using existing connection');
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('[MongoDB] Connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Disconnected');
      isConnected = false;
    });
    
  } catch (err) {
    console.error('[MongoDB Error]', err.message);
    isConnected = false;
    throw err;
  }
};

// Initialize database connection (don't block server startup if fails)
connectDB().catch((err) => {
  console.error('[Startup Error] Failed to connect to MongoDB:', err.message);
});

// ========== EXPORT FOR VERCEL ==========
module.exports = app;

// ========== LOCAL DEVELOPMENT SERVER ==========
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  // Only start server if database connects successfully for local dev
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch((err) => {
    console.error('[Fatal Error] Cannot start server:', err.message);
    process.exit(1);
  });
}