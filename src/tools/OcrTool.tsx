import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { performOcr, OCR_LANGUAGES, SupportedOcrLanguage, OcrProgress } from '../services/ocrEngine';
import { ProcessedResult } from '../types';
import { Sparkles, Copy, Check, Download, FileText, Loader2, ArrowRight } from 'lucide-react';
import { downloadBlob } from '../utils/formatters';

export const OcrTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<SupportedOcrLanguage>('eng');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);
      setExtractedText('');

      const ocrResult = await performOcr(file, language, (p) => {
        setProgress(p);
      });

      setExtractedText(ocrResult.text);

      // Create text blob for download
      const txtBlob = new Blob([ocrResult.text], { type: 'text/plain;charset=utf-8' });
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const downloadUrl = URL.createObjectURL(txtBlob);

      setResult({
        blob: txtBlob,
        fileName: `${nameWithoutExt}_ocr_extracted.txt`,
        originalSize: file.size,
        newSize: txtBlob.size,
        downloadUrl,
        extractedText: ocrResult.text,
      });
    } catch (err: any) {
      console.error('OCR failed:', err);
      setError(err.message || 'OCR processing encountered an issue. Please ensure the document is clear and readable.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setExtractedText('');
    setProgress(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Optical Character Recognition (OCR)"
        onReset={handleReset}
        extractedText={extractedText}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {!file ? (
        <FileUploader
          acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.webp']}
          acceptedMimeTypes="application/pdf,image/jpeg,image/png,image/webp"
          multiple={false}
          files={file ? [file] : []}
          onFilesChange={(f) => setFile(f[0] || null)}
          title="Select scanned PDF or Image for OCR"
          subtitle="Supports English, Hindi, Bengali, Spanish, French, German, Arabic, Chinese"
          buttonText="Select File"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-sm">
                {file.name}
              </h3>
              <p className="text-xs text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" /> High-Accuracy Neural OCR
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Language Selector */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Select Document Language
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {OCR_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    language === lang.code
                      ? 'border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{lang.label}</p>
                  <p className="text-[11px] text-slate-400 font-normal">{lang.nativeLabel}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar when processing */}
          {processing && progress && (
            <div className="rounded-2xl bg-purple-50/80 p-5 border border-purple-200/90 space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>{progress.status}</span>
                <span>{Math.round(progress.progress * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-purple-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(progress.progress * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-purple-700">
                Processing optical character recognition inside your browser sandbox.
              </p>
            </div>
          )}

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
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl btn-gradient-purple btn-shimmer px-6 py-4.5 text-base font-bold text-white shadow-lg shadow-purple-600/25 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[56px] cursor-pointer"
              id="start-ocr-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scanning text in document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Extract Text with OCR</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
