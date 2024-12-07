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
    <div className="text-center py-10 px-5">
      <h1 className="text-4xl font-extrabold mb-5">Welcome to the Catalog</h1>
      <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
        Research data on a collection of objects.
      </p>
      {!isLoggedIn ? (
        <div>
          <p className="text-base text-gray-600 mb-5">
            Please login or register to access the features. Use the navigation bar above to proceed.
          </p>
          <div>
            <Link
              to="/login"
              className="mx-4 text-blue-500 hover:underline text-lg"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="mx-4 text-blue-500 hover:underline text-lg"
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
