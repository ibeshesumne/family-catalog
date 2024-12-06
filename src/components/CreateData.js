import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./Auth/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import { Collapse } from "react-collapse";

const CreateForm = () => {
  const [openSections, setOpenSections] = useState({
    general: true,
    production: false,
    discovery: false,
    physical: false,
    ownership: false,
    additional: false,
    multimedia: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [formData, setFormData] = useState({
    british_museum_record: "",
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
    object_images: [],
    object_audio: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const recordId = uuidv4();
    const recordRef = ref(db, `objects/${recordId}`);

    try {
      await set(recordRef, formData);
      alert("Record added successfully!");
      setFormData({});
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to add record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* General Information */}
      <div>
        <button type="button" onClick={() => toggleSection("general")}>
          General Information
        </button>
        <Collapse isOpened={openSections.general}>
          <div>
            <input
              type="text"
              name="british_museum_record"
              placeholder="British Museum Record"
              value={formData.british_museum_record}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="object_title"
              placeholder="Object Title"
              value={formData.object_title}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="object_type"
              placeholder="Object Type"
              value={formData.object_type}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="museum_number"
              placeholder="Museum Number"
              value={formData.museum_number}
              onChange={handleInputChange}
            />
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

      {/* Production Details */}
      <div>
        <button type="button" onClick={() => toggleSection("production")}>
          Production Details
        </button>
        <Collapse isOpened={openSections.production}>
          <div>
            <input
              type="text"
              name="production_ethnic_group"
              placeholder="Production Ethnic Group"
              value={formData.production_ethnic_group}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="culture_period"
              placeholder="Culture Period"
              value={formData.culture_period}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="producer_name"
              placeholder="Producer Name"
              value={formData.producer_name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="school_style"
              placeholder="School Style"
              value={formData.school_style}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="production_date"
              value={formData.production_date}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="production_place"
              placeholder="Production Place"
              value={formData.production_place}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      {/* Discovery Details */}
      <div>
        <button type="button" onClick={() => toggleSection("discovery")}>
          Discovery Details
        </button>
        <Collapse isOpened={openSections.discovery}>
          <div>
            <input
              type="text"
              name="excavator_field_collector"
              placeholder="Excavator/Field Collector"
              value={formData.excavator_field_collector}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="findspot"
              placeholder="Findspot"
              value={formData.findspot}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      {/* Physical Details */}
      <div>
        <button type="button" onClick={() => toggleSection("physical")}>
          Physical Details
        </button>
        <Collapse isOpened={openSections.physical}>
          <div>
            <input
              type="text"
              name="materials"
              placeholder="Materials"
              value={formData.materials}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="ware"
              placeholder="Ware"
              value={formData.ware}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="technique"
              placeholder="Technique"
              value={formData.technique}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="dimensions_h_w_d"
              placeholder="Dimensions (H x W x D)"
              value={formData.dimensions_h_w_d}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="inscriptions"
              placeholder="Inscriptions"
              value={formData.inscriptions}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      {/* Ownership & Acquisition */}
      <div>
        <button type="button" onClick={() => toggleSection("ownership")}>
          Ownership & Acquisition
        </button>
        <Collapse isOpened={openSections.ownership}>
          <div>
            <input
              type="text"
              name="acquisition_name"
              placeholder="Acquisition Name"
              value={formData.acquisition_name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="previous_owner"
              placeholder="Previous Owner"
              value={formData.previous_owner}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="acquisition_date"
              value={formData.acquisition_date}
              onChange={handleInputChange}
            />
            <textarea
              name="acquisition_notes"
              placeholder="Acquisition Notes"
              value={formData.acquisition_notes}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      {/* Additional Information */}
      <div>
        <button type="button" onClick={() => toggleSection("additional")}>
          Additional Information
        </button>
        <Collapse isOpened={openSections.additional}>
          <div>
            <textarea
              name="curator_comment"
              placeholder="Curator Comment"
              value={formData.curator_comment}
              onChange={handleInputChange}
            />
            <textarea
              name="bibliographic_references"
              placeholder="Bibliographic References"
              value={formData.bibliographic_references}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="object_location"
              placeholder="Object Location"
              value={formData.object_location}
              onChange={handleInputChange}
            />
            <textarea
              name="exhibition_history"
              placeholder="Exhibition History"
              value={formData.exhibition_history}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="condition"
              placeholder="Condition"
              value={formData.condition}
              onChange={handleInputChange}
            />
            <textarea
              name="subjects"
              placeholder="Subjects"
              value={formData.subjects}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>
      </div>

      {/* Multimedia Section */}
      <div>
        <button type="button" onClick={() => toggleSection("multimedia")}>
          Multimedia
        </button>
        <Collapse isOpened={openSections.multimedia}>
          <div>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "object_images")}
            />
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "object_audio")}
            />
          </div>
        </Collapse>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={loading}>Submit</button>
    </form>
  );
};

export default CreateForm;
