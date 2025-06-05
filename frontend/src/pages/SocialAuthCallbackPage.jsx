import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

const SocialAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSocialLoginSuccess, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return; // Prevent multiple processing runs

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const role = params.get('role');
    const userId = params.get('id'); // or _id depending on backend
    const authError = params.get('error');

    if (authError) {
      setError(`Social login failed: ${authError.replace(/_/g, ' ')}`);
      setProcessed(true);
      // Optionally redirect to login page after a delay
      setTimeout(() => navigate('/login'), 4000);
      return;
    }

    if (token && name && email && role && userId) {
      handleSocialLoginSuccess({ token, name, email, role, id: userId });
      setProcessed(true);
      // Redirect to dashboard or intended page
      navigate('/dashboard', { replace: true });
    } else if (!isAuthenticated) { // Only set error if not already authenticated by other means
      setError('Social login callback is missing required information.');
      setProcessed(true);
      setTimeout(() => navigate('/login'), 4000);
    } else if (isAuthenticated) {
      // If already authenticated and somehow landed here, just go to dashboard
      setProcessed(true);
      navigate('/dashboard', { replace: true });
    }

  }, [location, navigate, handleSocialLoginSuccess, isAuthenticated, processed]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-red-600 mb-2">Authentication Error</h1>
        <p className="text-gray-700">{error}</p>
        <p className="text-gray-500 mt-4">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
      <p className="text-xl text-gray-700">Processing your social login...</p>
    </div>
  );
};

export default SocialAuthCallbackPage;