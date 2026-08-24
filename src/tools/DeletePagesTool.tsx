import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ResultScreen } from '../components/ResultScreen';
import { deletePdfPages, loadPdfDocument } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Trash2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export const DeletePagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    setPagesToDelete([]);
    if (selected) {
      try {
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
      } catch (e) {
        console.error('Error loading PDF:', e);
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    if (pagesToDelete.length === 0) {
      setError('Please select at least one page to delete.');
      return;
    }

    if (pagesToDelete.length >= totalPages) {
      setError('You cannot delete all pages in the document. At least one page must remain.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const updatedBlob = await deletePdfPages(file, pagesToDelete);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(updatedBlob);

      setResult({
        blob: updatedBlob,
        fileName: `${nameWithoutExt}_edited.pdf`,
        originalSize: file.size,
        newSize: updatedBlob.size,
        downloadUrl,
        pageCount: totalPages - pagesToDelete.length,
      });
    } catch (err: any) {
      console.error('Delete pages failed:', err);
      setError(err.message || 'Failed to remove pages.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setPagesToDelete([]);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="Delete PDF Pages"
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
          title="Select PDF file to remove unwanted pages"
          subtitle="Click pages to delete and download the clean updated PDF"
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
                {totalPages} Total Pages • {pagesToDelete.length} marked for deletion
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200/80 flex items-start space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Instructions:</span> Click on any page thumbnail below to select it for removal. Selected pages will be discarded from the final document.
            </div>
          </div>

          {/* Page Selector Grid */}
          <PageThumbnailGrid
            file={file}
            selectedPages={pagesToDelete}
            onSelectionChange={setPagesToDelete}
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
              disabled={processing || pagesToDelete.length === 0}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-delete-pages-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Removing selected pages...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete {pagesToDelete.length} Selected {pagesToDelete.length === 1 ? 'Page' : 'Pages'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
