import React from 'react';
import authService from '../../services/authService';
import { Chrome } from 'lucide-react'; // Using Chrome icon for Google

const GoogleSignInButton = ({ buttonText = "Sign in with Google" }) => {
  const handleGoogleLogin = () => {
    authService.googleLoginInitiate();
  };

  return (
    <button
      onClick={handleGoogleLogin}
      type="button" // Important to prevent form submission if inside a form
      className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Chrome className="h-5 w-5 mr-2 text-red-500" /> {/* Generic Google icon */}
      {buttonText}
    </button>
  );
};

export default GoogleSignInButton;
