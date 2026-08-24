import { createWorker } from 'tesseract.js';
import { renderPdfPageToDataUrl, loadPdfDocument } from './pdfEngine';

export interface OcrProgress {
  status: string;
  progress: number;
  currentPage: number;
  totalPages: number;
}

export type SupportedOcrLanguage =
  | 'eng' // English
  | 'hin' // Hindi
  | 'ben' // Bengali
  | 'spa' // Spanish
  | 'fra' // French
  | 'deu' // German
  | 'ara' // Arabic
  | 'chi_sim'; // Chinese Simplified

export const OCR_LANGUAGES: { code: SupportedOcrLanguage; label: string; nativeLabel: string }[] = [
  { code: 'eng', label: 'English', nativeLabel: 'English' },
  { code: 'hin', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ben', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'spa', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fra', label: 'French', nativeLabel: 'Français' },
  { code: 'deu', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'ara', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'chi_sim', label: 'Chinese (Simplified)', nativeLabel: '简体中文' },
];

/**
 * Perform OCR on a PDF or Image file
 */
export async function performOcr(
  file: File,
  language: SupportedOcrLanguage = 'eng',
  onProgress?: (p: OcrProgress) => void
): Promise<{ text: string; pages: { pageNum: number; text: string }[] }> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const results: { pageNum: number; text: string }[] = [];

  onProgress?.({
    status: 'Initializing OCR engine...',
    progress: 0.1,
    currentPage: 0,
    totalPages: 1,
  });

  const worker = await createWorker(language);

  try {
    if (isPdf) {
      const pdfDoc = await loadPdfDocument(file);
      const totalPages = pdfDoc.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        onProgress?.({
          status: `Scanning page ${pageNum} of ${totalPages}...`,
          progress: (pageNum - 1) / totalPages + 0.1 / totalPages,
          currentPage: pageNum,
          totalPages,
        });

        // Render page to high-res image for OCR accuracy
        const pageDataUrl = await renderPdfPageToDataUrl(file, pageNum, 2.0);

        const ret = await worker.recognize(pageDataUrl);
        results.push({
          pageNum,
          text: ret.data.text.trim(),
        });
      }
    } else {
      // Direct image OCR
      onProgress?.({
        status: 'Recognizing text in image...',
        progress: 0.5,
        currentPage: 1,
        totalPages: 1,
      });

      const ret = await worker.recognize(file);
      results.push({
        pageNum: 1,
        text: ret.data.text.trim(),
      });
    }

    onProgress?.({
      status: 'OCR Completed successfully!',
      progress: 1.0,
      currentPage: results.length,
      totalPages: results.length,
    });

    const combinedText = results
      .map((r) => (results.length > 1 ? `--- Page ${r.pageNum} ---\n${r.text}` : r.text))
      .join('\n\n');

    return {
      text: combinedText,
      pages: results,
    };
  } finally {
    await worker.terminate();
  }
}
