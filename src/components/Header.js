import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Catalog App</h1>
        <nav className="flex space-x-4">
          {/* Public Links */}
          <Link to="/" className="hover:underline text-sm">
            Home
          </Link>
          <Link to="/search" className="hover:underline text-sm">
            Search
          </Link>
          <Link to="/collection" className="hover:underline text-sm">
            Collection
          </Link>

          {/* Authenticated Links */}
          {currentUser && (
            <>
              <Link to="/records" className="hover:underline text-sm">
                Manage Records
              </Link>
              <Link to="/logout" className="hover:underline text-sm">
                Logout
              </Link>
            </>
          )}

          {/* Unauthenticated Links */}
          {!currentUser && (
            <>
              <Link to="/login" className="hover:underline text-sm">
                Login
              </Link>
              <Link to="/register" className="hover:underline text-sm">
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
