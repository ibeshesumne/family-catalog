import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../firebase";
import CreateProducer from "./CreateProducer";

const ProducerManager = () => {
  const [producers, setProducers] = useState([]);
  const [editingProducer, setEditingProducer] = useState(null);

  useEffect(() => {
    const producersRef = ref(db, "producers");
    onValue(producersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.entries(data).map(([id, details]) => ({
          id,
          ...details,
        }));
        setProducers(formattedData);
      }
    });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this producer?")) {
      await remove(ref(db, `producers/${id}`));
      alert("Producer deleted successfully.");
    }
  };

  if (editingProducer) {
    return (
      <CreateProducer
        producerId={editingProducer.id}
        existingData={editingProducer}
        onCancel={() => setEditingProducer(null)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Producers</h1>
      <button
        onClick={() => setEditingProducer({})}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Producer
      </button>
      <ul>
        {producers.map((producer) => (
          <li key={producer.id} className="p-4 border mb-2">
            <h2 className="font-bold">{producer.name}</h2>
            <p>{producer.biography}</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setEditingProducer(producer)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(producer.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProducerManager;
