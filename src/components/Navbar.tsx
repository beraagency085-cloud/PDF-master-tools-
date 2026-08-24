import React, { useState } from 'react';
import {
  FileText,
  Menu,
  X,
  ChevronDown,
  Shield,
  Layers,
  Scissors,
  Minimize2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { ToolId } from '../types';
import { TOOLS_DATA } from '../data/toolsData';

interface NavbarProps {
  currentView: string;
  onNavigateHome: () => void;
  onNavigateTool: (toolId: ToolId) => void;
  onNavigatePage: (page: 'home' | 'about' | 'privacy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onNavigateTool,
  onNavigatePage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = searchQuery.trim()
    ? TOOLS_DATA.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TOOLS_DATA;

  const handleToolClick = (toolId: ToolId) => {
    onNavigateTool(toolId);
    setToolsDropdownOpen(false);
    setConvertDropdownOpen(false);
    setMobileMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
            id="navbar-logo"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-red-500/20 group-hover:scale-105 transition-transform">
              <span>PDF</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                PDFMaster<span className="text-red-600">Tools</span>
              </h1>
              <span className="text-[10px] font-medium text-slate-400 -mt-1 hidden sm:block">
                Free &amp; In-Browser
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-600">
            <button
              onClick={onNavigateHome}
              className={`px-3.5 py-2 rounded-xl transition-colors ${
                currentView === 'home'
                  ? 'text-red-600 bg-red-50/80 font-bold'
                  : 'hover:text-red-600 hover:bg-white/60'
              }`}
              id="nav-home"
            >
              Home
            </button>

            {/* All PDF Tools Mega Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setToolsDropdownOpen(!toolsDropdownOpen);
                  setConvertDropdownOpen(false);
                }}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl hover:text-red-600 hover:bg-white/60 transition-colors"
                id="nav-all-tools"
              >
                <span>PDF Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180 text-red-600' : ''}`} />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-[540px] rounded-2xl bg-white/90 backdrop-blur-md p-4 shadow-xl border border-slate-200/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="mb-3 px-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Quick find tool..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/80 border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {filteredTools.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleToolClick(t.id)}
                        className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-red-50/70 text-left transition-colors group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/80 text-slate-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-red-600">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {t.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick direct links */}
            <button
              onClick={() => handleToolClick('compress-pdf')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl hover:text-red-600 hover:bg-white/60 transition-colors"
              id="nav-compress"
            >
              <Minimize2 className="w-3.5 h-3.5 text-red-600" />
              <span>Compress</span>
            </button>

            {/* Convert Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setConvertDropdownOpen(!convertDropdownOpen);
                  setToolsDropdownOpen(false);
                }}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl hover:text-red-600 hover:bg-white/60 transition-colors"
                id="nav-convert"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Convert</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              </button>

              {convertDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white/90 backdrop-blur-md p-2 shadow-xl border border-slate-200/90 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Convert to PDF
                  </div>
                  <button
                    onClick={() => handleToolClick('jpg-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    JPG to PDF
                  </button>
                  <button
                    onClick={() => handleToolClick('word-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    Word to PDF
                  </button>
                  <button
                    onClick={() => handleToolClick('excel-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    Excel to PDF
                  </button>

                  <div className="my-1 border-t border-slate-200/60"></div>

                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Convert from PDF
                  </div>
                  <button
                    onClick={() => handleToolClick('pdf-to-jpg')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    PDF to JPG
                  </button>
                  <button
                    onClick={() => handleToolClick('pdf-to-png')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    PDF to PNG
                  </button>
                  <button
                    onClick={() => handleToolClick('pdf-to-word')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    PDF to Word (.docx)
                  </button>
                  <button
                    onClick={() => handleToolClick('pdf-to-excel')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    PDF to Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleToolClick('merge-pdf')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl hover:text-red-600 hover:bg-white/60 transition-colors"
              id="nav-merge"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Merge</span>
            </button>

            <button
              onClick={() => handleToolClick('split-pdf')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl hover:text-red-600 hover:bg-white/60 transition-colors"
              id="nav-split"
            >
              <Scissors className="w-3.5 h-3.5 text-purple-600" />
              <span>Split</span>
            </button>

            <button
              onClick={() => {
                onNavigatePage('about');
                setToolsDropdownOpen(false);
                setConvertDropdownOpen(false);
              }}
              className={`px-3.5 py-2 rounded-xl transition-colors ${
                currentView === 'about'
                  ? 'text-red-600 bg-red-50/80 font-bold'
                  : 'hover:text-red-600 hover:bg-white/60'
              }`}
              id="nav-about"
            >
              About
            </button>
          </nav>

          {/* Right Action: Privacy Badge & OCR Quick Highlight */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => handleToolClick('pdf-ocr')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 backdrop-blur-xs text-purple-700 border border-purple-200/80 text-xs font-bold hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>OCR</span>
            </button>

            <button
              onClick={() => onNavigatePage('privacy')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 backdrop-blur-xs text-emerald-700 border border-emerald-200/80 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Private &amp; Secure</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-white/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2">
          {/* Quick Search */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search PDF tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/90 border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => handleToolClick('compress-pdf')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              Compress PDF
            </button>
            <button
              onClick={() => handleToolClick('merge-pdf')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              Merge PDF
            </button>
            <button
              onClick={() => handleToolClick('split-pdf')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              Split PDF
            </button>
            <button
              onClick={() => handleToolClick('jpg-to-pdf')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              JPG to PDF
            </button>
            <button
              onClick={() => handleToolClick('pdf-to-jpg')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              PDF to JPG
            </button>
            <button
              onClick={() => handleToolClick('pdf-to-word')}
              className="p-3 text-left font-bold text-sm bg-white/80 border border-slate-200/80 hover:bg-red-50 rounded-xl text-slate-800"
            >
              PDF to Word
            </button>
            <button
              onClick={() => handleToolClick('pdf-ocr')}
              className="p-3 text-left font-bold text-sm bg-purple-50/80 border border-purple-200/80 text-purple-700 hover:bg-purple-100 rounded-xl"
            >
              PDF OCR Extractor
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              All PDF Tools ({filteredTools.length})
            </p>
            <div className="space-y-1">
              {filteredTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleToolClick(t.id)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white/80 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span>{t.title}</span>
                  {t.badge && (
                    <span className="text-[10px] bg-red-100/80 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => {
                onNavigatePage('about');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-slate-600 hover:text-red-600"
            >
              About Us
            </button>
            <button
              onClick={() => {
                onNavigatePage('privacy');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              100% Privacy Guarantee
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
