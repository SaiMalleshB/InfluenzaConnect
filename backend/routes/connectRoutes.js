import express from 'express';
import passport from '../config/passportSetup.js';
import { protect } from '../middleware/authMiddleware.js'; // To protect these routes
import { generateToken } from '../controllers/authController.js'; // If needed for re-auth or info

const router = express.Router();

// --- YouTube Connection Routes ---
// 1. Route to initiate YouTube OAuth connection (user must be logged in)
router.get('/youtube', passport.authenticate('youtube-connect')); // Uses 'youtube-connect' strategy
// New route in connectRoutes.js

// 2. YouTube OAuth Callback Route
router.get('/youtube/callback', 
  passport.authenticate('youtube-connect', {
    failureRedirect: `${process.env.CLIENT_URL}/profile/settings?error=youtube_connect_failed`,
    session: false
  }),
  (req, res) => {
    // Successful connection
    const redirectUrl = `${process.env.CLIENT_URL}/profile/settings?success=youtube_connected`;
    
    // For popup flow
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'youtube-connected' }, '${process.env.CLIENT_URL}');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
);

// --- Instagram Connection Routes ---
// 1. Route to initiate Instagram OAuth connection (user must be logged in)
router.get('/instagram', protect, passport.authenticate('instagram-connect')); // Uses 'instagram-connect' strategy

// 2. Instagram OAuth Callback Route
router.get('/instagram/callback',
  protect,
  passport.authenticate('instagram-connect', {
    // session: false,
    failureRedirect: `${process.env.CLIENT_URL}/profile/settings?error=instagram_connect_failed`,
  }),
  (req, res) => {
    // Successful connection, req.user is updated by 'instagram-connect' strategy
    res.redirect(`${process.env.CLIENT_URL}/profile/settings?success=instagram_connected`);
  }
);

export default router;
