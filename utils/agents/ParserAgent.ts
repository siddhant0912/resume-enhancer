import { AzureOpenAI } from "openai";
import { ResumeData } from "../../types/resume";

export class ParserAgent {
  private client: AzureOpenAI;

  constructor() {
    this.client = new AzureOpenAI ({
        apiKey:process.env.AZURE_OPENAI_KEY,
        endpoint:process.env.AZURE_OPENAI_ENDPOINT,
        deployment:process.env.AZURE_OPENAI_DEPLOYMENT,
        apiVersion:process.env.AZURE_OPENAI_VERSION,
    });
  }

  async parse(resumeText: string): Promise<ResumeData> {
    const prompt = `
      You are an expert AI resume parser trained to convert unstructured text resumes into clean, structured JSON data.

      Your goal:
      - Extract only relevant, factual information from the given resume text.
      - Ignore decorative formatting, section headers, or unrelated content.
      - Always return a complete JSON object matching the exact schema below.

      Schema:
      {
        "name": "string",
        "contact": {
          "email": "string",
          "phone": "string",
          "location": "string | null",
          "linkedin": "string | null",
          "github": "string | null",
          "portfolio": "string | null"
        },
        "summary": "string",
        "skills": [ "string" ],
        "experience": [
          {
            "company": "string",
            "position": "string",
            "startDate": "string (YYYY-MM)",
            "endDate": "string | 'Present'",
            "description": "string",
            "technologies": [ "string" ]
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string",
            "startYear": "number | null",
            "endYear": "number | null"
          }
        ],
        "projects": [
          {
            "name": "string",
            "description": "string",
            "technologies": [ "string" ],
            "link": "string | null"
          }
        ],
        "certificates": [
          {
            "name": "string",
            "issuer": "string | null",
            "year": "number | null"
          }
        ],
        "awards": [
          {
            "title": "string",
            "issuer": "string | null",
            "year": "number | null"
          }
        ]
      }

      Instructions:
      1. Parse the provided resume text accurately into this schema.
      2. Use null for any missing or unknown field — do NOT omit keys.
      3. Do not include Markdown, code blocks, or any explanations.
      4. Return ONLY the valid JSON object.

      Resume Text:
      ${resumeText}
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT as string,
        messages: [{ role: "user", content: prompt }],
        });
      return JSON.parse(response?.choices?.[0]?.message?.content || "") as ResumeData;
    } catch(error) {
      console.error("Error parsing resume:", error);
      return {};
    }
  }
}
