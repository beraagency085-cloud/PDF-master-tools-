import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { mergePdfFiles } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Layers, ArrowUp, ArrowDown, Trash2, Plus, Loader2, ArrowRight, FileText } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...files];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setFiles(updated);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const updated = [...files];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least two PDF files to merge.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const mergedBlob = await mergePdfFiles(files);
      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
      const downloadUrl = URL.createObjectURL(mergedBlob);

      setResult({
        blob: mergedBlob,
        fileName: 'merged_document.pdf',
        originalSize: totalOriginalSize,
        newSize: mergedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(err.message || 'Failed to merge PDF files. Please ensure files are valid PDFs.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Merge"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {files.length === 0 ? (
        <FileUploader
          acceptedTypes={['.pdf']}
          acceptedMimeTypes="application/pdf"
          multiple={true}
          files={files}
          onFilesChange={setFiles}
          title="Select multiple PDF files to merge"
          subtitle="Combine reports, chapters, or receipts into one single file"
          buttonText="Select PDF Files"
        />
      ) : (
        <div className="space-y-6">
          {/* Header & Add More */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Arrange PDF Order ({files.length} Files)
              </h3>
              <p className="text-xs text-slate-500">
                Documents will be merged in the order listed below from top to bottom.
              </p>
            </div>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer transition-colors border border-slate-200">
              <Plus className="w-3.5 h-3.5" />
              <span>Add More PDFs</span>
              <input
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles([...files, ...Array.from(e.target.files)]);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1" id="merge-files-container">
            {files.map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate font-semibold text-sm text-slate-800" title={f.name}>
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{formatBytes(f.size)}</p>
                  </div>
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === files.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Merge Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={processing || files.length < 2}
              onClick={handleMerge}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-gradient-indigo btn-shimmer px-6 py-4.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[56px] cursor-pointer"
              id="start-merge-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merging PDF files...</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  <span>Merge {files.length} PDFs</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
