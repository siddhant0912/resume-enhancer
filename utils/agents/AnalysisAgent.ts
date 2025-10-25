import { ResumeAnalysis, ResumeData } from "@/types/resume";
import {AzureOpenAI} from "openai";

export class AnalysisAgent {
  private client: AzureOpenAI;

  constructor() {
    this.client = new AzureOpenAI ({
        apiKey:process.env.AZURE_OPENAI_KEY,
        endpoint:process.env.AZURE_OPENAI_ENDPOINT,
        deployment:process.env.AZURE_OPENAI_DEPLOYMENT,
        apiVersion:process.env.AZURE_OPENAI_VERSION,
    });  
  }

  async compare(resumeData: ResumeData , jobDescription: string): Promise<ResumeAnalysis> {
  const prompt = `
  You are an expert AI resume analyst and career advisor. 
  Your job is to analyze a candidate's resume against a job description and identify exact skill or content gaps.

  Follow these steps carefully:
  1. Read and understand both the resume and the job description.
  2. Compare technical skills, tools, soft skills, and experience depth.
  3. Identify any missing or weak areas that could reduce ATS (Applicant Tracking System) match score.
  4. Suggest *concrete improvements* — new bullet points, better phrasing, or quantifiable achievements.

  Return the output in **valid JSON only**, with no markdown or commentary.

  Format the JSON like this:
  {
    "missingSkills": [ "TypeScript", "Kubernetes", "Leadership" ],
    "weakAreas": [
      {
        "section": "Experience",
        "issue": "Does not mention recent frameworks",
        "suggestion": "Add experience with React 18 and Next.js 14"
      }
    ],
    "improvementSuggestions": [
      "Add more quantified metrics in experience bullets (e.g., 'Improved performance by 30%').",
      "Include relevant keywords from job description to improve ATS matching.",
      "Adjust professional summary to reflect alignment with company’s tech stack."
    ],
    "summaryScore": {
      "matchPercentage": 0-100,
      "comments": "Brief analysis of resume-job fit"
    }
  }

  Resume JSON:
  ${JSON.stringify(resumeData)}

  Job Description:
  ${jobDescription}
  `;

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT as string,
        messages: [{ role: "user", content: prompt }],
      });
      return JSON.parse(response.choices[0].message.content || "");
    }
    catch (error) { 
        console.error("Error comparing resume:", error);    
        return { 
          missingSkills: [],
          weakAreas: [],
          improvementSuggestions: [],
          summaryScore: { matchPercentage: 0, comments: "Comparison failed due to an error." }
        };
    }
  }
}
