import React from 'react';
import { ShieldCheck, Cpu, Heart, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { ToolId } from '../types';

interface AboutPageProps {
  onBackToHome: () => void;
  onSelectTool: (tool: ToolId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome, onSelectTool }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About PDFMaster Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The all-in-one browser-first PDF suite built to give everyone fast, unrestricted, and strictly private document tools.
        </p>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-md p-8 border border-slate-200/90 shadow-sm space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Most online PDF converters upload your private tax documents, contracts, medical records, and bank statements to third-party remote cloud servers. At <strong>PDFMaster Tools</strong>, we took an entirely different architectural approach: <em>100% Client-Side WebAssembly &amp; JavaScript execution</em>.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          When you compress, merge, split, rotate, convert, or OCR a PDF here, all processing is computed natively on your phone or laptop’s CPU. Your files are never transmitted across the network, guaranteeing total confidentiality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Zero Server Uploads</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All algorithms execute inside your browser sandbox. Nobody can see, log, or steal your data.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">High-Fidelity Engine</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Powered by industry-standard PDF parsing and rendering engines ensuring vector-sharp results.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Completely Free</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No subscriptions, no page limits, no artificial watermarks, and no sign-up requirements.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/95 backdrop-blur-md text-white p-8 text-center space-y-4 shadow-sm border border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold">Ready to process your documents?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Choose from over 18 PDF tools designed for students, educators, lawyers, and business professionals.
        </p>
        <button
          onClick={onBackToHome}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-red-600 font-semibold text-xs sm:text-sm text-white hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors"
        >
          Explore All Tools
        </button>
      </div>
    </div>
  );
};
