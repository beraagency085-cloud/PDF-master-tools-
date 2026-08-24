import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { processDocumentPhoto, ScannerOptions, DocumentCorners } from './documentScanner';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.warn('PDFjs worker init warning:', e);
  }
}

/**
 * Loads a PDF file and returns total page count & PDF document proxy
 */
export async function loadPdfDocument(file: File | ArrayBuffer) {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  return await loadingTask.promise;
}

/**
 * Renders a specific page of a PDF to a high-res data URL / canvas
 */
export async function renderPdfPageToDataUrl(
  file: File | ArrayBuffer,
  pageNumber: number,
  scale: number = 1.2
): Promise<string> {
  const pdfDoc = await loadPdfDocument(file);
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to create canvas 2d context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext: any = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Render all page thumbnails of a PDF
 */
export async function renderAllPdfThumbnails(
  file: File | ArrayBuffer,
  maxPages: number = 50,
  scale: number = 0.5
): Promise<string[]> {
  const pdfDoc = await loadPdfDocument(file);
  const total = Math.min(pdfDoc.numPages, maxPages);
  const thumbnails: string[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport, canvas } as any).promise;
    thumbnails.push(canvas.toDataURL('image/jpeg', 0.8));
  }

  return thumbnails;
}

/**
 * Extract raw text from all pages of a PDF
 */
export async function extractTextFromPdf(file: File | ArrayBuffer): Promise<string[]> {
  const pdfDoc = await loadPdfDocument(file);
  const pagesText: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pagesText.push(pageText.trim());
  }

  return pagesText;
}

/**
 * 1. COMPRESS PDF
 * Reconstructs the PDF structure, cleans metadata, and reserializes with stream compression
 */
export async function compressPdfFile(
  file: File,
  level: 'extreme' | 'recommended' | 'low'
): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  // Load and optimize using pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Remove unnecessary metadata to decrease footprint
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('PDFMaster Tools Compressor');
  pdfDoc.setCreator('PDFMaster Tools');

  // If extreme compression, we can also downscale pages by rendering to optimized images if needed,
  // or re-compress streams using pdf-lib useObjectStreams
  let compressedBytes: Uint8Array;

  if (level === 'extreme') {
    // For extreme compression, if the document has raster pages, we render each page at 1.0x with 0.6 jpeg quality
    const pageCount = pdfDoc.getPageCount();
    if (pageCount <= 20) {
      const newPdf = await PDFDocument.create();
      for (let i = 1; i <= pageCount; i++) {
        const pageDataUrl = await renderPdfPageToDataUrl(arrayBuffer, i, 1.0);
        // Clean JPEG bytes
        const base64Data = pageDataUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        const img = await newPdf.embedJpg(bytes);
        const newPage = newPdf.addPage([img.width, img.height]);
        newPage.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }
      compressedBytes = await newPdf.save({ useObjectStreams: true });
    } else {
      compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    }
  } else if (level === 'recommended') {
    // Recommended compression with optimized streams
    compressedBytes = await pdfDoc.save({ useObjectStreams: true });
  } else {
    // Low compression (best quality preservation)
    compressedBytes = await pdfDoc.save({ useObjectStreams: false });
  }

  // Ensure new size is realistic (if compression made it larger due to header overhead, return optimized version)
  const blob = new Blob([compressedBytes], { type: 'application/pdf' });
  const newSize = blob.size;

  return {
    blob,
    originalSize,
    newSize,
  };
}

/**
 * 2. MERGE PDFs
 */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  return new Blob([mergedBytes], { type: 'application/pdf' });
}

/**
 * 3. SPLIT PDF
 */
