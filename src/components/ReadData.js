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
        id,
        ...data,
      }));
      setRecords(allRecords);
    });

    return () => unsubscribe();
  }, [currentUser, userType]);

  const headers = [
    { label: "ID", key: "id" },
    { label: "British Museum Record", key: "british_museum_record" },
    { label: "Object Title", key: "object_title" },
    { label: "Object Type", key: "object_type" },
    { label: "Museum Number", key: "museum_number" },
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
    { label: "Production Ethnic Group", key: "production_ethnic_group" },
    { label: "Culture Period", key: "culture_period" },
    { label: "Producer Name", key: "producer_name" },
    { label: "School Style", key: "school_style" },
    { label: "Production Date", key: "production_date" },
    { label: "Production Place", key: "production_place" },
    { label: "Excavator/Field Collector", key: "excavator_field_collector" },
    { label: "Findspot", key: "findspot" },
    { label: "Materials", key: "materials" },
    { label: "Ware", key: "ware" },
    { label: "Technique", key: "technique" },
    { label: "Dimensions (H x W x D)", key: "dimensions_h_w_d" },
    { label: "Inscriptions", key: "inscriptions" },
    { label: "Acquisition Name", key: "acquisition_name" },
    { label: "Previous Owner", key: "previous_owner" },
    { label: "Acquisition Date", key: "acquisition_date" },
    { label: "Acquisition Notes", key: "acquisition_notes" },
    { label: "Curator Comment", key: "curator_comment" },
    { label: "Bibliographic References", key: "bibliographic_references" },
    { label: "Object Location", key: "object_location" },
    { label: "Exhibition History", key: "exhibition_history" },
    { label: "Condition", key: "condition" },
    { label: "Subjects", key: "subjects" },
    { label: "Object Images", key: "object_images" },
    { label: "Object Audio", key: "object_audio" },
    { label: "Notes", key: "notes" },
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
            <div><strong>British Museum Record:</strong> {selectedRecord.british_museum_record}</div>
            <div><strong>Object Title:</strong> {selectedRecord.object_title}</div>
            <div><strong>Object Type:</strong> {selectedRecord.object_type}</div>
            <div><strong>Museum Number:</strong> {selectedRecord.museum_number}</div>
            <div><strong>Title:</strong> {selectedRecord.title}</div>
            <div><strong>Description:</strong> {selectedRecord.description}</div>
            <div><strong>Production Ethnic Group:</strong> {selectedRecord.production_ethnic_group}</div>
            <div><strong>Culture Period:</strong> {selectedRecord.culture_period}</div>
            <div><strong>Producer Name:</strong> {selectedRecord.producer_name}</div>
            <div><strong>School Style:</strong> {selectedRecord.school_style}</div>
            <div><strong>Production Date:</strong> {selectedRecord.production_date}</div>
            <div><strong>Production Place:</strong> {selectedRecord.production_place}</div>
            <div><strong>Excavator/Field Collector:</strong> {selectedRecord.excavator_field_collector}</div>
            <div><strong>Findspot:</strong> {selectedRecord.findspot}</div>
            <div><strong>Materials:</strong> {selectedRecord.materials}</div>
            <div><strong>Ware:</strong> {selectedRecord.ware}</div>
            <div><strong>Technique:</strong> {selectedRecord.technique}</div>
            <div><strong>Dimensions:</strong> {selectedRecord.dimensions_h_w_d}</div>
            <div><strong>Inscriptions:</strong> {selectedRecord.inscriptions}</div>
            <div><strong>Acquisition Name:</strong> {selectedRecord.acquisition_name}</div>
            <div><strong>Previous Owner:</strong> {selectedRecord.previous_owner}</div>
            <div><strong>Acquisition Date:</strong> {selectedRecord.acquisition_date}</div>
            <div><strong>Acquisition Notes:</strong> {selectedRecord.acquisition_notes}</div>
            <div><strong>Curator Comment:</strong> {selectedRecord.curator_comment}</div>
            <div><strong>Bibliographic References:</strong> {selectedRecord.bibliographic_references}</div>
            <div><strong>Object Location:</strong> {selectedRecord.object_location}</div>
            <div><strong>Exhibition History:</strong> {selectedRecord.exhibition_history}</div>
            <div><strong>Condition:</strong> {selectedRecord.condition}</div>
            <div><strong>Subjects:</strong> {selectedRecord.subjects}</div>
            <div><strong>Object Images:</strong> {selectedRecord.object_images.join(", ")}</div>
            <div><strong>Object Audio:</strong> {selectedRecord.object_audio.join(", ")}</div>
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
                  <strong>ID:</strong> {record.id} | <strong>Title:</strong> {record.object_title} |{" "}
                  <strong>Type:</strong> {record.object_type}
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
