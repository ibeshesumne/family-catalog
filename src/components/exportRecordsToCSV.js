import { ref, get } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./Auth/AuthContext"; // Use AuthContext for authentication and verification
import "./exportRecordsToCSV.css";

function exportRecordsToCSV() {
  const { currentUser, emailVerified } = useAuth(); // Access current user and email verification status

  // Check user authentication and email verification
  if (!currentUser) {
    alert("You must be logged in to export records.");
    return;
  }

  if (!emailVerified) {
    alert("You must verify your email before exporting records.");
    return;
  }

  // Reference to the "objects" node
  const recordsRef = ref(db, `objects`);

  get(recordsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const records = snapshot.val();
        const recordsArray = Object.keys(records).map((key) => ({
          id: key, // Firebase-generated key
          ...records[key], // Include all fields in the record
        }));
        const csvContent = convertToCSV(recordsArray);
        downloadCSV(csvContent, "object_records.csv");
      } else {
        alert("No records available to export.");
      }
    })
    .catch((error) => {
      console.error("Error fetching records:", error.message);
      alert("Failed to fetch records. Please try again.");
    });
}

// Convert JSON data to CSV format
function convertToCSV(data) {
  if (!data.length) return "";

  // Dynamically fetch all headers from the first record
  const headers = Object.keys(data[0]).join(",");

  // Map each record to a CSV row
  const rows = data.map((record) =>
    Object.values(record)
      .map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes in values
      .join(",")
  );

  return [headers, ...rows].join("\n");
}

// Download the generated CSV file
function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default exportRecordsToCSV;

/* exportRecordsToCSV.css */
.download-button {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.download-button:hover {
  background-color: #0056b3;
}
