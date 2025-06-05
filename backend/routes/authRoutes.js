import express from 'express';
import { registerUser, loginUser, getMe, generateToken } from '../controllers/authController.js'; // Added generateToken
import { protect } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import passport from '../config/passportSetup.js' // Import configured passport

const router = express.Router();
// ... (registerValidation, loginValidation remain the same)
const registerValidation = [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be either influencer or business').optional().isIn(['influencer', 'business'])
];
const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
];


router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);

// --- Google Sign-In Routes ---
// 1. Route to initiate Google OAuth for Sign-In
router.get('/google', passport.authenticate('google-signin', { scope: ['profile', 'email'] }));

// 2. Google OAuth Callback Route for Sign-In
router.get('/google/callback',
  passport.authenticate('google-signin', {
    // session: false, // We are not using server sessions for JWT auth state
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`, // Redirect to frontend login on failure
  }),
  (req, res) => {
    // Successful authentication, req.user is populated by Passport.
    // Generate your platform's JWT for the user.
    const token = generateToken(req.user._id, req.user.role);
    // Redirect to frontend with token (or user info + token)
    // A common pattern is to redirect to a specific frontend page that handles the token.
    // For simplicity, redirecting to dashboard with token in query param (can be improved for security)
    // Better: redirect to a page that stores token from cookie or script, then redirects.
    // Or, have client poll for status after popup closes.
    // For this example, let's assume frontend can handle token from query (not ideal for production)
    // Or better, set HttpOnly cookie here if not using client-side cookie storage.
    // Since we are using client-side cookies, we can redirect and let client store.
    // Let's redirect to a page that expects user info to be set in cookies by passport strategy.
    // The passport strategy above already saves user.
    // We need to ensure the client (frontend) knows authentication was successful.
    // The frontend will have its own logic to fetch user/token from cookies.
    // Redirect to a page that then perhaps fetches /me or uses AuthContext.
    res.redirect(`${process.env.CLIENT_URL}/auth/social/success?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${req.user.email}&role=${req.user.role}&id=${req.user._id}`);
  }
);

export default router;
