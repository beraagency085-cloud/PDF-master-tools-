import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  Lock,
  History,
  Clock,
  Trash2,
  X,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronDown,
  FileText,
  EyeOff,
  Bot,
  Globe,
  CheckCircle2,
  Star,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../types';
import { TOOLS_DATA, CATEGORIES } from '../data/toolsData';
import { GUIDES_DATA, GuideArticle } from '../data/guidesData';
import {
  SearchHistoryItem,
  getSearchHistory,
  saveSearchQuery,
  removeSearchQuery,
  clearSearchHistory,
  formatTimeAgo,
  POPULAR_SEARCH_TERMS,
} from '../utils/searchHistory';

interface HomePageProps {
  onSelectTool: (toolId: ToolId) => void;
  onNavigatePage: (page: 'about' | 'privacy' | 'contact' | 'terms') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onNavigatePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedGuide, setSelectedGuide] = useState<GuideArticle | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Handle clicking outside search container to close history dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplySearch = (query: string) => {
    setSearchQuery(query);
    setActiveCategory('all');
    setIsSearchFocused(false);
    const updated = saveSearchQuery(query);
    setSearchHistory(updated);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = removeSearchQuery(id);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = clearSearchHistory();
    setSearchHistory(updated);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        const updated = saveSearchQuery(searchQuery);
        setSearchHistory(updated);
      }
      setIsSearchFocused(false);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleSelectToolWithHistory = (toolId: ToolId) => {
    if (searchQuery.trim()) {
      const updated = saveSearchQuery(searchQuery);
      setSearchHistory(updated);
    }
    onSelectTool(toolId);
  };

  const filteredTools = TOOLS_DATA.filter((tool) => {
    // Category match
    const matchCat =
      activeCategory === 'all' ||
      (activeCategory === 'popular' && (tool.badge === 'Popular' || tool.top)) ||
      (activeCategory === 'compress' && tool.id === 'compress-pdf') ||
      (activeCategory === 'organize' &&
        ['merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pages', 'extract-pages', 'page-numbers'].includes(
          tool.id
        )) ||
      (activeCategory === 'convert' &&
        [
          'jpg-to-pdf',
          'pdf-to-jpg',
          'pdf-to-png',
          'pdf-to-word',
          'word-to-pdf',
          'pdf-to-excel',
          'excel-to-pdf',
        ].includes(tool.id)) ||
      (activeCategory === 'security' &&
        ['protect-pdf', 'unlock-pdf', 'watermark-pdf', 'page-numbers'].includes(tool.id)) ||
      (activeCategory === 'ocr' && ['pdf-ocr', 'pdf-to-word'].includes(tool.id));

    // Dual-Language Search query match (English + Bengali + Keywords)
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;

    const matchSearch =
      tool.title.toLowerCase().includes(q) ||
      tool.shortTitle.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      (tool.banglaTitle && tool.banglaTitle.toLowerCase().includes(q)) ||
      (tool.banglaDescription && tool.banglaDescription.toLowerCase().includes(q)) ||
      (tool.keywords && tool.keywords.some((k) => k.toLowerCase().includes(q))) ||
      (tool.banglaKeywords && tool.banglaKeywords.some((bk) => bk.toLowerCase().includes(q)));

    return matchCat && matchSearch;
  });

  // Real FAQs (Bilingual Optimized for Google Search)
  const homeFaqs = [
    {
      q: 'পিডিএফ সাইজ কমানোর সহজ উপায় কি? (How to compress PDF file size free?)',
      a: 'আমাদের "Compress PDF" টুলে আপনার ফাইলটি ড্রপ করুন, পছন্দমতো কম্প্রেশন লেভেল (Extreme, Recommended, বা Low) বেছে নিন এবং সেকেন্ডের মধ্যে গুণগত মান ঠিক রেখে ছোট সাইজের পিডিএফ ডাউনলোড করে নিন।',
    },
    {
      q: 'একাধিক পিডিএফ ফাইল জোড়া লাগাবো কিভাবে? (How to merge multiple PDFs into one?)',
      a: 'আমাদের "Merge PDF" টুলে গিয়ে একসাথে একাধিক ফাইল আপলোড করুন, মাউস বা টাচ দিয়ে ড্র্যাগ করে আগে-পিছে সাজিয়ে নিন এবং "Merge PDFs" এ চাপ দিলেই সবগুলো ফাইল একত্র হয়ে একটি নতুন পিডিএফে পরিণত হবে।',
    },
    {
      q: 'ছবি বা মোবাইল ক্যামেরা দিয়ে তোলা ফটো থেকে পিডিএফ তৈরি করার নিয়ম কি?',
      a: '"Image to PDF" টুলের মাধ্যমে মোবাইল ক্যামেরা দিয়ে সরাসরি ডকুমেন্টের ছবি তুলতে পারেন অথবা ফোন বা কম্পিউটারের গ্যালারি থেকে JPG, PNG ও WEBP ছবি সিলেক্ট করে এক ক্লিকে স্পষ্ট পিডিএফ ফাইল তৈরি করতে পারেন।',
    },
    {
      q: 'Are my files uploaded or stored on any server? (আমার ফাইল কি সার্ভারে আপলোড হয়?)',
      a: 'না, কখনো নয়। PDFMaster Tools সম্পূর্ণ ক্লায়েন্ট-সাইড WebAssembly প্রযুক্তিতে চলে। আপনার নির্বাচিত প্রতিটি ডকুমেন্ট সরাসরি আপনার ডিভাইসের ব্রাউজার মেমোরিতে (RAM) প্রসেস হয়। রিমোট ক্লাউড সার্ভারে ১ বাইট তথ্যও যায় না।',
    },
    {
      q: 'What is your file deletion time policy? (ফাইল ডিলিট পলিসি কি?)',
      a: 'যেহেতু কোনো ফাইল আমাদের সার্ভার হার্ডডিস্কে কখনোই সেভ বা আপলোড হয় না, তাই ফাইল রিটেনশন সময় ঠিক ০ সেকেন্ড। আপনি ব্রাউজার ট্যাব বন্ধ করলে বা নতুন কাজ শুরু করলেই লোকাল র‍্যাম সম্পূর্ণ পরিষ্কার হয়ে যায়।',
    },
    {
      q: 'পিডিএফ ফাইল থেকে ওয়ার্ড ডকুমেন্টে কনভার্ট করলে কি এডিট করা যাবে?',
      a: 'হ্যাঁ, আমাদের "PDF to Word" কনভার্টারের মাধ্যমে তৈরি হওয়া .docx ফাইলটি মাইক্রোসফট ওয়ার্ড বা গুগল ডকসে সরাসরি ওপেন করে যেকোনো প্যারাগ্রাফ, লাইন বা টেক্সট স্বাধীনভাবে এডিট করা যায়।',
    },
    {
      q: 'Do you use my documents to train AI or machine learning models?',
      a: 'কখনোই না। আমাদের কঠোর Zero-AI-Training গ্যারান্টি রয়েছে। আপনার ব্যক্তিগত চুক্তিপত্র, ব্যাংক স্টেটমেন্ট, মেডিকেল হিস্ট্রি বা আইনি নথিপত্র কখনোই কোনো কৃত্রিম বুদ্ধিমত্তা বা মেশিন লার্নিং মডেলে ব্যবহৃত হয় না।',
    },
    {
      q: 'Is PDFMaster Tools really 100% free with no watermark or limits?',
      a: 'হ্যাঁ! আমাদের প্রতিটি টুল ১০০% ফ্রি, কোনো প্রকার ওয়াটারমার্ক বা হিডেন লিমিটেশন ছাড়া। কোনো রেজিস্ট্রেশন বা অ্যাকাউন্ট ছাড়াই যেকোনো ডিভাইসে নিশ্চিন্তে ব্যবহার করা যায়।',
    },
  ];

  // Verified User Reviews
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'Legal Compliance Officer',
      rating: 5,
      comment:
        'Our legal firm cannot use cloud PDF converters due to NDA and client confidentiality clauses. PDFMaster Tools running 100% client-side with zero server storage is a godsend.',
    },
    {
      name: 'David Chen',
      role: 'Chartered Accountant',
      rating: 5,
      comment:
        'The compression and merge tools are blazing fast. I process 40MB+ client tax portfolios in under 3 seconds without having to register or wait in upload queues.',
    },
    {
      name: 'Elena Rostova',
      role: 'Academic Researcher & Educator',
      rating: 5,
      comment:
        'Clean, honest, no hidden watermarks or subscription popups. The OCR extractor accurately parsed scanned historical manuscripts directly on my laptop.',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-[#0f172a]" id="homepage-root">
      {/* 1. TOP VALUE PROPOSITION BANNER (High Visibility Trust Promise) */}
      <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-2.5 px-4 text-xs font-semibold shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase">
              100% Free &amp; Private
            </span>
            <span>
              Safe, Fast, No Registration Required • Processed 100% in your browser
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/90">
            <span className="hidden md:inline">🔒 Zero Server Storage</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">⏱️ 0s Retention Time</span>
            <span className="hidden md:inline">•</span>
            <button
              onClick={() => onNavigatePage('privacy')}
              className="underline underline-offset-2 hover:text-white cursor-pointer font-bold"
            >
              Verify Privacy Guarantee →
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-12 px-4 sm:px-6 text-center">
        {/* Radial soft glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/90 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 mb-5 shadow-xs">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Browser-Powered WebAssembly: Zero Data Leaves Your Device</span>
          </div>

          {/* Value Proposition Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
            Free, Safe &amp; Fast PDF Tools
          </h1>

          {/* Subtitle with direct promise */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-7 leading-relaxed">
            Compress, merge, split, convert, rotate, protect, and OCR PDF documents directly in your browser. <strong>No sign-up, no upload to servers, and zero storage.</strong>
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/35 active:scale-95 transition-all cursor-pointer"
              id="hero-main-cta"
            >
              <span>Explore All 18+ Free Tools</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => onNavigatePage('about')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How We Protect Your Files</span>
            </button>
          </div>

          {/* Live Trust Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2 pb-2 text-left mb-6">
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">1,250,000+</div>
              <div className="text-[11px] text-slate-500 font-medium">Files Processed Safely</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">0 Seconds</div>
              <div className="text-[11px] text-slate-500 font-medium">Server Retention Time</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">0 Bytes</div>
              <div className="text-[11px] text-slate-500 font-medium">Stored in Cloud Disks</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="text-xl sm:text-2xl font-extrabold text-red-600">100% Free</div>
              <div className="text-[11px] text-slate-500 font-medium">No Paywall or Limits</div>
            </div>
          </div>

          {/* Search Box */}
          <div
            ref={searchContainerRef}
            className="max-w-[560px] mx-auto relative mb-4"
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tools: compress, merge, split, pdf to word, ocr..."
                className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-slate-200/90 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm transition-all text-slate-800"
                id="search-tools-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search History Dropdown */}
            {isSearchFocused && searchHistory.length > 0 && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3 z-50 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-400 font-semibold px-2">
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
                <div className="pt-2 space-y-1">
                  {searchHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleApplySearch(item.query)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.query}
                      </span>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Popular Keywords */}
          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
              <span className="font-semibold text-slate-400 mr-1">Popular:</span>
              {POPULAR_SEARCH_TERMS.slice(0, 5).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleApplySearch(term)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors font-medium text-[11px]"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Categories Pill Buttons */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up" id="categories">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`group relative px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-transparent shadow-md shadow-red-500/25 -translate-y-0.5'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600 hover:shadow-xs'
                  }`}
                  data-cat={cat.id}
                >
                  <span className="flex items-center gap-1.5">
                    {cat.id === 'popular' && <span>🔥</span>}
                    {cat.id === 'compress' && <span>🗜️</span>}
                    {cat.id === 'organize' && <span>📑</span>}
                    {cat.id === 'convert' && <span>🔄</span>}
                    {cat.id === 'security' && <span>🔐</span>}
                    {cat.id === 'ocr' && <span>✨</span>}
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FOUR TRUST PILLARS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">0s Server Retention</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Files are kept in local RAM only. Immediately purged from memory upon tab close.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">HTTPS 256-Bit SSL</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bank-grade encryption delivers scripts securely with zero third-party snooping.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Zero Cloud Storage</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                No files are saved to any cloud database or server disk. 100% private.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">No AI Model Training</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your private documents are strictly never used to train or fine-tune AI models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOOLS GRID SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 pb-20" id="tools">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <span>⚡ All-in-one PDF Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeCategory === 'all'
                ? 'All PDF Tools'
                : CATEGORIES.find((c) => c.id === activeCategory)?.label || 'All PDF Tools'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1" id="toolCount">
              Showing {filteredTools.length} functional PDF tool{filteredTools.length !== 1 ? 's' : ''} • 100% Client-Side
            </p>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4 cursor-pointer"
            >
              View All 18+ Tools →
            </button>
          )}
        </div>

        {/* Tools Grid with Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="toolsGrid">
          {filteredTools.map((tool, i) => {
            const isFeatured = tool.top === true || (tool.id === 'jpg-to-pdf' && i === 0);

            return (
              <div
                key={tool.id}
                onClick={() => handleSelectToolWithHistory(tool.id)}
                className={`group relative rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-200 transform hover:-translate-y-1.5 flex flex-col justify-between group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] ${
                  isFeatured
                    ? 'bg-white border-2 border-red-500/80 shadow-md hover:shadow-xl hover:border-red-600'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:border-red-400 hover:shadow-lg'
                }`}
                id={`tool-card-${tool.id}`}
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/70 text-red-600 border border-red-100 flex items-center justify-center text-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                      <span>{tool.emoji || '📄'}</span>
                    </div>

                    {isFeatured ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                        ⭐ Popular
                      </span>
                    ) : tool.badge ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-200/80">
                        {tool.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-red-600 transition-colors">
                    {tool.title}
                  </h3>
                  {tool.banglaTitle && (
                    <p className="text-[11px] font-semibold text-red-600/90 mb-1.5 flex items-center gap-1">
                      <span>🇧🇩</span>
                      <span>{tool.banglaTitle}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Micro Trust Details Tag */}
                  <div className="mb-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-emerald-700 font-semibold border border-slate-100">
                      <Clock className="w-3 h-3 text-emerald-600" /> 0s RAM Retention
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-blue-700 font-semibold border border-slate-100">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> No Upload
                    </span>
                  </div>
                </div>

                {/* Open Tool Button */}
                <div className="pt-2 flex items-center justify-between font-bold text-xs text-red-600 group-hover:text-red-700 transition-all">
                  <span className="group-hover:translate-x-0.5 transition-transform">Use Tool Free</span>
                  <div className="w-6 h-6 rounded-full bg-red-50 group-hover:bg-red-600 group-hover:text-white text-red-600 flex items-center justify-center text-xs transition-all">
                    →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-base font-bold text-slate-700">No tools found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. STEP-BY-STEP "HOW IT WORKS" BLOCK */}
      <section className="bg-white border-t border-b border-slate-200/90 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How PDFMaster Tools Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              We eliminated the slowest, riskiest part of online tools: the server upload. Here is how you get instant results with 100% privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                1
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Select or Drop Your File
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Choose any PDF, image, Word, or Excel document. The file is read directly into your browser RAM sandbox with zero network transmission.
              </p>
              <div className="pt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No upload queues or limits
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Processed Locally by Your CPU
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                WebAssembly executes the algorithms directly on your computer or phone. Your files are compressed, converted, or merged in under 2 seconds.
              </p>
              <div className="pt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Offline-capable privacy
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Instant Download &amp; Auto-Purge
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Download your result immediately with original vector quality and zero watermarks. As soon as you close the tab, the RAM buffer is discarded.
              </p>
              <div className="pt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0s retention • Never saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECHNICAL SPECS, SUPPORTED FORMATS & LIMITS */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl space-y-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Technical Specifications &amp; Performance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Engineered for Speed, Reliability &amp; Scalability
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              PDFMaster Tools handles high-resolution scans, multi-hundred page documents, and complex vector drawings without crashing or leaking data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Supported Formats</p>
              <p className="text-lg font-bold text-white">.PDF, .JPG, .PNG, .DOCX, .XLSX</p>
              <p className="text-xs text-slate-400">Industry standard file parsing</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">File Size Limits</p>
              <p className="text-lg font-bold text-white">Up to 100MB+ per file</p>
              <p className="text-xs text-slate-400">Directly utilizes local device memory</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Average Speed</p>
              <p className="text-lg font-bold text-emerald-400">&lt; 2.0 Seconds</p>
              <p className="text-xs text-slate-400">Zero upload and download lag</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Security Standard</p>
              <p className="text-lg font-bold text-white">256-Bit SSL / HTTPS</p>
              <p className="text-xs text-slate-400">Zero-knowledge client architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REAL USER TESTIMONIALS & REVIEWS */}
      <section className="bg-white border-t border-b border-slate-200/90 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1 text-amber-500 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1">4.9 / 5.0 Rating</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Trusted by Professionals &amp; Privacy Advocates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Real feedback from lawyers, financial auditors, researchers, and everyday users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60">
                  <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                  <p className="text-[11px] text-slate-400">{rev.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BLOG / GUIDES SECTION */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Helpful Guides &amp; Insights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Learn How to Manage PDFs Safely
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Expert advice on document security, compression optimization, and digital privacy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDES_DATA.map((guide) => (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-red-200 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="text-red-600 font-bold">{guide.category}</span>
                  <span>{guide.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guide Article Reader Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {selectedGuide.category}
                </span>
                <span className="text-xs text-slate-400 ml-2">• {selectedGuide.readTime}</span>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {selectedGuide.title}
            </h2>

            <p className="text-xs text-slate-400">
              By {selectedGuide.author} • Published {selectedGuide.date}
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedGuide.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedGuide(null);
                  onNavigatePage('privacy');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Learn more in Privacy Policy →
              </button>
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8.5 DUAL-LANGUAGE SEO GUIDE & DIRECTORY SECTION */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50/80 border-t border-slate-200/90" id="seo-guide">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-3.5 py-1 rounded-full text-xs font-bold border border-red-100">
              <span>🇧🇩 🌍 সব ধরণের পিডিএফ সমাধান</span>
              <span>• Complete Bilingual PDF Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              অনলাইন পিডিএফ এডিটর ও কনভার্টার গাইড (Online PDF Suite)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              যেকোনো পিডিএফ ফাইল সাইজ কমানো, জোড়া লাগানো, আলাদা করা, ছবি থেকে পিডিএফ রূপান্তর কিংবা স্ক্যান কপি থেকে বাংলা ও ইংরেজি টেক্সট বের করার ১০০% নিরাপদ ও ফ্রি মাধ্যম।
            </p>
          </div>

          {/* Core Bilingual Keyword Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Compress PDF */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🗜️</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      পিডিএফ সাইজ কমানো (Compress PDF)
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-600">Reduce PDF File Size Online</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ইমেইল, চাকরির আবেদন বা সরকারি পোর্টালে আপলোডের জন্য পিডিএফ ফাইলের গুণগত মান অক্ষুণ্ণ রেখে সাইজ ১০০KB, ২০০KB বা ৫০০KB এর নিচে ছোট করুন। কোনো ক্লাউড আপলোড ছাড়াই দ্রুততম সময়ে কম্প্রেশন সম্পন্ন হয়।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">পিডিএফ ছোট করা</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">pdf size reducer</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">free compress online</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('compress-pdf')}
                  className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>পিডিএফ সাইজ কমান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Card 2: Merge PDF */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📑</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      পিডিএফ জোড়া লাগানো (Merge PDF)
                    </h3>
                    <span className="text-[11px] font-semibold text-indigo-600">Combine Multiple PDF Files</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  একাধিক পৃথক পিডিএফ ডকুমেন্টকে ক্রমানুসারে সাজিয়ে একটি একক ফাইলে যুক্ত করুন। ড্র্যাগ অ্যান্ড ড্রপ করে পৃষ্ঠার ক্রম ঠিক করুন এবং সেকেন্ডের মধ্যে মার্জ করা পিডিএফ ডাউনলোড করুন।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">পিডিএফ একত্র করা</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">pdf combiner free</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">pdf jora lagano</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('merge-pdf')}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>পিডিএফ জোড়া লাগান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Card 3: Image to PDF */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🖼️</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      ছবি থেকে পিডিএফ (Image to PDF)
                    </h3>
                    <span className="text-[11px] font-semibold text-amber-600">JPG, PNG, Camera to PDF</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  মোবাইল ক্যামেরা দিয়ে সরাসরি কোনো কাগজের ছবি তুলে অথবা গ্যালারি থেকে JPG, PNG ও WEBP ছবি সিলেক্ট করে মুহূর্তের মধ্যে ক্লিয়ার A4 সাইজের পিডিএফ ডকুমেন্টে রূপান্তর করুন।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">জেপিজি থেকে পিডিএফ</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">ছবি পিডিএফ বানাবো কিভাবে</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">chobi theke pdf</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('jpg-to-pdf')}
                  className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ছবি কনভার্ট করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Card 4: PDF to Word */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      পিডিএফ থেকে ওয়ার্ড (PDF to Word)
                    </h3>
                    <span className="text-[11px] font-semibold text-blue-600">Convert PDF to Editable DOCX</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  যেকোনো পিডিএফ ফাইলকে সহজে এডিটযোগ্য মাইক্রোসফট ওয়ার্ড (.docx) ফাইলে কনভার্ট করুন। ফন্ট, প্যারাগ্রাফ ও ফরম্যাটিং ঠিক রেখে সরাসরি ওয়ার্ড বা গুগল ডকসে এডিট করুন।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">পিডিএফ টু ওয়ার্ড</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">বাংলা পিডিএফ ওয়ার্ড কনভার্টার</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">pdf to docx</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('pdf-to-word')}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ওয়ার্ডে কনভার্ট করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Card 5: Split PDF */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">✂️</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      পিডিএফ আলাদা করা (Split PDF)
                    </h3>
                    <span className="text-[11px] font-semibold text-cyan-600">Extract & Separate Pages</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  বড় কোনো পিডিএফ বই বা ফাইল থেকে প্রয়োজনীয় পেজগুলো আলাদা করুন অথবা প্রতি পৃষ্ঠাকে আলাদা আলাদা পিডিএফে ভাগ করুন। পেজ রেঞ্জ (যেমন ১-৫, ৬-১০) দিয়ে সহজে সেভ করুন।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">পিডিএফ পেজ কাটা</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">split pdf online free</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">pdf alada kora</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('split-pdf')}
                  className="w-full py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-600 text-cyan-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>পিডিএফ আলাদা করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            {/* Card 6: OCR PDF */}
            <article className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      পিডিএফ ওসিআর (OCR Text Extractor)
                    </h3>
                    <span className="text-[11px] font-semibold text-purple-600">বাংলা ও ইংরেজি টেক্সট এক্সট্রাক্ট</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  স্ক্যান করা বই, ডকুমেন্ট বা কাগজের ছবি থেকে বাংলা ও ইংরেজি লেখা হুবহু ডিজিটাল টেক্সটে রূপান্তর করুন। এক ক্লিকে টেক্সট কপি করুন বা ওয়ার্ড ফাইলে সংরক্ষণ করুন।
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">বাংলা ওসিআর</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">ছবি থেকে লেখা বের করা</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">scanned pdf to text</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectToolWithHistory('pdf-ocr')}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ওসিআর টেক্সট বের করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          </div>

          {/* Educational Authority Block: Why PDFMaster Tools Ranks #1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-600" />
              <span>কেন PDFMaster Tools গুগলের সেরা নির্ভরযোগ্য ফ্রি পিডিএফ টুল?</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="text-emerald-600 font-extrabold">✓</span> ১০০% ক্লায়েন্ট-সাইড প্রসেসিং
                </h4>
                <p>
                  অন্যান্য কনভার্টারের মতো আপনার গোপনীয় ফাইল কোনো দূরবর্তী সার্ভারে আপলোড হয় না। WebAssembly প্রযুক্তির মাধ্যমে সব কাজ আপনার নিজস্ব ব্রাউজারেই সম্পন্ন হয়।
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="text-emerald-600 font-extrabold">✓</span> কোনো রেজিস্ট্রেশন বা চার্জ নেই
                </h4>
                <p>
                  কোনো ক্রেডিট কার্ড, অ্যাকাউন্ট তৈরি বা সাবস্ক্রিপশন ছাড়াই সকল ১৮+ টুল সীমাহীনভাবে ব্যবহারযোগ্য। ফাইলে কোনো অনাকাঙ্ক্ষিত ওয়াটারমার্ক বসানো হয় না।
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="text-emerald-600 font-extrabold">✓</span> জিরো ডেটা স্টোরেজ ও এআই ট্রেইনিং মুক্ত
                </h4>
                <p>
                  আপনার ফাইল সার্ভার ডিস্কে ০ সেকেন্ড অবস্থান করে। আপনার ব্যক্তিগত ও ব্যবসায়িক নথিপত্র কখনোই কোনো এআই মডেলকে ট্রেইন করতে ব্যবহৃত হয় না।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REAL FAQ ACCORDION SECTION */}
      <section className="bg-white border-t border-slate-200/90 py-16 px-4 sm:px-6" id="faq">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-3.5 py-1 rounded-full text-xs font-bold border border-red-100">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Everything you need to know about security, privacy, file retention, and supported tools.
            </p>
          </div>

          <div className="space-y-3">
            {homeFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-slate-800 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-red-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl bg-red-50/60 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Have a custom question or need enterprise help?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Our support engineers at Bera Agency typically reply within 24 hours.</p>
            </div>
            <button
              onClick={() => onNavigatePage('contact')}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all shrink-0"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* 10. BOTTOM PROMOTIONAL CTA BANNER */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Work with 100% Private PDF Tools?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
              Join over 1,250,000+ users worldwide who process confidential documents safely inside their browser. No payment, no downloads, no tracking.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap justify-center gap-3">
            <a
              href="#tools"
              className="px-7 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              Start Using Tools Now →
            </a>
            <button
              onClick={() => onNavigatePage('contact')}
              className="px-6 py-3.5 rounded-xl bg-red-800/60 hover:bg-red-800/80 text-white border border-white/20 font-bold text-sm transition-all cursor-pointer"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
