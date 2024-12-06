function DeleteData({ onDeleteSuccess, onCancel }) {
  const [recordId, setRecordId] = useState("");

  const handleIdChange = (e) => {
    setRecordId(e.target.value);
  };

  const deleteFiles = async (fileURLs) => {
    for (const url of fileURLs) {
      try {
        const fileRef = storageRef(storage, url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error(`Error deleting file: ${url}`, error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recordId.trim()) {
      alert("Please enter a valid Record ID.");
      return;
    }

    const recordRef = dbRef(db, `objects/${recordId}`);

    try {
      // Fetch the record to get multimedia file URLs
      const snapshot = await get(recordRef);
      if (!snapshot.exists()) {
        alert("Record not found.");
        return;
      }

      const recordData = snapshot.val();

      // Delete associated files from Firebase Storage
      if (recordData.object_images) {
        await deleteFiles(recordData.object_images);
      }
      if (recordData.object_audio) {
        await deleteFiles(recordData.object_audio);
      }

      // Delete the record from the Realtime Database
      await remove(recordRef);
      alert("Record deleted successfully!");
      setRecordId(""); // Reset the input field
      onDeleteSuccess(recordId); // Notify parent about the deletion
    } catch (error) {
      console.error("Error deleting record:", error.message);
      alert("Error deleting record. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Delete Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recordId" className="block text-sm font-medium text-gray-700">
              Record ID
            </label>
            <input
              type="text"
              id="recordId"
              name="recordId"
              value={recordId}
              onChange={handleIdChange}
              placeholder="Enter Record ID"
              required
              className="block w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onCancel} // Call cancel function
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Delete Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteData;
