import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService'; // For fetching 'me' data

const DashboardPage = () => {
  const { currentUser, token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          setLoading(true);
          setError('');
          const data = await authService.getMe(); // Use the service
          setUserData(data);
        } catch (err) {
          setError('Failed to fetch user data. You might be logged out.');
          console.error("Dashboard fetch error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No token found. Please log in.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]); // Re-fetch if token changes (e.g., after login)

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500 text-xl">{error}</p></div>;
  }
  
  if (!currentUser && !userData) {
     return <div className="flex justify-center items-center h-screen"><p className="text-red-500 text-xl">Not authenticated. Please log in.</p></div>;
  }

  // Display data from AuthContext (currentUser) or fetched data (userData)
  const displayUser = userData || currentUser;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-4xl font-bold text-indigo-700 mb-6">Dashboard</h1>
        {displayUser ? (
          <>
            <p className="text-xl text-gray-700 mb-2">Welcome back, <span className="font-semibold">{displayUser.name}!</span></p>
            <p className="text-gray-600 mb-2">Email: {displayUser.email}</p>
            <p className="text-gray-600 mb-4">Your Role: <span className="capitalize bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm font-medium">{displayUser.role}</span></p>
            
            {displayUser.role === 'influencer' && (
              <div className="mt-6 p-6 border border-purple-300 rounded-lg bg-purple-50">
                <h2 className="text-2xl font-semibold text-purple-700 mb-3">Influencer Hub</h2>
                <p className="text-purple-600">Manage your profile, view campaign offers, and connect with businesses.</p>
                {/* Add influencer-specific links/components here */}
              </div>
            )}

            {displayUser.role === 'business' && (
              <div className="mt-6 p-6 border border-green-300 rounded-lg bg-green-50">
                <h2 className="text-2xl font-semibold text-green-700 mb-3">Business Hub</h2>
                <p className="text-green-600">Create campaigns, find influencers, and manage your collaborations.</p>
                {/* Add business-specific links/components here */}
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700">Next Steps:</h3>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li>Complete your profile details.</li>
                {displayUser.role === 'influencer' ? <li>Browse available campaigns.</li> : <li>Post your first campaign.</li>}
                <li>Explore platform features.</li>
              </ul>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Could not load user information.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;