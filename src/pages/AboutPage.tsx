import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Heart,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Server,
  Zap,
  Award,
  Users,
  Building,
} from 'lucide-react';
import { ToolId } from '../types';

interface AboutPageProps {
  onBackToHome: () => void;
  onSelectTool: (tool: ToolId) => void;
  onNavigatePage?: (page: 'contact' | 'privacy' | 'terms') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onSelectTool, onNavigatePage }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      {/* Hero */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <Award className="w-3.5 h-3.5 text-red-600" />
          <span>About PDFMaster Tools</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Built for Speed, Privacy &amp; Everyday Productivity
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The all-in-one browser-first PDF suite built to give everyone fast, unrestricted, and strictly confidential document tools without paywalls.
        </p>
      </div>

      {/* Mission */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Most online PDF converters upload your private tax documents, legal contracts, medical reports, and confidential financial statements to third-party remote cloud servers. At <strong>PDFMaster Tools</strong> (www.pdftools.2bd.net), we chose an entirely different architectural philosophy: <em>100% Client-Side WebAssembly execution</em>.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          When you compress, merge, split, rotate, convert, watermark, or OCR a PDF here, all computation is executed locally inside your device’s browser sandbox. Your files never cross network wires, guaranteeing complete and verifiable confidentiality.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Zero Server Uploads</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All algorithms run inside your browser. No server storage, no database copies, and zero data logging.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Native Hardware Power</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Utilizes modern WebAssembly and Web Workers for multithreaded processing directly on your device CPU.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">No AI Training</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your documents are never used, trained on, or scraped by artificial intelligence or LLM models.
          </p>
        </div>
      </div>

      {/* Technical Comparison Table */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          How We Compare to Traditional Cloud Converters
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 pr-4 font-bold">Feature</th>
                <th className="py-3 px-4 font-bold text-red-600 bg-red-50/50 rounded-t-lg">PDFMaster Tools</th>
                <th className="py-3 pl-4 font-bold">Standard Cloud Converters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-slate-800">Processing Location</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 bg-red-50/20">Your Device (Local RAM)</td>
                <td className="py-3.5 pl-4 text-slate-500">Remote Cloud Servers</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-slate-800">Server Retention Time</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 bg-red-50/20">0 Seconds (Never uploaded)</td>
                <td className="py-3.5 pl-4 text-slate-500">1 to 24 Hours on Cloud Disks</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-slate-800">AI Model Training</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 bg-red-50/20">Never — Strictly Prohibited</td>
                <td className="py-3.5 pl-4 text-slate-500">Often ambiguous in privacy terms</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-slate-800">Registration / Sign-up</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 bg-red-50/20">No Sign-up Required</td>
                <td className="py-3.5 pl-4 text-slate-500">Forced email capture after 2 tasks</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-slate-800">Price / Watermarks</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 bg-red-50/20">100% Free • No Watermarks</td>
                <td className="py-3.5 pl-4 text-slate-500">Freemium limits &amp; paywalls</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization & Transparency */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <Building className="w-5 h-5" />
          <span>Organization &amp; Transparency</span>
        </div>
        <h3 className="text-xl font-bold">
          Operated by Bera Agency &amp; 2BD Network
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          PDFMaster Tools is managed and maintained by the software engineering team at <strong>Bera Agency</strong> as part of the <strong>2BD Network</strong> digital utilities ecosystem.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Official Domain:</span>
            <span className="font-mono text-slate-200">www.pdftools.2bd.net</span>
          </div>
          <div>
            <span className="text-slate-400 block">Support Contact:</span>
            <a href="mailto:beraagency085@gmail.com" className="text-red-400 hover:underline">
              beraagency085@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
