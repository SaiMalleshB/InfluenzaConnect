
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'; // To get currentUser as a fallback or for quick display
import authService from '../services/authService'; // To call getMe API
import { UserCircle, Mail, Briefcase, AlertTriangle, Loader2 } from 'lucide-react'; // Icons

const ProfilePage = () => {
  const { currentUser: contextUser, loadingAuth } = useAuth(); // Get currentUser from context
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Call the getMe service to fetch fresh data from the backend
        const data = await authService.getMe();
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || 'Could not load profile information.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if initial auth loading is done and we have a token (implied by getMe's internal check)
    if (!loadingAuth) {
        fetchProfile();
    } else {
        // If auth is still loading, defer fetch until it's done or rely on contextUser if needed immediately
        // For this example, we wait for auth to complete then fetch.
    }

  }, [loadingAuth]); // Re-fetch if loadingAuth status changes, e.g., after initial load

  if (loadingAuth || loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)] p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-xl font-semibold text-gray-700">Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)] p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-600">Error Loading Profile</p>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }
  
  // Use fetched profileData if available, otherwise fallback to contextUser (which might be from cookie)
  const userToDisplay = profileData || contextUser;

  if (!userToDisplay) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)] p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-xl font-semibold text-yellow-600">No Profile Data Available</p>
        <p className="text-gray-600 mt-2">Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <UserCircle className="h-24 w-24 text-indigo-600 mb-4" strokeWidth={1.5}/>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{userToDisplay.name}</h1>
          <p className="text-lg text-indigo-500 capitalize">{userToDisplay.role}</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
            <Mail className="h-6 w-6 text-indigo-700 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-md font-medium text-gray-700">{userToDisplay.email}</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <Briefcase className="h-6 w-6 text-purple-700 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="text-md font-medium text-gray-700 capitalize">{userToDisplay.role}</p>
            </div>
          </div>
          
          {/* You can add more profile fields here as your application grows */}
          {/* Example: Joined Date (if available in userToDisplay.createdAt) */}
          {userToDisplay.createdAt && (
             <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <UserCircle className="h-6 w-6 text-green-700 mr-4" /> {/* Replace with a calendar icon if you have one */}
                <div>
                <p className="text-sm text-gray-500">Joined On</p>
                <p className="text-md font-medium text-gray-700">
                    {new Date(userToDisplay.createdAt).toLocaleDateString()}
                </p>
                </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
                // onClick={() => {/* Implement edit profile functionality */}}
            >
                Edit Profile (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;