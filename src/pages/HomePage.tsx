import React, { useState } from 'react';
import {
  Search,
  Minimize2,
  Layers,
  Scissors,
  Image,
  FileImage,
  FileSpreadsheet,
  FileType,
  Table,
  RotateCw,
  Trash2,
  FileCheck,
  Lock,
  Unlock,
  Stamp,
  Hash,
  ScanText,
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { ToolDefinition, ToolId } from '../types';
import { TOOLS_DATA, CATEGORIES } from '../data/toolsData';
import { AdSlot } from '../components/AdSlot';

interface HomePageProps {
  onSelectTool: (toolId: ToolId) => void;
  onNavigatePage: (page: 'about' | 'privacy') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onNavigatePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const getToolIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Minimize2':
        return <Minimize2 className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Scissors':
        return <Scissors className={className} />;
      case 'Image':
        return <Image className={className} />;
      case 'FileImage':
        return <FileImage className={className} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'FileType':
        return <FileType className={className} />;
      case 'Table':
        return <Table className={className} />;
      case 'RotateCw':
        return <RotateCw className={className} />;
      case 'Trash2':
        return <Trash2 className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'Lock':
        return <Lock className={className} />;
      case 'Unlock':
        return <Unlock className={className} />;
      case 'Stamp':
        return <Stamp className={className} />;
      case 'Hash':
        return <Hash className={className} />;
      case 'ScanText':
        return <ScanText className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'popular') return tool.badge === 'Popular';
    return tool.category === activeCategory;
  });

  const popularToolsList = TOOLS_DATA.filter((t) => t.badge === 'Popular').slice(0, 12);

  return (
    <div className="w-full bg-transparent min-h-screen text-[#1e293b]" id="homepage-root">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill Guarantee */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-red-600 text-xs sm:text-sm font-semibold border border-red-200/60 mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Free &amp; Secure — Processed locally in your browser</span>
          </div>

          {/* Hero Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-2">
            Free PDF Tools — Fast, Simple &amp; Secure
          </h2>

          {/* Subtitle */}
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Compress, merge, split, convert and edit PDF files online for free.
          </p>

          {/* Main Search Box */}
          <div className="max-w-md mx-auto relative">
            <div className="relative flex items-center shadow-sm rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-2.5 pr-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
                id="main-search-box"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-3 text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === cat.id && !searchQuery
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'bg-white/80 backdrop-blur-xs text-slate-600 border border-slate-200/80 hover:border-red-200 hover:bg-white hover:text-red-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tools Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeCategory === 'all'
                ? 'All PDF Tools'
                : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredTools.length} functional PDF tools
            </p>
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="tools-grid">
          {filteredTools.map((tool, index) => {
            const isFirstImageToPdf = tool.id === 'jpg-to-pdf' && index === 0 && activeCategory === 'all' && !searchQuery;

            // Distinct frosted category badge color mapping
            const getCategoryColor = (cat: string) => {
              switch (cat) {
                case 'compress':
                  return { bg: 'bg-red-50', text: 'text-red-600', hoverBorder: 'hover:border-red-200', hoverBg: 'group-hover:bg-red-600' };
                case 'merge-split':
                  return { bg: 'bg-blue-50', text: 'text-blue-600', hoverBorder: 'hover:border-blue-200', hoverBg: 'group-hover:bg-blue-600' };
                case 'convert-to':
                case 'convert-from':
                  return { bg: 'bg-purple-50', text: 'text-purple-600', hoverBorder: 'hover:border-purple-200', hoverBg: 'group-hover:bg-purple-600' };
                case 'security':
                  return { bg: 'bg-indigo-50', text: 'text-indigo-600', hoverBorder: 'hover:border-indigo-200', hoverBg: 'group-hover:bg-indigo-600' };
                case 'ocr':
                  return { bg: 'bg-cyan-50', text: 'text-cyan-600', hoverBorder: 'hover:border-cyan-200', hoverBg: 'group-hover:bg-cyan-600' };
                default:
                  return { bg: 'bg-red-50', text: 'text-red-600', hoverBorder: 'hover:border-red-200', hoverBg: 'group-hover:bg-red-600' };
              }
            };
            const catColors = getCategoryColor(tool.category);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`group relative flex flex-col justify-between rounded-2xl bg-white/90 backdrop-blur-xs p-5 transition-all cursor-pointer select-none ${
                  isFirstImageToPdf
                    ? 'border-2 border-red-500/80 shadow-md shadow-red-500/10 ring-2 ring-red-500/10 hover:shadow-lg hover:-translate-y-1'
                    : `border border-slate-200/90 shadow-sm ${catColors.hoverBorder} hover:shadow-md hover:-translate-y-0.5`
                }`}
                id={`tool-card-${tool.id}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${
                      isFirstImageToPdf
                        ? 'bg-red-600 text-white shadow-xs'
                        : `${catColors.bg} ${catColors.text} ${catColors.hoverBg} group-hover:text-white shadow-2xs`
                    } transition-colors`}>
                      {getToolIcon(tool.iconName, 'w-5 h-5')}
                    </div>

                    {isFirstImageToPdf ? (
                      <span className="rounded-md bg-red-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 shadow-2xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>#1 Top Tool</span>
                      </span>
                    ) : tool.badge ? (
                      <span className="rounded-md bg-red-50 text-red-700 font-bold text-[10px] uppercase px-2 py-0.5 border border-red-100">
                        {tool.badge}
                      </span>
                    ) : null}
                  </div>

                  <h4 className={`font-bold text-sm transition-colors ${
                    isFirstImageToPdf ? 'text-red-600 group-hover:text-red-700' : 'text-slate-900 group-hover:text-red-600'
                  }`}>
                    {tool.title}
                  </h4>

                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>

                  {isFirstImageToPdf && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                      <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100/80">📷 Camera</span>
                      <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100/80">🖼️ Gallery</span>
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100/80">📁 Upload</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                  isFirstImageToPdf ? 'border-red-100 text-red-600 font-bold' : 'border-slate-100/80 text-red-600'
                }`}>
                  <span>{isFirstImageToPdf ? 'Open Image to PDF' : 'Open Tool'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-8 shadow-sm">
            <p className="text-base font-bold text-slate-700">No tools found matching your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* AdSense Space Between Tool Sections */}
      <AdSlot format="banner" />

      {/* Value Proposition Features */}
      <section className="bg-white/70 backdrop-blur-md border-y border-slate-200/80 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Millions Rely on PDFMaster Tools
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Engineered for absolute privacy, rapid in-browser processing, and high fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">100% Private</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Files are processed directly inside your browser memory. Your confidential documents never leave your device.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Lightning Fast</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero upload waiting times. Manipulate, merge, compress, and convert files near-instantaneously on your CPU.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">AI &amp; OCR Powered</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extract text from scanned invoices, receipts, and images in 8+ languages including English, Hindi, and Spanish.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Star className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Free Forever</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All 18 tools are completely free to use with zero hidden subscriptions, credit limits, or mandatory registrations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
