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
  FileText,
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../types';
import { TOOLS_DATA, CATEGORIES } from '../data/toolsData';
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
  onNavigatePage: (page: 'about' | 'privacy') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onNavigatePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-[#0f172a]" id="homepage-root">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-14 px-6 text-center">
        {/* Radial soft glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#e2e8f0] px-4 py-2 rounded-full text-[0.85rem] font-semibold text-[#dc2626] mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] animate-fade-up">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse-dot" />
            <span>Free &amp; Secure — Processed locally in your browser</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-tight mb-4 animate-fade-up [animation-delay:100ms]">
            Free PDF Tools — Fast, Simple &amp; Secure
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-[#64748b] max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up [animation-delay:200ms]">
            Compress, merge, split, convert and edit PDF files online for free. No upload to servers.
          </p>

          {/* Search Box */}
          <div
            ref={searchContainerRef}
            className="max-w-[540px] mx-auto relative mb-4 animate-fade-up [animation-delay:300ms]"
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#64748b] dark:text-slate-400 absolute left-4.5 pointer-events-none" />
              <input
                type="text"
                id="searchInput"
                placeholder="Search PDF tools (e.g. Compress, JPG to PDF, OCR)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full py-4 pl-12 pr-20 border border-[#e2e8f0] dark:border-slate-700 rounded-full text-base bg-white dark:bg-slate-900 text-[#0f172a] dark:text-slate-100 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus:border-[#dc2626] dark:focus:border-red-500 focus:ring-4 focus:ring-[#dc2626]/10 dark:focus:ring-red-500/20 transition-all placeholder:text-[#94a3b8]"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}

                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsSearchFocused((prev) => !prev)}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isSearchFocused
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800'
                    }`}
                    title={isSearchFocused ? 'Hide Search History' : 'View Search History'}
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Optional Collapsible Search History Panel (Only when history button clicked & query is empty) */}
            {isSearchFocused && !searchQuery && searchHistory.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.5)] z-40 p-4 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <History className="w-3.5 h-3.5 text-red-500" />
                    <span>Recent Searches</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleApplySearch(item.query)}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-50/70 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors shrink-0" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 truncate">
                          {item.query}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-100/60 dark:hover:bg-slate-700 transition-colors"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Suggestions & Recent History Pills (Clean non-overlapping inline section) */}
          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-6 text-xs animate-fade-up [animation-delay:350ms]">
              {searchHistory.length > 0 ? (
                <>
                  <span className="flex items-center gap-1 font-bold text-slate-400 dark:text-slate-500">
                    <History className="w-3.5 h-3.5 text-red-500" />
                    <span>Recent:</span>
                  </span>
                  {searchHistory.slice(0, 4).map((item) => (
                    <span
                      key={item.id}
                      onClick={() => handleApplySearch(item.query)}
                      className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-red-400 hover:shadow-xs text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <span>{item.query}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                        className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-600 dark:hover:text-red-400 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1 font-bold text-slate-400 dark:text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>Popular:</span>
                  </span>
                  {POPULAR_SEARCH_TERMS.slice(0, 5).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleApplySearch(term)}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      {term}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Categories Pill Buttons with Rich Color Grading & Hover Effects */}
          <div className="flex flex-wrap justify-center gap-2.5 animate-fade-up [animation-delay:400ms]" id="categories">
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
                  className={`group relative px-4.5 py-2 rounded-full border text-[0.85rem] font-semibold cursor-pointer transition-all duration-300 transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-transparent shadow-[0_4px_16px_rgba(220,38,38,0.35)] -translate-y-0.5'
                      : 'bg-white/90 backdrop-blur-xs text-[#475569] border-[#e2e8f0] hover:border-red-300 hover:text-red-600 hover:bg-gradient-to-r hover:from-white hover:to-red-50/50 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                  data-cat={cat.id}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
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

      {/* TOOLS SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 py-10 pb-20" id="tools">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight text-[#0f172a]">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeCategory === 'all'
                ? 'All PDF Tools'
                : CATEGORIES.find((c) => c.id === activeCategory)?.label || 'All PDF Tools'}
            </h2>
            <p className="text-[#64748b] text-sm mt-1" id="toolCount">
              Showing {filteredTools.length} functional PDF tool{filteredTools.length !== 1 ? 's' : ''}
            </p>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
            >
              View All Tools →
            </button>
          )}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="toolsGrid">
          {filteredTools.map((tool, i) => {
            const isFeatured = tool.top === true || (tool.id === 'jpg-to-pdf' && i === 0);

            return (
              <div
                key={tool.id}
                onClick={() => handleSelectToolWithHistory(tool.id)}
                style={{ transitionDelay: `${i * 25}ms` }}
                className={`group relative rounded-[20px] p-6 cursor-pointer overflow-hidden transition-all duration-300 ease-out transform hover:-translate-y-2 hover:scale-[1.025] active:scale-[0.98] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] flex flex-col justify-between ${
                  isFeatured
                    ? 'bg-gradient-to-br from-white via-rose-50/30 to-red-50/50 border-[1.5px] border-red-500/80 shadow-[0_8px_24px_rgba(220,38,38,0.12)] hover:shadow-[0_22px_45px_-10px_rgba(220,38,38,0.38),0_0_25px_rgba(220,38,38,0.2)] ring-1 ring-red-500/25 hover:border-red-600'
                    : 'bg-white border-[1.5px] border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-red-400/80 hover:shadow-[0_20px_45px_-10px_rgba(220,38,38,0.24),0_0_22px_rgba(220,38,38,0.14)] hover:bg-gradient-to-br hover:from-white hover:via-rose-50/20 hover:to-white'
                }`}
                id={`tool-card-${tool.id}`}
              >
                {/* Subtle Ambient Glow on Hover */}
                <div className="pointer-events-none absolute -inset-px rounded-[20px] bg-gradient-to-br from-red-500/10 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Badge with Color Grading */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-red-50 to-rose-100/70 text-[#dc2626] border border-red-100/80 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)]">
                      <span>{tool.emoji || '📄'}</span>
                    </div>

                    {isFeatured ? (
                      <span className="text-[0.7rem] font-extrabold uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white px-3 py-1 rounded-full shadow-[0_2px_10px_rgba(220,38,38,0.35)] flex items-center gap-1">
                        <span>⭐</span> #1 TOP TOOL
                      </span>
                    ) : tool.badge ? (
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider bg-gradient-to-r from-red-50 to-rose-50 text-[#dc2626] px-2.5 py-1 rounded-full border border-red-200/80">
                        {tool.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-[1.1rem] font-bold text-[#0f172a] mb-2 group-hover:text-[#dc2626] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-[0.875rem] text-[#64748b] leading-relaxed mb-5">
                    {tool.description}
                  </p>
                </div>

                {/* Open Tool Button with Gradient Hover */}
                <div className="relative z-10 pt-3.5 border-t border-slate-100/90 flex items-center justify-between font-bold text-[0.875rem] text-[#dc2626] transition-all">
                  <span className="group-hover:translate-x-1 transition-transform">Open Tool</span>
                  <div className="w-7 h-7 rounded-full bg-red-50 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 group-hover:text-white text-red-600 flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-sm">
                    →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <p className="text-base font-bold text-slate-700">No tools found matching your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-6 py-3 rounded-full btn-gradient-primary btn-shimmer text-xs font-bold transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-white border-t border-b border-[#e2e8f0] py-16 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-[16px] bg-[#fef2f2] text-[#dc2626] flex items-center justify-center text-3xl mb-4">
              <span>🔒</span>
            </div>
            <h3 className="text-[1.15rem] font-bold text-[#0f172a]">100% Private</h3>
            <p className="text-[#64748b] text-[0.95rem] leading-relaxed">
              All processing happens in your browser. Files never leave your device.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-[16px] bg-[#fef2f2] text-[#dc2626] flex items-center justify-center text-3xl mb-4">
              <span>⚡</span>
            </div>
            <h3 className="text-[1.15rem] font-bold text-[#0f172a]">Lightning Fast</h3>
            <p className="text-[#64748b] text-[0.95rem] leading-relaxed">
              No waiting for uploads. Instant results with optimized browser engines.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-[16px] bg-[#fef2f2] text-[#dc2626] flex items-center justify-center text-3xl mb-4">
              <span>🎁</span>
            </div>
            <h3 className="text-[1.15rem] font-bold text-[#0f172a]">Completely Free</h3>
            <p className="text-[#64748b] text-[0.95rem] leading-relaxed">
              No limits, no watermarks, no registration required. Use as much as you want.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

