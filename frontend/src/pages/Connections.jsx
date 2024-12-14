import React, { useEffect, useState } from "react";
import DataForm from "../components/DataForm";
import DataTable from "../components/DataTable";

function App() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const response = await fetch(`/api/data`);
    const result = await response.json();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDataAdded = () => {
    fetchData(); // Refresh data when new data is added
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100 dark:bg-black">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">Manage Connections</h1>
      <DataForm onDataAdded={handleDataAdded} />
      {data.length === 0 ? (
        <p className="text-gray-600 text-center">No connections available.</p>
      ) : (
        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-6 mb-2">Saved Connections</h1>
          <DataTable data={data} onDataChange={fetchData} />
        </div>
      )}
    </div>
  );
}

export default App;
