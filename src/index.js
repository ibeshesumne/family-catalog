import React from "react";
import ReactDOM from "react-dom/client"; // Use createRoot API for React 18+
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./components/Auth/AuthContext"; // Import AuthProvider

// Create root and render the application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true, // Opt into React startTransition behavior for state updates
          v7_relativeSplatPath: true, // Enable new relative route resolution within Splat routes
        }}
      >
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

// Optional: Log performance metrics
reportWebVitals();
