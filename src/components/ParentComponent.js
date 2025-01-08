import React, { useState } from "react";
import UpdateData from "./UpdateData";
import { useAuth } from "./Auth/AuthContext";

const ParentComponent = ({ selectedRecord, onRecordUpdated, onCancel }) => {
  const { currentUser, isAdmin } = useAuth(); // Get currentUser and isAdmin from AuthContext
  const [error, setError] = useState(null); // State to track error messages

  console.log("currentUser in ParentComponent:", currentUser);
  console.log("isAdmin in ParentComponent:", isAdmin);
  console.log("selectedRecord in ParentComponent:", selectedRecord);

  const handleUpdateRecord = (updatedRecord) => {
    console.log("Record updated:", updatedRecord);
    if (onRecordUpdated) onRecordUpdated(updatedRecord);
  };

  const handleCancel = () => {
    console.log("Update canceled.");
    if (onCancel) onCancel();
  };

  // Check for missing permissions and display an appropriate message
  if (!currentUser) {
    return <div className="text-center text-red-500">You must be logged in to access this feature.</div>;
  }

  if (!isAdmin && selectedRecord?.createdByUid !== currentUser.uid) {
    return (
      <div className="text-center text-red-500">
        You do not have permission to update this record.
      </div>
    );
  }

  return (
    <UpdateData
      selectedRecord={selectedRecord}
      onRecordUpdated={handleUpdateRecord}
      onCancel={handleCancel}
      currentUser={currentUser}
      isAdmin={isAdmin}
    />
  );
};

export default ParentComponent;
