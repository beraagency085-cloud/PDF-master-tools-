import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { extractTextFromPdf, loadPdfDocument } from './pdfEngine';

/**
 * 7. PDF TO WORD (.docx)
 */
export async function convertPdfToWordDocx(
  file: File,
  _ocrMode: boolean = false
): Promise<Blob> {
  const pagesText = await extractTextFromPdf(file);
  const docParagraphs: Paragraph[] = [];

  // Title
  docParagraphs.push(
    new Paragraph({
      text: file.name.replace(/\.pdf$/i, ''),
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    })
  );

  for (let i = 0; i < pagesText.length; i++) {
    const text = pagesText[i];
    if (i > 0) {
      docParagraphs.push(
        new Paragraph({
          text: `[ Page ${i + 1} ]`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: true,
        })
      );
    }

    const lines = text.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim(),
              size: 24, // 12pt
              font: 'Calibri',
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * 8. WORD TO PDF (DOCX -> PDF)
 */
export async function convertWordDocxToPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || 'No readable text content found in Word file.';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 11;
  const lineHeight = 16;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Header Title
  const title = file.name.replace(/\.(docx|doc)$/i, '');
  currentPage.drawText(title, {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  currentY -= 30;

  const paragraphs = rawText.split(/\n\s*\n/);

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const words = para.replace(/\s+/g, ' ').trim().split(' ');
    let currentLine = '';

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentY < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentY -= lineHeight;
        currentLine = word;
      }
    }

    if (currentLine) {
      if (currentY < margin + lineHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentPage.drawText(currentLine, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= lineHeight + 8; // Extra paragraph spacing
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 9. PDF TO EXCEL (.xlsx)
 * Extracts structured tables and lines from PDF into an Excel workbook
 */
export async function convertPdfToExcel(file: File): Promise<Blob> {
  const pdfDoc = await loadPdfDocument(file);
  const workbook = XLSX.utils.book_new();

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by vertical Y coordinate with tolerance to detect rows
    const rowsMap = new Map<number, { x: number; text: string }[]>();

    textContent.items.forEach((item: any) => {
      if (!('str' in item) || !item.str.trim()) return;
      const transform = item.transform;
      const x = transform[4];
      const y = Math.round(transform[5] / 8) * 8; // cluster into approx rows

      if (!rowsMap.has(y)) {
        rowsMap.set(y, []);
      }
      rowsMap.get(y)!.push({ x, text: item.str.trim() });
    });

    // Sort rows from top (highest Y in PDF coords) to bottom
    const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
    const sheetData: string[][] = [];

    sortedY.forEach((y) => {
      const rowItems = rowsMap.get(y)!.sort((a, b) => a.x - b.x);
      const rowTexts = rowItems.map((item) => item.text);
      sheetData.push(rowTexts);
    });

    if (sheetData.length === 0) {
      sheetData.push([`Page ${pageNum} (Empty / Image Page)`]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page_${pageNum}`);
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * 10. EXCEL TO PDF (XLSX/XLS -> PDF)
 */
export async function convertExcelToPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 841.89; // A4 Landscape for better spreadsheet fit
  const pageHeight = 595.28;
  const margin = 40;
  const rowHeight = 22;

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rawData.length === 0) return;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Sheet Name Heading
    currentPage.drawText(`Sheet: ${sheetName}`, {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.4, 0.2),
    });
    currentY -= 30;

    // Calculate column count and widths
    const maxCols = Math.min(Math.max(...rawData.map((r) => (r ? r.length : 0))), 8);
    const colWidth = (pageWidth - margin * 2) / Math.max(maxCols, 1);

    rawData.forEach((row, rowIndex) => {
      if (currentY < margin + rowHeight) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      const isHeader = rowIndex === 0;
      // Row background
      if (isHeader) {
        currentPage.drawRectangle({
          x: margin,
          y: currentY - 4,
          width: pageWidth - margin * 2,
          height: rowHeight,
          color: rgb(0.92, 0.95, 0.92),
        });
      } else if (rowIndex % 2 === 1) {
        currentPage.drawRectangle({
          x: margin,
          y: currentY - 4,
          width: pageWidth - margin * 2,
          height: rowHeight,
          color: rgb(0.98, 0.98, 0.99),
        });
      }

      // Draw cells
      for (let c = 0; c < maxCols; c++) {
        const cellValue = row && row[c] !== undefined && row[c] !== null ? String(row[c]) : '';
        const cellText = cellValue.length > 20 ? cellValue.substring(0, 18) + '...' : cellValue;

        currentPage.drawText(cellText, {
          x: margin + c * colWidth + 6,
          y: currentY + 3,
          size: isHeader ? 10 : 9,
          font: isHeader ? boldFont : font,
          color: isHeader ? rgb(0.1, 0.2, 0.1) : rgb(0.2, 0.2, 0.2),
        });
      }

      currentY -= rowHeight;
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
