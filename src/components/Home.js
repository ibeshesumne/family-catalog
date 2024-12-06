import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";
import SearchBox from "./SearchBox"; // Import the search box component
import ReadData from "./ReadData"; // Import the search functionality

const Home = () => {
  const { isLoggedIn } = useAuth(); // Use the isLoggedIn property
  const [results, setResults] = useState([]); // State to store search results

  const handleSearch = async (query) => {
    try {
      const data = await ReadData(query); // Fetch search results
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Welcome to the Catalog
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          marginBottom: "30px",
          lineHeight: "1.6",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        Research data on a collection of objects.
      </p>
      {!isLoggedIn ? (
        <div>
          <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
            Please login or register to access the features. Use the navigation
            bar above to proceed.
          </p>
          <div>
            <Link
              to="/login"
              style={{
                margin: "0 15px",
                color: "#007BFF",
                textDecoration: "none",
                fontSize: "1.2rem",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                margin: "0 15px",
                color: "#007BFF",
                textDecoration: "none",
                fontSize: "1.2rem",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      ) : (
        <>
          <SearchBox onSearch={handleSearch} />
          <div>
            {results.length > 0 ? (
              <ul>
                {results.map((item, index) => (
                  <li key={index}>
                    <strong>Title:</strong> {item.title} | <strong>Place:</strong>{" "}
                    {item.place} | <strong>ID:</strong> {item.object_id}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
