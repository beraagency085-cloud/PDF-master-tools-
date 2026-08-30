import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { protectPdf } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export const ProtectTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    if (!password) {
      setError('Please enter a password to protect your PDF.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const protectedBlob = await protectPdf(file, password, {
        allowPrinting,
        allowCopying,
      });

      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(protectedBlob);

      setResult({
        blob: protectedBlob,
        fileName: `${nameWithoutExt}_protected.pdf`,
        originalSize: file.size,
        newSize: protectedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Protect failed:', err);
      setError(err.message || 'Failed to protect PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Password Protection"
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
          title="Select PDF file to protect"
          subtitle="Encrypt and password protect confidential documents"
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
                Security: 128/256-bit AES Standard Encryption
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Password Form Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Set Document Passwords & Permissions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Document Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                />
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPrinting}
                  onChange={(e) => setAllowPrinting(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span>Allow high-resolution document printing</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCopying}
                  onChange={(e) => setAllowCopying(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                <span>Allow copying text and graphic contents</span>
              </label>
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
              disabled={processing || !password}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 btn-shimmer px-6 py-4.5 text-base font-bold text-white shadow-lg shadow-slate-900/30 hover:from-slate-800 hover:to-slate-900 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[56px] cursor-pointer"
              id="start-protect-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Encrypting PDF...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>Protect PDF with Password</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
