import React, { useState, useEffect, useRef } from 'react';
import { Globe, Search, Check, ChevronDown, Sparkles, X, RotateCcw } from 'lucide-react';
import { LANGUAGES, LanguageOption } from '../data/languagesData';
import { getCurrentLanguageCode, translatePage } from '../utils/translator';

interface LanguageTranslatorProps {
  className?: string;
  variant?: 'compact' | 'navbar' | 'topbar' | 'inline';
}

export const LanguageTranslator: React.FC<LanguageTranslatorProps> = ({
  className = '',
  variant = 'topbar',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'asia' | 'world' | 'popular'>('all');
  const [currentCode, setCurrentCode] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync current language on mount
  useEffect(() => {
    setCurrentCode(getCurrentLanguageCode());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeLanguage =
    LANGUAGES.find((l) => l.code === currentCode) ||
    LANGUAGES.find((l) => l.code === 'en') ||
    LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter((lang) => {
    // Filter by tab
    if (activeTab === 'asia' && lang.region !== 'asia') return false;
    if (activeTab === 'world' && lang.region !== 'world') return false;
    if (activeTab === 'popular' && !lang.isPopular) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectLanguage = async (lang: LanguageOption) => {
    setIsTranslating(true);
    setCurrentCode(lang.code);
    setIsOpen(false);
    setSearchQuery('');

    await translatePage(lang.code);
    setIsTranslating(false);
  };

  const handleReset = async () => {
    setIsTranslating(true);
    setIsOpen(false);
    await translatePage('en');
    setIsTranslating(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block notranslate ${className}`}
      id="site-language-translator"
    >
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 transition-all cursor-pointer font-medium select-none ${
          variant === 'topbar'
            ? 'px-2.5 py-1 text-xs rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-2xs hover:border-slate-600'
            : variant === 'navbar'
            ? 'px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 shadow-2xs'
            : 'px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
        }`}
        title="Translate Website / ভাষা পরিবর্তন করুন"
        aria-expanded={isOpen}
      >
        <Globe
          className={`w-3.5 h-3.5 text-red-500 shrink-0 ${
            isTranslating ? 'animate-spin' : ''
          }`}
        />
        <span className="text-sm shrink-0">{activeLanguage.flag}</span>
        <span className="font-bold text-xs truncate max-w-[85px] sm:max-w-[120px]">
          {activeLanguage.nativeName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-red-500' : ''
          }`}
        />
      </button>

      {/* Floating Language Picker Popover / Modal */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] max-w-[95vw] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[100] p-3 sm:p-4 text-left animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Translate Website / ভাষা নির্বাচন করুন
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  এশিয়া ও বিশ্বের যেকোনো ভাষায় সম্পূর্ণ সাইট অনুবাদ করুন
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mt-2.5 mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language / ভাষা খুঁজুন... (e.g. বাংলা, Hindi, Arabic, Spanish)"
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All / সকল ({LANGUAGES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('asia')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'asia'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🌏 Asia / এশিয়া (33)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('world')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'world'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🌍 World / আন্তর্জাতিক (27)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'popular'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Top / জনপ্রিয়</span>
            </button>
          </div>

          {/* Language Grid List */}
          <div className="max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-2 gap-1.5 text-xs">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50/90 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold shadow-2xs ring-1 ring-red-500/20'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0 select-none">{lang.flag}</span>
                    <div className="truncate">
                      <div className="font-bold text-xs truncate leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 ml-1" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                কোনো ভাষা খুঁজে পাওয়া যায়নি (No language found)
              </div>
            )}
          </div>

          {/* Footer with Reset & Info */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>⚡ Google AI Translate Engine</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Original (English)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
