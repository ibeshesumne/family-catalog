import React, { useState, useEffect } from "react";
import { ref, get, remove, set } from "firebase/database";
//import { createUserWithEmailAndPassword } from "firebase/auth";//
import { db, auth } from "../../firebase";

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending requests from Firebase
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const pendingRef = ref(db, "pendingRequests");
        const snapshot = await get(pendingRef);

        if (snapshot.exists()) {
          const requests = snapshot.val();
          const formattedRequests = Object.keys(requests).map((key) => ({
            id: key,
            ...requests[key],
          }));
          setPendingRequests(formattedRequests);
        } else {
          setPendingRequests([]);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  // Approve a user
  const approveUser = async (email) => {
    try {
      const defaultPassword = "defaultPassword123";
  
      console.log(`Approving user: ${email}`);
      // Create user in Firebase Authentication without logging in as the new user
      const userCredential = await auth.createUser({
        email: email,
        password: defaultPassword,
      });
  
      console.log(`User created: ${userCredential.uid}`);
  
      // Add the user to the whitelistedEmails node
      const whitelistRef = ref(db, `whitelistedEmails/${btoa(email)}`);
      await set(whitelistRef, true);
  
      // Remove the user from pendingRequests
      const pendingRef = ref(db, `pendingRequests/${btoa(email)}`);
      await remove(pendingRef);
      console.log(`Removed ${email} from pending requests.`);
  
      alert(`User ${email} has been approved and added to the system.`);
      // Refresh pending requests list
      setPendingRequests((prev) => prev.filter((request) => request.email !== email));
    } catch (error) {
      console.error("Error approving user:", error.message);
      alert(`Error approving user: ${error.message}`);
    }
  };

  // Reject a user
  const rejectUser = async (email) => {
    try {
      // Remove the user from pendingRequests
      const pendingRef = ref(db, `pendingRequests/${btoa(email)}`);
      await remove(pendingRef);

      alert(`User ${email} has been rejected.`);
      // Refresh pending requests list
      setPendingRequests((prev) => prev.filter((request) => request.email !== email));
    } catch (error) {
      console.error("Error rejecting user:", error.message);
      alert(`Error rejecting user: ${error.message}`);
    }
  };

  if (loading) {
    return <p>Loading pending requests...</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Requested At</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-2 border-b">{request.email}</td>
                <td className="px-4 py-2 border-b">
                  {new Date(request.requestedAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => approveUser(request.email)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => rejectUser(request.email)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
