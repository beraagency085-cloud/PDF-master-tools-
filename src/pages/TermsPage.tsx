import React from 'react';
import { ShieldCheck, FileCheck, ArrowLeft, AlertCircle, Scale } from 'lucide-react';
import { ToolId } from '../types';

interface TermsPageProps {
  onBackToHome: () => void;
  onSelectTool?: (toolId: ToolId) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          <Scale className="w-3.5 h-3.5 text-slate-600" />
          <span>Legal Agreement &amp; Fair Use</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: March 2026 • Effective Immediately
        </p>
      </div>

      {/* Main Content Box */}
      <div className="rounded-3xl bg-white p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-7 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">01.</span> Acceptance of Terms
          </h2>
          <p>
            By accessing or using <strong>PDFMaster Tools</strong> (available at{' '}
            <span className="font-semibold text-slate-800">www.pdftools.2bd.net</span> and affiliated mirrors, operated by Bera Agency / 2BD Network), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our utilities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">02.</span> Service Description &amp; Architecture
          </h2>
          <p>
            PDFMaster Tools provides free, browser-based document processing utilities including PDF compression, merging, splitting, file conversion (JPG, PNG, Word, Excel), page rotation, protection, watermarking, OCR text extraction, and page numbering.
          </p>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 font-medium space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Client-Side Processing Guarantee
            </p>
            <p className="text-xs text-emerald-900/90">
              All PDF manipulations are executed natively inside your device’s browser environment using WebAssembly and JavaScript. We do not store, view, log, or transmit the contents of your documents to any remote server.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">03.</span> User Responsibilities &amp; Fair Use
          </h2>
          <p>
            You agree to use PDFMaster Tools solely for lawful purposes. You retain 100% full copyright, title, and ownership of all files processed using this platform. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Process documents that violate copyright, trademark, or intellectual property rights of third parties without proper authorization.</li>
            <li>Attempt to reverse-engineer, inject malicious scripts, or disrupt the service infrastructure.</li>
            <li>Use automated scrapers or flood requests that degrade the client-side experience for other users.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">04.</span> No AI Model Training Clause
          </h2>
          <p>
            We strictly pledge that <strong>none of your documents, text, images, or metadata</strong> are ever harvested, sold, or used to train public or private artificial intelligence (AI) or machine learning models. Your files remain exclusively under your control in local memory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">05.</span> Disclaimer of Warranties
          </h2>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While our algorithms are thoroughly tested to preserve document layout fidelity, Bera Agency / 2BD Network shall not be liable for any data corruption, browser crash, or loss resulting from local hardware or memory limitations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">06.</span> Advertising &amp; Third-Party Services
          </h2>
          <p>
            To keep PDFMaster Tools free without paywalls or subscription tiers, our site may display non-intrusive banner advertisements provided by Google AdSense and accredited ad networks. Interaction with these advertisements is governed by the respective providers’ policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-red-600 font-mono">07.</span> Contact &amp; Governance
          </h2>
          <p>
            These terms shall be governed by applicable digital commerce laws. For any legal inquiries, copyright notices, or questions regarding these terms, please contact us at:
          </p>
          <div className="pt-2">
            <p className="font-bold text-slate-900">Bera Agency / 2BD Network</p>
            <p className="text-slate-600">Email: <a href="mailto:beraagency085@gmail.com" className="text-red-600 underline">beraagency085@gmail.com</a></p>
            <p className="text-slate-500 text-xs mt-0.5">Website: www.pdftools.2bd.net</p>
          </div>
        </section>
      </div>
    </div>
  );
};
