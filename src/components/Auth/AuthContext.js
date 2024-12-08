import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../firebase"; // Adjust the path to your firebase.js

// Create the AuthContext
const AuthContext = createContext();

// Retry utility
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Retry ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error; // If it's the last retry, rethrow
      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
    }
  }
};

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
        console.log(`User signed in: ${user.email}`);
        setEmailVerified(user.emailVerified);

        try {
          // Log Base64-encoded email
          const base64Email = btoa(user.email);
          console.log(`Base64-encoded email: ${base64Email}`);

          // Check if the user's email exists in the whitelist with retry
          const whitelistRef = ref(db, `whitelistedEmails/${base64Email}`);
          const whitelistSnapshot = await retry(() => get(whitelistRef));

          if (!whitelistSnapshot.exists()) {
            console.warn(`User ${user.email} is not whitelisted. Signing out.`);
            alert("Your email is not whitelisted. Please contact the administrator.");
            await signOut(auth); // Log out the user
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          console.log(`User ${user.email} is whitelisted.`);
          setCurrentUser(user);

          // Check the userType for additional roles with retry
          const userRef = ref(db, `users/${user.uid}/userType`);
          const snapshot = await retry(() => get(userRef));

          if (snapshot.exists()) {
            setUserType(snapshot.val());
            console.log(`User type for ${user.email}: ${snapshot.val()}`);
          } else {
            console.warn(`No userType found for ${user.email}. Defaulting to 'regular'.`);
            setUserType("regular");
          }
        } catch (error) {
          console.error("Error during authentication check:", error.message);
          setCurrentUser(null);
          setUserType("regular");
        }
      } else {
        console.log("User signed out.");
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
