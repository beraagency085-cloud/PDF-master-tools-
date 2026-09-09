import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  ArrowLeft,
  Copy,
  Check,
  FileCheck,
  Share2,
  Smartphone,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { ProcessedResult } from '../types';
import { formatBytes, downloadBlob } from '../utils/formatters';
import { AdSlot } from './AdSlot';
import { ShareButton } from './ShareButton';
import { ShareModal } from './ShareModal';
import { copyToClipboard } from '../utils/shareUtils';

interface ResultScreenProps {
  result: ProcessedResult;
  toolTitle: string;
  onReset: () => void;
  extractedText?: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  toolTitle,
  onReset,
  extractedText,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignored if confetti fails in iframe
    }
  }, []);

  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName);
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const hasReduction = result.originalSize > 0 && result.newSize > 0 && result.newSize < result.originalSize;
  const reductionPercent = hasReduction
    ? Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)
    : 0;

  const getDownloadLabel = () => {
    if (result.isZip) return 'ZIP Archive';
    const ext = result.fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'docx') return 'Word (.docx)';
    if (ext === 'xlsx') return 'Excel (.xlsx)';
    if (ext === 'jpg' || ext === 'jpeg') return 'JPG Image';
    if (ext === 'png') return 'PNG Image';
    if (ext === 'txt') return 'Text File';
    return 'File';
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6" id="result-screen">
      {/* Celebration Header Card */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/90 p-8 sm:p-10 shadow-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5 border border-emerald-100/80 shadow-xs">
          <CheckCircle2 className="h-12 w-12 stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 backdrop-blur-xs text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3 border border-emerald-200/80 shadow-2xs">
          <Check className="w-3.5 h-3.5" /> Processing Complete
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your file is ready for download!
        </h2>

        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          {toolTitle} operation finished successfully. Your file has been processed locally on your device.
        </p>

        {/* File Details Comparison Box */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Generated File
            </p>
            <p className="mt-1 font-bold text-slate-800 truncate text-base" title={result.fileName}>
              {result.fileName}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-700 bg-white/90 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                {formatBytes(result.newSize)}
              </span>
              {result.pageCount && (
                <span className="text-xs text-slate-500 font-medium">
                  {result.pageCount} {result.pageCount === 1 ? 'page' : 'pages'}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Original Size
            </p>
            <p className="mt-1 font-bold text-slate-800 text-base">
              {formatBytes(result.originalSize)}
            </p>
            {hasReduction ? (
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                <span>Reduced by {reductionPercent}%</span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-400">Standard optimization applied</div>
            )}
          </div>
        </div>

        {/* Primary Action Buttons with Color Grading and Effects */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl btn-gradient-primary btn-shimmer px-8 py-4.5 text-base sm:text-lg font-extrabold text-white shadow-[0_8px_25px_rgba(220,38,38,0.35)] hover:shadow-[0_12px_32px_rgba(220,38,38,0.5)] active:scale-[0.98] transition-all min-h-[56px] cursor-pointer"
            id="download-result-button"
          >
            <Download className="w-5 h-5 stroke-[2.8] group-hover:translate-y-0.5 transition-transform" />
            <span>Download {getDownloadLabel()}</span>
          </button>

          {/* Web Share API: Share File Button */}
          <ShareButton
            mode="file"
            blob={result.blob}
            fileName={result.fileName}
            fileSize={result.newSize}
            toolTitle={toolTitle}
            variant="outline"
            size="lg"
            label="Share File"
            className="w-full sm:w-auto min-h-[56px] px-7 py-4.5 text-sm sm:text-base font-bold bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer"
            id="share-file-result-button"
          />

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-50 to-white hover:from-white hover:to-slate-100/90 px-6 py-4.5 text-sm sm:text-base font-bold text-slate-700 hover:text-slate-900 active:scale-[0.98] transition-all min-h-[56px] border-2 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md cursor-pointer"
            id="process-another-button"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Process Another File</span>
          </button>
        </div>

        {/* Quick Web Share API Bar: Direct Options for File or Tool URL */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <div className="rounded-2xl bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 border border-slate-200/80 p-4 sm:p-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Smartphone className="w-3.5 h-3.5 text-red-600" />
                  <span>Instant Device Sharing (Web Share API)</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Send this {getDownloadLabel()} directly to WhatsApp, Gmail, AirDrop, or Telegram without uploading to any server.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <ShareButton
                  mode="file"
                  blob={result.blob}
                  fileName={result.fileName}
                  fileSize={result.newSize}
                  toolTitle={toolTitle}
                  variant="secondary"
                  size="sm"
                  label="Share File"
                  id="quick-share-file-pill"
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                />

                <ShareButton
                  mode="url"
                  toolTitle={toolTitle}
                  variant="secondary"
                  size="sm"
                  label="Share Tool URL"
                  id="quick-share-url-pill"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OCR / Extracted Text Viewer if applicable */}
        {extractedText && (
          <div className="mt-8 text-left rounded-2xl bg-slate-900/95 backdrop-blur-md text-slate-100 p-5 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Extracted Text Content</span>
              </div>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors text-slate-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <pre className="text-xs font-mono leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-300 select-text p-2 bg-slate-950/60 rounded-lg">
              {extractedText}
            </pre>
          </div>
        )}
      </div>

      {/* Ad Placement */}
      <AdSlot format="banner" />

      {/* Back to tools button */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Process Another File</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.hash = '';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs transition-colors cursor-pointer"
          id="result-back-home-button"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to All Tools / হোমে ফিরে যান</span>
        </button>
      </div>
    </div>
  );
};
