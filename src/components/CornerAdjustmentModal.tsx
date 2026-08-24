import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentCorners,
  Point,
  detectDocumentCornersWithConfidence,
  fullFrameCorners,
} from '../services/documentScanner';
import { Check, RotateCcw, Sparkles, X, Move, Info } from 'lucide-react';

interface CornerAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  imageId: string;
  initialCorners?: DocumentCorners | null;
  onSaveCorners: (id: string, corners: DocumentCorners | null) => void;
}

export const CornerAdjustmentModal: React.FC<CornerAdjustmentModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  imageId,
  initialCorners,
  onSaveCorners,
}) => {
  const [corners, setCorners] = useState<DocumentCorners | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 1, height: 1 });
  const [activeCorner, setActiveCorner] = useState<'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft' | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen || !imageFile) {
      setImgSrc(null);
      setCorners(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImgSrc(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImageDims({ width: w, height: h });

      if (initialCorners) {
        setCorners(initialCorners);
      } else {
        // Run auto-detection
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const det = detectDocumentCornersWithConfidence(canvas);
          setCorners(det.corners);
          setConfidence(Math.round(det.confidence * 100));
        } else {
          setCorners(fullFrameCorners(w, h));
        }
      }
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [isOpen, imageFile, initialCorners]);

  if (!isOpen || !imgSrc || !corners) return null;

  // Convert image coordinates to percentage (0% to 100%) for responsive overlay
  const toPctX = (x: number) => (x / imageDims.width) * 100;
  const toPctY = (y: number) => (y / imageDims.height) * 100;

  // Handle Dragging
  const handlePointerDown = (corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveCorner(corner);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeCorner || !containerRef.current || !corners) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
    const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

    const normX = (clientX - rect.left) / rect.width;
    const normY = (clientY - rect.top) / rect.height;

    const newX = Math.max(0, Math.min(imageDims.width, normX * imageDims.width));
    const newY = Math.max(0, Math.min(imageDims.height, normY * imageDims.height));

    setCorners((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [activeCorner]: { x: Math.round(newX), y: Math.round(newY) },
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeCorner) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveCorner(null);
    }
  };

  const handleAutoDetect = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = imageDims.width;
    canvas.height = imageDims.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgRef.current, 0, 0);
      const det = detectDocumentCornersWithConfidence(canvas);
      setCorners(det.corners);
      setConfidence(Math.round(det.confidence * 100));
    }
  };

  const handleResetFull = () => {
    setCorners(fullFrameCorners(imageDims.width, imageDims.height));
    setConfidence(null);
  };

  const handleSave = () => {
    onSaveCorners(imageId, corners);
    onClose();
  };

  const polyPoints = `${toPctX(corners.topLeft.x)},${toPctY(corners.topLeft.y)} ${toPctX(corners.topRight.x)},${toPctY(corners.topRight.y)} ${toPctX(corners.bottomRight.x)},${toPctY(corners.bottomRight.y)} ${toPctX(corners.bottomLeft.x)},${toPctY(corners.bottomLeft.y)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Adjust Document Corners
                {confidence !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {confidence}% Confidence
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Drag the 4 corner handles to match the physical paper boundaries exactly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Workspace */}
        <div className="relative flex-1 min-h-[300px] max-h-[62vh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative max-w-full max-h-full inline-block shadow-2xl rounded-lg overflow-hidden touch-none"
            style={{
              aspectRatio: `${imageDims.width} / ${imageDims.height}`,
            }}
          >
            {/* Base Image */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Document"
              className="w-full h-full object-contain pointer-events-none block"
            />

            {/* SVG Polygon & Lines Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Semi-transparent Dark Mask with Document Cutout */}
              <defs>
                <mask id="docMask">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <polygon points={polyPoints} fill="black" />
                </mask>
              </defs>

              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="rgba(0, 0, 0, 0.55)"
                mask="url(#docMask)"
              />

              {/* Glowing Boundary Polyline */}
              <polygon
                points={polyPoints}
                fill="rgba(59, 130, 246, 0.12)"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />

              {/* Solid inner border line */}
              <polygon
                points={polyPoints}
                fill="none"
                stroke="#0284c7"
                strokeWidth="0.5"
              />
            </svg>

            {/* 4 Interactive Corner Handles */}
            {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const).map((key) => {
              const pt = corners[key];
              const pctX = toPctX(pt.x);
              const pctY = toPctY(pt.y);
              const isSelected = activeCorner === key;

              const labelMap = {
                topLeft: 'Top-Left',
                topRight: 'Top-Right',
                bottomRight: 'Bottom-Right',
                bottomLeft: 'Bottom-Left',
              };

              return (
                <div
                  key={key}
                  onPointerDown={handlePointerDown(key)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-30 transition-transform ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{ left: `${pctX}%`, top: `${pctY}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Ring Pulse */}
                    <div className="w-8 h-8 rounded-full bg-sky-500/30 border-2 border-sky-400 flex items-center justify-center shadow-lg backdrop-blur-xs">
                      <div className="w-3 h-3 rounded-full bg-white ring-2 ring-sky-600" />
                    </div>

                    {/* Corner Tag */}
                    <span className="absolute top-8 px-1.5 py-0.5 rounded bg-slate-900/90 text-sky-300 font-mono text-[9px] font-bold shadow-md border border-slate-700 whitespace-nowrap pointer-events-none">
                      {labelMap[key]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Toolbar & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/95">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAutoDetect}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Auto-Detect Corners</span>
            </button>

            <button
              type="button"
              onClick={handleResetFull}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Page (No Crop)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Corners</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
