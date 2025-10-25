import ResumeReview from "@/components/ResumeReview";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analysis, setAnalysis] = useState(  );
  const [evaluation, setEvaluation] = useState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a resume");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    const res = await fetch("/api/enhance", { method: "POST", body: formData }).then(r => r.json());
    setAnalysis(res.analysis);
    setEvaluation(res.evaluation);
    const blob = new Blob([Uint8Array.from(atob(res.enhanced_resume), c => c.charCodeAt(0))], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced_resume.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Agentic Resume Enhancer (Next.js + TypeScript + Classes)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <textarea
          style={{ width: "100%", height: 120, marginTop: 10 }}
          placeholder="Paste Job Description"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
        <button type="submit" style={{ marginTop: 10, padding: "10px 20px" }}>
          Enhance & Download ZIP
        </button>
      </form>
      {evaluation && analysis &&
        <ResumeReview evaluation={evaluation} analysis={analysis} />
      }
    </div>
  );
}
