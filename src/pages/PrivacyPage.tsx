import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 backdrop-blur-xs text-emerald-700 text-xs font-semibold border border-emerald-200/80 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Zero-Knowledge Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy &amp; Security Guarantee
        </h1>
        <p className="text-xs text-slate-400">Last updated: Current</p>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-md p-8 border border-slate-200/90 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Client-Side Only Data Processing</h2>
        <p>
          At <strong>PDFMaster Tools</strong>, user privacy is our foremost priority. Unlike traditional cloud converter websites, <strong>all PDF manipulation algorithms run entirely within your web browser</strong> using JavaScript and WebAssembly.
        </p>
        <p>
          When you select or drop a file into PDFMaster Tools, the file remains in your device’s local memory (RAM). It is never sent to our servers, uploaded to any third-party storage cloud, or indexed.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">2. No File Retention or Logging</h2>
        <p>
          Because your files are never transmitted to our servers, it is technically impossible for us to store, read, copy, or retain any of your documents, photos, spreadsheets, or extracted OCR text. Once you close your browser tab or click &quot;Process Another File&quot;, the in-memory buffer is immediately released by your browser.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">3. Analytics &amp; Cookies</h2>
        <p>
          We do not track user identities or personal data. We may use privacy-preserving, anonymous metrics to understand aggregate website performance and tool usage.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">4. Advertising Disclosures (Google AdSense)</h2>
        <p>
          To keep this service 100% free for everyone, we display non-intrusive banner advertisements. Third-party advertising partners such as Google AdSense may use cookies to serve ads based on prior visits. You may opt out of personalized advertising by visiting Google Ad Settings.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">5. Contact Us</h2>
        <p>
          If you have questions regarding our privacy architecture or have feedback for our developer team, please reach out via our support channels.
        </p>
      </div>
    </div>
  );
};
