import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { compressPdfFile } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Minimize2, Zap, Sparkles, Shield, Loader2, ArrowRight } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const CompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      setError(null);

      const res = await compressPdfFile(file, level);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(res.blob);

      setResult({
        blob: res.blob,
        fileName: `${nameWithoutExt}_compressed.pdf`,
        originalSize: res.originalSize,
        newSize: res.newSize,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Compression failed:', err);
      setError(err.message || 'Failed to compress the PDF document. Please try a different file.');
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
        toolTitle="PDF Compression"
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
          onFilesChange={(files) => setFile(files[0] || null)}
          title="Select PDF file to compress"
          subtitle="Extreme, recommended, or high-fidelity compression in seconds"
          buttonText="Select PDF File"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                <Minimize2 className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <h3 className="truncate font-bold text-slate-800 text-sm sm:text-base">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Original Size: {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-800 block">
              Select Compression Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Extreme */}
              <div
                onClick={() => setLevel('extreme')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  level === 'extreme'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Extreme</span>
                  <Zap className={`w-4 h-4 ${level === 'extreme' ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Maximum file reduction. Optimal for email and web uploads.
                </p>
              </div>

              {/* Recommended */}
              <div
                onClick={() => setLevel('recommended')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  level === 'recommended'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 right-3 text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                  Recommended
                </span>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Recommended</span>
                  <Sparkles className={`w-4 h-4 ${level === 'recommended' ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Balanced size reduction with high visual fidelity.
                </p>
              </div>

              {/* Low */}
              <div
                onClick={() => setLevel('low')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  level === 'low'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Low</span>
                  <Shield className={`w-4 h-4 ${level === 'low' ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  High quality preservation with gentle stream optimization.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-compress-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compressing PDF locally...</span>
                </>
              ) : (
                <>
                  <span>Compress PDF Now</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
