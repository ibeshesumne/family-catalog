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
import SearchPage from "./components/SearchPage"; // Import SearchPage Component
import Collection from "./components/Collection"; // Import Collection Component
import ObjectDetail from "./components/ObjectDetail"; // Import ObjectDetail Component
import CreatePage from "./components/CreateData"; // Import the CreatePage component
import ResultsPage from "./components/ResultsPage"; // Import ResultsPage Component

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

          {/* Search page */}
          <Route path="/search" element={<SearchPage />} />

          {/* Results page */}
          <Route path="/results" element={<ResultsPage />} />

          <Route path="/object/:objectId" element={<ObjectDetail />} />

          {/* Collection page */}
          <Route path="/collection" element={<Collection />} />

          {/* Object detail page */}
          <Route path="/object/:objectId" element={<ObjectDetail />} />

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
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePage />
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
