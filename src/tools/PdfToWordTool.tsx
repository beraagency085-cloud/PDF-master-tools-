import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { convertPdfToWordDocx } from '../services/officeEngine';
import { performOcr } from '../services/ocrEngine';
import { ProcessedResult } from '../types';
import { FileSpreadsheet, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Document, Paragraph, TextRun, Packer } from 'docx';

export const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrMode, setOcrMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleConvert = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);
      let wordBlob: Blob;

      if (ocrMode) {
        setStatusText('Running OCR on scanned pages...');
        const ocrRes = await performOcr(file, 'eng', (p) => {
          setStatusText(`${p.status} (${Math.round(p.progress * 100)}%)`);
        });

        // Construct Word document with OCR text
        const paragraphs: Paragraph[] = [];
        ocrRes.pages.forEach((p) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `--- Page ${p.pageNum} ---`,
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { before: 200, after: 150 },
            })
          );
          p.text.split('\n').forEach((line) => {
            if (line.trim()) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: line.trim(), size: 22 })],
                  spacing: { after: 100 },
                })
              );
            }
          });
        });

        const doc = new Document({
          sections: [{ children: paragraphs }],
        });
        wordBlob = await Packer.toBlob(doc);
      } else {
        setStatusText('Extracting text and formatting into Word (.docx)...');
        wordBlob = await convertPdfToWordDocx(file);
      }

      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(wordBlob);

      setResult({
        blob: wordBlob,
        fileName: `${nameWithoutExt}_editable.docx`,
        originalSize: file.size,
        newSize: wordBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('PDF to Word failed:', err);
      setError(err.message || 'Failed to convert PDF to Word. Try enabling OCR mode if the PDF is scanned.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF to Word Conversion"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {!file ? (
        <FileUploader
          acceptedTypes={['.pdf']}
          acceptedMimeTypes="application/pdf"
          multiple={false}
          files={file ? [file] : []}
          onFilesChange={(f) => setFile(f[0] || null)}
          title="Select PDF file to convert to Word"
          subtitle="Generate fully editable Microsoft Word (.docx) document"
          buttonText="Select PDF File"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-sm">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Target Format: Microsoft Word (.docx)
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* OCR Mode switch */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-slate-800">
                  Enable OCR Mode (For Scanned PDFs)
                </span>
              </div>
              <input
                type="checkbox"
                checked={ocrMode}
                onChange={(e) => setOcrMode(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                id="ocr-mode-checkbox"
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check this if your PDF was created from a scanner, camera photo, or flat image so text characters can be recognized optically.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={handleConvert}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-pdf-to-word-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{statusText || 'Converting to Word (.docx)...'}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Convert to Word (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
