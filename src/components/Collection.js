import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { objectTypes } from "./constants"; // Import the constants file

const Collection = () => {
  const [objects, setObjects] = useState([]); // All fetched objects
  const [filteredResults, setFilteredResults] = useState([]); // Filtered results
  const [filters, setFilters] = useState({
    object_title: "",
    object_type: "",
    object_id: "",
    title: "",
  }); // Filter criteria

  useEffect(() => {
    const db = getDatabase();
    const objectsRef = ref(db, "objects");

    onValue(objectsRef, (snapshot) => {
      const data = snapshot.val();

      // Load all objects into the state
      const results = Object.keys(data || {}).map((key) => data[key]);
      setObjects(results);
      setFilteredResults(results); // Initialize filtered results
    });
  }, []);

  const applyFilters = useCallback(() => {
    // Dynamically filter results based on all filter criteria
    setFilteredResults(
      objects.filter((obj) => {
        const matchesObjectTitle =
          !filters.object_title ||
          obj.object_title?.toLowerCase().includes(filters.object_title.toLowerCase());
        const matchesObjectType =
          !filters.object_type || obj.object_type === filters.object_type;
        const matchesObjectId =
          !filters.object_id ||
          obj.object_id?.toLowerCase().includes(filters.object_id.toLowerCase());
        const matchesTitle =
          !filters.title ||
          obj.title?.toLowerCase().includes(filters.title.toLowerCase());
        return matchesObjectTitle && matchesObjectType && matchesObjectId && matchesTitle;
      })
    );
  }, [filters, objects]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Reapply filters whenever `filters` or `objects` change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Filter Panel */}
      <aside
        style={{
          width: "25%",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Filters</h2>
        <input
          type="text"
          name="object_title"
          placeholder="Filter by Object Title"
          value={filters.object_title}
          onChange={handleFilterChange}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <select
          name="object_type"
          value={filters.object_type}
          onChange={handleFilterChange}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <option value="">All Object Types</option>
          {objectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="object_id"
          placeholder="Filter by Object ID"
          value={filters.object_id}
          onChange={handleFilterChange}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <input
          type="text"
          name="title"
          placeholder="Filter by Title"
          value={filters.title}
          onChange={handleFilterChange}
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
      </aside>

      {/* Right Content Area */}
      <main
        style={{
          width: "75%",
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          overflowY: "auto",
        }}
      >
        {filteredResults.length > 0 ? (
          filteredResults.map((obj, index) => (
            <Link
              key={index}
              to={`/object/${obj.object_id}`}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#fff",
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src={obj.thumbnailUrl || "default-thumbnail.jpg"}
                alt={obj.title || "No Title"}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
              <div style={{ textAlign: "left", margin: "10px 0" }}>
                {obj.object_title && (
                  <p style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 5px 0" }}>
                    {obj.object_title}
                  </p>
                )}
                {obj.description && (
                  <p style={{ fontSize: "0.9rem", margin: "0 0 5px 0", color: "#666" }}>
                    {obj.description}
                  </p>
                )}
                {obj.object_id && (
                  <p style={{ fontSize: "0.9rem", margin: "0 0 5px 0", color: "#999" }}>
                    <strong>ID:</strong> {obj.object_id}
                  </p>
                )}
                {obj.object_type && (
                  <p style={{ fontSize: "0.9rem", margin: "0 0 5px 0", color: "#999" }}>
                    <strong>Type:</strong> {obj.object_type}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p>No results found</p>
        )}
      </main>
    </div>
  );
};

export default Collection;
