import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, update } from "firebase/database";
import { useAuth } from "./Auth/AuthContext";

function UpdateData({ selectedRecord, onRecordUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    id: "",
    createdByEmail: "",
    object_title: "",
    object_type: "",
    museum_number: "",
    title: "",
    description: "",
    production_ethnic_group: "",
    culture_period: "",
    producer_name: "",
    school_style: "",
    production_date: "",
    production_place: "",
    excavator_field_collector: "",
    findspot: "",
    materials: "",
    ware: "",
    technique: "",
    dimensions_h_w_d: "",
    inscriptions: "",
    acquisition_name: "",
    previous_owner: "",
    acquisition_date: "",
    acquisition_notes: "",
    curator_comment: "",
    bibliographic_references: "",
    object_location: "",
    exhibition_history: "",
    condition: "",
    subjects: "",
    object_images: "",
    object_audio: "",
    notes: "",
    index_modified_date: "",
  });

  const { currentUser, emailVerified } = useAuth();

  useEffect(() => {
    if (selectedRecord) {
      setFormData(selectedRecord); // Populate the form with selected record data
    }
  }, [selectedRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to update a record.");
      return;
    }

    if (!emailVerified) {
      alert("You must verify your email before updating records.");
      return;
    }

    if (!formData.id) {
      alert("No record selected for update.");
      return;
    }

    const recordRef = ref(db, `objects/${formData.id}`);
    const updatedRecord = {
      ...formData,
      index_modified_date: new Date().toISOString(),
    };

    try {
      await update(recordRef, updatedRecord);
      alert("Record updated successfully!");
      if (onRecordUpdated) onRecordUpdated(updatedRecord); // Notify parent component
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
          {/* Object Title */}
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

          {/* Object Type */}
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

          {/* Museum Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Museum Number</label>
            <input
              type="text"
              name="museum_number"
              value={formData.museum_number}
              onChange={handleChange}
              placeholder="Enter museum number"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Title */}
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

          {/* Description */}
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

          {/* Production Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Production Date</label>
            <input
              type="date"
              name="production_date"
              value={formData.production_date}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Production Ethnic Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Production Ethnic Group</label>
            <input
              type="text"
              name="production_ethnic_group"
              value={formData.production_ethnic_group}
              onChange={handleChange}
              placeholder="Enter production ethnic group"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Culture Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Culture Period</label>
            <input
              type="text"
              name="culture_period"
              value={formData.culture_period}
              onChange={handleChange}
              placeholder="Enter culture period"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Producer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Producer Name</label>
            <input
              type="text"
              name="producer_name"
              value={formData.producer_name}
              onChange={handleChange}
              placeholder="Enter producer name"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* School Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700">School Style</label>
            <input
              type="text"
              name="school_style"
              value={formData.school_style}
              onChange={handleChange}
              placeholder="Enter school style"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Production Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Production Place</label>
            <input
              type="text"
              name="production_place"
              value={formData.production_place}
              onChange={handleChange}
              placeholder="Enter production place"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Excavator/Field Collector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Excavator/Field Collector</label>
            <input
              type="text"
              name="excavator_field_collector"
              value={formData.excavator_field_collector}
              onChange={handleChange}
              placeholder="Enter excavator/field collector"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Findspot */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Findspot</label>
            <input
              type="text"
              name="findspot"
              value={formData.findspot}
              onChange={handleChange}
              placeholder="Enter findspot"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Materials</label>
            <input
              type="text"
              name="materials"
              value={formData.materials}
              onChange={handleChange}
              placeholder="Enter materials"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Object Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Object Images (URLs)</label>
            <input
              type="text"
              name="object_images"
              value={formData.object_images}
              onChange={handleChange}
              placeholder="Enter image URLs separated by commas"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Object Audio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Object Audio (URLs)</label>
            <input
              type="text"
              name="object_audio"
              value={formData.object_audio}
              onChange={handleChange}
              placeholder="Enter audio URLs separated by commas"
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter notes"
              className="block w-full mt-1 p-2 border rounded-md"
            ></textarea>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onCancel} // Trigger cancel callback
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
