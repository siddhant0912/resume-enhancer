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
    You are a professional resume writer and ATS optimization expert.

    Your task:
    Enhance and optimize the provided resume to align it with the given job description, ensuring it remains authentic, readable, and ready for Applicant Tracking Systems (ATS).

    ### Objectives:
    - Strengthen the resume by naturally incorporating **relevant keywords and phrases** from the job description.
    - Improve **clarity, impact, and structure** while maintaining the candidate’s original experience and authenticity.
    - Ensure the result is **ATS-compliant**, professionally formatted, and ready to export as a **Word (DOCX)** document.

    ### Strict Guidelines:
    1. **Preserve authenticity** — Do not invent or exaggerate achievements or roles not implied in the resume.
    2. **Keep original structure** — Retain all existing sections such as Summary, Skills, Experience, Projects, and Education (if available).
    3. **Keyword integration** — Seamlessly embed important job-related keywords where relevant, especially in Summary, Skills, and Experience.
    4. **Language & tone** — Maintain a formal, confident, and concise professional tone suitable for mid-to-senior-level roles.
    5. **Formatting** — Use plain text structure (headings, bullet points, line breaks). Avoid images, tables, columns, or any non-ATS-friendly elements.
    6. **Do not output explanations or commentary.**
    7. The output **must represent the final resume text content**, structured as it should appear in a Word (DOCX) file — not Markdown, not JSON, not annotated text.

    ### Inputs:
    **Resume:**
    ${resumeText}

    **Job Description:**
    ${jobDescription}

    ### Output:
    Return only the enhanced resume content, ready for direct conversion to a Word (DOCX) document.
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
