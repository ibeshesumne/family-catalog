import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import { useAuth } from "./Auth/AuthContext"; // Ensure correct path to AuthContext
import { CSVLink } from "react-csv";

function ReadData({ onSelectRecord, onDelete, onCreate }) {
  const [records, setRecords] = useState([]); // State to hold all records from Firebase
  const [filteredRecords, setFilteredRecords] = useState([]); // State to hold search results
  const [searchQuery, setSearchQuery] = useState(""); // State to manage the search input
  const { currentUser, userType } = useAuth(); // Authentication context

  // Fetch records from Firebase Realtime Database
  useEffect(() => {
    if (!currentUser) return;

    // Reference to "objects" node in the database
    const recordsRef = ref(db, "objects");

    // Query for admin users or filtering by createdByEmail for non-admins
    const recordsQuery =
      userType === "admin"
        ? recordsRef
        : query(recordsRef, orderByChild("createdByEmail"), equalTo(currentUser.email));

    // Subscribe to database changes
    const unsubscribe = onValue(recordsQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setRecords([]); // No records found
        setFilteredRecords([]);
        return;
      }

      // Map the records to an array with the Firebase ID
      const allRecords = Object.entries(snapshot.val()).map(([id, data]) => ({
        id, // Firebase key
        ...data,
      }));

      setRecords(allRecords); // Update state with fetched records
      setFilteredRecords(allRecords); // Initially show all records
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [currentUser, userType]);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records); // Show all records if search query is empty
      return;
    }

    const dbRef = ref(db, "objects");

    // Prepare queries for each field
    const keywordQuery = query(dbRef, orderByChild("keyword"), equalTo(searchQuery));
    const placeQuery = query(dbRef, orderByChild("place"), equalTo(searchQuery));
    const objectIdQuery = query(dbRef, orderByChild("object_id"), equalTo(searchQuery));

    try {
      // Fetch results for all queries
      const [keywordSnapshot, placeSnapshot, objectIdSnapshot] = await Promise.all([
        get(keywordQuery),
        get(placeQuery),
        get(objectIdQuery),
      ]);

      // Combine results from all queries
      const results = [];
      keywordSnapshot.forEach((child) => results.push(child.val()));
      placeSnapshot.forEach((child) => results.push(child.val()));
      objectIdSnapshot.forEach((child) => results.push(child.val()));

      setFilteredRecords(results); // Update state with filtered records
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // CSV headers for exporting data
  const headers = [
    { label: "ID (Firebase Key)", key: "id" },
    { label: "Object ID", key: "object_id" },
    { label: "Object Title", key: "object_title" },
    { label: "Object Type", key: "object_type" },
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
    { label: "Creation Date", key: "creationDate" },
    { label: "Modified Date", key: "modifiedDate" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        {/* Header Section */}
        <h3 className="text-2xl font-bold mb-4">Your Records</h3>
        <p className="text-gray-600 mb-4">
          You have <strong>{records.length}</strong> records. Use the buttons below to create, review, update, or delete records.
          You can also export the data as a CSV file.
        </p>

        {/* Search Section */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by keyword, place, or object ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              marginRight: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* Create New Record Button */}
        <div className="mb-4">
          <button
            onClick={onCreate} // Trigger Create mode
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Record
          </button>
        </div>

        {/* CSV Export Button */}
        <CSVLink
          data={records}
          headers={headers}
          filename="objects_records.csv"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block"
        >
          Export Records to CSV
        </CSVLink>

        {/* Records Listing */}
        {filteredRecords.length === 0 ? (
          <p className="text-gray-500">No records available</p>
        ) : (
          <ul className="list-none p-0 space-y-4">
            {filteredRecords.map((record) => (
              <li
                key={record.id}
                className="p-4 border border-gray-300 rounded flex justify-between items-center"
              >
                {/* Record Thumbnail and Details */}
                <div className="flex items-center space-x-4">
                  {record.thumbnailUrl && (
                    <img
                      src={record.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-16 h-16 object-cover rounded-md border border-gray-300"
                    />
                  )}
                  <div>
                    <strong>ID:</strong> {record.id} | <strong>Object ID:</strong> {record.object_id} |{" "}
                    <strong>Title:</strong> {record.object_title} | <strong>Type:</strong> {record.object_type}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* Review Record Button */}
                  <button
                    onClick={() => onSelectRecord(record)} // Pass selected record to parent
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Review Record
                  </button>

                  {/* Delete Record Button */}
                  <button
                    onClick={() => onDelete(record)} // Trigger delete action
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete Record
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ReadData;
