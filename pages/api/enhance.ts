import { formidable,File } from 'formidable';
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Orchestrator } from "@/utils/orchestrator";
import { NextApiRequest, NextApiResponse } from 'next';
import { PDFParse } from 'pdf-parse';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try{

    const form = formidable({});
    form.parse(req, async (err,fields,files) => {
        if (err) return res.status(500).send("Error parsing files");

        const jobDescription: string = fields.jobDescription?.[0] || "";
        if (!files?.resume?.[0]) return res.status(400).send("Resume file is required");
        const resumeFile = files.resume[0] as File;
        const buffer = fs.readFileSync(resumeFile.filepath);
        const pdfParse = new PDFParse({
            data:buffer
        })
        const pdfData = await pdfParse.getText();
        const orchestrator = new Orchestrator();
        const { rewritten, evaluation, analysis } = await orchestrator.enhance(pdfData.text, jobDescription);
        const doc = new Document({
          sections: [
            {
              children: rewritten
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map(
                  (line) => new Paragraph({ children: [new TextRun({ text: line })] })
                ),
            },
          ],
        });
        const docBuffer = await Packer.toBuffer(doc);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", "attachment; filename=enhanced_resume.docx");
        res.status(200).json({
          enhanced_resume: docBuffer.toString("base64"),
          evaluation,
          analysis
        });
    });
  }catch(err){
    console.error("Error in /api/enhance:", err);
    return res.status(500).send("Internal Server Error");
  }

}
