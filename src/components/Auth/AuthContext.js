import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../firebase"; // Adjust the path to your firebase.js

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userType, setUserType] = useState("regular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setEmailVerified(user.emailVerified);

        try {
          // Fetch the userType from the Realtime Database
          const userRef = ref(db, `users/${user.uid}/userType`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            setUserType(snapshot.val());
          } else {
            console.warn("No userType found for this user; defaulting to regular.");
            setUserType("regular"); // Default to 'regular' if no userType exists
          }
        } catch (error) {
          console.error("Error fetching userType:", error.message);
          setUserType("regular"); // Fallback to 'regular' on error
        }
      } else {
        // Reset states when user logs out
        setCurrentUser(null);
        setEmailVerified(false);
        setUserType("regular");
      }

      setLoading(false); // Authentication state resolved
    });

    // Cleanup the auth state listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    emailVerified,
    userType,
    isLoggedIn: !!currentUser, // Added isLoggedIn property
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
