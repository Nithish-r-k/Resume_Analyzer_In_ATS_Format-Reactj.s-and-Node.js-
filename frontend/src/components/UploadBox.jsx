import React, { useState } from "react";
import { uploadResume } from "../lib/api";
import Result from "./Result";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const data = await uploadResume(file);
      setResult(data);
    } catch (err) {
      setError("Error uploading or processing file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Result result={result} />
    </div>
  );
}
