import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { convertWordDocxToPdf } from '../services/officeEngine';
import { ProcessedResult } from '../types';
import { FileType, Loader2, ArrowRight } from 'lucide-react';

export const WordToPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleConvert = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const pdfBlob = await convertWordDocxToPdf(file);
      const nameWithoutExt = file.name.replace(/\.(docx|doc)$/i, '');
      const downloadUrl = URL.createObjectURL(pdfBlob);

      setResult({
        blob: pdfBlob,
        fileName: `${nameWithoutExt}.pdf`,
        originalSize: file.size,
        newSize: pdfBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Word to PDF failed:', err);
      setError(err.message || 'Failed to convert Word file to PDF. Please ensure file is a standard DOCX.');
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
        toolTitle="Word to PDF Conversion"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {!file ? (
        <FileUploader
          acceptedTypes={['.docx', '.doc']}
          acceptedMimeTypes="application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          multiple={false}
          files={file ? [file] : []}
          onFilesChange={(f) => setFile(f[0] || null)}
          title="Select Microsoft Word document (.docx)"
          subtitle="Convert Word document to clean, formatted PDF format"
          buttonText="Select Word File"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-sm">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Target Format: Standard PDF Document
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-word-to-pdf-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting DOCX to PDF...</span>
                </>
              ) : (
                <>
                  <FileType className="w-5 h-5" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
