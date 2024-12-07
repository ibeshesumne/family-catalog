import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { ref, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

function UpdateData({ selectedRecord, onRecordUpdated, onCancel }) {
  const [formData, setFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [newAudio, setNewAudio] = useState([]);
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

    if (!formData.object_id) {
      alert("Invalid record ID.");
      return;
    }

    const recordRef = ref(db, `objects/${formData.object_id}`);
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
        updatedRecord.thumbnailUrl = thumbnailUrl || updatedRecord.thumbnailUrl;
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

  const renderInputFields = () => {
    return Object.entries(formData).map(([key, value]) => {
      if (key === "object_images") {
        // Handle images
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">Existing Images</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {value.map((imageUrl, index) => (
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
            <label className="block text-sm font-medium text-gray-700 mt-4">Add New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, setNewImages)}
              className="block w-full mt-1"
            />
          </div>
        );
      }

      if (key === "object_audio") {
        // Handle audio
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">Add New Audio</label>
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={(e) => handleFileChange(e, setNewAudio)}
              className="block w-full mt-1"
            />
          </div>
        );
      }

      if (key === "thumbnailUrl") {
        // Handle thumbnail
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            {value ? (
              <img
                src={value}
                alt="Thumbnail"
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md">
                No Thumbnail
              </div>
            )}
          </div>
        );
      }

      // Default input fields
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700">{key.replace(/_/g, " ").toUpperCase()}</label>
          <input
            type="text"
            name={key}
            value={value || ""}
            onChange={handleChange}
            className="block w-full mt-1 p-2 border rounded-md"
          />
        </div>
      );
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Update Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
