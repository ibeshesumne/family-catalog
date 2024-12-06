import React, { useState } from "react";
import "./SearchBox.css"; // Optional CSS for styling

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState(""); // State to manage search input

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query); // Call the parent's search handler
    }
  };

  return (
    <div className="search-box" style={{ marginBottom: "20px", textAlign: "center" }}>
      <input
        type="text"
        placeholder="Search by keyword, place, or object ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginRight: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBox;
