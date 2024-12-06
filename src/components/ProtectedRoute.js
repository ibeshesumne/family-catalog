import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, emailVerified } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false); // Assume state stabilizes after mounting
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Add a loading spinner or placeholder
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default ProtectedRoute;
