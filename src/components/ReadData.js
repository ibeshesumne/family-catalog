import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "./Auth/AuthContext"; // Ensure correct path to AuthContext
import { CSVLink } from "react-csv";
import UpdateData from "./UpdateData";

function ReadData() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
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
        return;
      }

      const allRecords = Object.entries(snapshot.val()).map(([id, data]) => ({
        id, // Firebase key
        ...data,
      }));
      setRecords(allRecords);
    });

    return () => unsubscribe();
  }, [currentUser, userType]);

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

  const handleRecordClick = (record) => setSelectedRecord(record);
  const handleBackToRecords = () => {
    setSelectedRecord(null);
    setIsUpdating(false);
  };
  const handleUpdateRecord = () => setIsUpdating(true);

  if (isUpdating && selectedRecord) {
    return (
      <UpdateData
        selectedRecord={selectedRecord}
        onRecordUpdated={handleBackToRecords}
      />
    );
  }

  if (selectedRecord) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Record Details</h2>
          <div className="space-y-4">
            <div><strong>ID:</strong> {selectedRecord.id}</div>
            <div><strong>Object ID:</strong> {selectedRecord.object_id}</div>
            <div><strong>Object Title:</strong> {selectedRecord.object_title}</div>
            <div><strong>Object Type:</strong> {selectedRecord.object_type}</div>
            <div><strong>Title:</strong> {selectedRecord.title}</div>
            <div><strong>Description:</strong> {selectedRecord.description}</div>
            <div><strong>Creation Date:</strong> {selectedRecord.creationDate}</div>
            <div><strong>Modified Date:</strong> {selectedRecord.modifiedDate}</div>

            {/* Display Images */}
            {selectedRecord.object_images && selectedRecord.object_images.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {selectedRecord.object_images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Object ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBackToRecords}
              className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mr-2"
            >
              Back to Records
            </button>
            <button
              onClick={handleUpdateRecord}
              className="w-1/2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Update Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Your Records</h3>
        <p className="text-gray-600 mb-4">
          You have <strong>{records.length}</strong> records. Use the buttons below to review or update them. 
          You can also export the data as a CSV file.
        </p>
        <CSVLink
          data={records}
          headers={headers}
          filename="objects_records.csv"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block"
        >
          Export Records to CSV
        </CSVLink>
        {records.length === 0 ? (
          <p className="text-gray-500">No records available</p>
        ) : (
          <ul className="list-none p-0 space-y-4">
            {records.map((record) => (
              <li
                key={record.id}
                className="p-4 border border-gray-300 rounded flex justify-between items-center"
              >
                <div>
                  <strong>ID:</strong> {record.id} | <strong>Object ID:</strong> {record.object_id} |{" "}
                  <strong>Title:</strong> {record.object_title} | <strong>Type:</strong> {record.object_type}
                </div>
                <button
                  onClick={() => handleRecordClick(record)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Review Record
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ReadData;
