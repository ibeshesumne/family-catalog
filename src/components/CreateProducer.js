import React, { useState } from "react";
import { db } from "../firebase";
import { ref, set, update } from "firebase/database";

const CreateProducer = ({ producerId, existingData, onCancel }) => {
  const [formData, setFormData] = useState(
    existingData || {
      name: "",
      alsoKnownAs: "",
      biography: "",
      bibliography: "",
      otherDates: "",
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const producerRef = ref(db, `producers/${producerId || Date.now()}`);
    const data = {
      ...formData,
      relatedObjects: existingData ? existingData.relatedObjects || [] : [],
    };
    try {
      if (producerId) {
        await update(producerRef, data); // Update existing
      } else {
        await set(producerRef, data); // Create new
      }
      alert("Producer saved successfully!");
      onCancel();
    } catch (error) {
      console.error("Error saving producer:", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">{producerId ? "Edit" : "Add"} Producer</h2>
      <input
        type="text"
        name="name"
        placeholder="Producer Name"
        value={formData.name}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="alsoKnownAs"
        placeholder="Also Known As"
        value={formData.alsoKnownAs}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        name="biography"
        placeholder="Biography"
        value={formData.biography}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        name="bibliography"
        placeholder="Bibliography"
        value={formData.bibliography}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        name="otherDates"
        placeholder="Other Dates"
        value={formData.otherDates}
        onChange={handleInputChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="flex justify-between">
        <button type="button" onClick={onCancel} className="bg-gray-500 px-4 py-2 text-white rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 px-4 py-2 text-white rounded">
          Save Producer
        </button>
      </div>
    </form>
  );
};

export default CreateProducer;
