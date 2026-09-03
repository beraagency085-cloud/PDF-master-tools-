import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToolLayout } from './components/ToolLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { ToolId, ToolDefinition } from './types';
import { TOOLS_DATA } from './data/toolsData';

// Tools
import { CompressTool } from './tools/CompressTool';
import { MergeTool } from './tools/MergeTool';
import { SplitTool } from './tools/SplitTool';
import { JpgToPdfTool } from './tools/JpgToPdfTool';
import { PdfToJpgTool } from './tools/PdfToJpgTool';
import { PdfToPngTool } from './tools/PdfToPngTool';
import { PdfToWordTool } from './tools/PdfToWordTool';
import { WordToPdfTool } from './tools/WordToPdfTool';
import { PdfToExcelTool } from './tools/PdfToExcelTool';
import { ExcelToPdfTool } from './tools/ExcelToPdfTool';
import { RotateTool } from './tools/RotateTool';
import { DeletePagesTool } from './tools/DeletePagesTool';
import { ExtractPagesTool } from './tools/ExtractPagesTool';
import { ProtectTool } from './tools/ProtectTool';
import { UnlockTool } from './tools/UnlockTool';
import { WatermarkTool } from './tools/WatermarkTool';
import { PageNumberTool } from './tools/PageNumberTool';
import { OcrTool } from './tools/OcrTool';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark mode class and data-theme with documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const selectedTool: ToolDefinition | undefined = TOOLS_DATA.find(
    (t) => t.id === currentView
  );

  // Dynamic SEO Title and Meta Description update on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let title = 'PDFMaster Tools — Free, Fast & Secure Online PDF Utility';
    let description =
      'Free online PDF tools: Compress, Merge, Split, Convert PDF to Word/Excel/JPG, Rotate, Protect, Unlock, Watermark, and OCR in your browser. 100% private, 0s retention.';

    if (selectedTool) {
      title = `${selectedTool.title} Free Online — PDFMaster Tools`;
      description = selectedTool.seo.metaDescription || selectedTool.description;
    } else if (currentView === 'about') {
      title = 'About Us & Zero-Knowledge Architecture — PDFMaster Tools';
      description =
        'Learn how PDFMaster Tools processes documents 100% client-side with WebAssembly. No server storage, zero data leaks, operated by Bera Agency.';
    } else if (currentView === 'privacy') {
      title = 'Privacy Policy & Zero Server Storage Guarantee — PDFMaster Tools';
      description =
        'Our strict privacy policy: 0s server retention, instant local memory purging, no cloud storage, and zero AI model training on user documents.';
    } else if (currentView === 'contact') {
      title = 'Contact Support & Ownership Details — PDFMaster Tools';
      description =
        'Get in touch with the PDFMaster Tools engineering and support team at Bera Agency / 2BD Network. SLA response within 12–24 hours.';
    } else if (currentView === 'terms') {
      title = 'Terms of Service & Fair Use — PDFMaster Tools';
      description =
        'Terms of service and fair use guidelines for PDFMaster Tools. Client-side processing, intellectual property protection, and warranty terms.';
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [currentView, selectedTool]);

  const handleSelectTool = (toolId: ToolId) => {
    setCurrentView(toolId);
  };

  const handleNavigate = (page: 'home' | 'about' | 'contact' | 'privacy' | 'terms') => {
    setCurrentView(page);
  };

  const renderToolComponent = (id: string) => {
    switch (id) {
      case 'compress-pdf':
        return <CompressTool />;
      case 'merge-pdf':
        return <MergeTool />;
      case 'split-pdf':
        return <SplitTool />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
      case 'pdf-to-png':
        return <PdfToPngTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'pdf-to-excel':
        return <PdfToExcelTool />;
      case 'excel-to-pdf':
        return <ExcelToPdfTool />;
      case 'rotate-pdf':
        return <RotateTool />;
      case 'delete-pages':
        return <DeletePagesTool />;
      case 'extract-pages':
        return <ExtractPagesTool />;
      case 'protect-pdf':
        return <ProtectTool />;
      case 'unlock-pdf':
        return <UnlockTool />;
      case 'watermark-pdf':
        return <WatermarkTool />;
      case 'page-numbers':
        return <PageNumberTool />;
      case 'pdf-ocr':
        return <OcrTool />;
      default:
        return <CompressTool />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans text-[#1e293b] antialiased selection:bg-red-500 selection:text-white relative">
      {/* Frosted ambient background decorative soft blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateTool={handleSelectTool}
        onNavigatePage={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-grow relative z-10">
        {currentView === 'home' && (
          <HomePage
            onSelectTool={handleSelectTool}
            onNavigatePage={handleNavigate}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onBackToHome={() => setCurrentView('home')}
            onSelectTool={handleSelectTool}
            onNavigatePage={handleNavigate}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onBackToHome={() => setCurrentView('home')}
            onSelectTool={handleSelectTool}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage onBackToHome={() => setCurrentView('home')} />
        )}

        {currentView === 'terms' && (
          <TermsPage
            onBackToHome={() => setCurrentView('home')}
            onSelectTool={handleSelectTool}
          />
        )}

        {selectedTool && (
          <ToolLayout
            tool={selectedTool}
            onNavigateHome={() => setCurrentView('home')}
            onNavigateToTool={handleSelectTool}
          >
            {renderToolComponent(selectedTool.id)}
          </ToolLayout>
        )}
      </main>

      {/* Comprehensive Footer */}
      <Footer
        onNavigateTool={handleSelectTool}
        onNavigatePage={handleNavigate}
      />
    </div>
  );
}
