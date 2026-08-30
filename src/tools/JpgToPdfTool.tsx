import React, { useState, useRef, useEffect } from 'react';
import { ResultScreen } from '../components/ResultScreen';
import { imagesToPdf } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import {
  Camera,
  Image as ImageIcon,
  UploadCloud,
  FolderOpen,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Loader2,
  ArrowRight,
  X,
  SwitchCamera,
  Check,
  Sparkles,
  ShieldCheck,
  Eye,
  Crop,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { DocumentCorners } from '../services/documentScanner';
import { CornerAdjustmentModal } from '../components/CornerAdjustmentModal';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
  source: 'camera' | 'gallery' | 'upload';
  customCorners?: DocumentCorners | null;
}

export const JpgToPdfTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'original'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'medium'>('small');
  
  // Document Scanner Enhancement Options
  const [colorMode, setColorMode] = useState<'color' | 'bw' | 'grayscale' | 'original'>('color');
  const [autoCrop, setAutoCrop] = useState<boolean>(true);
  const [removeShadows, setRemoveShadows] = useState<boolean>(true);

  const [activeCornerModalItem, setActiveCornerModalItem] = useState<ImageItem | null>(null);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  // Live Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hidden input refs
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Start live camera
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use native camera upload.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Live camera stream error, offering native capture fallback:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. You can allow camera in browser settings or use the native camera option below.'
          : 'Unable to open live camera stream. Click "Use Native Camera" below to take a photo.'
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `camera_photo_${timestamp}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);

        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            file,
            previewUrl,
            rotation: 0,
            source: 'camera',
          },
        ]);

        // Close camera on capture (or keep open for multi-shot if desired)
        stopCamera();
      },
      'image/jpeg',
      0.95
    );
  };

  // Add files from gallery or upload
  const handleAddFiles = (fileList: FileList | null, source: 'camera' | 'gallery' | 'upload') => {
    if (!fileList || fileList.length === 0) return;
    const newItems: ImageItem[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name)) {
        newItems.push({
          id: `${Date.now()}-${Math.random()}-${file.name}`,
          file,
          previewUrl: URL.createObjectURL(file),
          rotation: 0,
          source,
        });
      }
    });

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      setError(null);
    }
  };

  // Drag & drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleAddFiles(e.dataTransfer.files, 'upload');
    }
  };

  // Rotate an image
  const rotateImage = async (index: number) => {
    const item = images[index];
    const newRotation = (item.rotation + 90) % 360;

    // Apply rotation on canvas to generate new File
    try {
      const img = new Image();
      img.src = item.previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (newRotation === 90 || newRotation === 270) {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((newRotation * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const rotatedFile = new File([blob], item.file.name, { type: item.file.type || 'image/jpeg' });
          const newPreview = URL.createObjectURL(blob);

          setImages((prev) => {
            const copy = [...prev];
            copy[index] = {
              ...item,
              file: rotatedFile,
              previewUrl: newPreview,
              rotation: newRotation,
            };
            return copy;
          });
        },
        item.file.type || 'image/jpeg',
        0.95
      );
    } catch (e) {
      console.error('Rotation failed:', e);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setImages(copy);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setImages(copy);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCorners = (id: string, corners: DocumentCorners | null) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customCorners: corners } : item))
    );
  };

  // Convert to PDF
  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      setProcessing(true);
      setError(null);

      const items = images.map((img) => ({
        file: img.file,
        customCorners: img.customCorners,
      }));

      const pdfBlob = await imagesToPdf(items, {
        pageSize,
        orientation,
        margin,
        scannerOptions: {
          autoCrop,
          removeShadows,
          whitenBackground: true,
          suppressBleedThrough: true,
          enhanceText: true,
          colorMode,
        },
      });

      const totalOriginalSize = images.reduce((acc, f) => acc + f.file.size, 0);
      const downloadUrl = URL.createObjectURL(pdfBlob);

      const baseName =
        images.length === 1
          ? images[0].file.name.replace(/\.[^/.]+$/, '').trim() || 'converted-document'
          : 'converted-images';
      const outputFileName = `${baseName}.pdf`;

      setResult({
        blob: pdfBlob,
        fileName: outputFileName,
        originalSize: totalOriginalSize,
        newSize: pdfBlob.size,
        downloadUrl,
        pageCount: images.length,
      });
    } catch (err: any) {
      console.error('Image to PDF conversion failed:', err);
      setError(err.message || 'Failed to convert images to PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
    setError(null);
    stopCamera();
  };

  // Cleanup camera and blob URLs on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="Image to PDF Conversion"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="image-to-pdf-tool">
      {/* Hidden File Inputs */}
      {/* 1. Gallery input */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleAddFiles(e.target.files, 'gallery');
          e.target.value = '';
        }}
      />

      {/* 2. Standard Upload input */}
      <input
        type="file"
        ref={uploadInputRef}
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleAddFiles(e.target.files, 'upload');
          e.target.value = '';
        }}
      />

      {/* 3. Native mobile camera fallback input */}
      <input
        type="file"
        ref={nativeCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleAddFiles(e.target.files, 'camera');
          e.target.value = '';
        }}
      />

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                <span className="font-bold text-sm sm:text-base">Take Photo with Camera</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                  <span className="text-xs text-slate-300 font-medium">Starting camera stream...</span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/95 text-white text-center space-y-4">
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      nativeCameraInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Open Native Device Camera
                  </button>
                </div>
              )}
            </div>

            {/* Hidden canvas for snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors"
                title="Switch Camera (Front / Back)"
              >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">Flip</span>
              </button>

              <button
                type="button"
                disabled={cameraLoading || !!cameraError}
                onClick={capturePhoto}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40 active:scale-95 transition-transform disabled:opacity-50 ring-4 ring-white/20"
                id="camera-shutter-btn"
                title="Snap Photo"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  nativeCameraInputRef.current?.click();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline text-right"
              >
                Use System App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Image Selection Area */}
      {images.length === 0 ? (
        <div className="space-y-6">
          {/* Prominent Hero Action Buttons Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-3xl bg-white/90 backdrop-blur-md p-6 sm:p-10 border-2 transition-all shadow-sm text-center ${
              isDragging
                ? 'border-red-500 bg-red-50/70 scale-[1.01]'
                : 'border-slate-200/90 hover:border-red-300'
            }`}
          >
            <div className="max-w-xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Image to PDF Conversion</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Take a photo, choose from gallery, or upload images
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Combine pictures, receipts, scans, JPG, PNG &amp; WEBP directly into a clean PDF document.
                </p>
              </div>

              {/* Three Main Action Buttons with Color Grading and Interactive Effects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* 1. Camera Button - Red/Crimson Gradient with Shimmer & Glow */}
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white shadow-[0_6px_20px_rgba(220,38,38,0.35)] hover:shadow-[0_12px_28px_rgba(220,38,38,0.5)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer"
                  id="take-photo-btn"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-white mb-3 group-hover:scale-115 group-hover:rotate-3 transition-transform shadow-inner">
                    <Camera className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white">Take Photo</span>
                  <span className="text-[11px] text-red-100 mt-0.5 font-semibold bg-black/15 px-2 py-0.5 rounded-full">Use Camera</span>
                </button>

                {/* 2. Gallery Button - Amber/Orange Gradient with Glow */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_6px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.45)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer"
                  id="choose-gallery-btn"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-white mb-3 group-hover:scale-115 group-hover:-rotate-3 transition-transform shadow-inner">
                    <ImageIcon className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white">Choose from Gallery</span>
                  <span className="text-[11px] text-amber-100 mt-0.5 font-semibold bg-black/15 px-2 py-0.5 rounded-full">Pick Photos</span>
                </button>

                {/* 3. Upload File Button - Blue/Indigo Gradient with Glow */}
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.45)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer"
                  id="upload-image-btn"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-white mb-3 group-hover:scale-115 group-hover:rotate-3 transition-transform shadow-inner">
                    <UploadCloud className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white">Upload Image</span>
                  <span className="text-[11px] text-blue-100 mt-0.5 font-semibold bg-black/15 px-2 py-0.5 rounded-full">Browse Files or Drop</span>
                </button>
              </div>

              {/* Drag & drop dropzone hint */}
              <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200/80">
                  JPG, JPEG, PNG, WEBP
                </span>
                <span>• Multiple files supported</span>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80 max-w-fit mx-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side Privacy — Images never leave your device</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Image Management & PDF Configuration Area */
        <div className="space-y-6">
          {/* Quick Action Top Bar to Add More */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-xs">
                {images.length}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {images.length === 1 ? '1 Image Selected' : `${images.length} Images Selected`}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Total Size: {formatBytes(images.reduce((sum, img) => sum + img.file.size, 0))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 text-xs font-bold transition-all shadow-xs shadow-red-500/25 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Another</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 text-xs font-bold transition-all shadow-xs shadow-amber-500/25 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Add Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 text-xs font-bold transition-all shadow-xs shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload More</span>
              </button>

              <button
                type="button"
                onClick={() => setImages([])}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Clear all images"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid of Selected Image Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="selected-images-grid">
            {images.map((item, idx) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/90 overflow-hidden shadow-xs hover:border-red-300 transition-all"
              >
                {/* Image Preview */}
                <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-contain p-2"
                  />
                  {/* Badge showing page number */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-bold text-[10px] backdrop-blur-xs">
                    Page {idx + 1}
                  </span>

                  {/* Badge showing source */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-slate-700 font-semibold text-[9px] uppercase border border-slate-200/80 shadow-2xs">
                    {item.source === 'camera' ? '📷 Camera' : item.source === 'gallery' ? '🖼️ Gallery' : '📁 Upload'}
                  </span>

                  {item.customCorners && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-sky-600/90 text-white font-bold text-[9px] shadow-xs">
                      Corners Adjusted
                    </span>
                  )}
                </div>

                {/* Card Info & Tools */}
                <div className="p-3 flex items-center justify-between bg-white text-xs">
                  <div className="overflow-hidden mr-2">
                    <p className="font-semibold text-slate-800 truncate text-xs">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatBytes(item.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveCornerModalItem(item)}
                      title="Adjust Page Corners & Crop"
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.customCorners
                          ? 'text-sky-600 bg-sky-50 hover:bg-sky-100'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => rotateImage(idx)}
                      title="Rotate 90°"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      title="Delete Image"
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Document Scanner Engine Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Document Scanner Processing
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Auto-Enhanced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Scan Mode / Filter */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Scan Filter
                </label>
                <select
                  value={colorMode}
                  onChange={(e: any) => setColorMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="color">Clean Color Scan (Default)</option>
                  <option value="bw">Crisp Black &amp; White</option>
                  <option value="grayscale">Grayscale Document</option>
                  <option value="original">Original Photo (Unprocessed)</option>
                </select>
              </div>

              {/* Auto Boundary Crop */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Page Boundary Crop
                </label>
                <select
                  value={autoCrop ? 'true' : 'false'}
                  onChange={(e: any) => setAutoCrop(e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="true">Auto-Crop Table / Floor / Bed</option>
                  <option value="false">Keep Full Camera Frame</option>
                </select>
              </div>

              {/* Shadow & Lighting Normalization */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Lighting &amp; Shadows
                </label>
                <select
                  value={removeShadows ? 'true' : 'false'}
                  onChange={(e: any) => setRemoveShadows(e.target.value === 'true')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="true">Remove Shadows &amp; Whiten Page</option>
                  <option value="false">Keep Original Lighting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Page Formatting Options Card */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md p-5 border border-slate-200/90 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              PDF Formatting Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Page Dimensions
                </label>
                <select
                  value={pageSize}
                  onChange={(e: any) => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="a4">A4 (Standard Document)</option>
                  <option value="letter">US Letter</option>
                  <option value="original">Original Image Aspect Ratio</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e: any) => setOrientation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="auto">Auto (Match Image Format)</option>
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Landscape (Horizontal)</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Page Margin
                </label>
                <select
                  value={margin}
                  onChange={(e: any) => setMargin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="none">No Margin (Full Bleed)</option>
                  <option value="small">Small Margin (20pt)</option>
                  <option value="medium">Medium Margin (40pt)</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Instant Convert & Download Action */}
          <div className="pt-2">
            <button
              type="button"
              disabled={processing || images.length === 0}
              onClick={handleConvert}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl btn-gradient-primary btn-shimmer px-8 py-4.5 text-base sm:text-lg font-extrabold text-white shadow-[0_8px_25px_rgba(220,38,38,0.35)] hover:shadow-[0_12px_32px_rgba(220,38,38,0.5)] active:scale-[0.99] transition-all disabled:opacity-50 min-h-[60px] cursor-pointer"
              id="convert-image-to-pdf-btn"
            >
              {processing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Converting {images.length} {images.length === 1 ? 'photo' : 'photos'} to PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Convert to PDF &amp; Download</span>
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manual 4-Corner Adjustment Modal */}
      {activeCornerModalItem && (
        <CornerAdjustmentModal
          isOpen={!!activeCornerModalItem}
          onClose={() => setActiveCornerModalItem(null)}
          imageFile={activeCornerModalItem.file}
          imageId={activeCornerModalItem.id}
          initialCorners={activeCornerModalItem.customCorners}
          onSaveCorners={handleSaveCorners}
        />
      )}
    </div>
  );
};
