import React from "react"; // Import React to use hooks
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "./Auth/AuthContext"; // Use AuthContext for authentication and verification
import "./exportRecordsToCSV.css";

function ExportRecordsToCSV() {
  const { currentUser, emailVerified } = useAuth(); // Access current user and email verification status

  // Check user authentication and email verification
  if (!currentUser) {
    alert("You must be logged in to export records.");
    return null; // Return null to prevent rendering
  }

  if (!emailVerified) {
    alert("You must verify your email before exporting records.");
    return null; // Return null to prevent rendering
  }

  // Reference to the "objects" node
  const recordsRef = ref(db, `objects`);

  const handleExport = () => {
    get(recordsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const records = snapshot.val();
          const recordsArray = Object.entries(records).map(([object_id, data]) => {
            const { object_images = [], object_audio = [], ...rest } = data;
            return {
              object_id, // Use object_id as the key
              ...rest,
              object_images: object_images.join("; "), // Combine image URLs into a single string
              object_audio: object_audio.join("; "), // Combine audio URLs into a single string
            };
          });
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
  };

  return (
    <button className="download-button" onClick={handleExport}>
      Export Records to CSV
    </button>
  );
}

// Convert JSON data to CSV format
function convertToCSV(data) {
  if (!data.length) return "";

  // Dynamically fetch all headers from the first record
  const headers = Object.keys(data[0]).join(",");

  // Map each record to a CSV row
  const rows = data.map((record) =>
    Object.values(record)
      .map((value) => {
        // Convert arrays to strings and escape quotes
        if (Array.isArray(value)) {
          return `"${value.join("; ").replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes in values
      })
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

export default ExportRecordsToCSV;  