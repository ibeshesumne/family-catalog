import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import { useAuth } from "./Auth/AuthContext";
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

      // Map the records to an array with the object_id as the key
      const allRecords = Object.entries(snapshot.val()).map(([object_id, data]) => ({
        object_id, // Use object_id as the key
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

    // Query records by object_id
    const objectIdQuery = query(ref(db, "objects"), orderByChild("object_id"), equalTo(searchQuery));

    try {
      const snapshot = await get(objectIdQuery);

      // Process search results
      const results = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          results.push({ object_id: child.key, ...child.val() });
        });
      }

      setFilteredRecords(results); // Update state with filtered records
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Dynamically create CSV headers
  const headers = records.length > 0
    ? Object.keys(records[0]).map((key) => ({
        label: key.replace(/_/g, " ").toUpperCase(),
        key: key,
      }))
    : [];

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
            placeholder="Search by object ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-72"
          />
          <button onClick={handleSearch} className="ml-4 p-2 bg-blue-500 text-white rounded">
            Search
          </button>
        </div>

        {/* Create New Record Button */}
        <div className="mb-4">
          <button onClick={onCreate} className="p-2 bg-green-500 text-white rounded">
            Create New Record
          </button>
        </div>

        {/* CSV Export Button */}
        <CSVLink
          data={records}
          headers={headers}
          filename="objects_records.csv"
          className="p-2 bg-gray-500 text-white rounded mb-4 inline-block"
        >
          Export Records to CSV
        </CSVLink>

        {/* Records Listing */}
        {filteredRecords.length === 0 ? (
          <p className="text-gray-500">No records available</p>
        ) : (
          <ul className="space-y-4">
            {filteredRecords.map((record) => (
              <li
                key={record.object_id}
                className="p-4 border border-gray-300 rounded flex flex-col space-y-2"
              >
                {Object.entries(record).map(([key, value]) => {
                  if (key === "thumbnailUrl") {
                    return (
                      <div key={key}>
                        <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>
                        <img
                          src={value}
                          alt="Thumbnail"
                          className="w-16 h-16 object-cover rounded-md border border-gray-300 mt-2"
                        />
                      </div>
                    );
                  }

                  if (key === "object_images" && Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {value.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Object ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md border border-gray-300"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={key}>
                      <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong> {value?.toString() || "N/A"}
                    </p>
                  );
                })}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectRecord(record)}
                    className="p-2 bg-yellow-500 text-white rounded"
                  >
                    Review Record
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="p-2 bg-red-500 text-white rounded"
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
