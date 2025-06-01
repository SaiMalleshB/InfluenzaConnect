import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col justify-center items-center p-8 text-center">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
        Welcome to InfluencerConnect!
      </h1>
      <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in-up">
        The platform where businesses meet influencers to create amazing collaborations.
        Find the perfect match for your brand or showcase your influence to the world.
      </p>
      {isAuthenticated ? (
        <div className="animate-fade-in">
          <p className="text-lg mb-4">Hello, {currentUser?.name}! You are logged in as a {currentUser?.role}.</p>
          <Link
            to="/dashboard"
            className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg"
          >
            Go to Your Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-x-0 md:space-x-4 space-y-4 md:space-y-0 flex flex-col md:flex-row animate-fade-in">
          <Link
            to="/register"
            className="bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-300 transition duration-300 text-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-white hover:text-indigo-600 transition duration-300 text-lg"
          >
            Login
          </Link>
        </div>
      )}
       <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.3s backwards;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out 0.6s backwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;