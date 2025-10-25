import { formidable, File } from "formidable";
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Orchestrator } from "@/utils/orchestrator";
import { NextApiRequest, NextApiResponse } from "next";
import { PDFParse } from "pdf-parse";
import { dailyLimiter } from "@/utils/ratelimitar";

export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userIP =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  console.log("User IP:", userIP);
  try {
    await dailyLimiter.consume(userIP, 1);
  } catch {
    console.warn("Rate limit exceeded for IP",userIP);
    return res.status(429).json({ message: "Too many requests."})
  }
  try {
    if (req.method === "POST") {
      const form = formidable({});
      form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send("Error parsing files");
        const jobDescription: string = fields.jobDescription?.[0] || "";
        if (!files?.resume?.[0])
          return res.status(400).send("Resume file is required");
        const resumeFile = files.resume[0] as File;
        const buffer = fs.readFileSync(resumeFile.filepath);
        const pdfParse = new PDFParse({
          data: buffer,
        });
        const pdfData = await pdfParse.getText();
        const orchestrator = new Orchestrator();
        const { rewritten, evaluation, analysis } = await orchestrator.enhance(
          pdfData.text,
          jobDescription
        );
        const doc = new Document({
          sections: [
            {
              children: rewritten
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map(
                  (line) =>
                    new Paragraph({ children: [new TextRun({ text: line })] })
                ),
            },
          ],
        });
        const docBuffer = await Packer.toBuffer(doc);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=enhanced_resume.docx"
        );
        return res.status(200).json({
          enhanced_resume: docBuffer.toString("base64"),
          evaluation,
          analysis,
        });
      });
    }
  } catch (err) {
    console.error("Error in /api/enhance:", err);
    return res.status(500).send("Internal Server Error");
  }
}
