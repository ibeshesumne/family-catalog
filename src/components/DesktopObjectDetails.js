const DesktopObjectDetails = ({ data }) => (
    <div className="overflow-y-auto p-6">
      <h2 className="mb-6 text-xl font-bold">Object Details</h2>
      {Object.entries(data || {}).map(([key, value]) => (
        <div key={key} className="mb-4">
          <h3 className="text-sm font-bold capitalize text-gray-700">{key}</h3>
          <p className="text-sm text-gray-600 mt-1">{value}</p>
        </div>
      ))}
    </div>
  );
  export default DesktopObjectDetails;
  