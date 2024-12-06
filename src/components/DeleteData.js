import React, { useState } from "react";
import { db } from "../firebase";
import { ref, remove } from "firebase/database";
import { useAuth } from "./Auth/AuthContext";

function DeleteData() {
  const [recordId, setRecordId] = useState("");
  const { currentUser, emailVerified } = useAuth();

  const handleIdChange = (e) => {
    setRecordId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to delete a record.");
      return;
    }

    if (!emailVerified) {
      alert("You must verify your email before deleting records.");
      return;
    }

    if (!recordId.trim()) {
      alert("Please enter a valid Record ID.");
      return;
    }

    const recordRef = ref(db, `objects/${recordId}`); // Firebase key used to locate the record

    try {
      // Attempt to remove the record
      await remove(recordRef);
      alert("Record deleted successfully!");
      setRecordId(""); // Reset the input field
    } catch (error) {
      console.error("Error deleting record:", error.message);
      alert("Error deleting record. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Delete Record</h2>
        <p className="text-gray-600 mb-4">
          To delete a record, please enter the <strong>Record ID</strong> in the box below. 
          The Record ID is the system-generated key associated with the record. You can 
          find it in the "Your Records" section.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recordId" className="block text-sm font-medium text-gray-700">
              Record ID
            </label>
            <input
              type="text"
              id="recordId"
              name="recordId"
              value={recordId}
              onChange={handleIdChange}
              placeholder="Enter Record ID"
              required
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Delete Record
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          <strong>Note:</strong> Deleting a record is permanent and cannot be undone.
        </p>
      </div>
    </div>
  );
}

export default DeleteData;
