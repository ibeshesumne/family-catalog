import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
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
        setEmailVerified(user.emailVerified);

        try {
          // Check if the user's email exists in the whitelist
          const whitelistRef = ref(db, `whitelistedEmails/${btoa(user.email)}`);
          const whitelistSnapshot = await get(whitelistRef);

          if (!whitelistSnapshot.exists()) {
            console.warn(`User ${user.email} is not whitelisted. Signing out.`);
            alert("Your email is not whitelisted. Please contact the administrator.");
            await signOut(auth); // Log out the user
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          // If whitelisted, proceed with fetching additional user data
          setCurrentUser(user);

          const userRef = ref(db, `users/${user.uid}/userType`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            setUserType(snapshot.val());
          } else {
            console.warn("No userType found for this user; defaulting to regular.");
            setUserType("regular"); // Default to 'regular' if no userType exists
          }
        } catch (error) {
          console.error("Error during authentication check:", error.message);
          setCurrentUser(null);
          setUserType("regular");
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
