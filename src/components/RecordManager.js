import React, { useState, useEffect } from "react";
import CreateData from "./CreateData";
import ReadData from "./ReadData";
import UpdateData from "./UpdateData";
import DeleteData from "./DeleteData";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

const RecordManager = () => {
  const [records, setRecords] = useState([]); // All records
  const [view, setView] = useState("read"); // Current view: "create", "read", "update", "delete"
  const [selectedRecord, setSelectedRecord] = useState(null); // Record selected for update/delete

  useEffect(() => {
    // Fetch records from Firebase
    const recordsRef = ref(db, "objects");
    const unsubscribe = onValue(recordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedRecords = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setRecords(fetchedRecords);
      } else {
        setRecords([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setView("update");
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setView("delete");
  };

  const handleRecordUpdated = () => {
    setSelectedRecord(null);
    setView("read");
  };

  const handleCreate = () => {
    setView("create"); // Switch to Create mode
  };

  const handleCancel = () => {
    setSelectedRecord(null);
    setView("read");
  };

  return (
    <div className="container mx-auto p-4">
      {view === "create" && <CreateData onCancel={handleCancel} />}
      {view === "read" && (
        <ReadData
          records={records}
          onSelectRecord={handleSelectRecord}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      )}
      {view === "update" && selectedRecord && (
        <UpdateData selectedRecord={selectedRecord} onRecordUpdated={handleRecordUpdated} onCancel={handleCancel} />
      )}
      {view === "delete" && selectedRecord && (
        <DeleteData selectedRecord={selectedRecord} onDeleteSuccess={handleRecordUpdated} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default RecordManager;
