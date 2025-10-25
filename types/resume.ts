export interface ResumeData {
  name?: string;
  contact?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  summary?: string;
  certificates?: string[];
  awards?: string[];
  projects?: string[];
}

export interface ResumeScore {
  ats_score: number;              // 0–100
  keyword_match: number;          // 0–100
  experience_relevance: number;   // 0–100
  skill_gaps: string[];           // Missing or underrepresented skills
  notes: string[];                // Observations or suggestions
}

export interface Evaluation {
  originalResumeScore: ResumeScore;
  enhancedResumeScore: ResumeScore;
  summary: string;                // Brief comparison highlighting improvements
}


export interface WeakArea {
  section: string;
  issue: string;
  suggestion: string;
}

export interface SummaryScore {
  matchPercentage: number; // 0 to 100
  comments: string;
}

export interface ResumeAnalysis {
  missingSkills: string[];
  weakAreas: WeakArea[];
  improvementSuggestions: string[];
  summaryScore: SummaryScore;
}
