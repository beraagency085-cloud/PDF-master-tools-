import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { addPageNumbersToPdf } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Hash, Loader2, ArrowRight } from 'lucide-react';

export const PageNumberTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  >('bottom-center');
  const [format, setFormat] = useState<'Page {n}' | '{n} of {total}' | '{n}' | '- {n} -'>(
    'Page {n}'
  );
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const numberedBlob = await addPageNumbersToPdf(file, {
        position,
        format,
        fontSize,
        startFrom,
      });

      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(numberedBlob);

      setResult({
        blob: numberedBlob,
        fileName: `${nameWithoutExt}_numbered.pdf`,
        originalSize: file.size,
        newSize: numberedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Page numbering failed:', err);
      setError(err.message || 'Failed to add page numbers to PDF.');
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
        toolTitle="PDF Page Numbering"
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
          title="Select PDF file to add page numbers"
          subtitle="Insert clean, customizable page numbers in headers or footers"
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
                Position: {position.replace('-', ' ').toUpperCase()} • Format: {format}
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Configuration Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Page Number Styling & Placement
            </h4>

            {/* Visual 6-box position selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Header / Footer Position
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto p-3 bg-slate-100 rounded-2xl border border-slate-200">
                {(
                  [
                    'top-left',
                    'top-center',
                    'top-right',
                    'bottom-left',
                    'bottom-center',
                    'bottom-right',
                  ] as const
                ).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold capitalize transition-all ${
                      position === pos
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Format */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Numbering Format
                </label>
                <select
                  value={format}
                  onChange={(e: any) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Page {n}">Page &#123;n&#125; (e.g. Page 1)</option>
                  <option value="{n} of {total}">&#123;n&#125; of &#123;total&#125; (e.g. 1 of 10)</option>
                  <option value="{n}">&#123;n&#125; (Just Number)</option>
                  <option value="- {n} -">- &#123;n&#125; - (Dashed)</option>
                </select>
              </div>

              {/* Start From */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  First Page Starts At
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={startFrom}
                  onChange={(e) => setStartFrom(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Font size */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value={9}>Small (9pt)</option>
                  <option value={11}>Normal (11pt)</option>
                  <option value={14}>Large (14pt)</option>
                </select>
              </div>
            </div>
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-page-numbers-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Numbering pages...</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>Add Page Numbers to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
