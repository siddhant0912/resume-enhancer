import ResumeReview from "@/components/ResumeReview";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setAnalysis(null);
    setEvaluation(null);
    setLoading(true);
    e.preventDefault();
    if (!file) return alert("Please upload a resume");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);
    try {
      const result = await axios.post("/api/enhance", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      const { analysis, evaluation, enhanced_resume } = result.data;
      if(!analysis || !evaluation || !enhanced_resume) {
        alert("Incomplete response from server. Please try again later.");
        return;
      }
      setAnalysis(analysis);
      setEvaluation(evaluation);
      const blob = new Blob([Uint8Array.from(atob(enhanced_resume), c => c.charCodeAt(0))], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "enhanced_resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setLoading(false);
      console.error("Error during enhancement:", err);
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;

        if (status === 429) {
          // Handle rate limit specifically
          alert(err.response.data?.message || "You have exceeded the daily limit. Try again tomorrow.");
        } else {
          // Other errors
          alert(err.response.data?.message || "An error occurred while enhancing the resume. Please try again later.");
        }
      } else {
        alert("Network error or server is unreachable. Please try again later.");
      }

      //return;
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>AI Resume Enhancer</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <textarea
          style={{ width: "100%", height: 120, marginTop: 10 }}
          placeholder="Paste Job Description"
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
        <button type="submit" disabled={loading}  style={{ marginTop: 10, padding: "10px 20px" }}>
          Enhance & Download ZIP
        </button>
      </form>
      {loading && <p>Enhancing resume, please wait...</p>}
      {evaluation && analysis &&
        <ResumeReview evaluation={evaluation} analysis={analysis} />
      }
    </div>
  );
}
