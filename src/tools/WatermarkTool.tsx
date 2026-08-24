import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { addWatermarkToPdf } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { Stamp, Image as ImageIcon, Type, Loader2, ArrowRight } from 'lucide-react';

export const WatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.4);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal'>('diagonal');
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#dc2626');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    if (watermarkType === 'text' && !text.trim()) {
      setError('Please enter watermark text.');
      return;
    }

    if (watermarkType === 'image' && !imageFile) {
      setError('Please upload a watermark logo image (PNG/JPG).');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const watermarkedBlob = await addWatermarkToPdf(file, {
        type: watermarkType,
        text,
        imageFile: imageFile || undefined,
        opacity,
        position,
        fontSize,
        rotation,
        color,
      });

      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(watermarkedBlob);

      setResult({
        blob: watermarkedBlob,
        fileName: `${nameWithoutExt}_watermarked.pdf`,
        originalSize: file.size,
        newSize: watermarkedBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('Watermark failed:', err);
      setError(err.message || 'Failed to add watermark.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF Watermarking"
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {!file ? (
        <FileUploader
          acceptedTypes={['.pdf']}
          acceptedMimeTypes="application/pdf"
          multiple={false}
          files={file ? [file] : []}
          onFilesChange={(f) => setFile(f[0] || null)}
          title="Select PDF file to add watermark"
          subtitle="Stamp with text (Confidential, Draft, Copy) or brand logo"
          buttonText="Select PDF File"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-sm">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Watermark Type: {watermarkType.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          {/* Watermark Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWatermarkType('text')}
              className={`flex items-center justify-center space-x-2 p-3.5 rounded-2xl border-2 font-bold text-xs transition-all ${
                watermarkType === 'text'
                  ? 'border-pink-600 bg-pink-50/50 text-pink-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text Watermark</span>
            </button>
            <button
              type="button"
              onClick={() => setWatermarkType('image')}
              className={`flex items-center justify-center space-x-2 p-3.5 rounded-2xl border-2 font-bold text-xs transition-all ${
                watermarkType === 'image'
                  ? 'border-pink-600 bg-pink-50/50 text-pink-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image Logo Watermark</span>
            </button>
          </div>

          {/* Settings Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-4">
            {watermarkType === 'text' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL, DRAFT"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Watermark Logo Image (PNG / JPG)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    if (e.target.files) setImageFile(e.target.files[0] || null);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Position */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e: any) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="diagonal">Diagonal Across Page</option>
                  <option value="center">Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Opacity</label>
                  <span className="text-xs font-mono text-slate-500">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              {/* Font Size */}
              {watermarkType === 'text' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Font Size</label>
                    <span className="text-xs font-mono text-slate-500">{fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="90"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-pink-600"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={handleProcess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-watermark-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Stamping watermark...</span>
                </>
              ) : (
                <>
                  <Stamp className="w-5 h-5" />
                  <span>Add Watermark to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