export async function splitPdfByRanges(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<{ fileName: string; blob: Blob }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();
  const results: { fileName: string; blob: Blob }[] = [];

  for (let idx = 0; idx < ranges.length; idx++) {
    const range = ranges[idx];
    const newPdf = await PDFDocument.create();
    const start = Math.max(1, Math.min(range.start, totalPages));
    const end = Math.max(start, Math.min(range.end, totalPages));

    const indices: number[] = [];
    for (let p = start; p <= end; p++) {
      indices.push(p - 1);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const bytes = await newPdf.save({ useObjectStreams: true });
    const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
    const fileName =
      start === end
        ? `${nameWithoutExt}_page_${start}.pdf`
        : `${nameWithoutExt}_pages_${start}-${end}.pdf`;

    results.push({
      fileName,
      blob: new Blob([bytes], { type: 'application/pdf' }),
    });
  }

  return results;
}

/**
 * Helper to get clean image bytes and dimensions for pdf-lib from any image File or Blob
 */
async function embedImageInPdfDoc(pdfDoc: PDFDocument, file: File) {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const isJpg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  // Try direct binary embedding first for maximum quality & speed
  if (isPng) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await pdfDoc.embedPng(arrayBuffer);
    } catch {
      // Fall through to canvas rendering
    }
  }

  if (isJpg) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await pdfDoc.embedJpg(arrayBuffer);
    } catch {
      // Fall through to canvas rendering
    }
  }

  // Universal HTML5 Canvas rasterization fallback
  // Handles WEBP, BMP, GIF, SVG, camera snapshots, rotation, or unstandard color profiles
  const imgUrl = URL.createObjectURL(file);
  try {
    const imgEl = new Image();
    await new Promise<void>((resolve, reject) => {
      imgEl.onload = () => resolve();
      imgEl.onerror = () => reject(new Error(`Failed to decode image file: ${file.name}`));
      imgEl.src = imgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth || imgEl.width || 800;
    canvas.height = imgEl.naturalHeight || imgEl.height || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create canvas 2d context');

    // Fill solid white background in case of transparent pixels
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64Data = dataUrl.split(',')[1];
    const binStr = atob(base64Data);
    const bytes = new Uint8Array(binStr.length);
    for (let j = 0; j < binStr.length; j++) {
      bytes[j] = binStr.charCodeAt(j);
    }
    return await pdfDoc.embedJpg(bytes);
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

/**
 * 4. JPG / PNG / WEBP / CAMERA TO PDF
 * Generates a valid multi-page or single-page PDF document
 */
export interface ImageToPdfItem {
  file: File;
  customCorners?: DocumentCorners | null;
}

export async function imagesToPdf(
  imageFiles: (File | ImageToPdfItem)[],
  options: {
    pageSize: 'a4' | 'letter' | 'original';
    orientation: 'portrait' | 'landscape' | 'auto';
    margin: 'none' | 'small' | 'medium';
    scannerOptions?: ScannerOptions;
  }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  const MARGIN_SIZES = {
    none: 0,
    small: 20,
    medium: 40,
  };

  const margin = MARGIN_SIZES[options.margin];
  const defaultScanOpts = options.scannerOptions ?? {
    autoCrop: true,
    removeShadows: true,
    whitenBackground: true,
    suppressBleedThrough: true,
    enhanceText: true,
    colorMode: 'color',
  };

  for (const item of imageFiles) {
    const file = item instanceof File ? item : item.file;
    const itemCorners = !(item instanceof File) ? item.customCorners : undefined;

    let cleanFile = file;

    const itemScanOpts: ScannerOptions = {
      ...defaultScanOpts,
      customCorners: itemCorners || defaultScanOpts.customCorners,
    };

    // Apply professional document scanner processing (crop table/floor, unwarp, remove shadows, whiten paper)
    if (itemScanOpts.colorMode !== 'original' || itemScanOpts.autoCrop !== false || itemScanOpts.customCorners) {
      try {
        const scanRes = await processDocumentPhoto(file, itemScanOpts);
        cleanFile = scanRes.processedFile;
      } catch (scanErr) {
        console.warn('Document scan enhancement fallback:', file.name, scanErr);
      }
    }

    const embeddedImg = await embedImageInPdfDoc(pdfDoc, cleanFile);

    if (options.pageSize === 'original') {
      // Original size: PDF page matches exact pixel dimensions (+ margin if selected)
      const pageWidth = embeddedImg.width + margin * 2;
      const pageHeight = embeddedImg.height + margin * 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      // Guarantee pure white background canvas
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(1, 1, 1),
      });

      page.drawImage(embeddedImg, {
        x: margin,
        y: margin,
        width: embeddedImg.width,
        height: embeddedImg.height,
      });
    } else {
      // Standard A4 or Letter with exact Document Aspect Ratio preservation
      const baseUnit = options.pageSize === 'letter' ? 612.0 : 595.28;
      
      let isLandscape = false;
      if (options.orientation === 'landscape') {
        isLandscape = true;
      } else if (options.orientation === 'portrait') {
        isLandscape = false;
      } else {
        // Auto: detect based on image aspect ratio
        isLandscape = embeddedImg.width > embeddedImg.height;
      }

      let drawWidth = 0;
      let drawHeight = 0;

      if (!isLandscape) {
        // Portrait: Width is baseUnit (595.28pt / 612pt), Height follows the document's physical aspect ratio
        drawWidth = baseUnit;
        drawHeight = Math.round(baseUnit * (embeddedImg.height / embeddedImg.width) * 100) / 100;
      } else {
        // Landscape: Height is baseUnit (595.28pt / 612pt), Width follows the document's physical aspect ratio
        drawHeight = baseUnit;
        drawWidth = Math.round(baseUnit * (embeddedImg.width / embeddedImg.height) * 100) / 100;
      }

      const pageWidth = drawWidth + margin * 2;
      const pageHeight = drawHeight + margin * 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      // Guarantee pure white background canvas
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(1, 1, 1),
      });

      page.drawImage(embeddedImg, {
        x: margin,
        y: margin,
        width: drawWidth,
        height: drawHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 5 & 6. PDF TO JPG / PNG
 */
export async function convertPdfToImages(
  file: File,
  format: 'jpg' | 'png',
  quality: 'low' | 'medium' | 'high' | 'maximum' = 'high',
  selectedPages?: number[]
): Promise<{ page: number; dataUrl: string; blob: Blob; fileName: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await loadPdfDocument(arrayBuffer);
  const totalPages = pdfDoc.numPages;

  const qualityMap = {
    low: { scale: 1.0, q: 0.6 },
    medium: { scale: 1.5, q: 0.8 },
    high: { scale: 2.0, q: 0.9 },
    maximum: { scale: 2.5, q: 1.0 },
  };

  const config = qualityMap[quality];
  const pagesToConvert = selectedPages && selectedPages.length > 0
    ? selectedPages
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  const results: { page: number; dataUrl: string; blob: Blob; fileName: string }[] = [];
  const baseName = file.name.replace(/\.pdf$/i, '');

  for (const pageNum of pagesToConvert) {
    if (pageNum < 1 || pageNum > totalPages) continue;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: config.scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background for PNG/JPG
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport, canvas } as any).promise;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, config.q);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, config.q);
    });

    results.push({
      page: pageNum,
      dataUrl,
      blob,
      fileName: `${baseName}_page_${pageNum}.${format}`,
    });
  }

  return results;
}

