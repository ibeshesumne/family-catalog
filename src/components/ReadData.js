import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import { useAuth } from "./Auth/AuthContext";
import { CSVLink } from "react-csv";

function ReadData({ onSelectRecord, onDelete, onCreate }) {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, userType } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const recordsRef = ref(db, "objects");
    const recordsQuery =
      userType === "admin"
        ? recordsRef
        : query(recordsRef, orderByChild("createdByEmail"), equalTo(currentUser.email));

    const unsubscribe = onValue(recordsQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setRecords([]);
        setFilteredRecords([]);
        return;
      }

      const allRecords = Object.entries(snapshot.val()).map(([object_id, data]) => ({
        object_id,
        ...data,
      }));

      setRecords(allRecords);
      setFilteredRecords(allRecords);
    });

    return () => unsubscribe();
  }, [currentUser, userType]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    const objectIdQuery = query(ref(db, "objects"), orderByChild("object_id"), equalTo(searchQuery));

    try {
      const snapshot = await get(objectIdQuery);
      const results = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          results.push({ object_id: child.key, ...child.val() });
        });
      }

      setFilteredRecords(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const headers = records.length > 0
    ? Object.keys(records[0]).map((key) => ({
        label: key.replace(/_/g, " ").toUpperCase(),
        key: key,
      }))
    : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Your Records</h3>
        <p className="text-gray-600 mb-4">
          You have <strong>{records.length}</strong> records. Use the buttons below to create, review, update, or delete records.
          You can also export the data as a CSV file.
        </p>

        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            placeholder="Search by object ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
            Search
          </button>
        </div>

        <div className="mb-4">
          <button onClick={onCreate} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400">
            Create New Record
          </button>
        </div>

        <CSVLink
          data={records}
          headers={headers}
          filename="objects_records.csv"
          className="p-2 bg-gray-500 text-white rounded mb-4 inline-block hover:bg-gray-700 focus:ring-2 focus:ring-gray-400"
        >
          Export Records to CSV
        </CSVLink>

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
                      <div key={key} className="flex items-center space-x-2">
                        <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong>
                        <img
                          src={value}
                          alt="Thumbnail"
                          className="w-16 h-16 object-cover rounded-md border border-gray-300"
                        />
                      </div>
                    );
                  }

                  if (key === "object_images" && Array.isArray(value)) {
                    return (
                      <div key={key} className="flex flex-col">
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
                    <p key={key} className="text-sm">
                      <strong>{key.replace(/_/g, " ").toUpperCase()}:</strong> {value?.toString() || "N/A"}
                    </p>
                  );
                })}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => onSelectRecord(record)}
                    className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400"
                  >
                    Review Record
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400"
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
