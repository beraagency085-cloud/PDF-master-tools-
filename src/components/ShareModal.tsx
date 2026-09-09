import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  FileText,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  isWebShareSupported,
  shareProcessedFile,
  sharePageUrl,
  copyToClipboard,
  getSocialShareUrls,
  createFileFromBlob,
  canShareFile,
} from '../utils/shareUtils';
import { formatBytes } from '../utils/formatters';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  toolTitle?: string;
  blob?: Blob;
  fileName?: string;
  fileSize?: number;
  url?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  toolTitle = 'PDF Tool',
  blob,
  fileName,
  fileSize,
  url,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareHeading = title || (fileName ? `Share "${fileName}"` : `Share ${toolTitle}`);
  const hasFile = !!blob && !!fileName;
  const webShareAvailable = isWebShareSupported();

  // Check if file sharing specifically is supported
  let fileShareAvailable = false;
  if (hasFile && webShareAvailable) {
    try {
      const file = createFileFromBlob(blob, fileName);
      fileShareAvailable = canShareFile(file);
    } catch {
      fileShareAvailable = false;
    }
  }

  const handleNativeShareFile = async () => {
    if (!blob || !fileName) return;
    setIsSharing(true);
    setStatusMessage(null);

    const result = await shareProcessedFile({
      blob,
      fileName,
      title: fileName,
      url: currentUrl,
      text: `Processed "${fileName}" in-browser with PDFMaster.`,
    });

    setIsSharing(false);
    if (result.success) {
      setStatusMessage(result.message || 'Shared successfully!');
      if (result.method === 'clipboard') {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } else if (result.method !== 'aborted') {
      setStatusMessage(result.message || 'Share failed.');
    }
  };

  const handleNativeShareUrl = async () => {
    setIsSharing(true);
    setStatusMessage(null);

    const result = await sharePageUrl({
      title: toolTitle ? `${toolTitle} - PDFMaster` : 'PDFMaster Tools',
      text: `Try ${toolTitle} - 100% private, client-side PDF tool with zero server uploads:`,
      url: currentUrl,
    });

    setIsSharing(false);
    if (result.success) {
      setStatusMessage(result.message || 'Shared successfully!');
      if (result.method === 'clipboard') {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } else if (result.method !== 'aborted') {
      setStatusMessage(result.message || 'Share failed.');
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(currentUrl);
    if (ok) {
      setCopied(true);
      setStatusMessage('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      setStatusMessage('Failed to copy link.');
    }
  };

  const socialUrls = getSocialShareUrls(
    currentUrl,
    hasFile
      ? `Check out this processed file from ${toolTitle}:`
      : `Check out ${toolTitle} on PDFMaster:`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      id="share-modal-backdrop"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        id="share-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {shareHeading}
              </h3>
              <p className="text-xs text-slate-500">
                Share via device apps or copy link
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* File Card if available */}
          {hasFile && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs sm:text-sm text-slate-800 truncate" title={fileName}>
                    {fileName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {fileSize ? formatBytes(fileSize) : 'Ready to share'} • In-Browser Wasm
                  </p>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Private
              </span>
            </div>
          )}

          {/* Primary Native Web Share Buttons */}
          <div className="space-y-2.5">
            {hasFile && (
              <button
                type="button"
                onClick={handleNativeShareFile}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl btn-gradient-primary btn-shimmer text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                id="share-file-native-button"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  {fileShareAvailable
                    ? 'Share File via Device Apps'
                    : 'Share File / Link via Device'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNativeShareUrl}
              disabled={isSharing}
              className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 ${
                hasFile
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'btn-gradient-primary btn-shimmer text-white shadow-md hover:shadow-lg'
              }`}
              id="share-url-native-button"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Tool Page URL via Device</span>
            </button>
          </div>

          {/* Quick Copy Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Direct Link
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 p-1.5 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-600 outline-hidden font-mono select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
                id="copy-share-link-button"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Share directly to
            </span>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={socialUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 transition-colors"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-[10px] font-semibold">WhatsApp</span>
              </a>

              <a
                href={socialUrls.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/70 transition-colors"
                title="Share on Telegram"
              >
                <Send className="w-5 h-5 mb-1 text-sky-500" />
                <span className="text-[10px] font-semibold">Telegram</span>
              </a>

              <a
                href={socialUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70 transition-colors"
                title="Share on X / Twitter"
              >
                <ExternalLink className="w-5 h-5 mb-1 text-slate-700" />
                <span className="text-[10px] font-semibold">X / Twitter</span>
              </a>

              <a
                href={socialUrls.email}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 transition-colors"
                title="Share via Email"
              >
                <Mail className="w-5 h-5 mb-1 text-rose-600" />
                <span className="text-[10px] font-semibold">Email</span>
              </a>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold text-center animate-fade-in ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Web Share API enabled</span>
          </span>
          <span className="text-emerald-700 font-medium">100% Client-Side</span>
        </div>
      </div>
    </div>
  );
};
