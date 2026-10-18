import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import familyRoutes from './routes/families.js';
import medicineRoutes from './routes/medicines.js';
import doseRoutes from './routes/doses.js';
import stockRoutes from './routes/stock.js';
import prescriptionRoutes from './routes/prescriptions.js';
import carePlanRoutes from './routes/carePlans.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import medicineInfoRoutes from './routes/medicineInfo.js';

// Import error handler
import { errorHandler } from './middleware/errorHandler.js';

// Import scheduler
import './services/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/families', familyRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/doses', doseRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/care-plans', carePlanRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/medicine-info', medicineInfoRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Database connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack')
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
