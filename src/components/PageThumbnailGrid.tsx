import React, { useState, useEffect } from 'react';
import { renderAllPdfThumbnails } from '../services/pdfEngine';
import { Check, RotateCw, Trash2, Loader2 } from 'lucide-react';

interface PageThumbnailGridProps {
  file: File;
  selectedPages: number[]; // 1-based page numbers
  onSelectionChange?: (pages: number[]) => void;
  pageRotations?: Record<number, number>; // page index -> rotation deg
  onPageRotate?: (pageIndex: number, newAngle: number) => void;
  onPageDelete?: (pageNumber: number) => void;
  allowSelection?: boolean;
  allowRotation?: boolean;
  allowDeletion?: boolean;
  maxPagesRender?: number;
}

export const PageThumbnailGrid: React.FC<PageThumbnailGridProps> = ({
  file,
  selectedPages,
  onSelectionChange,
  pageRotations = {},
  onPageRotate,
  onPageDelete,
  allowSelection = true,
  allowRotation = false,
  allowDeletion = false,
  maxPagesRender = 60,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadThumbs() {
      try {
        setLoading(true);
        setError(null);
        const thumbs = await renderAllPdfThumbnails(file, maxPagesRender, 0.45);
        if (isMounted) {
          setThumbnails(thumbs);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error rendering thumbnails:', err);
          setError('Failed to render PDF page previews. The file will still process accurately.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadThumbs();
    return () => {
      isMounted = false;
    };
  }, [file, maxPagesRender]);

  const togglePageSelection = (pageNum: number) => {
    if (!onSelectionChange) return;
    if (selectedPages.includes(pageNum)) {
      onSelectionChange(selectedPages.filter((p) => p !== pageNum));
    } else {
      onSelectionChange([...selectedPages, pageNum].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(thumbnails.map((_, idx) => idx + 1));
  };

  const handleDeselectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange([]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[220px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-700">Generating page previews...</p>
        <p className="text-xs text-slate-400 mt-1">Processing pages directly in your browser</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200" id="page-thumbnails-container">
      {/* Header with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Document Pages ({thumbnails.length} Total)
          </h4>
          {allowSelection && (
            <p className="text-xs text-slate-500">
              {selectedPages.length} of {thumbnails.length} pages selected
            </p>
          )}
        </div>

        {allowSelection && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Grid of Pages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {thumbnails.map((thumbUrl, index) => {
          const pageNum = index + 1;
          const isSelected = selectedPages.includes(pageNum);
          const currentRotation = pageRotations[index] || 0;

          return (
            <div
              key={`page-${pageNum}`}
              onClick={() => allowSelection && togglePageSelection(pageNum)}
              className={`group relative flex flex-col items-center rounded-xl bg-white p-2.5 shadow-sm border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-red-500 ring-2 ring-red-400/40 bg-red-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow'
              }`}
              id={`thumbnail-page-${pageNum}`}
            >
              {/* Checkbox indicator */}
              {allowSelection && (
                <div
                  className={`absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border shadow-sm transition-colors ${
                    isSelected
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-white/90 border-slate-300 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
              )}

              {/* Page Number Badge */}
              <div className="absolute top-3 right-3 z-10 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xs font-mono">
                {pageNum}
              </div>

              {/* Thumbnail Image */}
              <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-1">
                <img
                  src={thumbUrl}
                  alt={`Page ${pageNum}`}
                  style={{
                    transform: `rotate(${currentRotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                  className="max-h-full max-w-full object-contain rounded shadow-xs"
                />
              </div>

              {/* Action Buttons (Rotate, Delete) */}
              {(allowRotation || allowDeletion) && (
                <div
                  className="mt-2 flex w-full items-center justify-between border-t border-slate-100 pt-2 gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {allowRotation && onPageRotate && (
                    <button
                      type="button"
                      onClick={() => onPageRotate(index, (currentRotation + 90) % 360)}
                      className="flex flex-1 items-center justify-center p-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Rotate page 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5 mr-1" />
                      <span className="text-[10px]">Rotate</span>
                    </button>
                  )}

                  {allowDeletion && onPageDelete && (
                    <button
                      type="button"
                      onClick={() => onPageDelete(pageNum)}
                      className="flex items-center justify-center p-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete this page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
