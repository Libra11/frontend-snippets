import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const text = "PDF 预览示例";
const contentStream = `BT\n/F1 24 Tf\n72 730 Td\n(${text}) Tj\nET`;
const contentBuffer = Buffer.from(contentStream, "utf8");

const objects = [
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
  "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
  `4 0 obj\n<< /Length ${contentBuffer.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
  "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
];

let pdf = "%PDF-1.4\n";
const offsets: number[] = [0];
let offset = pdf.length;

for (const obj of objects) {
  offsets.push(offset);
  pdf += obj;
  offset = pdf.length;
}

const xrefPos = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i <= objects.length; i++) {
  pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

const outputDir = join(process.cwd(), "public/previews");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "sample.pdf"), pdf, "utf8");
console.log("Created sample.pdf");
