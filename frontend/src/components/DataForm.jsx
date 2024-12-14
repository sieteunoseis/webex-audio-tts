import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import validator from "validator";

const DataForm = ({ onDataAdded }) => {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
  const object = data.reduce((obj, value) => {
    obj[value.name] = "";
    return obj;
  }, {});
  const [formData, setFormData] = useState(object);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dbSetup.json"); // Note the leading '/'
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  const handleChange = (e, options) => {
    const { name, value } = e.target;
    const newErrors = {};

    // Validate
    if (!validator[options.name](value, options.options)) {
      newErrors[name] = "Invalid value";
    }else{
      newErrors[name] = "";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      onDataAdded(); // Notify the table to refresh
      setFormData(object);
    } else {
      console.error("Error inserting data.");
    }
  };

  const formatColumnName = (col) => {
    return col
      .replace(/[^a-zA-Z]+/g, " ") // Replace non-letter characters with spaces
      .toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {data.map((col) => {
        var formValue = formData[col.name];
        var type = "text";
        if (col.name === "password" || col.name === "pw") {
          type = "password";
        }
        return (
          <div key={col.name}>
            <Input
              required
              type={type}
              key={col.name}
              name={col.name}
              placeholder={formatColumnName(col.name)}
              value={formValue || ""}
              onChange={(e) => {
                handleChange(e, col.validator);
              }}
            />{errors[col.name] && <span className="text-red-500 font-semibold">{errors[col.name]}</span>}
          </div>
        );
      })}
      <Button type="submit">Add Connection</Button>
    </form>
  );
};

export default DataForm;
