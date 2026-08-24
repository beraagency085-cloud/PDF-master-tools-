import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { PageThumbnailGrid } from '../components/PageThumbnailGrid';
import { ResultScreen } from '../components/ResultScreen';
import { convertPdfToImages, loadPdfDocument } from '../services/pdfEngine';
import { ProcessedResult } from '../types';
import { FileText, Loader2, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';

export const PdfToPngTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageMode, setPageMode] = useState<'all' | 'selected'>('all');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = async (files: File[]) => {
    const selected = files[0] || null;
    setFile(selected);
    if (selected) {
      try {
        const doc = await loadPdfDocument(selected);
        setTotalPages(doc.numPages);
        setSelectedPages(Array.from({ length: doc.numPages }, (_, i) => i + 1));
      } catch (e) {
        console.error('Error reading PDF:', e);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const pagesToExtract = pageMode === 'all' ? undefined : selectedPages;
      if (pageMode === 'selected' && selectedPages.length === 0) {
        throw new Error('Please select at least one page to convert.');
      }

      const images = await convertPdfToImages(file, 'png', 'high', pagesToExtract);

      if (images.length === 1) {
        const single = images[0];
        const downloadUrl = URL.createObjectURL(single.blob);
        setResult({
          blob: single.blob,
          fileName: single.fileName,
          originalSize: file.size,
          newSize: single.blob.size,
          downloadUrl,
          pageCount: 1,
        });
      } else {
        const zip = new JSZip();
        images.forEach((img) => zip.file(img.fileName, img.blob));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
        const downloadUrl = URL.createObjectURL(zipBlob);

        setResult({
          blob: zipBlob,
          fileName: `${nameWithoutExt}_png_images.zip`,
          originalSize: file.size,
          newSize: zipBlob.size,
          downloadUrl,
          isZip: true,
          pageCount: images.length,
        });
      }
    } catch (err: any) {
      console.error('PDF to PNG conversion failed:', err);
      setError(err.message || 'Failed to convert PDF to PNG.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <ResultScreen
        result={result}
        toolTitle="PDF to PNG Conversion"
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
          onFilesChange={handleFileChange}
          title="Select PDF file to convert to PNG"
          subtitle="Extract crisp, lossless PNG images with transparent/sharp vectors"
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
                Total Pages: {totalPages}
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pages to Convert
              </span>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPageMode('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    pageMode === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All Pages ({totalPages})
                </button>
                <button
                  type="button"
                  onClick={() => setPageMode('selected')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    pageMode === 'selected' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Select Pages
                </button>
              </div>
            </div>

            {pageMode === 'selected' && (
              <PageThumbnailGrid
                file={file}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
                allowSelection={true}
              />
            )}
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
              onClick={handleConvert}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-pdf-to-png-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting PDF to lossless PNG...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Convert to PNG Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
