// server\server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Routes
import candidateRoutes from './routes/candidateRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

// Import Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware Setup
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/interview', interviewRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running and connected to DB!' });
});

// Custom Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
