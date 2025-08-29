import jsPDF from "jspdf";

export function downloadReport(payload){
  const { score, keywordScore, skillScore, matchedKeywords, matchedSkills, sectionCompleteness } = payload || {};
  const doc = new jsPDF({ unit: "pt" });
  let y = 40;

  doc.setFont("helvetica","bold"); doc.setFontSize(18);
  doc.text("Resume Analyzer Report", 40, y); y += 24;

  doc.setFont("helvetica","normal"); doc.setFontSize(11);
  doc.text(`ATS Score: ${score ?? 0}%`, 40, y); y += 16;
  doc.text(`Breakdown - Keywords: ${keywordScore ?? 0}, Skills: ${skillScore ?? 0}`, 40, y); y += 22;

  const section = (title, items=[]) => {
    doc.setFont("helvetica","bold"); doc.text(title, 40, y); y += 14;
    doc.setFont("helvetica","normal");
    const text = items.length ? items.join(", ") : "—";
    doc.splitTextToSize(text, 520).forEach(line => { doc.text(line, 40, y); y += 14; if (y>760){ doc.addPage(); y=40; } });
    y += 8;
  };

  section("Matched Keywords", matchedKeywords || []);
  section("Matched Skills", matchedSkills || []);
  section("Missing Sections", sectionCompleteness?.missing || []);
  doc.save("resume-analysis.pdf");
}

