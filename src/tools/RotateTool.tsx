import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ResultScreen } from '../components/ResultScreen';
import { rotatePdfPages, loadPdfDocument } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { RotateCw, RotateCcw, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

export const RotateTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [globalAngle, setGlobalAngle] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    setGlobalAngle(0);
    setPageRotations({});
    if (selected) {
      try {
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
      } catch (e) {
        console.error('Error loading PDF:', e);
      }
    }
  };

  const handleRotateAll = (delta: number) => {
    const nextAngle = (globalAngle + delta) % 360;
    setGlobalAngle(nextAngle);
    const updated: Record<number, number> = {};
    for (let i = 0; i < totalPages; i++) {
      updated[i] = ((pageRotations[i] || 0) + delta) % 360;
    }
    setPageRotations(updated);
  };

  const handleSinglePageRotate = (pageIndex: number, newAngle: number) => {
    setPageRotations({
      ...pageRotations,
      [pageIndex]: newAngle,
    });
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const rotatedBlob = await rotatePdfPages(file, 0 as any, pageRotations);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(rotatedBlob);

      setResult({
        blob: rotatedBlob,
        fileName: `${nameWithoutExt}_rotated.pdf`,
        originalSize: file.size,
        newSize: rotatedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Rotate failed:', err);
      setError(err.message || 'Failed to rotate PDF document.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setGlobalAngle(0);
    setPageRotations({});
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Rotation"
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
          title="Select PDF file to rotate"
          subtitle="Rotate all pages or customize orientation for individual pages"
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
                Total Pages: {totalPages}
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Quick Global Rotate Controls */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rotate All Pages At Once
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shadow-xs"
              >
                <RotateCw className="w-4 h-4 text-violet-600" />
                <span>Rotate 90° Clockwise</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateAll(270)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-violet-600" />
                <span>Rotate 90° Counter-Clockwise</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateAll(180)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-violet-600" />
                <span>Rotate 180° (Upside Down)</span>
              </button>
            </div>
          </div>

          {/* Individual Page Thumbnails */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              You can also click &quot;Rotate&quot; under any individual page thumbnail below:
            </p>
            <PageThumbnailGrid
              file={file}
              selectedPages={[]}
              allowSelection={false}
              allowRotation={true}
              pageRotations={pageRotations}
              onPageRotate={handleSinglePageRotate}
            />
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
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-rotate-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving rotated PDF...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" />
                  <span>Save Rotated PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
