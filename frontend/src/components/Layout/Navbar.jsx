import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, LayoutDashboard, Home, LogOut, Settings } from 'lucide-react'; // Added Settings

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600 hover:text-indigo-700">
          InfluencerConnect
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center">
            <Home size={18} className="mr-1 hidden sm:inline" /> Home
          </Link>
          {isAuthenticated && currentUser ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center">
                 <LayoutDashboard size={18} className="mr-1 hidden sm:inline" /> Dashboard
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <User size={18} className="mr-1 hidden sm:inline" /> Profile
              </Link>
              {/* ADDED PROFILE SETTINGS LINK */}
              {currentUser.role === 'influencer' && (
                <Link to="/profile/settings" className="text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Settings size={18} className="mr-1 hidden sm:inline" /> Connect
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut size={18} className="mr-0 sm:mr-1" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;