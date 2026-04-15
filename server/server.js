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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= UPDATED CORS CONFIGURATION =============
// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'https://pharmacy-management-system-78if.vercel.app',
  'https://pharmacy-management-system-flame.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined values

// Dynamic CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (allowedOrigins.includes(origin) || (origin && origin.includes('.vercel.app'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // For development - allow any origin (remove in production)
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight requests
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Alternative: Use cors package with more options
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || (origin && origin.includes('.vercel.app'))) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-HTTP-Method-Override'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy', status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedUrl: req.originalUrl,
    availableEndpoints: {
      auth: '/api/auth (POST: /register, /login)',
      medicines: '/api/medicines (GET, POST, PUT, DELETE)',
      sales: '/api/sales (GET, POST)',
      health: '/api/health (GET)'
    }
  });
});

// General 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// MongoDB Connection
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
      socketTimeoutMS: 45000,
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

// Initialize database connection for Vercel (non-blocking)
connectDB().catch((err) => {
  console.error('[Startup Error] Failed to connect to MongoDB:', err.message);
});

// For Vercel serverless - ensure DB connection is established before handling requests
const withDB = async (handler) => {
  return async (req, res) => {
    try {
      if (!isConnected) {
        await connectDB();
      }
      return handler(req, res);
    } catch (error) {
      console.error('[DB Middleware Error]', error);
      return res.status(500).json({ 
        message: 'Database connection error', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Export app for Vercel serverless
module.exports = app;

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  // For local development, connect to DB first
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] API available at http://localhost:${PORT}/api`);
    });
  }).catch((err) => {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  });
}