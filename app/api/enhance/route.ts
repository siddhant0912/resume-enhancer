import { Document, Packer, Paragraph, TextRun } from "docx";
import { Orchestrator } from "@/utils/orchestrator";
import { dailyLimiter } from "@/utils/ratelimitar";
import { NextResponse } from "next/server";
import PDFParser, { Page, Text, TextRun as PDFTextRun } from "pdf2json";


async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", err => reject(err));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const pagesText = pdfData.Pages.map((page: Page) =>
        page.Texts
          .map((text: Text) =>
            text.R.map((r:PDFTextRun ) =>
              decodeURIComponent(r.T)
            ).join("")
          )
          .join("")
      );
      resolve(pagesText.join("\n"));
    });

    pdfParser.parseBuffer(Buffer.from(buffer));
  });
}

export async function POST(req: Request) {
  // Get IP for rate limiting
  const userIP =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  //Rate limiting
  try {
    await dailyLimiter.consume(userIP, 10);
  } catch {
    console.warn("Rate limit exceeded for IP", userIP);
    return NextResponse.json({ message: "Too many requests." }, { status: 429 });
  }

  try {
    const formData = await req.formData();

    const jobDescription = formData.get("jobDescription")?.toString() || "";
    const resumeFile = formData.get("resume") as File;

    if (!resumeFile) {
      return NextResponse.json({ message: "Resume file is required" }, { status: 400 });
    }

    // Convert File -> Node Buffer
    const arrayBuffer = await resumeFile.arrayBuffer();

    // Parse PDF
    const pdfData = await extractPdfText(arrayBuffer); 

    // Call orchestrator
    const orchestrator = new Orchestrator();
    const { rewritten, evaluation, analysis } = await orchestrator.enhance(
      pdfData,
      jobDescription
    );

    // Create DOCX
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
    return NextResponse.json({
        enhanced_resume: docBuffer.toString("base64"),
        evaluation,
        analysis,
    },{status:200,headers:{
        "Content-Type": "application/json"
    }});
  } catch (err) {
    console.error("Error in /api/enhance:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
