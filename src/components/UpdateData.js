import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { ref, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { objectTypes } from "./constants";

function UpdateData({ selectedRecord, onRecordUpdated, onCancel }) {
  const [formData, setFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [newAudio, setNewAudio] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [filteredObjectTypes, setFilteredObjectTypes] = useState(objectTypes);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (selectedRecord) {
      setFormData({
        ...selectedRecord,
        object_images: selectedRecord.object_images || [],
        object_audio: selectedRecord.object_audio || [],
        thumbnailUrl: selectedRecord.thumbnailUrl || "",
        modifiedDate: new Date().toISOString(),
        production_ethnic_group: selectedRecord.production_ethnic_group || "",
        culture_period: selectedRecord.culture_period || "",
        producer_name: selectedRecord.producer_name || "",
        school_style: selectedRecord.school_style || "",
        production_date: selectedRecord.production_date || "",
        production_place: selectedRecord.production_place || "",
        excavator_field_collector: selectedRecord.excavator_field_collector || "",
        findspot: selectedRecord.findspot || "",
        materials: selectedRecord.materials || "",
        ware: selectedRecord.ware || "",
        technique: selectedRecord.technique || "",
        dimensions_h_w_d: selectedRecord.dimensions_h_w_d || "",
        inscriptions: selectedRecord.inscriptions || "",
        acquisition_name: selectedRecord.acquisition_name || "",
        previous_owner: selectedRecord.previous_owner || "",
        acquisition_date: selectedRecord.acquisition_date || "",
        acquisition_notes: selectedRecord.acquisition_notes || "",
        curator_comment: selectedRecord.curator_comment || "",
        bibliographic_references: selectedRecord.bibliographic_references || "",
        object_location: selectedRecord.object_location || "",
        exhibition_history: selectedRecord.exhibition_history || "",
        condition: selectedRecord.condition || "",
        subjects: selectedRecord.subjects || "",
        object_type: selectedRecord.object_type || "",
      });
    }
  }, [selectedRecord]);

  // Clean the data to remove undefined values
  const cleanData = (data) => {
    if (Array.isArray(data)) {
      return data.filter((item) => item !== undefined); // Remove undefined values from arrays
    } else if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data)
          .filter(([_, value]) => value !== undefined) // Remove undefined values
          .map(([key, value]) => [key, cleanData(value)]) // Recursively clean nested objects/arrays
      );
    }
    return data; // Return value as is for non-object types
  };

  const handleObjectTypeChange = (e) => {
    const { value } = e.target;

    setIsTyping(true);

    setFormData((prev) => ({
      ...prev,
      object_type: value,
    }));

    const filtered = objectTypes.filter((type) =>
      type.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredObjectTypes(filtered);
  };

  const handleObjectTypeBlur = () => {
    setTimeout(() => {
      setIsTyping(false);
      if (!formData.object_type.trim()) {
        setFormData((prev) => ({
          ...prev,
          object_type: selectedRecord.object_type,
        }));
      }
      setFilteredObjectTypes([]);
    }, 200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, setFiles) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDeleteImage = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setFormData((prev) => ({
      ...prev,
      object_images: (prev.object_images || []).filter((url) => url !== imageUrl),
      thumbnailUrl: prev.thumbnailUrl === imageUrl ? null : prev.thumbnailUrl,
    }));
  };

  const uploadFiles = async (files, folder) => {
    const urls = [];
    let thumbnailUrl = null;

    for (const file of files) {
      const storagePath = `${folder}/${file.name}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      if (!thumbnailUrl) {
        thumbnailUrl = fileURL;
      }

      urls.push(fileURL);
    }

    return { urls, thumbnailUrl };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.object_id) {
      alert("Invalid record ID.");
      return;
    }

    const recordRef = ref(db, `objects/${formData.object_id}`);

    // Clean the formData to remove undefined values
    const cleanedData = cleanData(formData);
    console.log("Cleaned Data:", cleanedData);

    try {
      for (const imageUrl of imagesToDelete) {
        const imageRef = storageRef(storage, imageUrl);
        await deleteObject(imageRef);
      }

      if (newImages.length > 0) {
        const { urls: imageUrls, thumbnailUrl } = await uploadFiles(newImages, "images");
        cleanedData.object_images = [...(cleanedData.object_images || []), ...imageUrls];
        cleanedData.thumbnailUrl = thumbnailUrl || cleanedData.thumbnailUrl;
      }

      if (newAudio.length > 0) {
        const audioUrls = await uploadFiles(newAudio, "audio");
        cleanedData.object_audio = [...(cleanedData.object_audio || []), ...audioUrls];
      }

      await update(recordRef, cleanedData);
      alert("Record updated successfully!");
      if (onRecordUpdated) onRecordUpdated(cleanedData);
    } catch (error) {
      console.error("Error updating record:", error.message);
      alert("Failed to update record. Please try again.");
    }
  };

  const renderInputFields = () => (
    <>
      {Object.entries(formData).map(([key, value]) => {
        if (key === "object_type") {
          return (
            <div key={key} className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">Object Type</label>
              <input
                type="text"
                name={key}
                value={formData.object_type}
                placeholder="Type to filter object types"
                onChange={handleObjectTypeChange}
                onBlur={handleObjectTypeBlur}
                onFocus={() => setFilteredObjectTypes(objectTypes)}
                className="block w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {isTyping && filteredObjectTypes.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-auto shadow-lg">
                  {filteredObjectTypes.slice(0, 50).map((type, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          object_type: type,
                        }));
                        setFilteredObjectTypes([]);
                      }}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        if (key === "object_images") {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Existing Images</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Array.isArray(value) &&
                  value.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Object ${index + 1}`}
                        className="w-full h-auto rounded-lg shadow border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(imageUrl)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
              <label className="block text-sm font-medium text-gray-700 mt-4">Add New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, setNewImages)}
                className="block w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
          );
        }

        if (key === "object_audio") {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add New Audio</label>
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => handleFileChange(e, setNewAudio)}
                className="block w-full mt-1 p-2 border border-gray-300 rounded"
              />
            </div>
          );
        }

        if (key === "thumbnailUrl") {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              {value ? (
                <img
                  src={value}
                  alt="Thumbnail"
                  className="w-24 h-24 object-cover rounded-md border border-gray-300 mt-2"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md mt-2">
                  No Thumbnail
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{key.replace(/_/g, " ").toUpperCase()}</label>
            <input
              type="text"
              name={key}
              value={value || ""}
              onChange={handleChange}
              className="block w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
        );
      })}
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Update Record</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderInputFields()}
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