import React, { useState, useEffect } from "react";

const DesktopImageViewer = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Set the first image as the default selected image when images prop changes
  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    } else {
      setSelectedImage(null);
    }
  }, [images]);

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
            className="zoom-button bg-gray-300 text-black px-2 py-1 rounded"
          >
            +
          </button>
          <button
            onClick={() => setZoomScale(Math.max(zoomScale - 0.1, 1))}
            className="zoom-button bg-gray-300 text-black px-2 py-1 rounded"
          >
            -
          </button>
          <button onClick={resetZoom} className="zoom-button bg-gray-300 text-black px-2 py-1 rounded">
            ⤢
          </button>
        </div>
      </div>
      {/* Thumbnail Bar */}
      <div className="thumbnail-bar flex space-x-4 overflow-x-auto bg-gray-200 p-2 rounded">
        {images.length > 0 ? (
          images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className={`w-20 h-20 object-cover cursor-pointer rounded border ${
                image === selectedImage ? "border-blue-500" : "border-gray-300"
              }`}
              onClick={() => setSelectedImage(image)}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No thumbnails available</p>
        )}
      </div>
    </div>
  );
};

export default DesktopImageViewer;
