import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";
import SearchBox from "./SearchBox";

const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/results?q=${encodeURIComponent(query)}`); // Redirect to results
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Welcome to the Catalog</h1>
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
            Please login or register to access the features. Use the navigation bar above to proceed.
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
        <SearchBox onSearch={handleSearch} />
      )}
    </div>
  );
};

export default Home;
