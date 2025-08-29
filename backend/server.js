// server.js (ESM)
import express from "express";
import cors from "cors";
import multer from "multer";
import chalk from "chalk";
import pdfParseFixed from "pdf-parse-fixed";
import pdfParseFork from "pdf-parse-fork";

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer – keep uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// ---------- PDF Text Extractor with safe fallback ----------
async function extractText(buffer, tryFork = false) {
  try {
    const data = tryFork ? await pdfParseFork(buffer) : await pdfParseFixed(buffer);
    return data.text || "";
  } catch (err) {
    console.error(
      chalk.red(`❌ pdf-parse ${tryFork ? "fork" : "fixed"} failed:`),
      err.message
    );
    if (!tryFork) {
      console.log(chalk.yellow("↪️ Retrying with pdf-parse-fork…"));
      return extractText(buffer, true);
    }
    throw err;
  }
}

// ---------- Lightweight Analyzer ----------
function analyzeResume(text) {
  let score = 0;
  const keywords = ["developer", "engineer", "react", "node", "python", "java"];
  const skills = ["JavaScript", "Python", "C++", "React", "Node.js"];

  const matchedKeywords = [];
  const matchedSkills = [];

  const lower = text.toLowerCase();

  keywords.forEach((k) => {
    if (lower.includes(k)) {
      matchedKeywords.push(k);
      score += 5;
    }
  });

  skills.forEach((s) => {
    if (lower.includes(s.toLowerCase())) {
      matchedSkills.push(s);
      score += 5;
    }
  });

  const sectionCompleteness = {
    education: lower.includes("education"),
    experience: lower.includes("experience"),
    projects: lower.includes("project"),
  };

  return {
    atsScore: Math.min(100, score),
    keywordsMatched: matchedKeywords,
    skillsMatched: matchedSkills,
    sectionCompleteness,
    extractedText: text.slice(0, 2000),
  };
}

// ---------- Upload Endpoint ----------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.log(chalk.red("❌ No file uploaded"));
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(chalk.green(`📄 Received: ${req.file.originalname}`));
    console.log(chalk.blue(`ℹ️ File mimetype: ${req.file.mimetype}`));
    console.log(chalk.blue(`ℹ️ File size: ${req.file.size} bytes`));

    const text = await extractText(req.file.buffer);
    const analysis = analyzeResume(text);

    console.log(chalk.green("✅ Analysis complete"));
    return res.json(analysis);
  } catch (err) {
    console.error(chalk.red("❌ Processing error:"), err);
    return res.status(500).json({ error: "Failed to process resume" });
  }
});

app.listen(PORT, () => {
  console.log(chalk.blueBright(`🚀 Server running on http://localhost:${PORT}`));
});
