import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowLeft, Clock, EyeOff, Bot, Globe } from 'lucide-react';

interface PrivacyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Zero-Knowledge Client-Side Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy &amp; Security Guarantee
        </h1>
        <p className="text-xs text-slate-400">
          Last updated: March 2026 • Verified Zero-Server Storage
        </p>
      </div>

      {/* 4 Trust Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <Clock className="w-5 h-5 text-red-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900">0s Server Retention</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Your files are never saved to our server disks. RAM buffers are instantly purged when you close the tab.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <EyeOff className="w-5 h-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900">Zero Document Access</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Nobody can read, open, or inspect your private contracts, tax returns, medical files, or bank statements.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <Bot className="w-5 h-5 text-purple-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900">No AI Training</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Your documents are never fed into or scraped by artificial intelligence or machine learning models.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <Globe className="w-5 h-5 text-blue-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-900">256-bit HTTPS</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            All code delivery is end-to-end encrypted with top-tier TLS/SSL encryption certificates.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Client-Side Only Data Processing</h2>
        <p>
          At <strong>PDFMaster Tools</strong> (www.pdftools.2bd.net, operated by Bera Agency / 2BD Network), user privacy is our foundational promise. Unlike traditional online converters that upload your confidential files to remote cloud servers, <strong>all PDF manipulation algorithms run entirely within your web browser</strong> using WebAssembly and local JavaScript.
        </p>
        <p>
          When you drag, drop, or select a file, the file data stays exclusively inside your browser sandbox. <strong>No file payload is transmitted over the internet to our backend servers.</strong>
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">2. File Deletion &amp; Memory Purging</h2>
        <p>
          Because no files ever reach our servers, <strong>server retention time is exactly 0 seconds</strong>. Local memory buffers stored in your browser are automatically released:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Immediately upon clicking &quot;Process Another File&quot; or resetting the tool.</li>
          <li>Immediately upon navigating away or refreshing the webpage.</li>
          <li>When you close your browser tab or window.</li>
        </ul>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">3. Strict &quot;No AI Training&quot; Policy</h2>
        <p>
          We expressly guarantee that <strong>we do not use, harvest, scan, or sell your documents</strong> to train or fine-tune public, commercial, or private AI models (such as LLMs, OCR models, or computer vision networks). Your intellectual property and personal secrets remain 100% yours.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">4. Analytics &amp; Cookies</h2>
        <p>
          We use strictly anonymous, privacy-focused metrics to monitor aggregate bandwidth and site health (e.g. error rates, tool popularity). We never track individual identity, IP addresses, or document filenames.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">5. Advertising Disclosures (Google AdSense)</h2>
        <p>
          To maintain PDFMaster Tools as an entirely free utility with zero paywalls, we display non-intrusive banner advertisements provided by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to websites. You can manage or disable personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-red-600 underline">Google Ads Settings</a>.
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">6. Compliance with International Standards</h2>
        <p>
          Because we never collect, store, or process personal data on remote servers, our zero-knowledge architecture inherently complies with the core data minimization mandates of the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>

        <h2 className="text-base sm:text-lg font-bold text-slate-900">7. Contact the Privacy Team</h2>
        <p>
          If you have technical questions regarding our WebAssembly architecture or need compliance documentation, contact our data protection team at:
        </p>
        <div className="pt-1">
          <p className="font-bold text-slate-900">Bera Agency / 2BD Network — Privacy Office</p>
          <p className="text-slate-600">Email: <a href="mailto:beraagency085@gmail.com" className="text-red-600 underline">beraagency085@gmail.com</a></p>
          <p className="text-slate-500 text-xs">Official Domain: www.pdftools.2bd.net</p>
        </div>
      </div>
    </div>
  );
};
