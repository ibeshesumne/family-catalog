import React, { useState } from "react";

const MobileImageViewer = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [zoomScale, setZoomScale] = useState(1);

  const resetZoom = () => setZoomScale(1);

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg shadow p-4">
      {/* Central Image */}
      <div className="relative flex justify-center items-center overflow-hidden rounded mb-4">
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
            +
          </button>
          <button
            onClick={() => setZoomScale(Math.max(zoomScale - 0.1, 1))}
            className="zoom-button"
          >
            -
          </button>
          <button onClick={resetZoom} className="zoom-button">
            ⤢
          </button>
        </div>
      </div>
      {/* Thumbnail Bar */}
      <div className="thumbnail-bar flex space-x-4 overflow-x-auto bg-gray-200 p-2 rounded">
        {images &&
          images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className={`w-16 h-16 object-cover cursor-pointer rounded border ${
                image === selectedImage ? "border-blue-500" : "border-gray-300"
              }`}
              onClick={() => setSelectedImage(image)}
            />
          ))}
      </div>
    </div>
  );
};

export default MobileImageViewer;
