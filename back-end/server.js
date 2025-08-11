import express from 'express';
import cors from 'cors';
import questionRoutes from './routes/questionRoutes.js';
import resetRoute from './routes/resetRoute.js';
import authRoutes from './routes/authRoutes.js';
import extractRoutes from './routes/extractRoutes.js';
import userRoutes from './routes/userRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import healthCheckRoute from './routes/healthCheckRoute.js';
import mongoose from 'mongoose';
// import authenticateUser from './middleware/auth.js';
import {
  authenticateToken,
  checkPromptUsage,
} from './middleware/authMiddleware.js';
import { checkUsageLimit } from './middleware/usageMiddleware.js';
import { connectDB } from './config/database.js';

//Initializing the express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', questionRoutes);
app.use('/api/extract-text', extractRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/usage', authenticateToken, usageRoutes);
app.use('/api/reset', resetRoute);

app.use('/api/health', healthCheckRoute);

//Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Access URL: http://192.168.63.141:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

export default app;
