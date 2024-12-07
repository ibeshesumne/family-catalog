// src/utils/fetchData.js
import { ref, get } from "firebase/database";
import { db } from "../firebase";

export const fetchData = async () => {
  const dbRef = ref(db, "objects");

  try {
    // Fetch all records from the "objects" node
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return Object.values(snapshot.val()); // Convert the snapshot to an array of objects
    } else {
      return []; // Return an empty array if no data exists
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
