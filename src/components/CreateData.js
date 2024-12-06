import React, { useState } from "react";
import { db } from "../firebase";
import { ref, push } from "firebase/database"; // Push for Firebase-generated keys
import { useAuth } from "./Auth/AuthContext"; // Access the current user
import { Collapse } from "react-collapse";
import { objectTypes } from "./constants"; // Import objectTypes

const CreateForm = () => {
  const { currentUser } = useAuth();
  const [openSections, setOpenSections] = useState({ general: true });

  const [formData, setFormData] = useState({
    object_title: "",
    object_type: "",
    object_id: "",
    title: "",
    description: "",
    createdByEmail: currentUser ? currentUser.email : "",
    creationDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
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
      const recordsRef = ref(db, "objects");
      await push(recordsRef, formData);
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
      <button type="submit" disabled={loading}>
        Submit
      </button>
    </form>
  );
};

export default CreateForm;
