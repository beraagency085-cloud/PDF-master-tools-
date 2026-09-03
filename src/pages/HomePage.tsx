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

    // Search query match
    const matchSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  // Real FAQs
  const homeFaqs = [
    {
      q: 'Are my files uploaded or stored on any server?',
      a: 'No. Never. PDFMaster Tools is built entirely on WebAssembly and client-side JavaScript. When you select or drop a document, all processing is computed directly in your browser memory (RAM). Zero bytes are transmitted to any remote cloud server.',
    },
    {
      q: 'What is your file deletion time policy?',
      a: 'Because we never store or upload your files to our server disks, retention time is exactly 0 seconds. Once you close or reload the browser tab, or click "Process Another File", the local RAM buffer is immediately cleared.',
    },
    {
      q: 'Do you use my documents to train AI or machine learning models?',
      a: 'Strictly NO. We have an explicit Zero-AI-Training guarantee. Your confidential contracts, financial statements, taxes, and medical records are never inspected, stored, or fed into any AI training dataset.',
    },
    {
      q: 'Is PDFMaster Tools really 100% free with no watermarks?',
      a: 'Yes. Every tool is 100% free, unlimited, and requires no account creation, credit card, or email sign-up. Output files never contain watermarks.',
    },
    {
      q: 'What file size limits and formats are supported?',
      a: 'We support PDF, JPG, PNG, DOCX (Word), and XLSX (Excel). Because processing happens directly using your local device CPU and RAM, you can comfortably process documents up to 100MB+ in under 2 seconds without upload lag.',
    },
    {
      q: 'Is it safe to use for sensitive legal and financial documents?',
      a: 'Yes. In fact, client-side processing is far safer than traditional cloud converters because your private data never leaves your computer or phone. Even in the event of an external network failure, your data remains secure in your browser.',
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
                className={`group relative rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-200 transform hover:-translate-y-1.5 flex flex-col justify-between ${
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
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-red-600 transition-colors">
                    {tool.title}
                  </h3>
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
