import React, { useState } from "react";
import { uploadResume } from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ correct import
import "./App.css";

function clampScore(s) {
  if (typeof s !== "number" || Number.isNaN(s)) return 0;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a PDF resume first.");
      return;
    }

    // ✅ Only check file type (no size check now)
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      console.log("Uploading file:", file);
      const formData = new FormData();
      formData.append("file", file); // MUST match backend

      const data = await uploadResume(formData);
      if (!data || data.error) {
        throw new Error(data?.error || "Server returned an invalid response.");
      }
      setResult(data);
    } catch (e) {
      console.error("Upload error:", e);
      setError(e.message || "Error analyzing resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  // ✅ Updated downloadPDF function
  const downloadPDF = () => {
    if (!result) {
      alert("No analysis result available to download.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("📄 Resume Analyzer Report", 14, 20);

    // ATS Score
    const score = clampScore(result.atsScore);
    doc.setFontSize(14);
    doc.text(`ATS Score: ${score}%`, 14, 35);

    // Keywords Table
    if (Array.isArray(result.keywordsMatched) && result.keywordsMatched.length) {
      autoTable(doc, {
        startY: 45,
        head: [["Keywords Matched"]],
        body: result.keywordsMatched.map((k) => [k]),
      });
    }

    // Skills Table
    if (Array.isArray(result.skillsMatched) && result.skillsMatched.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60,
        head: [["Skills Matched"]],
        body: result.skillsMatched.map((s) => [s]),
      });
    }

    // Section Completeness Table
    const sections = [
      ["Education", result?.sectionCompleteness?.education ? "✔️" : "❌"],
      ["Experience", result?.sectionCompleteness?.experience ? "✔️" : "❌"],
      ["Projects", result?.sectionCompleteness?.projects ? "✔️" : "❌"],
    ];
    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80,
      head: [["Section", "Status"]],
      body: sections,
    });

    // Extracted Text
    if (result?.extractedText) {
      const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
      doc.setFontSize(12);
      doc.text("Extracted Resume Text (Preview):", 14, y);

      // Wrap long text safely
      const textLines = doc.splitTextToSize(result.extractedText.slice(0, 1000), 180);
      doc.setFontSize(10);
      doc.text(textLines, 14, y + 10);
    }

    // Save
    doc.save("resume-analysis-report.pdf");
  };

  const score = clampScore(result?.atsScore);

  return (
    <div className="app-container">
      <h1 className="title">📄 Resume Analyzer</h1>

      <div className="upload-section">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
        {file && (
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Selected: <strong>{file.name}</strong>
          </div>
        )}
        {result && (
          <button
            style={{ marginLeft: 10 }}
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        )}
      </div>

      {error && <p className="error">❌ {error}</p>}

      {result && !error && (
        <div className="results-card">
          <h2>📊 Analysis Results</h2>

          <div className="score-box">
            <strong>ATS Score:</strong> <span>{score}</span>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${score}%` }}>
                {score}%
              </div>
            </div>
          </div>

          {Array.isArray(result?.keywordsMatched) &&
            result.keywordsMatched.length > 0 && (
              <>
                <strong>Keywords Matched:</strong>
                <div className="tags" style={{ marginTop: 8 }}>
                  {result.keywordsMatched.map((k) => (
                    <span className="tag" key={`kw-${k}`}>
                      {k}
                    </span>
                  ))}
                </div>
              </>
            )}

          {Array.isArray(result?.skillsMatched) &&
            result.skillsMatched.length > 0 && (
              <>
                <strong>Skills Matched:</strong>
                <div className="tags" style={{ marginTop: 8 }}>
                  {result.skillsMatched.map((s) => (
                    <span className="tag green" key={`sk-${s}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

          <div className="sections" style={{ marginTop: 10 }}>
            <p className="section-status">
              <span className="status-icon">
                {result?.sectionCompleteness?.education ? "✔️" : "❌"}
              </span>
              Education Section
            </p>
            <p className="section-status">
              <span className="status-icon">
                {result?.sectionCompleteness?.experience ? "✔️" : "❌"}
              </span>
              Experience Section
            </p>
            <p className="section-status">
              <span className="status-icon">
                {result?.sectionCompleteness?.projects ? "✔️" : "❌"}
              </span>
              Projects Section
            </p>
          </div>

          {result?.extractedText && (
            <div className="resume-preview">
              <h3>📄 Extracted Resume Text (preview)</h3>
              <pre>{result.extractedText}</pre>
            </div>
          )}

          <button className="download-btn" onClick={downloadPDF}>
            ⬇️ Download Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
