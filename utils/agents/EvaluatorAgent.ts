import {AzureOpenAI} from "openai";
import { Evaluation } from "../../types/resume";

export class EvaluatorAgent {
  private client: AzureOpenAI;

  constructor() {
     this.client = new AzureOpenAI ({
            apiKey:process.env.AZURE_OPENAI_KEY,
            endpoint:process.env.AZURE_OPENAI_ENDPOINT,
            deployment:process.env.AZURE_OPENAI_DEPLOYMENT,
            apiVersion:process.env.AZURE_OPENAI_VERSION,
    });
  }

  async evaluate(
    originalResume:string,
    enhancedResume: string,
    jobDescription: string
  ): Promise<Evaluation> {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) evaluator.
    Your task is to evaluate and compare two resumes against a given job description.

    Resumes:
    1. Original Resume: ${originalResume}
    2. Rewritten / Enhanced Resume: ${enhancedResume}

    Job Description:
    ${jobDescription}

    Your task:
    1. Analyze each resume for ATS keyword coverage, skills match, experience relevance, and overall alignment with the job description.
    2. Assign an ATS score (0–100) to each resume.
    3. Identify missing skills or weak areas in each resume.
    4. Suggest improvements where necessary.

    Return ONLY valid JSON in the following format (no markdown or extra text):

    {
      "originalResumeScore": {
        "ats_score": number,
        "keyword_match": number,
        "experience_relevance": number,
        "skill_gaps": [ "string" ],
        "notes": [ "string" ]
      },
      "enhancedResumeScore": {
        "ats_score": number,
        "keyword_match": number,
        "experience_relevance": number,
        "skill_gaps": [ "string" ],
        "notes": [ "string" ]
      },
      "summary": "Brief comparison highlighting improvements after rewriting the resume."
    }
  `;

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT as string,
        messages: [{ role: "user", content: prompt }],
      });
      return JSON.parse(
        response?.choices?.[0]?.message?.content || ""
      ) as Evaluation;
    } catch {
      return {
        originalResumeScore: {
          ats_score: 0,
          keyword_match: 0,
          experience_relevance: 0,
          skill_gaps: [],
          notes: [],
        },
        enhancedResumeScore: {
          ats_score: 0,
          keyword_match: 0,
          experience_relevance: 0,
          skill_gaps: [],
          notes: [],
        },
        summary: "",
      };
    }
  }
}
