import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Generic dashboard
import ProtectedRoute from './components/Common/ProtectedRoute';

// A simple unauthorized page
const UnauthorizedPage = () => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
    <p className="text-gray-700 mt-4">You do not have permission to view this page.</p>
    <Link to="/" className="text-indigo-600 hover:underline mt-6 inline-block">Go to Homepage</Link>
  </div>
);


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="pt-0"> {/* Navbar is sticky, so no need for pt on main if navbar is fixed height */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            {/* Generic Dashboard - accessible by any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Add more generic protected routes here, e.g., /profile */}
            </Route>

            {/* Role-specific dashboards/routes */}
            {/* Example: Influencer Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['influencer', 'admin']} />}>
              <Route path="/dashboard/influencer" element={<div>Influencer Specific Dashboard Content</div>} />
              {/* Add more influencer-specific routes here */}
            </Route>

            {/* Example: Business Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['business', 'admin']} />}>
              <Route path="/dashboard/business" element={<div>Business Specific Dashboard Content</div>} />
              {/* Add more business-specific routes here */}
            </Route>
            
            {/* Fallback for any other authenticated route not matched could be a general dashboard or profile */}
             <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<div>User Profile Page (Protected)</div>} />
             </Route>


            {/* Redirect to home if no route matches */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;