import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import statsRoutes from './routes/stats.js';
import likeCommentRoutes from './routes/likeCommentRoutes.js';
import { apiLimiter, authLimiter, commentLimiter } from './middleware/rateLimiter.js';
import helmet from 'helmet';

dotenv.config();

const app = express();

// CORS configuration with more specific options
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization']
}));

// Add token verification middleware


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser()); // ✅ Enable cookies parsing
app.use(helmet()); // Add security headers

// Apply rate limiting
app.use('/api/', apiLimiter); // General API rate limiting
app.use('/api/users/(signin|register)', authLimiter); // Auth endpoints rate limiting
app.use('/api/blogs/interactions/:id/comments', commentLimiter); // Comment rate limiting

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs/interactions', likeCommentRoutes); // Mount likeCommentRoutes with a distinct path
app.use('/api/blogs', blogRoutes); // Then mount blogRoutes

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is required');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Change this line
    const PORT = process.env.PORT || 5000;  // Changed from 5001 to 5000
    app.listen(PORT, () => 
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
