import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { ref, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { objectTypes } from "./constants";

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
    object_images: [],
    object_audio: [],
    thumbnailUrl: "", // Include thumbnailUrl in form data
  });

  const [newImages, setNewImages] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [newAudio, setNewAudio] = useState([]); // Suppress warning for setNewAudio
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    if (selectedRecord) {
      setFormData({
        ...selectedRecord,
        object_images: selectedRecord.object_images || [],
        object_audio: selectedRecord.object_audio || [],
        thumbnailUrl: selectedRecord.thumbnailUrl || "",
        modifiedDate: new Date().toISOString(),
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

  const handleFileChange = (e, setFiles) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDeleteImage = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setFormData((prev) => {
      const updatedImages = (prev.object_images || []).filter((url) => url !== imageUrl);
      const updatedThumbnail = prev.thumbnailUrl === imageUrl ? (updatedImages[0] || null) : prev.thumbnailUrl;
      return {
        ...prev,
        object_images: updatedImages,
        thumbnailUrl: updatedThumbnail,
      };
    });
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
        thumbnailUrl = fileURL; // Use the first uploaded image as the thumbnail
      }

      urls.push(fileURL);
    }

    return { urls, thumbnailUrl };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRecord.id) {
      alert("Invalid record ID.");
      return;
    }

    const recordRef = ref(db, `objects/${selectedRecord.id}`);
    const updatedRecord = { ...formData, modifiedDate: new Date().toISOString() };

    try {
      // Delete selected images
      for (const imageUrl of imagesToDelete) {
        const imageRef = storageRef(storage, imageUrl);
        await deleteObject(imageRef);
      }

      // Upload new multimedia files
      if (newImages.length > 0) {
        const { urls: imageUrls, thumbnailUrl } = await uploadFiles(newImages, "images");
        updatedRecord.object_images = [...(formData.object_images || []), ...imageUrls];
        updatedRecord.thumbnailUrl = thumbnailUrl || updatedRecord.thumbnailUrl; // Update thumbnail if new images are uploaded
      }

      if (newAudio.length > 0) {
        const audioUrls = await uploadFiles(newAudio, "audio");
        updatedRecord.object_audio = [...(formData.object_audio || []), ...audioUrls];
      }

      // Update the record in Firebase
      await update(recordRef, updatedRecord);
      alert("Record updated successfully!");
      if (onRecordUpdated) onRecordUpdated(updatedRecord);
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
              readOnly
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
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            {formData.thumbnailUrl ? (
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail"
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md">
                No Thumbnail
              </div>
            )}
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
              {objectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Existing Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Existing Images</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {(formData.object_images || []).map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Object ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow"
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
          </div>

          {/* Add New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Add New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, setNewImages)}
              className="block w-full mt-1"
            />
          </div>

          {/* Add New Audio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Add New Audio</label>
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={(e) => handleFileChange(e, setNewAudio)}
              className="block w-full mt-1"
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onCancel} // Correctly calls the onCancel prop
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
