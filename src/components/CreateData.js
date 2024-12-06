import React, { useState } from "react";
import { db, storage } from "../firebase"; // Import Firebase Storage
import { ref as dbRef, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./Auth/AuthContext";
import { Collapse } from "react-collapse";
import { objectTypes } from "./constants";
/*************  ✨ Codeium Command ⭐  *************/
/**
 * CreateForm is a React component that provides a form interface for adding new records to the database.
 * 
 * The form includes fields for object details such as object ID, title, type, and description. It also 
 * automatically populates the createdByEmail, creationDate, and modifiedDate fields based on the current 
 * user's email and the current date.
 * 
 * The component uses state to manage form data and section visibility, and it provides functionality for
 * toggling form sections and handling input changes. Upon form submission, the data is validated and 
 * submitted to the Firebase database, with feedback provided to the user regarding the success or failure 
 * of the operation.
 */

/******  c302af58-7246-4c07-98ae-80fc4d8fa910  *******/
const CreateForm = () => {
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
    for (const file of files) {
      const storagePath = `${folder}/${file.name}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);
      urls.push(fileURL);
    }
    return urls;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.object_id.trim() || !formData.object_type.trim()) {
      alert("Object ID and Object Type are required.");
      return;
    }

    setLoading(true);

    try {
      const imagesURLs = await uploadFiles(formData.object_images, "images");
      const audioURLs = await uploadFiles(formData.object_audio, "audio");

      const updatedFormData = {
        ...formData,
        object_images: imagesURLs,
        object_audio: audioURLs,
      };

      const recordsRef = dbRef(db, "objects");
      await push(recordsRef, updatedFormData);

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
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to add record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <button type="button" onClick={() => toggleSection("general")}>
          General Information
        </button>
        <Collapse isOpened={openSections.general}>
          <div>
            <input
              type="text"
              name="object_id"
              placeholder="Object ID (e.g., OBJ-001)"
              value={formData.object_id}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="object_title"
              placeholder="Object Title"
              value={formData.object_title}
              onChange={handleInputChange}
            />
            <select
              name="object_type"
              value={formData.object_type}
              onChange={handleInputChange}
              required
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
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button type="button" onClick={() => toggleSection("multimedia")}>
          Multimedia
        </button>
        <Collapse isOpened={openSections.multimedia}>
          <div>
            <label>Upload Images:</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, "object_images")}
            />
            <label>Upload Audio:</label>
            <input
              type="file"
              multiple
              accept="audio/*"
              onChange={(e) => handleFileChange(e, "object_audio")}
            />
          </div>
        </Collapse>
      </div>

      <button type="submit" disabled={loading}>
        Submit
      </button>
    </form>
  );
};

export default CreateForm;
