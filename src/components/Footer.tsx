import React from 'react';
import { FileText, ShieldCheck, Heart, Zap, Lock, RefreshCw } from 'lucide-react';
import { ToolId } from '../types';
import { AdSlot } from './AdSlot';

interface FooterProps {
  onNavigateTool: (toolId: ToolId) => void;
  onNavigatePage: (page: 'home' | 'about' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTool, onNavigatePage }) => {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 pt-12 pb-8 text-slate-500 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Ad Placement */}
        <AdSlot format="banner" className="mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigatePage('home')}
              className="flex items-center space-x-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-red-500/20 group-hover:scale-105 transition-transform">
                <span>PDF</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                PDFMaster<span className="text-red-600">Tools</span>
              </span>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              All-in-one free PDF utility platform. Compress, convert, merge, split, rotate, protect, watermark, and OCR documents directly inside your browser with 100% privacy.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/80 backdrop-blur-xs text-emerald-700 font-semibold border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Privacy
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/80 backdrop-blur-xs text-blue-700 font-semibold border border-blue-200/80">
                <Zap className="w-3.5 h-3.5" /> Instant Processing
              </span>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigateTool('compress-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Compress PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('merge-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Merge PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('split-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Split PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('jpg-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  JPG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-jpg')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-ocr')}
                  className="hover:text-red-600 transition-colors font-medium text-purple-600"
                >
                  PDF OCR Extractor
                </button>
              </li>
            </ul>
          </div>

          {/* Convert Tools */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Convert &amp; Edit
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-word')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to Word (DOCX)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('word-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Word to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-excel')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF to Excel (XLSX)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('excel-to-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Excel to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('rotate-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Rotate PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('watermark-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  PDF Watermark
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Security &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigatePage('privacy')}
                  className="hover:text-red-600 transition-colors font-semibold text-emerald-700"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-red-600 transition-colors"
                >
                  About PDFMaster
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('protect-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Protect PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('unlock-pdf')}
                  className="hover:text-red-600 transition-colors"
                >
                  Unlock PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('page-numbers')}
                  className="hover:text-red-600 transition-colors"
                >
                  Add Page Numbers
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & privacy statement */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <svg className="w-3 h-3 text-emerald-500 inline-block" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.9L9.03 9.125a2.5 2.5 0 001.94 0l6.864-4.225A1.246 1.246 0 0017.5 2.5H2.5c-.172 0-.332.035-.478.098a1.248 1.248 0 00.144 2.302zM18 7.324l-6.864 4.225a4 4 0 01-3.104 0L2 7.324V16.25A1.25 1.25 0 003.25 17.5h13.5A1.25 1.25 0 0018 16.25V7.324z" clipRule="evenodd" />
              </svg>
              Your files never leave your device. Client-side processing enabled.
            </span>
            <span className="hidden sm:inline">•</span>
            <span>© {new Date().getFullYear()} PDFMaster Tools.</span>
          </div>

          <nav className="flex gap-4 uppercase tracking-widest font-bold text-[11px]">
            <button onClick={() => onNavigatePage('privacy')} className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigatePage('about')} className="hover:text-slate-600 transition-colors">
              About
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
};
