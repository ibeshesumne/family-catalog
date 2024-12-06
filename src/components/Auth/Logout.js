import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoading(true); // Start loading state
    try {
      // Perform sign-out operation
      await signOut(auth);

      // Navigate to the login page after successful logout
      navigate('/login');

      console.log('User successfully logged out.');
    } catch (error) {
      // Handle potential logout errors
      console.error('Error during logout:', error.message);
      alert('Failed to log out. Please try again.');
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Are you sure you want to log out?</h2>
        <p className="text-gray-600 text-center mb-6">
          Click the button below to securely log out of your account.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`flex items-center justify-center w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? 'Logging Out...' : 'Logout'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Note: You will be redirected to the login page after logging out.
        </p>
      </div>
    </div>
  );
};

export default Logout;
