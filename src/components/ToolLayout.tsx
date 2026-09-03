import React, { useState } from 'react';
import { ToolDefinition, ToolId } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import {
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Lock,
  EyeOff,
  Bot,
  Zap,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { AdSlot } from './AdSlot';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  onNavigateToTool: (toolId: ToolId) => void;
  onNavigateHome: () => void;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  onNavigateToTool,
  onNavigateHome,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const relatedTools = TOOLS_DATA.filter((t) => t.id !== tool.id).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-900 pb-16">
      {/* Top Breadcrumb & SEO Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-3" aria-label="Breadcrumb">
            <button
              onClick={onNavigateHome}
              className="hover:text-red-600 transition-colors font-medium cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="capitalize text-slate-400">{tool.category.replace('-', ' ')}</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{tool.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {tool.seo.h1}
                </h1>
                {tool.badge && (
                  <span className="rounded-md bg-red-50 text-red-700 font-bold text-[10px] uppercase px-2 py-0.5 border border-red-100">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* Privacy Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/90 backdrop-blur-xs border border-emerald-200/90 text-emerald-800 text-xs font-semibold self-start md:self-auto shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% In-Browser Privacy • Zero Server Uploads</span>
            </div>
          </div>

          {/* Quick Trust Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span><strong>File Retention:</strong> 0s (Instant RAM purge)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span><strong>Security:</strong> HTTPS 256-bit encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-blue-500" />
              <span><strong>Storage:</strong> No cloud storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              <span><strong>AI Safety:</strong> Zero AI training</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        {/* Workspace Card */}
        <div
          className="rounded-3xl bg-white/90 backdrop-blur-md p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-8"
          id="tool-workspace"
        >
          {children}
        </div>

        {/* Technical Specification Box */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-5 border border-slate-200/80 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Supported Formats
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md inline-block">
              {tool.acceptedFileTypes.join(', ')}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Max File Size
            </span>
            <span className="text-xs font-bold text-slate-800">
              Up to 100MB+ (Client RAM)
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Processing Speed
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5" /> &lt; 2 seconds avg
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Execution Architecture
            </span>
            <span className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> WebAssembly Wasm
            </span>
          </div>
        </div>

        {/* Ad Placement between tool and how-to */}
        <AdSlot format="banner" />

        {/* How-To Guide Section */}
        {tool.seo.howToSteps && tool.seo.howToSteps.length > 0 && (
          <div
            className="my-10 rounded-3xl bg-white/80 backdrop-blur-md p-6 sm:p-8 border border-slate-200/90 shadow-sm"
            id="how-to-section"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">
              How to use {tool.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Follow these simple steps to process your file safely in seconds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tool.seo.howToSteps.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col rounded-2xl bg-white/80 backdrop-blur-xs p-5 border border-slate-200/80 shadow-xs"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-extrabold text-xs mb-3 shadow-xs">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust & Guarantee Box */}
        <div className="my-8 rounded-3xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50 p-6 sm:p-7 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Zero-Storage Guarantee for {tool.title}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Your files never leave your device. All computation happens in your local browser sandbox. Once you close this window, all data is automatically erased from memory.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="shrink-0 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Explore All 18+ Tools →
          </button>
        </div>

        {/* FAQ Section */}
        {tool.seo.faqs && tool.seo.faqs.length > 0 && (
          <div
            className="my-10 rounded-3xl bg-white/80 backdrop-blur-md p-6 sm:p-8 border border-slate-200/90 shadow-sm"
            id="faq-section"
          >
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Frequently Asked Questions about {tool.title}
              </h2>
            </div>

            <div className="space-y-3">
              {tool.seo.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200/90 bg-white/80 backdrop-blur-xs overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-slate-800 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-red-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Tools Grid */}
        <div className="my-10" id="related-tools-section">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Related PDF Tools You Might Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onNavigateToTool(t.id)}
                className="group flex flex-col items-start p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/90 hover:border-red-200 hover:shadow-md transition-all text-left cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 group-hover:text-red-600 transition-colors">
                  {t.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {t.description}
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-red-600">
                  <span>Open tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
