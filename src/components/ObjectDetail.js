import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

const ObjectDetail = () => {
  const { objectId } = useParams(); // Extract objectId from the URL
  const [objectData, setObjectData] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const objectRef = ref(db, `objects/${objectId}`); // Directly reference object by object_id

    onValue(objectRef, (snapshot) => {
      if (snapshot.exists()) {
        setObjectData(snapshot.val());
      } else {
        console.error("Object not found for ID:", objectId);
        setObjectData(null);
      }
    });
  }, [objectId]);

  if (!objectData) {
    return <p>Loading...</p>;
  }

  const filteredFields = Object.entries(objectData || {}).filter(
    ([key, value]) => value && value !== ""
  );

  return (
    <div
      className="object-detail"
      style={{
        display: "flex",
        flexDirection: "row",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        gap: "20px",
      }}
    >
      {/* Sidebar for Object Details */}
      <aside
        style={{
          width: "30%",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", fontWeight: "bold" }}>
          Object Details
        </h2>
        {filteredFields.map(([key, value]) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", textTransform: "capitalize" }}>
              {key.replace(/_/g, " ")}:
            </h3>
            <p style={{ fontSize: "0.9rem", margin: "5px 0" }}>{value}</p>
          </div>
        ))}
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          width: "70%",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {objectData.object_images && objectData.object_images.length > 0 ? (
          <img
            src={objectData.object_images[0]}
            alt={objectData.title || "Object Image"}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "contain",
              marginBottom: "20px",
            }}
          />
        ) : (
          <p>No image available</p>
        )}
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {objectData.title || "Untitled"}
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            marginTop: "10px",
          }}
        >
          {objectData.description || "No description provided."}
        </p>
      </main>
    </div>
  );
};

export default ObjectDetail;
