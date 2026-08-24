import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ResultScreen } from '../components/ResultScreen';
import { extractPdfPages, loadPdfDocument } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { FileCheck, Loader2, ArrowRight } from 'lucide-react';

export const ExtractPagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    setSelectedPages([1]);
    if (selected) {
      try {
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
      } catch (e) {
        console.error('Error reading PDF:', e);
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    if (selectedPages.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const extractedBlob = await extractPdfPages(file, selectedPages);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(extractedBlob);

      setResult({
        blob: extractedBlob,
        fileName: `${nameWithoutExt}_extracted.pdf`,
        originalSize: file.size,
        newSize: extractedBlob.size,
        downloadUrl,
        pageCount: selectedPages.length,
      });
    } catch (err: any) {
      console.error('Extract failed:', err);
      setError(err.message || 'Failed to extract selected pages.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setSelectedPages([]);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="Extract PDF Pages"
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
          onFilesChange={handleFileChange}
          title="Select PDF file to extract pages"
          subtitle="Choose the exact pages you need and generate a focused new document"
          buttonText="Select PDF File"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-sm">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {totalPages} Total Pages • {selectedPages.length} pages selected for new PDF
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Page Selector */}
          <PageThumbnailGrid
            file={file}
            selectedPages={selectedPages}
            onSelectionChange={setSelectedPages}
            allowSelection={true}
          />

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled={processing || selectedPages.length === 0}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-extract-pages-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting selected pages...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  <span>Extract {selectedPages.length} {selectedPages.length === 1 ? 'Page' : 'Pages'} into New PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
