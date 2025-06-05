import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: { // Optional if user signs up with Google/social
    type: String,
    // required: [true, 'Please add a password'], // No longer strictly required for social logins
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['influencer', 'business', 'admin'],
    default: 'influencer',
  },
  // --- Google Sign-In Field ---
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values, but unique if present
  },
  // --- YouTube Connection Fields (for influencers) ---
  youtube: {
    channelId: String,
    accessToken: String, // Encrypt this in a real application
    refreshToken: String, // Encrypt this
    profileData: Object, // Store relevant channel stats
    isVerified: { type: Boolean, default: false },
  },
  // --- Instagram Connection Fields (for influencers) ---
  instagram: {
    userId: String, // Instagram User ID
    username: String,
    accessToken: String, // Encrypt this
    profileData: Object, // Store relevant profile stats
    isVerified: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving the user (if password is provided/modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // User might not have a password (social login)
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;