import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConfig } from '../config/ConfigContext';

const DataTable = ({ data, onDataChange }) => {
  const config = useConfig();
  const [jsonData, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dbSetup.json"); // Note the leading '/'
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);


  const handleDelete = async (id) => {
    const response = await fetch(`/api/data/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      onDataChange(); // Refresh data when a record is deleted
    } else {
      console.error("Error deleting data.");
    }
  };

  const selectRecord = async (id) => {
    const response = await fetch(`/api/data/select/${id}`, {
      method: "PUT",
    });
    if (response.ok) {
      onDataChange(); // Refresh data when a record is deleted
    } else {
      console.error("Error updating data.");
    }
  };

  const formatColumnName = (col) => {
    return col
      .replace(/[^a-zA-Z]+/g, ' ') // Replace non-letter characters with spaces
      .toUpperCase()
  };

  return (
    <table className="mt-4 w-full bg-white border border-gray-300 dark:bg-black">
      <thead>
        <tr>
          {["ID", ...jsonData.map((col) => (col.name) ), "Actions"].map((col) => (
            <th className="border p-2" key={col}>
              {formatColumnName(col)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((record) => (
            <tr key={record.id}>
              <td className="border p-2">{record.id}</td>
              {jsonData.map((col) => {
                const columnName = col.name.trim();
                const cellValue = record[columnName] || ""; // Get the value for this column

                return (
                  <td className="border p-2" key={columnName}>
                    {columnName === "password" || columnName === "pw" ? (
                      <span>********</span> // Mask the password
                    ) : (
                      cellValue
                    )}
                  </td>
                );
              })}
              <td className="border p-2">
                {record.selected === "YES" ? (
                  <Button className="mr-2 bg-red-800 hover:bg-red-500">Selected</Button>
                ) : (
                  <Button onClick={() => selectRecord(record.id)} className="mr-2">
                    Select
                  </Button>
                )}
                <Button onClick={() => handleDelete(record.id)}>Delete</Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={config.tableColumns.split(",").length + 2} className="border text-center p-2">
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DataTable;