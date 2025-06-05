import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import InstagramStrategy from 'passport-instagram';
import User from '../models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// This function might not be needed directly in this file if authController.generateToken is used in routes.
const generateTokenForPassportStrategy = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// --- Google Strategy for Sign-In ---
passport.use('google-signin', new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'influencer', // Default role, can be adjusted
      });
      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      console.error("Error in Google Sign-In strategy:", err);
      return done(err, false);
    }
  }
));

// --- Google Strategy for YouTube Connection (for existing logged-in users) ---
passport.use('youtube-connect', new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/connect/youtube/callback',
    accessType: 'offline', // Request refresh token
    prompt: 'consent',     // Force consent screen to ensure refresh token issuance attempt
    scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly', // Example scope
        // 'profile', // 'profile' and 'email' are often included by default with Google OAuth2
        // 'email'   // but explicitly adding them doesn't hurt if needed for profile object.
                     // The profile object you logged already contains this info.
    ],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('--- YouTube Connect Strategy ---');
      console.log('User from JWT (req.user):', req.user); // Log the user from JWT
      console.log('Google Profile (profile):', JSON.stringify(profile, null, 2));
      console.log('Access Token (accessToken):', accessToken);
      console.log('Refresh Token (refreshToken):', refreshToken); // THIS IS THE KEY TOKEN TO CHECK

      if (!req.user) {
        return done(new Error('User not authenticated for YouTube connection (req.user missing).'), false);
      }
      const user = await User.findById(req.user.id); // req.user.id comes from your JWT 'protect' middleware
      if (!user) {
        return done(new Error('User not found in database.'), false);
      }

      // Store or update YouTube connection details
      user.youtube = {
        channelId: profile.id, // This is the Google Account ID.
                               // You'll typically use the accessToken to call YouTube Data API
                               // to get the actual YouTube Channel ID if it's different or more specific.
                               // For example: GET https://www.googleapis.com/youtube/v3/channels?part=id&mine=true
        accessToken: accessToken,   // TODO: Encrypt this in a real application
        refreshToken: refreshToken, // TODO: Encrypt this. THIS IS IMPORTANT.
        profileData: {
            googleProfileId: profile.id,
            displayName: profile.displayName,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
            // You'll make API calls using accessToken to get actual YouTube stats later
        },
        isVerified: true, // Mark as verified upon successful connection
      };
      if (!refreshToken) {
          console.warn(`Refresh token was not provided for user ${user.email} during YouTube connect. This might happen if user has previously granted consent. The existing refresh token (if any) will be preserved if not overwritten with undefined.`);
          // If you want to preserve an existing refresh token if a new one isn't provided:
          if (user.youtube.refreshToken && typeof refreshToken === 'undefined') {
              user.youtube.refreshToken = user.youtube.refreshToken; // Keep old one
          } else {
              user.youtube.refreshToken = refreshToken; // Set new one (even if undefined)
          }
      } else {
          user.youtube.refreshToken = refreshToken; // Definitely set the new refresh token
      }


      await user.save();
      console.log(`YouTube connection details saved for user: ${user.email}`);
      return done(null, user);
    } catch (err) {
      console.error("Error in YouTube Connect strategy:", err);
      return done(err, false);
    }
  }
));

// --- Instagram Strategy for Connection ---
passport.use('instagram-connect', new InstagramStrategy.Strategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: '/api/connect/instagram/callback',
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      if (!req.user) {
        return done(new Error('User not authenticated for Instagram connection.'), false);
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return done(new Error('User not found.'), false);
      }

      user.instagram = {
        userId: profile.id,
        username: profile.username,
        accessToken: accessToken, // TODO: Encrypt this
        profileData: {
            displayName: profile.displayName,
            bio: profile._json?.data?.biography, // Use optional chaining
            website: profile._json?.data?.website,
        },
        isVerified: true,
      };
      await user.save();
      return done(null, user);
    } catch (err) {
      console.error("Error in Instagram Connect strategy:", err);
      return done(err, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
