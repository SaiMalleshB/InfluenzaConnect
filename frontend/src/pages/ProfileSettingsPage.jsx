import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { Youtube, Instagram, CheckCircle, XCircle, Link as LinkIcon, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuth } from '../contexts/AuthContext'; // To get current user details

const ProfileSettingsPage = () => {
  const location = useLocation();
  const { currentUser, loadingAuth } = useAuth(); // Get current user
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false); // For individual button loading
  const [userData, setUserData] = useState(null); // To store full user data with social connections

  // Function to fetch latest user data including social connections
  const fetchUserData = async () => {
      if(currentUser?._id) { // Ensure currentUser is loaded and has an ID
          setIsLoading(true);
          try {
              const data = await authService.getMe(); // Fetches the full user object
              setUserData(data);
          } catch (error) {
              console.error("Failed to fetch user data for settings:", error);
              setFeedback({ message: 'Could not load your connection status.', type: 'error' });
          } finally {
              setIsLoading(false);
          }
      }
  };

  useEffect(() => {
    // Fetch user data when component mounts or currentUser changes
    if (!loadingAuth && currentUser) {
        fetchUserData();
    }
  }, [currentUser, loadingAuth]);


  useEffect(() => {
    // Handle feedback from OAuth redirects
    const params = new URLSearchParams(location.search);
    const successMessage = params.get('success');
    const errorMessage = params.get('error');

    if (successMessage) {
      setFeedback({ message: `Successfully connected ${successMessage.replace('_', ' ')}!`, type: 'success' });
      fetchUserData(); // Re-fetch user data to show updated connection status
      // Clear query params after reading them
      window.history.replaceState({}, document.title, location.pathname);
    }
    if (errorMessage) {
      setFeedback({ message: `Failed to connect: ${errorMessage.replace(/_/g, ' ')}`, type: 'error' });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleConnectYouTube = () => {
    setIsLoading(true);
    setFeedback({ message: '', type: '' });
    authService.connectYouTube(); // This will redirect the user
    // No need to setIsLoading(false) here as page will redirect
  };

  const handleConnectInstagram = () => {
    setIsLoading(true);
    setFeedback({ message: '', type: '' });
    authService.connectInstagram(); // This will redirect
  };

  if (loadingAuth || (isLoading && !userData)) { // Show main loader if auth is loading or initial userData fetch is in progress
      return (
          <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)] p-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-xl font-semibold text-gray-700">Loading Settings...</p>
          </div>
      );
  }

  if (!currentUser || currentUser.role !== 'influencer') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-700 mt-2">This page is for influencers only.</p>
      </div>
    );
  }
  
  const isYouTubeConnected = userData?.youtube?.isVerified;
  const isInstagramConnected = userData?.instagram?.isVerified;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {isYouTubeConnected && (
  <div className="mt-3 pl-14">
    <p className="text-sm text-gray-600">
      Channel: {userData.youtube.profileData?.title || 'N/A'}
    </p>
    <button 
      onClick={handleDisconnectYouTube}
      className="mt-2 text-xs text-red-600 hover:text-red-800"
    >
      Disconnect
    </button>
  </div>
)}
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-6 md:p-10">
        <div className="text-center mb-8">
          <LinkIcon className="h-12 w-12 text-indigo-600 mx-auto mb-3" strokeWidth={1.5}/>
          <h1 className="text-3xl font-bold text-gray-800">Connect Social Accounts</h1>
          <p className="text-gray-600 mt-2">Verify your influencer accounts to build trust and access more features.</p>
        </div>

        {feedback.message && (
          <div className={`p-4 mb-6 rounded-md text-sm ${
              feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="space-y-6">
          {/* YouTube Connection */}
          <div className={`p-6 rounded-lg border ${isYouTubeConnected ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Youtube className={`h-10 w-10 mr-4 ${isYouTubeConnected ? 'text-red-600' : 'text-gray-500'}`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">YouTube</h2>
                  <p className={`text-sm ${isYouTubeConnected ? 'text-green-600' : 'text-gray-500'}`}>
                    {isYouTubeConnected ? `Connected as ${userData.youtube.profileData?.displayName || 'your YouTube channel'}` : 'Not Connected'}
                  </p>
                </div>
              </div>
              {isYouTubeConnected ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <button
                  onClick={handleConnectYouTube}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : null}
                  Connect
                </button>
              )}
            </div>
            {isYouTubeConnected && userData?.youtube?.profileData && (
                <div className="mt-3 text-xs text-gray-500 pl-14">
                    {/* Display some YouTube stats if available */}
                    {/* e.g., <p>Subscribers: {userData.youtube.profileData.subscriberCount || 'N/A'}</p> */}
                </div>
            )}
          </div>

          {/* Instagram Connection */}
          <div className={`p-6 rounded-lg border ${isInstagramConnected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Instagram className={`h-10 w-10 mr-4 ${isInstagramConnected ? 'text-pink-600' : 'text-gray-500'}`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Instagram</h2>
                   <p className={`text-sm ${isInstagramConnected ? 'text-purple-600' : 'text-gray-500'}`}>
                    {isInstagramConnected ? `Connected as @${userData.instagram.username || 'your Instagram account'}` : 'Not Connected'}
                  </p>
                </div>
              </div>
              {isInstagramConnected ? (
                <CheckCircle className="h-8 w-8 text-purple-500" />
              ) : (
                <button
                  onClick={handleConnectInstagram}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2"/> : null}
                  Connect
                </button>
              )}
            </div>
             {isInstagramConnected && userData?.instagram?.profileData && (
                <div className="mt-3 text-xs text-gray-500 pl-14">
                    {/* Display some Instagram stats if available */}
                    {/* e.g., <p>Followers: {userData.instagram.profileData.followerCount || 'N/A'}</p> */}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;