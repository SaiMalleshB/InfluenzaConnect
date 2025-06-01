import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
// Import other routes as you create them
// import userProfileRoutes from './routes/userProfileRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",       // Your local dev frontend
    "https://your-production.com",  // Add production domain
    process.env.CLIENT_URL          // Use from environment variables
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: [
    "Content-Length",
    "Authorization",
    "X-Powered-By",
    "Set-Cookie"
  ],
  credentials: true,
  maxAge: 86400,                   // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded request bodies

// API Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/auth', authRoutes);
// app.use('/api/profiles', userProfileRoutes); // Example for other features

// Basic Error Handling Middleware (can be more sophisticated)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
