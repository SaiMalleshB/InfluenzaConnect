import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    // You can return a loading spinner here
    return <div className="flex justify-center items-center h-screen"><p>Loading authentication status...</p></div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check if the current user's role is included
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    // User is authenticated but does not have the required role
    // Redirect to an unauthorized page or home page
    return <Navigate to="/unauthorized" replace />; // Or "/"
  }

  return <Outlet />; // Render the child route element
};

export default ProtectedRoute;