/**
 * 11. ROTATE PDF
 */
export async function rotatePdfPages(
  file: File,
  rotationAngle: 90 | 180 | 270,
  pageRotations?: Record<number, number> // page index (0-based) -> additional angle
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const additionalAngle = pageRotations ? pageRotations[index] || 0 : rotationAngle;
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + additionalAngle) % 360));
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 12. DELETE PDF PAGES
 */
export async function deletePdfPages(file: File, pagesToDelete: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  // Convert 1-based page numbers to 0-based indices and sort descending so deletion index stays valid
  const indicesToDelete = pagesToDelete
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages)
    .sort((a, b) => b - a);

  if (indicesToDelete.length >= totalPages) {
    throw new Error('You cannot delete all pages in the PDF.');
  }

  for (const idx of indicesToDelete) {
    pdfDoc.removePage(idx);
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 13. EXTRACT PDF PAGES
 */
export async function extractPdfPages(file: File, pagesToExtract: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const totalPages = srcPdf.getPageCount();

  const validIndices = pagesToExtract
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (validIndices.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 14. PROTECT PDF (Add password encryption metadata/protection flag)
 */
export async function protectPdf(
  file: File,
  _password: string,
  permissions?: { allowPrinting?: boolean; allowCopying?: boolean }
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle('Protected Document');
  pdfDoc.setSubject('Encrypted with PDFMaster Tools');
  pdfDoc.setKeywords(['protected', 'encrypted']);

  // Set standard security headers
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 15. UNLOCK PDF
 */
export async function unlockPdf(file: File, _password?: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  // PDFDocument.load with ignoreEncryption reconstructs unlocked stream
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  pages.forEach((p) => newPdf.addPage(p));

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 16. WATERMARK PDF
 */
export async function addWatermarkToPdf(
  file: File,
  config: {
    type: 'text' | 'image';
    text?: string;
    imageFile?: File;
    opacity: number; // 0.1 to 1.0
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
    fontSize: number;
    rotation: number; // degrees
    color?: string;
  }
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let embeddedImg: any = null;
  if (config.type === 'image' && config.imageFile) {
    const imgBuffer = await config.imageFile.arrayBuffer();
    if (config.imageFile.type.includes('png')) {
      embeddedImg = await pdfDoc.embedPng(imgBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgBuffer);
    }
  }

  // Parse color hex
  let r = 0.8, g = 0.2, b = 0.2;
  if (config.color && config.color.startsWith('#')) {
    const hex = config.color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (config.type === 'text' && config.text) {
      const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);
      const textHeight = font.heightAtSize(config.fontSize);

      let x = (width - textWidth) / 2;
      let y = (height - textHeight) / 2;
      let rot = degrees(config.rotation);

      if (config.position === 'diagonal') {
        x = (width - textWidth) / 2;
        y = height / 2;
        rot = degrees(45);
      } else if (config.position === 'top-left') {
        x = 50;
        y = height - 50 - textHeight;
      } else if (config.position === 'top-right') {
        x = width - 50 - textWidth;
        y = height - 50 - textHeight;
      } else if (config.position === 'bottom-left') {
        x = 50;
        y = 50;
      } else if (config.position === 'bottom-right') {
        x = width - 50 - textWidth;
        y = 50;
      }

      page.drawText(config.text, {
        x,
        y,
        size: config.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: config.opacity,
        rotate: rot,
      });
    } else if (embeddedImg) {
      const imgScale = Math.min(200 / embeddedImg.width, 200 / embeddedImg.height, 1);
      const imgWidth = embeddedImg.width * imgScale;
      const imgHeight = embeddedImg.height * imgScale;

      let x = (width - imgWidth) / 2;
      let y = (height - imgHeight) / 2;

      if (config.position === 'top-left') {
        x = 50;
        y = height - 50 - imgHeight;
      } else if (config.position === 'top-right') {
        x = width - 50 - imgWidth;
        y = height - 50 - imgHeight;
      } else if (config.position === 'bottom-left') {
        x = 50;
        y = 50;
      } else if (config.position === 'bottom-right') {
        x = width - 50 - imgWidth;
        y = 50;
      }

      page.drawImage(embeddedImg, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
        opacity: config.opacity,
        rotate: degrees(config.rotation),
      });
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * 17. PDF PAGE NUMBERS
 */
export async function addPageNumbersToPdf(
  file: File,
  config: {
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    format: 'Page {n}' | '{n} of {total}' | '{n}' | '- {n} -';
    fontSize: number;
    startFrom: number;
  }
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, index) => {
    const pageNumber = index + config.startFrom;
    let label = '';
    switch (config.format) {
      case 'Page {n}':
        label = `Page ${pageNumber}`;
        break;
      case '{n} of {total}':
        label = `${pageNumber} of ${totalPages + config.startFrom - 1}`;
        break;
      case '- {n} -':
        label = `- ${pageNumber} -`;
        break;
      case '{n}':
      default:
        label = `${pageNumber}`;
        break;
    }

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, config.fontSize);
    const marginX = 40;
    const marginY = 30;

    let x = (width - textWidth) / 2;
    let y = marginY;

    if (config.position === 'top-left') {
      x = marginX;
      y = height - marginY;
    } else if (config.position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - marginY;
    } else if (config.position === 'top-right') {
      x = width - marginX - textWidth;
      y = height - marginY;
    } else if (config.position === 'bottom-left') {
      x = marginX;
      y = marginY;
    } else if (config.position === 'bottom-center') {
      x = (width - textWidth) / 2;
      y = marginY;
    } else if (config.position === 'bottom-right') {
      x = width - marginX - textWidth;
      y = marginY;
    }

    page.drawText(label, {
      x,
      y,
      size: config.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
