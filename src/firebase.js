import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  query,
  orderByKey,
  get,
  limitToFirst,
} from "firebase/database"; // Import query functions
import { getAnalytics } from "firebase/analytics"; // Optional, for analytics
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth"; // For authentication
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // For Storage

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Realtime Database instance
export const db = getDatabase(app); // For Realtime Database

// Firebase Storage instance
export const storage = getStorage(app); // For File Storage

// Optional: Initialize Firebase Analytics
if (firebaseConfig.measurementId) {
  getAnalytics(app);
}

// Authentication instance
export const auth = getAuth(app);

// Set session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence set to browser session only");
  })
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });

// Fetch all objects data
export const fetchAllObjects = async () => {
  try {
    const objectsRef = ref(db, "objects");
    const snapshot = await get(objectsRef); // Fetch all data at the "objects" node
    if (snapshot.exists()) {
      return snapshot.val(); // Return all objects
    } else {
      console.warn("No objects data found");
      return {};
    }
  } catch (error) {
    console.error("Error fetching objects data:", error);
    throw error;
  }
};

// Example: Fetch limited objects data
export const fetchLimitedObjects = async (limit = 10) => {
  try {
    const objectsRef = ref(db, "objects");
    const limitedQuery = query(objectsRef, orderByKey(), limitToFirst(limit));
    const snapshot = await get(limitedQuery);
    return snapshot.val() || {};
  } catch (error) {
    console.error("Error fetching limited objects data:", error);
    throw error;
  }
};

// Example: Fetch object by key
export const fetchObjectByKey = async (key) => {
  try {
    const objectRef = ref(db, `objects/${key}`);
    const snapshot = await get(objectRef);
    return snapshot.val() || null;
  } catch (error) {
    console.error("Error fetching object by key:", error);
    throw error;
  }
};

// Upload file to Firebase Storage
export const uploadFile = async (file, folder = "uploads") => {
  try {
    const fileRef = storageRef(storage, `${folder}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    console.log(`File uploaded successfully: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Fetch file download URL from Firebase Storage
export const fetchFileURL = async (path) => {
  try {
    const fileRef = storageRef(storage, path);
    const downloadURL = await getDownloadURL(fileRef);
    console.log(`File URL fetched: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error("Error fetching file URL:", error);
    throw error;
  }
};
