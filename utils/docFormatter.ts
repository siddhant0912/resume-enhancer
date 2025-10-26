import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

export async function createEnhancedDocx(rewritten: string) {
  const lines = rewritten
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    // 🔹 Detect section headers like SUMMARY, SKILLS, EDUCATION
    if (/^[A-Z\s&]+$/.test(line) && line.length < 40) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
      continue;
    }

    // 🔹 Detect bullet points (• or starting with a dash)
    if (/^[•\-]\s*/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/^[•\-]\s*/, ""),
              font: "Calibri",
              size: 22,
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
      continue;
    }

    // 🔹 Default paragraph (normal text)
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: line, size: 22, font: "Calibri" })],
        spacing: { after: 100 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
