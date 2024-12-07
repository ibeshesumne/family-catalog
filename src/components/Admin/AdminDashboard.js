import React, { useEffect, useState } from 'react';
import { ref, get, remove, set } from 'firebase/database';
import { db } from '../../firebase'; // Adjust the path

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const pendingRef = ref(db, 'pendingRequests');
        const snapshot = await get(pendingRef);

        if (snapshot.exists()) {
          const requests = snapshot.val();
          const requestList = Object.entries(requests).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setPendingRequests(requestList);
        } else {
          setPendingRequests([]);
        }
      } catch (err) {
        setError('Error fetching pending requests: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (id, email) => {
    try {
      // Add email to whitelistedEmails
      const whitelistRef = ref(db, `whitelistedEmails/${id}`);
      await set(whitelistRef, true);

      // Remove from pendingRequests
      const pendingRef = ref(db, `pendingRequests/${id}`);
      await remove(pendingRef);

      // Update the local state
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      alert(`${email} has been approved and added to the whitelist.`);
    } catch (err) {
      console.error('Error approving request:', err.message);
      alert('Failed to approve the request.');
    }
  };

  const handleReject = async (id, email) => {
    try {
      // Remove from pendingRequests
      const pendingRef = ref(db, `pendingRequests/${id}`);
      await remove(pendingRef);

      // Update the local state
      setPendingRequests((prev) => prev.filter((req) => req.id !== id));
      alert(`${email} has been rejected.`);
    } catch (err) {
      console.error('Error rejecting request:', err.message);
      alert('Failed to reject the request.');
    }
  };

  if (loading) return <p>Loading pending requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {pendingRequests.map((req) => (
            <li key={req.id} className="p-4 border border-gray-300 rounded">
              <p>
                <strong>Email:</strong> {req.email}
              </p>
              <p>
                <strong>Requested At:</strong> {new Date(req.requestedAt).toLocaleString()}
              </p>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => handleApprove(req.id, req.email)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req.id, req.email)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
