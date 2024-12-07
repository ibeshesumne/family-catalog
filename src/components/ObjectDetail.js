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
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  const filteredFields = Object.entries(objectData || {}).filter(
    ([key, value]) =>
      value &&
      value !== "" &&
      ![
        "createdByemail",
        "creationDate",
        "modifiedDate",
        "object_images",
        "thumbnailUrl"
      ].includes(key)
  );

  return (
    <div className="flex flex-col md:flex-row p-6 max-w-6xl mx-auto gap-6">
      {/* Sidebar for Object Details */}
      <aside className="w-full md:w-1/3 bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="mb-6 text-xl font-bold">Object Details</h2>
        {filteredFields.map(([key, value]) => (
          <div key={key} className="mb-4">
            <h3 className="text-sm font-bold capitalize text-gray-700">
              {key.replace(/_/g, " ")}:
            </h3>
            <p className="text-sm text-gray-600 mt-1">{value}</p>
          </div>
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="w-full md:w-2/3 p-6 rounded-lg shadow text-center">
        {objectData.object_images && objectData.object_images.length > 0 ? (
          <img
            src={objectData.object_images[0]}
            alt={objectData.title || "Object Image"}
            className="w-full max-h-96 object-contain mb-6 rounded"
          />
        ) : (
          <p className="text-gray-500">No image available</p>
        )}
        <h2 className="text-2xl font-bold mt-4">
          {objectData.title || "Untitled"}
        </h2>
        <p className="text-gray-600 mt-4">
          {objectData.description || "No description provided."}
        </p>
      </main>
    </div>
  );
};

export default ObjectDetail;
