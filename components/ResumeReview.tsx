import React from "react";
import { Evaluation, ResumeAnalysis, ResumeScore } from "../types/resume"; // your existing types

interface Props {
  evaluation?: Evaluation;
  analysis?: ResumeAnalysis;
}
const keys: (keyof Evaluation)[] = ["originalResumeScore", "enhancedResumeScore"];

const ResumeReview: React.FC<Props> = ({ evaluation, analysis }) => {
  return (
    <div className="p-4 space-y-8">

      {/* Evaluation Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Evaluation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keys.map((key) => {
            const score = evaluation?.[key] as ResumeScore || {}; // safe now
            return (
              <div key={key} className="border p-4 rounded shadow-sm">
                <h3 className="font-semibold capitalize">{key.replace("Score", "")}</h3>
                <p><strong>ATS Score:</strong> {score.ats_score}</p>
                <p><strong>Keyword Match:</strong> {score.keyword_match}</p>
                <p><strong>Experience Relevance:</strong> {score.experience_relevance}</p>
                <p className="mt-2 font-semibold">Notes:</p>
                <ul className="list-disc list-inside">
                  {score?.notes?.map((note, i) => <li key={i}>{note}</li>)}
                </ul>
                {score?.skill_gaps?.length > 0 && (
                  <>
                    <p className="mt-2 font-semibold">Skill Gaps:</p>
                    <ul className="list-disc list-inside">
                      {score.skill_gaps.map((gap, i) => <li key={i}>{gap}</li>)}
                    </ul>
                  </>
                )}
              </div>
            );
          })}

        </div>
      </section>

      {/* Analysis Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Analysis</h2>

        <div>
          <h3 className="font-semibold">Missing Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {analysis?.missingSkills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>

          <h3 className="font-semibold">Weak Areas</h3>
          {analysis?.weakAreas.map((wa, i) => (
            <div key={i} className="border p-2 rounded mb-2">
              <p><strong>Section:</strong> {wa.section}</p>
              <p><strong>Issue:</strong> {wa.issue}</p>
              <p><strong>Suggestion:</strong> {wa.suggestion}</p>
            </div>
          ))}

          <h3 className="font-semibold">Improvement Suggestions</h3>
          <ul className="list-disc list-inside mb-4">
            {analysis?.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>

          <h3 className="font-semibold">Summary Score</h3>
          <p><strong>Match Percentage:</strong> {analysis?.summaryScore.matchPercentage}%</p>
          <p>{analysis?.summaryScore.comments}</p>
        </div>
      </section>

      {/* Optional Overall Summary */}
      {evaluation?.summary && (
        <section>
          <h2 className="text-2xl font-bold mb-2">Overall Summary</h2>
          <p>{evaluation.summary}</p>
        </section>
      )}
    </div>
  );
};

export default ResumeReview;
