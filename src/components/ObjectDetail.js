import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { parseDescription } from "../utils/urlParser";
import useDeviceType from "../hooks/useDeviceType";
import MobileImageViewer from "./MobileImageViewer";
import DesktopImageViewer from "./DesktopImageViewer";
import MobileObjectDetails from "./MobileObjectDetails";
import DesktopObjectDetails from "./DesktopObjectDetails";

const ObjectDetail = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const isMobile = useDeviceType(); // Detect if the user is on a mobile device
  const [view, setView] = useState(isMobile ? "images" : "data"); // Default to "images" on mobile
  const [objectData, setObjectData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1); // Zoom functionality

  // Fetch object data from Firebase
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
      {isMobile ? (
        <>
          {/* Mobile Layout */}
          <div className="tabs flex justify-around bg-bmGreen text-bmWhite p-2 border-b">
            <button
              className={`tab ${view === "data" ? "font-bold underline" : ""}`}
              onClick={() => setView("data")}
            >
              Data
            </button>
            <button
              className={`tab ${view === "images" ? "font-bold underline" : ""}`}
              onClick={() => setView("images")}
            >
              Images
            </button>
          </div>
          {view === "data" && (
            <aside className="relative w-full bg-gray-100 rounded-lg shadow flex flex-col">
              <div
                className="flex-grow overflow-y-auto p-6"
                style={{ maxHeight: "calc(100vh - 60px)" }}
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
              <div className="p-4 bg-bmGreen text-bmWhite text-center" style={{ height: "60px" }}>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center text-sm font-bold"
                >
                  ← Back to Results
                </button>
              </div>
            </aside>
          )}
          {view === "images" && (
            <MobileImageViewer images={objectData.object_images} />
          )}
        </>
      ) : (
        <>
          {/* Desktop Layout */}
          <aside className="relative w-full md:w-1/3 bg-gray-100 rounded-lg shadow flex flex-col">
            <DesktopObjectDetails data={objectData} />
          </aside>
          <main className="w-full md:w-2/3 bg-gray-50 rounded-lg shadow flex flex-col">
            <DesktopImageViewer images={objectData.object_images} />
          </main>
        </>
      )}
    </div>
  );
};

export default ObjectDetail;
