export type ToolId =
  | 'compress-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'jpg-to-pdf'
  | 'pdf-to-jpg'
  | 'pdf-to-png'
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'pdf-to-excel'
  | 'excel-to-pdf'
  | 'rotate-pdf'
  | 'delete-pages'
  | 'extract-pages'
  | 'protect-pdf'
  | 'unlock-pdf'
  | 'watermark-pdf'
  | 'page-numbers'
  | 'pdf-ocr';

export type ToolCategory = 'optimize' | 'organize' | 'convert-to-pdf' | 'convert-from-pdf' | 'security-edit' | 'advanced';

export interface ToolDefinition {
  id: ToolId;
  title: string;
  shortTitle: string;
  description: string;
  banglaTitle?: string;
  banglaDescription?: string;
  keywords?: string[];
  banglaKeywords?: string[];
  category: ToolCategory;
  badge?: string;
  top?: boolean;
  emoji?: string;
  iconName: string;
  color: string;
  acceptedFileTypes: string[];
  acceptedMimeTypes: string;
  multiple: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    explanation: string;
    howToSteps: { step: number; title: string; desc: string }[];
    faqs: { question: string; answer: string }[];
  };
}

export interface UploadedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  totalPages?: number;
  previewUrls?: string[];
  error?: string;
}

export interface ProcessedResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  newSize: number;
  downloadUrl: string;
  isZip?: boolean;
  extractedText?: string;
  pageCount?: number;
}
