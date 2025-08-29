import React from "react";

export default function Result({ result }) {
  if (!result) return null;

  return (
    <div style={{ marginTop: "30px" }}>
      {/* ATS Score */}
      <div style={{ marginBottom: "20px", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "10px" }}>ATS Score</h2>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>{result.atsScore} / 100</div>
        <div style={{ height: "15px", background: "#eee", borderRadius: "8px", marginTop: "10px" }}>
          <div
            style={{
              width: `${result.atsScore}%`,
              height: "100%",
              background: result.atsScore > 70 ? "#4caf50" : result.atsScore > 40 ? "#ff9800" : "#f44336",
              borderRadius: "8px"
            }}
          ></div>
        </div>
      </div>

      {/* Keywords Matched */}
      <div style={{ marginBottom: "20px", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h3>Keywords Matched</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {result.keywordsMatched?.map((kw, i) => (
            <span key={i} style={{ background: "#e3f2fd", color: "#1976d2", padding: "6px 12px", borderRadius: "20px", fontSize: "14px" }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Skills Matched */}
      <div style={{ marginBottom: "20px", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h3>Skills Matched</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {result.skillsMatched?.map((skill, i) => (
            <span key={i} style={{ background: "#f1f8e9", color: "#388e3c", padding: "6px 12px", borderRadius: "20px", fontSize: "14px" }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Section Completeness */}
      <div style={{ marginBottom: "20px", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h3>Section Completeness</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          <li>Education: {result.sectionCompleteness?.education ? "✅" : "❌"}</li>
          <li>Experience: {result.sectionCompleteness?.experience ? "✅" : "❌"}</li>
          <li>Projects: {result.sectionCompleteness?.projects ? "✅" : "❌"}</li>
        </ul>
      </div>

      {/* Extracted Resume Text */}
      <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h3>Extracted Resume Text</h3>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f9f9f9", padding: "15px", borderRadius: "8px", maxHeight: "300px", overflowY: "auto" }}>
          {result.extractedText}
        </pre>
      </div>
    </div>
  );
}
