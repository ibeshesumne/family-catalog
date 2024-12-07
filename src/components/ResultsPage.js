import React, { useState, useEffect, useCallback } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { objectTypes } from "./constants"; // Import object types for filtering

const ResultsPage = () => {
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
      const results = Object.entries(data || {}).map(([key, value]) => ({
        object_id: key, // Use object_id as the key
        ...value,
      }));
      setObjects(results);
      setFilteredResults(results); // Initialize filtered results
    });
  }, []);

  const applyFilters = useCallback(() => {
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

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="flex flex-col h-screen">
      {/* Top Section for Item Count */}
      <div className="p-4 bg-gray-100 text-left">
        <h2 className="text-lg font-bold">
          Collection search: {filteredResults.length} results
        </h2>
      </div>

      <div className="flex flex-1">
        {/* Left Filter Panel */}
        <aside className="w-1/4 bg-gray-50 p-4 border-r border-gray-300">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <input
            type="text"
            name="object_title"
            placeholder="Filter by Object Title"
            value={filters.object_title}
            onChange={handleFilterChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="object_type"
            value={filters.object_type}
            onChange={handleFilterChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="title"
            placeholder="Filter by Title"
            value={filters.title}
            onChange={handleFilterChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </aside>

        {/* Right Content Area */}
        <main className="w-3/4 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {filteredResults.length > 0 ? (
            filteredResults.map((obj, index) => (
              <Link
                key={index}
                to={`/object/${obj.object_id}`} // Navigate to ObjectDetail page
                className="border border-gray-300 rounded p-4 bg-white shadow hover:shadow-lg transition"
              >
                <img
                  src={obj.thumbnailUrl || "default-thumbnail.jpg"}
                  alt={obj.title || "No Title"}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <div>
                  {obj.object_title && (
                    <p className="text-lg font-bold mb-1">{obj.object_title}</p>
                  )}
                  {obj.description && (
                    <p className="text-gray-600 text-sm mb-1">{obj.description}</p>
                  )}
                  {obj.object_id && (
                    <p className="text-gray-500 text-xs">
                      <strong>ID:</strong> {obj.object_id}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No results found</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultsPage;
