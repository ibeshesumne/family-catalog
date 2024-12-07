import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Catalog App</h1>
        <nav className="flex space-x-4">
          {/* Public Links */}
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/search" className="hover:underline">
            Search
          </Link>
          <Link to="/collection" className="hover:underline">
            Collection
          </Link>

          {/* Authenticated Links */}
          {currentUser && (
            <>
              <Link to="/records" className="hover:underline">
                Manage Records
              </Link>
              <Link to="/logout" className="hover:underline">
                Logout
              </Link>
            </>
          )}

          {/* Unauthenticated Links */}
          {!currentUser && (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
