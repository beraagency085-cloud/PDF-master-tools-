import React from 'react';
import { ShieldCheck, Sparkles, Globe2 } from 'lucide-react';
import { LanguageTranslator } from './LanguageTranslator';

export const TopBar: React.FC = () => {
  return (
    <div
      className="w-full bg-slate-950 text-slate-200 border-b border-slate-800/80 text-xs relative z-50 notranslate"
      id="site-top-bar"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Global & Trust message */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 font-bold text-[10px] sm:text-[11px] shrink-0">
            <Globe2 className="w-3 h-3 text-red-400" />
            <span>Asia &amp; Global</span>
          </div>

          <span className="hidden md:inline text-slate-300 text-[11px] truncate">
            🌍 Translate all tools, manuals &amp; FAQs into 60+ Asian and World languages
          </span>
          <span className="inline md:hidden text-slate-300 text-[11px] truncate">
            অনুবাদ ও বিশ্বস্ত পিডিএফ টুলস
          </span>
        </div>

        {/* Right: Security pill & Compact Language Translator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy</span>
          </div>

          {/* Compact Language Translator Selector at the very top */}
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
              Language / ভাষা:
            </span>
            <LanguageTranslator variant="topbar" />
          </div>
        </div>
      </div>
    </div>
  );
};
