import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session'; // Added
import passport from './config/passportSetup.js'; // Import configured passport
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import connectRoutes from './routes/connectRoutes.js'; // Import connect routes

dotenv.config();
connectDB();
const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express session middleware (Passport relies on this for OAuth flows, even if final auth is JWT)
// The session is primarily for the duration of the OAuth redirect flow.
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_session_key_fallback', // Use an env variable
  resave: false,
  saveUninitialized: false, // True might be needed for some OAuth strategies if they require session before user is known
  // cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // If using sessions with passport

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/connect', connectRoutes); // Use connect routes

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});