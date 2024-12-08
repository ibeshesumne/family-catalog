import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Collection = () => {
  const [objects, setObjects] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filters, setFilters] = useState({
    object_title: "",
    object_type: "",
    object_id: "",
    title: "",
  });

  useEffect(() => {
    const db = getDatabase();
    const objectsRef = ref(db, "objects");

    onValue(objectsRef, (snapshot) => {
      const data = snapshot.val();
      const results = Object.entries(data || {}).map(([key, value]) => ({
        object_id: key,
        ...value,
      }));
      setObjects(results);
      setFilteredResults(results);
    });
  }, []);

  const debouncedSetFilteredResults = useMemo(
    () =>
      debounce((filtered) => {
        setFilteredResults(filtered);
      }, 300),
    []
  );

  const applyFilters = useCallback(() => {
    const filtered = objects.filter((obj) => {
      const matchesObjectTitle =
        !filters.object_title ||
        obj.object_title?.toLowerCase().includes(filters.object_title.toLowerCase());
      const matchesObjectType =
        !filters.object_type ||
        obj.object_type?.toLowerCase().includes(filters.object_type.toLowerCase());
      const matchesObjectId =
        !filters.object_id ||
        obj.object_id?.toLowerCase().includes(filters.object_id.toLowerCase());
      const matchesTitle =
        !filters.title ||
        obj.title?.toLowerCase().includes(filters.title.toLowerCase());
      return (
        matchesObjectTitle &&
        matchesObjectType &&
        matchesObjectId &&
        matchesTitle
      );
    });

    debouncedSetFilteredResults(filtered);
  }, [objects, filters, debouncedSetFilteredResults]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Filter Panel */}
      <aside className="w-1/4 bg-gray-100 p-4 border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <input
          type="text"
          name="object_title"
          placeholder="Filter by Object Title"
          value={filters.object_title}
          onChange={handleFilterChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="object_type"
          placeholder="Filter by Object Type"
          value={filters.object_type}
          onChange={handleFilterChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="object_id"
          placeholder="Filter by Object ID"
          value={filters.object_id}
          onChange={handleFilterChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="title"
          placeholder="Filter by Title"
          value={filters.title}
          onChange={handleFilterChange}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </aside>

      {/* Right Content Area */}
      <main className="w-3/4 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((obj, index) => (
            <Link
              key={index}
              to={`/object/${obj.object_id}`}
              className="block border border-gray-300 rounded p-4 bg-white shadow hover:shadow-lg transition"
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
                {obj.object_type && (
                  <p className="text-gray-500 text-xs">
                    <strong>Type:</strong> {obj.object_type}
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
  );
};

export default Collection;
