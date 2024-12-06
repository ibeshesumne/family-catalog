import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // Import Header Component
import Login from "./components/Auth/Login"; // Import Login Component
import Register from "./components/Auth/Register"; // Import Register Component
import Logout from "./components/Auth/Logout"; // Import Logout Component
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Home from "./components/Home"; // Import Home Component
import RecordManager from "./components/RecordManager"; // Import RecordManager

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Home />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <RecordManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
