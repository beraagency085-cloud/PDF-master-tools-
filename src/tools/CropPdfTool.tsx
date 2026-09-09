import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { cropPdfPages, loadPdfDocument, renderPdfPageToDataUrl, PdfCropRect } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import {
  Crop,
  Loader2,
  Check,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Grid,
  AlertCircle,
  FileText,
} from 'lucide-react';

type DragTarget =
  | 'topLeft'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topEdge'
  | 'rightEdge'
  | 'bottomEdge'
  | 'leftEdge'
  | 'body'
  | null;

export const CropPdfTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // Normalized Crop Rect (0 to 1)
  const [cropRect, setCropRect] = useState<PdfCropRect>({
    normX: 0.05,
    normY: 0.05,
    normWidth: 0.9,
    normHeight: 0.9,
  });

  const [applyToAll, setApplyToAll] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; initialRect: PdfCropRect } | null>(null);

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load PDF when file is selected
  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    setCurrentPage(1);
    setResult(null);
    setError(null);

    if (selected) {
      try {
        setPageLoading(true);
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
        const img = await renderPdfPageToDataUrl(selected, 1, 1.5);
        setPageImageUrl(img);
      } catch (err: any) {
        console.error('Failed to load PDF page preview:', err);
        setError('পিডিএফ প্রিভিউ লোড করা সম্ভব হয়নি। ফাইলটি ভ্যালিড কি না যাচাই করুন।');
      } finally {
        setPageLoading(false);
      }
    } else {
      setPageImageUrl(null);
    }
  };

  // Switch page
  const handlePageChange = async (newPage: number) => {
    if (!file || newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    try {
      setPageLoading(true);
      setCurrentPage(newPage);
      const img = await renderPdfPageToDataUrl(file, newPage, 1.5);
      setPageImageUrl(img);
    } catch (err: any) {
      console.error('Failed to render page:', err);
    } finally {
      setPageLoading(false);
    }
  };

  // Drag handlers for 8 handles
  const handlePointerDown = (target: DragTarget) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragTarget(target);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialRect: { ...cropRect },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragTarget || !dragStart || !containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.clientX) / bounds.width;
    const dy = (e.clientY - dragStart.clientY) / bounds.height;
    const orig = dragStart.initialRect;

    setCropRect(() => {
      // Move entire crop box
      if (dragTarget === 'body') {
        const clampedX = Math.max(0, Math.min(1 - orig.normWidth, orig.normX + dx));
        const clampedY = Math.max(0, Math.min(1 - orig.normHeight, orig.normY + dy));
        return {
          ...orig,
          normX: clampedX,
          normY: clampedY,
        };
      }

      let newX = orig.normX;
      let newY = orig.normY;
      let newW = orig.normWidth;
      let newH = orig.normHeight;

      // Top Edge
      if (dragTarget === 'topEdge' || dragTarget === 'topLeft' || dragTarget === 'topRight') {
        const maxY = orig.normY + orig.normHeight - 0.05;
        const candidateY = Math.max(0, Math.min(maxY, orig.normY + dy));
        newH = orig.normHeight - (candidateY - orig.normY);
        newY = candidateY;
      }

      // Bottom Edge
      if (dragTarget === 'bottomEdge' || dragTarget === 'bottomLeft' || dragTarget === 'bottomRight') {
        const candidateH = orig.normHeight + dy;
        newH = Math.max(0.05, Math.min(1 - orig.normY, candidateH));
      }

      // Left Edge
      if (dragTarget === 'leftEdge' || dragTarget === 'topLeft' || dragTarget === 'bottomLeft') {
        const maxX = orig.normX + orig.normWidth - 0.05;
        const candidateX = Math.max(0, Math.min(maxX, orig.normX + dx));
        newW = orig.normWidth - (candidateX - orig.normX);
        newX = candidateX;
      }

      // Right Edge
      if (dragTarget === 'rightEdge' || dragTarget === 'topRight' || dragTarget === 'bottomRight') {
        const candidateW = orig.normWidth + dx;
        newW = Math.max(0.05, Math.min(1 - orig.normX, candidateW));
      }

      return {
        normX: newX,
        normY: newY,
        normWidth: newW,
        normHeight: newH,
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragTarget) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragTarget(null);
      setDragStart(null);
    }
  };

  const handleResetFull = () => {
    setCropRect({
      normX: 0,
      normY: 0,
      normWidth: 1,
      normHeight: 1,
    });
  };

  const handleAutoFitMargin = () => {
    // 5% standard document crop
    setCropRect({
      normX: 0.06,
      normY: 0.06,
      normWidth: 0.88,
      normHeight: 0.88,
    });
  };

  const handleExecuteCrop = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const croppedBlob = await cropPdfPages(file, cropRect, applyToAll, currentPage - 1);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(croppedBlob);

      setResult({
        blob: croppedBlob,
        newSize: croppedBlob.size,
        downloadUrl,
        fileName: `${nameWithoutExt}_cropped.pdf`,
        originalSize: file.size,
        processedSize: croppedBlob.size,
        message: applyToAll
          ? `সবগুলো (${totalPages}টি) পেজ সফলভাবে ক্রপ করা হয়েছে এবং বাড়তি মার্জিন সম্পূর্ণ রিমুভ করা হয়েছে!`
          : `পেজ নম্বর ${currentPage} সফলভাবে ক্রপ করা হয়েছে!`,
      } as any);
    } catch (err: any) {
      console.error('Crop PDF error:', err);
      setError(err?.message || 'পিডিএফ ক্রপ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="Crop PDF"
        onReset={() => {
          setFile(null);
          setResult(null);
          setPageImageUrl(null);
        }}
      />
    );
  }

  // Polygon points for mask and border
  const leftPct = cropRect.normX * 100;
  const topPct = cropRect.normY * 100;
  const widthPct = cropRect.normWidth * 100;
  const heightPct = cropRect.normHeight * 100;
  const rightPct = leftPct + widthPct;
  const bottomPct = topPct + heightPct;

  const polyPoints = `${leftPct},${topPct} ${rightPct},${topPct} ${rightPct},${bottomPct} ${leftPct},${bottomPct}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* File Upload Screen */}
      {!file ? (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
              <Crop className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Crop PDF Pages (পিডিএফ ক্রপ ও মার্জিন রিমুভ)
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              পিডিএফের বাড়তি মার্জিন বা অনাকাঙ্ক্ষিত অংশ কেটে বাদ দিন। ৮টি হ্যান্ডেল দিয়ে নিখুঁতভাবে ক্রপ এরিয়া নির্ধারণ করুন।
            </p>
          </div>

          <FileUploader
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFileChange}
            title="Choose PDF to Crop / ক্রপ করার জন্য পিডিএফ ফাইল নির্বাচন করুন"
            description="ড্র্যাগ এবং ড্রপ করুন অথবা ব্রাউজ করে পিডিএফ ফাইল সিলেক্ট করুন"
            iconName="Crop"
          />
        </div>
      ) : (
        /* Crop Workspace - Matching Icecream PDF Editor & iPhone Crop Screens */
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-fadeIn">
          {/* Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900/95">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Crop Page</span>
                  <span className="text-xs text-slate-400 font-normal">({file.name})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  লাল ড্যাশযুক্ত বক্সটি টেনে পিডিএফ পেজের মাপ নির্ধারণ করুন
                </p>
              </div>
            </div>

            {/* Page Navigation & Grid Toggle */}
            <div className="flex items-center space-x-2">
              {totalPages > 1 && (
                <div className="flex items-center bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || pageLoading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || pageLoading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  showGrid
                    ? 'bg-slate-700 text-sky-400 border-sky-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="গ্রিড লাইন অন/অফ"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPageImageUrl(null);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Interactive Workspace */}
          <div className="relative min-h-[380px] max-h-[66vh] bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {pageLoading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="text-xs font-medium">পিডিএফ পেজ রেন্ডার হচ্ছে...</span>
              </div>
            ) : pageImageUrl ? (
              <div
                ref={containerRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative max-w-full max-h-[60vh] inline-block shadow-2xl rounded-sm overflow-hidden touch-none select-none"
              >
                {/* PDF Page Image */}
                <img
                  src={pageImageUrl}
                  alt={`Page ${currentPage}`}
                  className="max-h-[60vh] w-auto object-contain block pointer-events-none"
                />

                {/* SVG Overlay: Mask, Red Dashed Border & 3x3 Grid */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <mask id="pdfCropPageMask">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <rect x={leftPct} y={topPct} width={widthPct} height={heightPct} fill="black" />
                    </mask>
                  </defs>

                  {/* Dark Shaded Outside Backdrop */}
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    fill="rgba(0, 0, 0, 0.65)"
                    mask="url(#pdfCropPageMask)"
                  />

                  {/* Rule of Thirds Grid Lines (iPhone Style) */}
                  {showGrid && (
                    <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="0.35" strokeDasharray="1.5,1.5">
                      <line x1={leftPct + widthPct / 3} y1={topPct} x2={leftPct + widthPct / 3} y2={bottomPct} />
                      <line x1={leftPct + (widthPct * 2) / 3} y1={topPct} x2={leftPct + (widthPct * 2) / 3} y2={bottomPct} />
                      <line x1={leftPct} y1={topPct + heightPct / 3} x2={rightPct} y2={topPct + heightPct / 3} />
                      <line x1={leftPct} y1={topPct + (heightPct * 2) / 3} x2={rightPct} y2={topPct + (heightPct * 2) / 3} />
                    </g>
                  )}

                  {/* Primary Crop Boundary: Crisp Red Dashed Line (Icecream PDF Editor Style) */}
                  <polygon
                    points={polyPoints}
                    fill="rgba(239, 68, 68, 0.03)"
                    stroke="#ef4444"
                    strokeWidth="0.85"
                    strokeDasharray="2,2"
                  />

                  {/* Solid White Inner Hairline */}
                  <polygon
                    points={polyPoints}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.3"
                    opacity="0.75"
                  />
                </svg>

                {/* Move Body Drag Area */}
                <div
                  onPointerDown={handlePointerDown('body')}
                  className="absolute cursor-move z-10"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                  title="ক্রপ বক্সটি টেনে সরানো যাবে (Drag to move)"
                />

                {/* 4 Edge Midpoint Handles (Icecream Style) */}
                {/* Top Edge Handle */}
                <div
                  onPointerDown={handlePointerDown('topEdge')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-25 p-2"
                  style={{ left: `${leftPct + widthPct / 2}%`, top: `${topPct}%` }}
                  title="উপরের মার্জিন সামঞ্জস্য করুন"
                >
                  <div className="w-5 h-2 bg-red-600 border border-white rounded-xs shadow-md" />
                </div>

                {/* Right Edge Handle */}
                <div
                  onPointerDown={handlePointerDown('rightEdge')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-25 p-2"
                  style={{ left: `${rightPct}%`, top: `${topPct + heightPct / 2}%` }}
                  title="ডান মার্জিন সামঞ্জস্য করুন"
                >
                  <div className="w-2 h-5 bg-red-600 border border-white rounded-xs shadow-md" />
                </div>

                {/* Bottom Edge Handle */}
                <div
                  onPointerDown={handlePointerDown('bottomEdge')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-25 p-2"
                  style={{ left: `${leftPct + widthPct / 2}%`, top: `${bottomPct}%` }}
                  title="নিচের মার্জিন সামঞ্জস্য করুন"
                >
                  <div className="w-5 h-2 bg-red-600 border border-white rounded-xs shadow-md" />
                </div>

                {/* Left Edge Handle */}
                <div
                  onPointerDown={handlePointerDown('leftEdge')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-25 p-2"
                  style={{ left: `${leftPct}%`, top: `${topPct + heightPct / 2}%` }}
                  title="বাম মার্জিন সামঞ্জস্য করুন"
                >
                  <div className="w-2 h-5 bg-red-600 border border-white rounded-xs shadow-md" />
                </div>

                {/* 4 Corner Square Handles (Icecream & iPhone Style) */}
                {(
                  [
                    { key: 'topLeft', x: leftPct, y: topPct, cursor: 'cursor-nwse-resize' },
                    { key: 'topRight', x: rightPct, y: topPct, cursor: 'cursor-nesw-resize' },
                    { key: 'bottomRight', x: rightPct, y: bottomPct, cursor: 'cursor-nwse-resize' },
                    { key: 'bottomLeft', x: leftPct, y: bottomPct, cursor: 'cursor-nesw-resize' },
                  ] as const
                ).map(({ key, x, y, cursor }) => {
                  const isSelected = dragTarget === key;
                  return (
                    <div
                      key={key}
                      onPointerDown={handlePointerDown(key)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 ${cursor} z-30 p-2.5 transition-transform ${
                        isSelected ? 'scale-125' : 'hover:scale-115'
                      }`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title="কোণা টেনে সাইজ পরিবর্তন করুন"
                    >
                      <div className="w-4 h-4 bg-red-600 border-2 border-white rounded-xs shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Bottom Actions Bar - Exact Match to Icecream PDF Editor (Image 1) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-800 bg-slate-900/95">
            {/* Left Options & Apply to all */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAutoFitMargin}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>অটো মার্জিন ট্রিম</span>
              </button>

              <button
                type="button"
                onClick={handleResetFull}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>পুরো পেজ</span>
              </button>

              {/* Apply to all pages Checkbox (from Icecream screenshot) */}
              <label className="inline-flex items-center space-x-2 text-xs text-slate-300 cursor-pointer font-medium hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
                />
                <span>Apply to all (সকল পেজে এই ক্রপ সাইজ প্রয়োগ করুন)</span>
              </label>
            </div>

            {/* Right Action Buttons: CANCEL & Prominent Green CROP Button */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPageImageUrl(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={processing || !file}
                onClick={handleExecuteCrop}
                className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                id="execute-pdf-crop-btn"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>CROPPING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>CROP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="px-5 py-3 bg-red-950/70 border-t border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
