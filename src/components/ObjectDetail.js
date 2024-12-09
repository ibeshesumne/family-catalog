import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate for navigation
import { getDatabase, ref, onValue } from "firebase/database";
import { parseDescription } from "../utils/urlParser";

const ObjectDetail = () => {
  const { objectId } = useParams();
  const navigate = useNavigate(); // For navigation
  const [objectData, setObjectData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1); // Zoom functionality

  useEffect(() => {
    const db = getDatabase();
    const objectRef = ref(db, `objects/${objectId}`);

    onValue(objectRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setObjectData(data);
        if (data.object_images && data.object_images.length > 0) {
          setSelectedImage(data.object_images[0]);
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

  const resetZoom = () => setZoomScale(1); // Reset zoom to original scale

  return (
    <div className="flex flex-col md:flex-row p-6 max-w-6xl mx-auto gap-6">
      {/* Sidebar for Object Details */}
      <aside className="relative w-full md:w-1/3 bg-gray-100 rounded-lg shadow flex flex-col">
        {/* Scrollable Content */}
        <div
          className="flex-grow overflow-y-auto p-6"
          style={{ maxHeight: "calc(100vh - 60px)" }} // Adjust height to leave space for footer
        >
          <h2 className="mb-6 text-xl font-bold">Object Details</h2>
          {Object.entries(objectData || {})
            .filter(
              ([key, value]) =>
                value &&
                value !== "" &&
                !["createdByEmail", "creationDate", "modifiedDate", "object_images", "thumbnailUrl"].includes(key)
            )
            .map(([key, value]) => (
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
        </div>

        {/* Fixed Green Footer with Back to Results */}
        <div className="p-4 bg-bmGreen text-bmWhite text-center" style={{ height: "60px" }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center text-sm font-bold"
          >
            ← Back to Results
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-full md:w-2/3 bg-bmLightGray rounded-lg shadow flex flex-col">
        {/* Central Image */}
        <div className="flex-grow relative flex justify-center items-center overflow-hidden rounded">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Object"
              className="object-contain max-h-full max-w-full"
              style={{ transform: `scale(${zoomScale})`, transition: "transform 0.3s ease" }}
            />
          ) : (
            <p className="text-gray-500">No image available</p>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => setZoomScale(Math.min(zoomScale + 0.1, 3))}
              className="zoom-button"
            >
              <span>+</span>
            </button>
            <button
              onClick={() => setZoomScale(Math.max(zoomScale - 0.1, 1))}
              className="zoom-button"
            >
              <span>-</span>
            </button>
            <button onClick={resetZoom} className="zoom-button">
              <span>⤢</span>
            </button>
          </div>
        </div>

        {/* Thumbnail Bar */}
        <div className="thumbnail-bar flex mt-4 space-x-4 overflow-x-auto bg-bmDark p-4">
          {objectData.object_images &&
            objectData.object_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-20 h-20 object-cover cursor-pointer rounded border ${
                  image === selectedImage ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
        </div>
      </main>
    </div>
  );
};

export default ObjectDetail;
