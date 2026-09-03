import React from 'react';
import {
  FileText,
  ShieldCheck,
  Heart,
  Zap,
  Lock,
  RefreshCw,
  Mail,
  Building,
  Clock,
  MapPin,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { ToolId } from '../types';
import { AdSlot } from './AdSlot';

interface FooterProps {
  onNavigateTool: (toolId: ToolId) => void;
  onNavigatePage: (page: 'home' | 'about' | 'contact' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTool, onNavigatePage }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 text-slate-500 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Ad Placement */}
        <AdSlot format="banner" className="mb-10" />

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200/80">
          {/* Brand & Ownership Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigatePage('home')}
              className="flex items-center space-x-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-red-500/20 group-hover:scale-105 transition-transform">
                <span>PDF</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                PDFMaster<span className="text-red-600">Tools</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              All-in-one free PDF utility platform. Compress, convert, merge, split, rotate, protect, watermark, and OCR documents directly inside your browser memory with zero cloud storage.
            </p>

            {/* Ownership & Support Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Building className="w-4 h-4 text-red-600" />
                <span>Operated by Bera Agency (2BD Network)</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Official Web: <strong className="text-slate-700">www.pdftools.2bd.net</strong>
              </p>
              <div className="flex items-center gap-2 text-slate-600 pt-1">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Support: <a href="mailto:beraagency085@gmail.com" className="text-red-600 hover:underline font-semibold">beraagency085@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Response Time SLA: Within 12–24 hours</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Privacy
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 text-[11px]">
                <Lock className="w-3.5 h-3.5" /> HTTPS 256-Bit SSL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200/80 text-[11px]">
                <Bot className="w-3.5 h-3.5" /> No AI Training
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
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Compress PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('merge-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Merge PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('split-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Split PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('jpg-to-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  JPG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-jpg')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  PDF to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-ocr')}
                  className="hover:text-red-600 transition-colors text-left font-medium text-purple-600 cursor-pointer"
                >
                  PDF OCR Extractor
                </button>
              </li>
            </ul>
          </div>

          {/* Convert & Edit Tools */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Convert &amp; Edit
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-word')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  PDF to Word (DOCX)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('word-to-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Word to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('pdf-to-excel')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  PDF to Excel (XLSX)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('excel-to-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Excel to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('rotate-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Rotate PDF Pages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('watermark-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  PDF Watermark
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTool('protect-pdf')}
                  className="hover:text-red-600 transition-colors text-left cursor-pointer"
                >
                  Protect PDF Password
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Company Pages (Prominently Visible) */}
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Trust &amp; Transparency
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigatePage('privacy')}
                  className="hover:text-red-600 transition-colors font-bold text-emerald-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('terms')}
                  className="hover:text-red-600 transition-colors font-medium text-slate-700 cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-red-600 transition-colors font-medium text-slate-700 cursor-pointer"
                >
                  About PDFMaster Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('contact')}
                  className="hover:text-red-600 transition-colors font-bold text-red-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact &amp; Support</span>
                </button>
              </li>
              <li className="pt-2 border-t border-slate-100">
                <a
                  href="#faq"
                  onClick={() => onNavigatePage('home')}
                  className="hover:text-red-600 transition-colors text-slate-500 cursor-pointer block"
                >
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & privacy statement */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Your files never leave your device. 0s Server Retention.
            </span>
            <span className="hidden sm:inline">•</span>
            <span>© {new Date().getFullYear()} PDFMaster Tools. Bera Agency / 2BD Network. All rights reserved.</span>
          </div>

          <nav className="flex flex-wrap gap-4 uppercase tracking-wider font-bold text-[11px]">
            <button
              onClick={() => onNavigatePage('privacy')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigatePage('terms')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigatePage('about')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigatePage('contact')}
              className="hover:text-red-600 text-red-600 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
};
