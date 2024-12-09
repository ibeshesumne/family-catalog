import React, { useState} from "react";
import { db, storage } from "../firebase"; // Import Firebase Storage
import { ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./Auth/AuthContext";
import { Collapse } from "react-collapse";
import { objectTypes } from "./constants";

const CreateData = ({ onCancel }) => {
  const { currentUser } = useAuth();
  const [openSections, setOpenSections] = useState({
    general: true,
    productionDetails: false,
    multimedia: false,
    discovery: false,
    physical: false,
    ownershipAndAcquisition: false,
    additional: false,
  });

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
  });

  const [loading, setLoading] = useState(false);
  const [filteredObjectTypes, setFilteredObjectTypes] = useState(objectTypes);
  const [isTyping, setIsTyping] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setIsTyping(true);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "object_type") {
      const filtered = objectTypes.filter((type) =>
        type.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredObjectTypes(filtered);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsTyping(false);
      if (!formData.object_type.trim()) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          object_type: "Other",
        }));
      }
      setFilteredObjectTypes([]);
    }, 200);
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

    if (loading) return;

    if (!formData.object_id.trim() || !formData.object_type.trim()) {
      alert("Object ID and Object Type are required.");
      return;
    }

    setLoading(true);

    try {
      const { urls: imagesURLs, thumbnailUrl } = await uploadFiles(formData.object_images, "images");

      const audioURLs = await uploadFiles(formData.object_audio, "audio");

      const updatedFormData = {
        ...formData,
        object_images: imagesURLs,
        object_audio: audioURLs,
        thumbnailUrl: thumbnailUrl || null,
      };

      const recordRef = dbRef(db, `objects/${formData.object_id}`);
      await set(recordRef, updatedFormData);

      alert("Record added successfully!");
      setFormData({
        object_title: "",
        object_type: "Other",
        object_id: "",
        title: "",
        description: "",
        createdByEmail: currentUser ? currentUser.email : "",
        creationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        object_images: [],
        object_audio: [],
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
      });

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
            <div className="relative">
              <input
                type="text"
                name="object_type"
                placeholder="Type to filter object types"
                value={formData.object_type}
                onFocus={() => setFilteredObjectTypes(objectTypes)}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {isTyping && filteredObjectTypes.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-auto shadow-lg">
                  {filteredObjectTypes.slice(0, 50).map((type, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setFormData((prevFormData) => ({
                          ...prevFormData,
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
          onClick={() => toggleSection("productionDetails")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Production Details
        </button>
        <Collapse isOpened={openSections.productionDetails}>
          <div className="space-y-4">
            <input
              type="text"
              name="production_ethnic_group"
              placeholder="Production Ethnic Group"
              value={formData.production_ethnic_group}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="culture_period"
              placeholder="Culture Period"
              value={formData.culture_period}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="producer_name"
              placeholder="Producer Name"
              value={formData.producer_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="school_style"
              placeholder="School Style"
              value={formData.school_style}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="production_date"
              placeholder="Production Date"
              value={formData.production_date}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="production_place"
              placeholder="Production Place"
              value={formData.production_place}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("discovery")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Discovery
        </button>
        <Collapse isOpened={openSections.discovery}>
          <div className="space-y-4">
            <input
              type="text"
              name="excavator_field_collector"
              placeholder="Excavator/Field Collector"
              value={formData.excavator_field_collector}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="findspot"
              placeholder="Findspot"
              value={formData.findspot}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("physical")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Physical
        </button>
        <Collapse isOpened={openSections.physical}>
          <div className="space-y-4">
            <input
              type="text"
              name="materials"
              placeholder="Materials"
              value={formData.materials}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="ware"
              placeholder="Ware"
              value={formData.ware}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="technique"
              placeholder="Technique"
              value={formData.technique}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="dimensions_h_w_d"
              placeholder="Dimensions (H x W x D)"
              value={formData.dimensions_h_w_d}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="inscriptions"
              placeholder="Inscriptions"
              value={formData.inscriptions}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("ownershipAndAcquisition")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Ownership and Acquisition
        </button>
        <Collapse isOpened={openSections.ownershipAndAcquisition}>
          <div className="space-y-4">
            <input
              type="text"
              name="acquisition_name"
              placeholder="Acquisition Name"
              value={formData.acquisition_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="previous_owner"
              placeholder="Previous Owner"
              value={formData.previous_owner}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="acquisition_date"
              placeholder="Acquisition Date"
              value={formData.acquisition_date}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="acquisition_notes"
              placeholder="Acquisition Notes"
              value={formData.acquisition_notes}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          onClick={() => toggleSection("additional")}
          className="mb-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          Additional
        </button>
        <Collapse isOpened={openSections.additional}>
          <div className="space-y-4">
            <input
              type="text"
              name="curator_comment"
              placeholder="Curator Comment"
              value={formData.curator_comment}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="bibliographic_references"
              placeholder="Bibliographic References"
              value={formData.bibliographic_references}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="object_location"
              placeholder="Object Location"
              value={formData.object_location}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="exhibition_history"
              placeholder="Exhibition History"
              value={formData.exhibition_history}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="condition"
              placeholder="Condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="subjects"
              placeholder="Subjects"
              value={formData.subjects}
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

