import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import SocialAuthCallbackPage from './pages/SocialAuthCallbackPage'; // Import
import ProfileSettingsPage from './pages/ProfileSettingsPage';     // Import

const UnauthorizedPage = () => ( /* ... remains the same ... */
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
    <p className="text-gray-700 mt-4">You do not have permission to view this page.</p>
    <Link to="/" className="text-indigo-600 hover:underline mt-6 inline-block">Go to Homepage</Link>
  </div>
);

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
    // Optionally render an error message or a limited version of the app
    return <div className="text-center p-8 text-red-500">Error: Google Client ID not configured. Social logins will not work.</div>;
  }
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="pt-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/a" element={<ProfileSettingsPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              {/* Route to handle social login callbacks from backend */}
              <Route path="/auth/social/success" element={<SocialAuthCallbackPage />} />


              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* Profile settings page, only for influencers */}
                <Route element={<ProtectedRoute allowedRoles={['influencer', 'admin']} />}>
                    <Route path="/profile/settings" element={<ProfileSettingsPage />} />
              </Route>

              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
export default App;