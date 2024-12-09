import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { parseDescription } from "../utils/urlParser"; // Importing the updated parseDescription function

const ObjectDetail = () => {
  const { objectId } = useParams(); // Extract objectId from the URL
  const [objectData, setObjectData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for main image

  useEffect(() => {
    const db = getDatabase();
    const objectRef = ref(db, `objects/${objectId}`); // Directly reference object by object_id

    onValue(objectRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setObjectData(data);
        if (data.object_images && data.object_images.length > 0) {
          setSelectedImage(data.object_images[0]); // Default to the first image
        }
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
        "createdByEmail",
        "creationDate",
        "modifiedDate",
        "object_images",
        "thumbnailUrl",
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
            <p
              className="text-sm text-gray-600 mt-1"
              dangerouslySetInnerHTML={{ __html: parseDescription(value) }}
            ></p>
          </div>
        ))}
      </aside>

      {/* Main Content Area */}
      <main className="w-full md:w-2/3 p-6 rounded-lg shadow text-center">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={objectData.title || "Object Image"}
            className="w-full max-h-96 object-contain mb-6 rounded"
          />
        ) : (
          <p className="text-gray-500">No image available</p>
        )}
        <h2 className="text-2xl font-bold mt-4">
          {objectData.title || "Untitled"}
        </h2>
        <p
          className="text-gray-600 mt-4"
          dangerouslySetInnerHTML={{
            __html: parseDescription(objectData.description || ""),
          }}
        ></p>

        {/* Thumbnails for image selection */}
        <div className="flex justify-center mt-4 space-x-4">
          {objectData.object_images &&
            objectData.object_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-20 h-20 object-cover cursor-pointer rounded border ${
                  image === selectedImage
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(image)} // Update the main image
              />
            ))}
        </div>
      </main>
    </div>
  );
};

export default ObjectDetail;
