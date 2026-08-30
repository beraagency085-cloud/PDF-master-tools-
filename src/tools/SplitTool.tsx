import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ResultScreen } from '../components/ResultScreen';
import { splitPdfByRanges, loadPdfDocument } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { createAndDownloadZip } from '../utils/formatters';
import { Scissors, Layers, CheckSquare, ListFilter, Loader2, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';

export const SplitTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'every' | 'selected' | 'ranges'>('ranges');
  const [rangeInput, setRangeInput] = useState('1-2, 3-4');
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    if (selected) {
      try {
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
        setSelectedPages([1]);
        if (doc.numPages > 1) {
          const mid = Math.ceil(doc.numPages / 2);
          setRangeInput(`1-${mid}, ${mid + 1}-${doc.numPages}`);
        } else {
          setRangeInput('1');
        }
      } catch (e) {
        console.error('Error reading PDF pages:', e);
      }
    }
  };

  const parseRanges = (input: string): { start: number; end: number }[] => {
    const rawParts = input.split(',').map((s) => s.trim()).filter(Boolean);
    const parsed: { start: number; end: number }[] = [];

    for (const part of rawParts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e)) {
          parsed.push({ start: Math.min(s, e), end: Math.max(s, e) });
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p)) {
          parsed.push({ start: p, end: p });
        }
      }
    }
    return parsed;
  };

  const handleSplit = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      let rangesToExtract: { start: number; end: number }[] = [];

      if (mode === 'every') {
        for (let i = 1; i <= totalPages; i++) {
          rangesToExtract.push({ start: i, end: i });
        }
      } else if (mode === 'selected') {
        if (selectedPages.length === 0) {
          throw new Error('Please select at least one page to extract.');
        }
        rangesToExtract = selectedPages.map((p) => ({ start: p, end: p }));
      } else {
        // Custom ranges
        rangesToExtract = parseRanges(rangeInput);
        if (rangesToExtract.length === 0) {
          throw new Error('Please enter valid page ranges (e.g., 1-5, 6-10).');
        }
      }

      const splitFiles = await splitPdfByRanges(file, rangesToExtract);

      if (splitFiles.length === 1) {
        const single = splitFiles[0];
        const downloadUrl = URL.createObjectURL(single.blob);
        setResult({
          blob: single.blob,
          fileName: single.fileName,
          originalSize: file.size,
          newSize: single.blob.size,
          downloadUrl,
        });
      } else {
        // Multiple files -> Bundle into ZIP
        const zip = new JSZip();
        splitFiles.forEach((f) => zip.file(f.fileName, f.blob));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
        const downloadUrl = URL.createObjectURL(zipBlob);

        setResult({
          blob: zipBlob,
          fileName: `${nameWithoutExt}_split_pages.zip`,
          originalSize: file.size,
          newSize: zipBlob.size,
          downloadUrl,
          isZip: true,
        });
      }
    } catch (err: any) {
      console.error('Split error:', err);
      setError(err.message || 'Failed to split PDF.');
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
        toolTitle="PDF Split"
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
          title="Select PDF file to split"
          subtitle="Split every page, extract specific pages, or divide by ranges"
          buttonText="Select PDF File"
        />
      ) : (
        <div className="space-y-6">
          {/* File summary & Mode selector */}
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

          {/* Modes Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMode('ranges')}
              className={`flex items-center space-x-2.5 p-3.5 rounded-2xl border-2 transition-all text-left ${
                mode === 'ranges'
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs font-bold text-blue-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <ListFilter className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Split by Ranges</p>
                <p className="text-[10px] text-slate-400 font-normal">e.g. 1-5, 6-10</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('selected')}
              className={`flex items-center space-x-2.5 p-3.5 rounded-2xl border-2 transition-all text-left ${
                mode === 'selected'
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs font-bold text-blue-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Extract Selected</p>
                <p className="text-[10px] text-slate-400 font-normal">Pick pages on screen</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('every')}
              className={`flex items-center space-x-2.5 p-3.5 rounded-2xl border-2 transition-all text-left ${
                mode === 'every'
                  ? 'border-blue-600 bg-blue-50/50 shadow-2xs font-bold text-blue-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Split Every Page</p>
                <p className="text-[10px] text-slate-400 font-normal">1 PDF per page</p>
              </div>
            </button>
          </div>

          {/* Mode Configuration details */}
          {mode === 'ranges' && (
            <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Enter Custom Page Ranges (separated by comma):
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 4-8, 9-12"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-slate-400">
                Example: If your document has 10 pages, entering &quot;1-4, 5-10&quot; creates two separate PDFs.
              </p>
            </div>
          )}

          {mode === 'selected' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Click pages below to toggle selection for extraction:
              </p>
              <PageThumbnailGrid
                file={file}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
                allowSelection={true}
              />
            </div>
          )}

          {mode === 'every' && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-800 leading-relaxed">
              Every page in this {totalPages}-page document will be exported into an individual PDF file and bundled into a fast ZIP download.
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={handleSplit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-gradient-indigo btn-shimmer px-6 py-4.5 text-base font-bold text-white shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[56px] cursor-pointer"
              id="start-split-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Splitting PDF pages...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  <span>Split PDF Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
