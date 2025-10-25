import { AzureOpenAI } from "openai";

export class RewriterAgent {
  private client: AzureOpenAI;

  constructor() {
     this.client = new AzureOpenAI ({
            apiKey:process.env.AZURE_OPENAI_KEY,
            endpoint:process.env.AZURE_OPENAI_ENDPOINT,
            deployment:process.env.AZURE_OPENAI_DEPLOYMENT,
            apiVersion:process.env.AZURE_OPENAI_VERSION,
        });
  }

  async rewrite(resumeText: string, jobDescription: string): Promise<string> {
  const prompt = `
    You are an expert resume writer and ATS optimization specialist.

    Your goal:
    Enhance the given resume by adding relevant missing keywords and phrases from the job description — while preserving authenticity, readability, and formatting.  
    The result should look like a professionally written, ATS-friendly Word document.

    Guidelines:
    1. Do NOT change or delete existing content unless necessary for grammar or clarity.
    2. Naturally incorporate missing keywords and phrases from the job description into relevant sections 
      (Summary, Skills, Experience, and Projects).
    3. Keep the writing tone professional, concise, and realistic.
    4. Maintain consistent formatting — use clear section headers, bullet points, and spacing.
    5. Do NOT fabricate experience or achievements not implied in the resume.
    6. Optimize layout for ATS readability — avoid tables, columns, or images.
    7. Return the final resume in valid **Word (DOCX) format**, not Markdown or plain text.
    8. Do not include explanations — only the document content.

    Resume:
    ${resumeText}

    Job Description:
    ${jobDescription}
  `;

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT as string,
        messages: [{ role: "user", content: prompt }],
      });
      
      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error rewriting resume:", error);
      return resumeText;
    }
  }
}
