import React, { useState } from 'react';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { ref as dbRef, get, remove } from "firebase/database";
import { storage, db } from "../firebase";

function DeleteData({ onDeleteSuccess, onCancel }) {
  const [recordId, setRecordId] = useState("");

  const handleIdChange = (e) => {
    setRecordId(e.target.value);
  };

  const deleteFiles = async (fileURLs) => {
    for (const url of fileURLs) {
      try {
        const fileRef = storageRef(storage, url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error(`Error deleting file: ${url}`, error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recordId.trim()) {
      alert("Please enter a valid Record ID.");
      return;
    }

    const recordRef = dbRef(db, `objects/${recordId}`);

    try {
      // Fetch the record to get multimedia file URLs
      const snapshot = await get(recordRef);
      if (!snapshot.exists()) {
        alert("Record not found.");
        return;
      }

      const recordData = snapshot.val();

      // Delete associated files from Firebase Storage
      if (recordData.object_images && recordData.object_images.length > 0) {
        await deleteFiles(recordData.object_images);
      }
      if (recordData.object_audio && recordData.object_audio.length > 0) {
        await deleteFiles(recordData.object_audio);
      }

      // Delete the record from the Realtime Database
      await remove(recordRef);
      alert("Record deleted successfully!");
      setRecordId("");
      if (onDeleteSuccess) onDeleteSuccess(recordId);
    } catch (error) {
      console.error("Error deleting record:", error.message);
      alert("Error deleting record. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Delete Record</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="recordId" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteData;
