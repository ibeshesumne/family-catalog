import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, update } from "firebase/database";

function UpdateData({ selectedRecord, onRecordUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    object_title: "",
    object_type: "",
    object_id: "",
    title: "",
    description: "",
    createdByEmail: "",
    creationDate: "",
    modifiedDate: "",
  });

  // Populate formData with the selected record's data when it changes
  useEffect(() => {
    if (selectedRecord) {
      setFormData({
        ...selectedRecord,
        modifiedDate: new Date().toISOString(), // Automatically update the modified date
      });
    }
  }, [selectedRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRecord.id) {
      alert("Invalid record ID.");
      return;
    }

    const recordRef = ref(db, `objects/${selectedRecord.id}`); // Use the Firebase-generated key
    const updatedRecord = { ...formData, modifiedDate: new Date().toISOString() }; // Include the updated modified date

    try {
      await update(recordRef, updatedRecord); // Update the record in Firebase
      alert("Record updated successfully!");
      if (onRecordUpdated) onRecordUpdated(updatedRecord); // Notify the parent component of the update
    } catch (error) {
      console.error("Error updating record:", error.message);
      alert("Failed to update record. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Update Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Object ID</label>
            <input
              type="text"
              name="object_id"
              value={formData.object_id}
              onChange={handleChange}
              placeholder="Enter object ID"
              className="block w-full mt-1 p-2 border rounded-md"
              readOnly // Prevent changes to the human-readable object_id
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Object Title</label>
            <input
              type="text"
              name="object_title"
              value={formData.object_title}
              onChange={handleChange}
              placeholder="Enter object title"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Object Type</label>
            <select
              name="object_type"
              value={formData.object_type}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border rounded-md"
            >
              <option value="">Select Object Type</option>
              <option value="Figure">Figure</option>
              <option value="Coin">Coin</option>
              <option value="Ivory">Ivory</option>
              <option value="Jewellery">Jewellery</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Pottery">Pottery</option>
              <option value="Postcard">Postcard</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter title"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="block w-full mt-1 p-2 border rounded-md"
            ></textarea>
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateData;
