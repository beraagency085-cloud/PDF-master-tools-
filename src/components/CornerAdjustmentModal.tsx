import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentCorners,
  Point,
  detectDocumentCornersWithConfidence,
  fullFrameCorners,
} from '../services/documentScanner';
import { Check, RotateCcw, Sparkles, X, Move, Maximize2, Grid } from 'lucide-react';

interface CornerAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  imageId: string;
  initialCorners?: DocumentCorners | null;
  onSaveCorners: (id: string, corners: DocumentCorners | null, applyToAll?: boolean) => void;
}

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
  const [cropMode, setCropMode] = useState<'box' | 'perspective'>('box');
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialCorners: DocumentCorners } | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

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

  // Percentage conversion for responsive coordinate display
  const toPctX = (x: number) => (x / imageDims.width) * 100;
  const toPctY = (y: number) => (y / imageDims.height) * 100;

  // Midpoints for the 4 edges
  const topMid = {
    x: (corners.topLeft.x + corners.topRight.x) / 2,
    y: (corners.topLeft.y + corners.topRight.y) / 2,
  };
  const rightMid = {
    x: (corners.topRight.x + corners.bottomRight.x) / 2,
    y: (corners.topRight.y + corners.bottomRight.y) / 2,
  };
  const bottomMid = {
    x: (corners.bottomLeft.x + corners.bottomRight.x) / 2,
    y: (corners.bottomLeft.y + corners.bottomRight.y) / 2,
  };
  const leftMid = {
    x: (corners.topLeft.x + corners.bottomLeft.x) / 2,
    y: (corners.topLeft.y + corners.bottomLeft.y) / 2,
  };

  // Drag start handler
  const handlePointerDown = (target: DragTarget) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * imageDims.width;
    const currentY = ((e.clientY - rect.top) / rect.height) * imageDims.height;

    setDragTarget(target);
    setDragStart({
      x: currentX,
      y: currentY,
      initialCorners: {
        topLeft: { ...corners.topLeft },
        topRight: { ...corners.topRight },
        bottomRight: { ...corners.bottomRight },
        bottomLeft: { ...corners.bottomLeft },
      },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragTarget || !containerRef.current || !dragStart) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
    const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

    const currentX = Math.max(0, Math.min(imageDims.width, ((clientX - rect.left) / rect.width) * imageDims.width));
    const currentY = Math.max(0, Math.min(imageDims.height, ((clientY - rect.top) / rect.height) * imageDims.height));

    const dx = currentX - dragStart.x;
    const dy = currentY - dragStart.y;
    const orig = dragStart.initialCorners;

    setCorners(() => {
      // 1. Move the entire crop box (body drag)
      if (dragTarget === 'body') {
        const minX = Math.min(orig.topLeft.x, orig.bottomLeft.x);
        const maxX = Math.max(orig.topRight.x, orig.bottomRight.x);
        const minY = Math.min(orig.topLeft.y, orig.topRight.y);
        const maxY = Math.max(orig.bottomLeft.y, orig.bottomRight.y);

        const clampedDx = Math.max(-minX, Math.min(imageDims.width - maxX, dx));
        const clampedDy = Math.max(-minY, Math.min(imageDims.height - maxY, dy));

        return {
          topLeft: { x: Math.round(orig.topLeft.x + clampedDx), y: Math.round(orig.topLeft.y + clampedDy) },
          topRight: { x: Math.round(orig.topRight.x + clampedDx), y: Math.round(orig.topRight.y + clampedDy) },
          bottomRight: { x: Math.round(orig.bottomRight.x + clampedDx), y: Math.round(orig.bottomRight.y + clampedDy) },
          bottomLeft: { x: Math.round(orig.bottomLeft.x + clampedDx), y: Math.round(orig.bottomLeft.y + clampedDy) },
        };
      }

      // 2. Box Mode: Rectangle constraints
      if (cropMode === 'box') {
        const topY = Math.min(orig.bottomLeft.y - 20, Math.max(0, orig.topLeft.y + dy));
        const botY = Math.max(orig.topLeft.y + 20, Math.min(imageDims.height, orig.bottomLeft.y + dy));
        const leftX = Math.min(orig.topRight.x - 20, Math.max(0, orig.topLeft.x + dx));
        const rightX = Math.max(orig.topLeft.x + 20, Math.min(imageDims.width, orig.topRight.x + dx));

        if (dragTarget === 'topEdge') {
          return {
            topLeft: { x: orig.topLeft.x, y: Math.round(topY) },
            topRight: { x: orig.topRight.x, y: Math.round(topY) },
            bottomRight: orig.bottomRight,
            bottomLeft: orig.bottomLeft,
          };
        }
        if (dragTarget === 'bottomEdge') {
          return {
            topLeft: orig.topLeft,
            topRight: orig.topRight,
            bottomRight: { x: orig.bottomRight.x, y: Math.round(botY) },
            bottomLeft: { x: orig.bottomLeft.x, y: Math.round(botY) },
          };
        }
        if (dragTarget === 'leftEdge') {
          return {
            topLeft: { x: Math.round(leftX), y: orig.topLeft.y },
            topRight: orig.topRight,
            bottomRight: orig.bottomRight,
            bottomLeft: { x: Math.round(leftX), y: orig.bottomLeft.y },
          };
        }
        if (dragTarget === 'rightEdge') {
          return {
            topLeft: orig.topLeft,
            topRight: { x: Math.round(rightX), y: orig.topRight.y },
            bottomRight: { x: Math.round(rightX), y: orig.bottomRight.y },
            bottomLeft: orig.bottomLeft,
          };
        }

        // Corner resizing in Box mode
        if (dragTarget === 'topLeft') {
          return {
            topLeft: { x: Math.round(leftX), y: Math.round(topY) },
            topRight: { x: orig.topRight.x, y: Math.round(topY) },
            bottomRight: orig.bottomRight,
            bottomLeft: { x: Math.round(leftX), y: orig.bottomLeft.y },
          };
        }
        if (dragTarget === 'topRight') {
          return {
            topLeft: { x: orig.topLeft.x, y: Math.round(topY) },
            topRight: { x: Math.round(rightX), y: Math.round(topY) },
            bottomRight: { x: Math.round(rightX), y: orig.bottomRight.y },
            bottomLeft: orig.bottomLeft,
          };
        }
        if (dragTarget === 'bottomRight') {
          return {
            topLeft: orig.topLeft,
            topRight: { x: Math.round(rightX), y: orig.topRight.y },
            bottomRight: { x: Math.round(rightX), y: Math.round(botY) },
            bottomLeft: { x: orig.bottomLeft.x, y: Math.round(botY) },
          };
        }
        if (dragTarget === 'bottomLeft') {
          return {
            topLeft: { x: Math.round(leftX), y: orig.topLeft.y },
            topRight: orig.topRight,
            bottomRight: orig.bottomRight,
            bottomLeft: { x: Math.round(leftX), y: Math.round(botY) },
          };
        }
      }

      // 3. Perspective Mode: Freely adjust each corner or pull edge
      if (dragTarget === 'topLeft') {
        return { ...orig, topLeft: { x: Math.round(currentX), y: Math.round(currentY) } };
      }
      if (dragTarget === 'topRight') {
        return { ...orig, topRight: { x: Math.round(currentX), y: Math.round(currentY) } };
      }
      if (dragTarget === 'bottomRight') {
        return { ...orig, bottomRight: { x: Math.round(currentX), y: Math.round(currentY) } };
      }
      if (dragTarget === 'bottomLeft') {
        return { ...orig, bottomLeft: { x: Math.round(currentX), y: Math.round(currentY) } };
      }
      if (dragTarget === 'topEdge') {
        return {
          ...orig,
          topLeft: { x: orig.topLeft.x, y: Math.round(orig.topLeft.y + dy) },
          topRight: { x: orig.topRight.x, y: Math.round(orig.topRight.y + dy) },
        };
      }
      if (dragTarget === 'bottomEdge') {
        return {
          ...orig,
          bottomLeft: { x: orig.bottomLeft.x, y: Math.round(orig.bottomLeft.y + dy) },
          bottomRight: { x: orig.bottomRight.x, y: Math.round(orig.bottomRight.y + dy) },
        };
      }
      if (dragTarget === 'leftEdge') {
        return {
          ...orig,
          topLeft: { x: Math.round(orig.topLeft.x + dx), y: orig.topLeft.y },
          bottomLeft: { x: Math.round(orig.bottomLeft.x + dx), y: orig.bottomLeft.y },
        };
      }
      if (dragTarget === 'rightEdge') {
        return {
          ...orig,
          topRight: { x: Math.round(orig.topRight.x + dx), y: orig.topRight.y },
          bottomRight: { x: Math.round(orig.bottomRight.x + dx), y: orig.bottomRight.y },
        };
      }

      return orig;
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
    onSaveCorners(imageId, corners, applyToAll);
    onClose();
  };

  const polyPoints = `${toPctX(corners.topLeft.x)},${toPctY(corners.topLeft.y)} ${toPctX(corners.topRight.x)},${toPctY(corners.topRight.y)} ${toPctX(corners.bottomRight.x)},${toPctY(corners.bottomRight.y)} ${toPctX(corners.bottomLeft.x)},${toPctY(corners.bottomLeft.y)}`;

  // Grid lines calculation for Rule of Thirds (iPhone style)
  const p1X = toPctX(corners.topLeft.x + (corners.topRight.x - corners.topLeft.x) / 3);
  const p1Y = toPctY(corners.topLeft.y + (corners.topRight.y - corners.topLeft.y) / 3);
  const p2X = toPctX(corners.bottomLeft.x + (corners.bottomRight.x - corners.bottomLeft.x) / 3);
  const p2Y = toPctY(corners.bottomLeft.y + (corners.bottomRight.y - corners.bottomLeft.y) / 3);

  const p3X = toPctX(corners.topLeft.x + ((corners.topRight.x - corners.topLeft.x) * 2) / 3);
  const p3Y = toPctY(corners.topLeft.y + ((corners.topRight.y - corners.topLeft.y) * 2) / 3);
  const p4X = toPctX(corners.bottomLeft.x + ((corners.bottomRight.x - corners.bottomLeft.x) * 2) / 3);
  const p4Y = toPctY(corners.bottomLeft.y + ((corners.bottomRight.y - corners.bottomLeft.y) * 2) / 3);

  const h1X = toPctX(corners.topLeft.x + (corners.bottomLeft.x - corners.topLeft.x) / 3);
  const h1Y = toPctY(corners.topLeft.y + (corners.bottomLeft.y - corners.topLeft.y) / 3);
  const h2X = toPctX(corners.topRight.x + (corners.bottomRight.x - corners.topRight.x) / 3);
  const h2Y = toPctY(corners.topRight.y + (corners.bottomRight.y - corners.topRight.y) / 3);

  const h3X = toPctX(corners.topLeft.x + ((corners.bottomLeft.x - corners.topLeft.x) * 2) / 3);
  const h3Y = toPctY(corners.topLeft.y + ((corners.bottomLeft.y - corners.topLeft.y) * 2) / 3);
  const h4X = toPctX(corners.topRight.x + ((corners.bottomRight.x - corners.topRight.x) * 2) / 3);
  const h4Y = toPctY(corners.topRight.y + ((corners.bottomRight.y - corners.topRight.y) * 2) / 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-5 select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header - Icecream PDF Editor & iPhone Style */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Crop Page</span>
                <span className="text-xs text-slate-400 font-normal">(ক্রপ এরিয়া নির্ধারণ)</span>
                {confidence !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    {confidence}% Auto-Matched
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                হাতল বা কোণা টেনে খাতা/বইয়ের বাড়তি টেবিল বা ব্যাকগ্রাউন্ড বাদ দিন
              </p>
            </div>
          </div>

          {/* Mode Switch & Grid Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setCropMode('box')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cropMode === 'box'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="বক্স ক্রপ: চারপাশের হাতল দিয়ে সহজ আয়তাকার ক্রপ"
              >
                বক্স ক্রপ
              </button>
              <button
                type="button"
                onClick={() => setCropMode('perspective')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cropMode === 'perspective'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="পার্সপেক্টিভ ক্রপ: খাতা বা বইয়ের বাঁকা কোণা সোজা করতে"
              >
                ৪-কোণা ক্রপ
              </button>
            </div>

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
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Workspace with 8 Handles, Mask & Grid */}
        <div className="relative flex-1 min-h-[300px] max-h-[64vh] bg-slate-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative max-w-full max-h-full inline-block shadow-2xl rounded-sm overflow-hidden touch-none select-none"
            style={{
              aspectRatio: `${imageDims.width} / ${imageDims.height}`,
            }}
          >
            {/* Source Image */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop workspace"
              className="w-full h-full object-contain pointer-events-none block"
            />

            {/* SVG Overlay: Mask, Red Dashed Border & Grid Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="icecreamCropMask">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <polygon points={polyPoints} fill="black" />
                </mask>
              </defs>

              {/* Shaded Outside Backdrop Mask */}
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="rgba(0, 0, 0, 0.65)"
                mask="url(#icecreamCropMask)"
              />

              {/* Rule of Thirds Grid Lines (iPhone Style) */}
              {showGrid && (
                <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.35" strokeDasharray="1.5,1.5">
                  <line x1={p1X} y1={p1Y} x2={p2X} y2={p2Y} />
                  <line x1={p3X} y1={p3Y} x2={p4X} y2={p4Y} />
                  <line x1={h1X} y1={h1Y} x2={h2X} y2={h2Y} />
                  <line x1={h3X} y1={h3Y} x2={h4X} y2={h4Y} />
                </g>
              )}

              {/* Primary Crop Boundary: Crisp Red Dashed Line (Icecream PDF Editor Style) */}
              <polygon
                points={polyPoints}
                fill="rgba(239, 68, 68, 0.04)"
                stroke="#ef4444"
                strokeWidth="0.9"
                strokeDasharray="2,2"
              />

              {/* High-visibility Solid Inner Guide */}
              <polygon
                points={polyPoints}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.3"
                opacity="0.75"
              />
            </svg>

            {/* Center Body Drag Area (Click and drag inside crop box to translate) */}
            <div
              onPointerDown={handlePointerDown('body')}
              className="absolute cursor-move z-10"
              style={{
                left: `${toPctX(Math.min(corners.topLeft.x, corners.bottomLeft.x))}%`,
                top: `${toPctY(Math.min(corners.topLeft.y, corners.topRight.y))}%`,
                width: `${toPctX(Math.max(corners.topRight.x, corners.bottomRight.x) - Math.min(corners.topLeft.x, corners.bottomLeft.x))}%`,
                height: `${toPctY(Math.max(corners.bottomLeft.y, corners.bottomRight.y) - Math.min(corners.topLeft.y, corners.topRight.y))}%`,
              }}
              title="ক্রপ বক্সটি টেনে সরানো যাবে (Drag to move)"
            />

            {/* 4 Edge Midpoint Handles (Top, Right, Bottom, Left) */}
            {/* Top Edge Handle */}
            <div
              onPointerDown={handlePointerDown('topEdge')}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-25 p-2"
              style={{ left: `${toPctX(topMid.x)}%`, top: `${toPctY(topMid.y)}%` }}
              title="উপরের সীমানা পরিবর্তন করুন"
            >
              <div className="w-5 h-2.5 bg-red-600 border border-white rounded-xs shadow-md" />
            </div>

            {/* Right Edge Handle */}
            <div
              onPointerDown={handlePointerDown('rightEdge')}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-25 p-2"
              style={{ left: `${toPctX(rightMid.x)}%`, top: `${toPctY(rightMid.y)}%` }}
              title="ডানপাশের সীমানা পরিবর্তন করুন"
            >
              <div className="w-2.5 h-5 bg-red-600 border border-white rounded-xs shadow-md" />
            </div>

            {/* Bottom Edge Handle */}
            <div
              onPointerDown={handlePointerDown('bottomEdge')}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-25 p-2"
              style={{ left: `${toPctX(bottomMid.x)}%`, top: `${toPctY(bottomMid.y)}%` }}
              title="নিচের সীমানা পরিবর্তন করুন"
            >
              <div className="w-5 h-2.5 bg-red-600 border border-white rounded-xs shadow-md" />
            </div>

            {/* Left Edge Handle */}
            <div
              onPointerDown={handlePointerDown('leftEdge')}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-25 p-2"
              style={{ left: `${toPctX(leftMid.x)}%`, top: `${toPctY(leftMid.y)}%` }}
              title="বামপাশের সীমানা পরিবর্তন করুন"
            >
              <div className="w-2.5 h-5 bg-red-600 border border-white rounded-xs shadow-md" />
            </div>

            {/* 4 Corner Square Handles (Icecream PDF Editor & iPhone Style) */}
            {(
              [
                { key: 'topLeft', cursor: 'cursor-nwse-resize', label: 'Top-Left' },
                { key: 'topRight', cursor: 'cursor-nesw-resize', label: 'Top-Right' },
                { key: 'bottomRight', cursor: 'cursor-nwse-resize', label: 'Bottom-Right' },
                { key: 'bottomLeft', cursor: 'cursor-nesw-resize', label: 'Bottom-Left' },
              ] as const
            ).map(({ key, cursor, label }) => {
              const pt = corners[key];
              const pctX = toPctX(pt.x);
              const pctY = toPctY(pt.y);
              const isSelected = dragTarget === key;

              return (
                <div
                  key={key}
                  onPointerDown={handlePointerDown(key)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 ${cursor} z-30 p-2.5 transition-transform ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                  style={{ left: `${pctX}%`, top: `${pctY}%` }}
                  title={`${label} কোণা টেনে অ্যাডজাস্ট করুন`}
                >
                  <div className="w-4 h-4 bg-red-600 border-2 border-white rounded-xs shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar - Matching Icecream PDF Editor Image 1 */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/95">
          {/* Left tools & Apply to all */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAutoDetect}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>পেজ অটো-ডিটেক্ট</span>
            </button>

            <button
              type="button"
              onClick={handleResetFull}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>পুরো ফ্রেম</span>
            </button>

            {/* Apply to all pages Checkbox (from Icecream screenshot) */}
            <label className="inline-flex items-center space-x-2 text-xs text-slate-300 cursor-pointer font-medium hover:text-white select-none">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
              />
              <span>Apply to all (সকল পেজে এই মাপ প্রয়োগ করুন)</span>
            </label>
          </div>

          {/* Right Action Buttons: CANCEL & Prominent Green CROP Button */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              id="confirm-crop-btn"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>CROP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
