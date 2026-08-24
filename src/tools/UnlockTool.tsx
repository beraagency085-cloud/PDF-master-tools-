import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { unlockPdf } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Unlock, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export const UnlockTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    if (!authorized) {
      setError('Please check the authorization box confirming you are the document owner or permitted to unlock this file.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const unlockedBlob = await unlockPdf(file, password);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(unlockedBlob);

      setResult({
        blob: unlockedBlob,
        fileName: `${nameWithoutExt}_unlocked.pdf`,
        originalSize: file.size,
        newSize: unlockedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Unlock failed:', err);
      setError(err.message || 'Failed to remove restrictions. Please ensure the file is accessible.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setAuthorized(false);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Unlock"
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
          title="Select protected PDF file to unlock"
          subtitle="Remove restrictions, copying limits, and print locks"
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
                Operation: Remove Security & Permission Locks
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Current Password (If file requires password to open)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if only permission-restricted"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200/80 text-xs text-orange-900 space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="mt-0.5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                  id="authorized-checkbox"
                />
                <span>
                  I confirm that I have the legal right and authorization to access, unlock, and remove restrictions from this PDF document.
                </span>
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
              disabled={processing || !authorized}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-unlock-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Unlocking document...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Unlock & Remove Restrictions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
