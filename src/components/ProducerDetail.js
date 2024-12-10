import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const ProducerDetail = () => {
  const { producerName } = useParams(); // Shortened name from the URL (e.g., "Michael Leary")
  const [producerData, setProducerData] = useState(null);
  const [relatedObjects, setRelatedObjects] = useState([]);
  const [activeTab, setActiveTab] = useState("information");

  useEffect(() => {
    // Fetch producer details from the "producers" node
    const producersRef = ref(db, "producers");
    onValue(producersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const producer = Object.values(data).find((p) => p.name === producerName);
        setProducerData(producer || null);
      }
    });
  }, [producerName]);

  useEffect(() => {
    // Fetch all objects from the "objects" node
    const objectsRef = ref(db, "objects");
    onValue(objectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter objects where producer_name includes the shortened producerName
        const filteredObjects = Object.entries(data)
          .filter(([_, value]) =>
            value.producer_name && value.producer_name.includes(producerName)
          )
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));
        setRelatedObjects(filteredObjects);
      } else {
        setRelatedObjects([]);
      }
    });
  }, [producerName]);

  if (!producerData) {
    return <p className="text-center text-gray-500">Loading producer details...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 bg-white shadow-md rounded-lg">
      {/* Horizontal Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("information")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "information"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab("relatedObjects")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "relatedObjects"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Related Objects
          </button>
        </nav>
      </div>

      {/* Information Section */}
      {activeTab === "information" && (
        <section>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{producerData.name}</h1>
          <div className="space-y-6">
            {producerData.biography && (
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700">Biography</h3>
                <p className="text-gray-600">{producerData.biography}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Objects Section */}
      {activeTab === "relatedObjects" && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Objects</h2>
          {relatedObjects.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedObjects.map((object) => (
                <li key={object.id} className="bg-gray-100 p-4 shadow-md rounded-lg">
                  <Link to={`/object/${object.id}`} className="text-blue-500 underline">
                    {object.thumbnailUrl ? (
                      <img
                        src={object.thumbnailUrl}
                        alt={object.object_title || "Object Image"}
                        className="w-full h-40 object-cover mb-2 rounded"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-300 mb-2 flex items-center justify-center rounded">
                        <span className="text-gray-500">No Image Available</span>
                      </div>
                    )}
                    <p className="text-gray-700">{object.object_title || object.id}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No related objects found.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default ProducerDetail;
