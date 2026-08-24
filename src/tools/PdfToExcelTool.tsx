import React, { useState } from 'react';
import { FileUploader } from '../components/FileUploader';
import { ResultScreen } from '../components/ResultScreen';
import { convertPdfToExcel } from '../services/officeEngine';
import { ProcessedResult } from '../types';
import { Table, Loader2, ArrowRight } from 'lucide-react';

export const PdfToExcelTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleConvert = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);

      const excelBlob = await convertPdfToExcel(file);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const downloadUrl = URL.createObjectURL(excelBlob);

      setResult({
        blob: excelBlob,
        fileName: `${nameWithoutExt}_tables.xlsx`,
        originalSize: file.size,
        newSize: excelBlob.size,
        downloadUrl,
      });
    } catch (err: any) {
      console.error('PDF to Excel failed:', err);
      setError(err.message || 'Failed to extract tables to Excel.');
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
        toolTitle="PDF to Excel Conversion"
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
          title="Select PDF file to convert to Excel (.xlsx)"
          subtitle="Extract structured tables, spreadsheets, and line items"
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
                Target Format: Microsoft Excel (.xlsx) Workbook
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            >
              Change File
            </button>
          </div>

          <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200/80 text-xs text-emerald-800 leading-relaxed">
            PDFMaster extracts rows and tabular grids from your PDF document and arranges each page as an individual worksheet inside the XLSX spreadsheet.
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[52px]"
              id="start-pdf-to-excel-button"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Extracting tables to Excel...</span>
                </>
              ) : (
                <>
                  <Table className="w-5 h-5" />
                  <span>Extract Tables to Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
