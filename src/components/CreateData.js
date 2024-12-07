import React, { useState } from "react";
import { db, storage } from "../firebase"; // Import Firebase Storage
import { ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./Auth/AuthContext";
import { Collapse } from "react-collapse";
import { objectTypes } from "./constants";

const CreateData = ({ onCancel }) => {
  const { currentUser } = useAuth();
  const [openSections, setOpenSections] = useState({ general: true, multimedia: false });
  const [formData, setFormData] = useState({
    object_title: "",
    object_type: "",
    object_id: "",
    title: "",
    description: "",
    createdByEmail: currentUser ? currentUser.email : "",
    creationDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    object_images: [],
    object_audio: [],
  });

  const [loading, setLoading] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files });
  };

  const uploadFiles = async (files, folder) => {
    const urls = [];
    let thumbnailUrl = null;

    for (const file of files) {
      const storagePath = `${folder}/${file.name}`;
      const fileRef = storageRef(storage, storagePath);

      // Upload the file
      await uploadBytes(fileRef, file);

      // Get the file's download URL
      const fileURL = await getDownloadURL(fileRef);

      // Set the first file's URL as the thumbnail
      if (!thumbnailUrl) {
        thumbnailUrl = fileURL;
      }

      // Add the URL to the list of uploaded file URLs
      urls.push(fileURL);
    }

    return { urls, thumbnailUrl };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.object_id.trim() || !formData.object_type.trim()) {
      alert("Object ID and Object Type are required.");
      return;
    }

    setLoading(true);

    try {
      // Upload images and generate their URLs and a thumbnail URL
      const { urls: imagesURLs, thumbnailUrl } = await uploadFiles(formData.object_images, "images");

      // Upload audio files
      const audioURLs = await uploadFiles(formData.object_audio, "audio");

      // Prepare the updated form data
      const updatedFormData = {
        ...formData,
        object_images: imagesURLs,
        object_audio: audioURLs,
        thumbnailUrl: thumbnailUrl || null, // Add the thumbnail URL to the record
      };

      // Push the record to Firebase
      const recordRef = dbRef(db, `objects/${formData.object_id}`);
      await set(recordRef, updatedFormData);

      alert("Record added successfully!");
      setFormData({
        object_title: "",
        object_type: "",
        object_id: "",
        title: "",
        description: "",
        createdByEmail: currentUser ? currentUser.email : "",
        creationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        object_images: [],
        object_audio: [],
      });

      // Navigate back to RecordManager
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to add record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
      <h2 className="text-2xl font-bold">Create New Record</h2>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("general")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          General Information
        </button>
        <Collapse isOpened={openSections.general}>
          <div className="space-y-4">
            <input
              type="text"
              name="object_id"
              placeholder="Object ID (e.g., OBJ-001)"
              value={formData.object_id}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="object_title"
              placeholder="Object Title"
              value={formData.object_title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              name="object_type"
              value={formData.object_type}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Object Type</option>
              {objectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("multimedia")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Multimedia
        </button>
        <Collapse isOpened={openSections.multimedia}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Upload Images:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, "object_images")}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Upload Audio:</label>
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => handleFileChange(e, "object_audio")}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </Collapse>
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
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default CreateData;
