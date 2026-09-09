import React, { useState } from 'react';
import { ToolDefinition, ToolId } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import {
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Lock,
  EyeOff,
  Bot,
  Zap,
  FileCheck,
  Cpu,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AdSlot } from './AdSlot';
import { useToolProcessing } from '../context/ToolProcessingContext';
import { ShareButton } from './ShareButton';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  onNavigateToTool: (toolId: ToolId) => void;
  onNavigateHome: () => void;
  isProcessing?: boolean;
  progress?: number;
  stage?: string;
  detail?: string;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  onNavigateToTool,
  onNavigateHome,
  isProcessing: propIsProcessing,
  progress: propProgress,
  stage: propStage,
  detail: propDetail,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const context = useToolProcessing();

  // Support both explicit props and shared context
  const activeProcessing = propIsProcessing !== undefined ? propIsProcessing : context.isProcessing;
  const activeProgress = propProgress !== undefined ? propProgress : context.progress;
  const activeStage = propStage || context.stage || 'Executing WebAssembly processing...';
  const activeDetail = propDetail || context.detail || 'Client-Side WebAssembly Sandbox • Zero Server Upload';
  const elapsedSeconds = context.elapsedSeconds;

  const relatedTools = TOOLS_DATA.filter((t) => t.id !== tool.id).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-900 pb-16 relative">
      {/* Smooth Sticky Top Ambient WebAssembly Progress Line */}
      {activeProcessing && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-900/10 backdrop-blur-xs overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 animate-progress-stripe transition-all duration-300 ease-out shadow-[0_0_12px_rgba(239,68,68,0.7)] relative"
            style={{ width: `${Math.max(5, activeProgress)}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff,0_0_12px_#10b981]" />
          </div>
        </div>
      )}

      {/* Top Breadcrumb & SEO Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          {/* Top Navigation & Back Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer group shrink-0 active:scale-95"
                id="tool-header-back-button"
                title="Return to All Tools / হোমে ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>← Back to All Tools / ব্যাকে যান</span>
              </button>

              <ShareButton
                mode="url"
                toolTitle={tool.title}
                variant="outline"
                size="sm"
                label="Share Tool"
                id="tool-header-share-button"
                className="bg-white/90 text-slate-700 hover:text-red-600 hover:border-red-200 shadow-2xs"
              />
            </div>

            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
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
          </div>

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

            {/* Privacy Badge & Wasm Status Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/90 backdrop-blur-xs border border-emerald-200/90 text-emerald-800 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% In-Browser Privacy • Zero Server Uploads</span>
              </div>
              {activeProcessing && (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono font-bold shadow-xs border border-slate-800 animate-fade-up">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Wasm Executing ({activeProgress}%)</span>
                </div>
              )}
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
          {/* Quick Return Bar */}
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer group"
              id="workspace-quick-back-btn"
              title="Return to Home / ব্যাকে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>← Back / ব্যাকে যান</span>
            </button>
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
              <ShareButton
                mode="url"
                toolTitle={tool.title}
                variant="minimal"
                size="sm"
                label="Share Tool"
                id="workspace-share-tool-btn"
                className="text-xs text-slate-500 hover:text-red-600 px-2 py-1"
              />
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>WebAssembly Engine</span>
              </span>
              <span>•</span>
              <span>100% In-Browser Privacy</span>
            </div>
          </div>

          {/* WebAssembly Processing Visual Feedback Card & Progress Animation */}
          {activeProcessing && (
            <div
              className="mb-8 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-700/80 shadow-2xl relative overflow-hidden animate-fade-up"
              id="wasm-processing-banner"
            >
              {/* Decorative ambient background glows */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Header line: Wasm Chip Badge, Status & Percent */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    {/* Animated CPU / Wasm Chip */}
                    <div className="relative p-3 rounded-xl bg-slate-800/90 border border-slate-700 shadow-inner flex items-center justify-center shrink-0">
                      <span className="absolute -inset-1 rounded-xl bg-emerald-500/20 animate-ping opacity-60 pointer-events-none" />
                      <Cpu className="w-5 h-5 text-emerald-400 animate-wasm-pulse" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                          WebAssembly Sandbox
                        </span>
                        {context.fileName && (
                          <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                            {context.fileName}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                        <span>{activeStage}</span>
                      </h3>
                    </div>
                  </div>

                  {/* Right Metrics: Counter & Timer */}
                  <div className="flex items-center space-x-4">
                    {elapsedSeconds > 0 && (
                      <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-300 font-mono bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{elapsedSeconds}s elapsed</span>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="font-mono text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 leading-none">
                        {activeProgress}%
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mt-1">
                        Execution Progress
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Smooth Progress Track */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-4 w-full bg-slate-950/90 rounded-full p-0.5 border border-slate-700/80 shadow-inner relative overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 animate-progress-stripe transition-all duration-300 ease-out relative shadow-sm"
                      style={{ width: `${Math.max(5, activeProgress)}%` }}
                    >
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#10b981]" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 gap-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{activeDetail}</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                      Direct RAM memory transform • 0 bytes uploaded
                    </span>
                  </div>
                </div>

                {/* Multi-step Wasm status pipeline */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div
                    className={`p-2 rounded-xl border transition-colors ${
                      activeProgress >= 20
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      {activeProgress >= 20 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>1. Wasm Runtime</span>
                    </div>
                    <div className="text-[9px] opacity-75">Binary engine init</div>
                  </div>
                  <div
                    className={`p-2 rounded-xl border transition-colors ${
                      activeProgress >= 65
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : activeProgress >= 20
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 animate-pulse'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      {activeProgress >= 65 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>2. RAM Transform</span>
                    </div>
                    <div className="text-[9px] opacity-75">In-browser chunk processing</div>
                  </div>
                  <div
                    className={`p-2 rounded-xl border transition-colors ${
                      activeProgress >= 95
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      {activeProgress >= 95 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>3. Pack Artifact</span>
                    </div>
                    <div className="text-[9px] opacity-75">Clean buffer export</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {children}

          {/* Bottom Back Button */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Tools / অন্যান্য টুলসে ফিরে যান</span>
            </button>
          </div>
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
            <button
              type="button"
              onClick={() => context.simulateProcessing(2800, `Simulating ${tool.title} WebAssembly processing...`)}
              disabled={activeProcessing}
              className="mt-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-600 hover:underline cursor-pointer disabled:opacity-40 transition-colors inline-flex items-center gap-1"
              title="Test WebAssembly smooth progress bar and loading animation"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Test Wasm Feedback</span>
            </button>
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
                    <div
                      className={`px-4 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40 transition-all duration-200 overflow-hidden ${
                        isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      {faq.answer}
                    </div>
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

        {/* Sponsored Partner Offers */}
        <AdSlot format="smartlink" className="mt-8" />
      </div>
    </div>
  );
};

