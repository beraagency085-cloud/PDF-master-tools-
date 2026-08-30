import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Trash2, Plus, Lock } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface FileUploaderProps {
  acceptedTypes: string[];
  acceptedMimeTypes: string;
  multiple?: boolean;
  maxSizeMb?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  showList?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  acceptedTypes,
  acceptedMimeTypes,
  multiple = false,
  maxSizeMb = 100,
  files,
  onFilesChange,
  title = 'Select or drop your files here',
  subtitle = 'Fast, secure, and processed 100% in your browser',
  buttonText = 'Choose Files',
  showList = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: File[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const f = incomingFiles[i];
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();

      // Validate extension
      const isValidExt = acceptedTypes.some((t) => t.toLowerCase() === ext);
      if (!isValidExt && acceptedTypes.length > 0) {
        setErrorMessage(
          `Invalid format for "${f.name}". Allowed types: ${acceptedTypes.join(', ')}`
        );
        continue;
      }

      // Validate size
      if (f.size > maxSizeMb * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" exceeds the maximum size limit of ${maxSizeMb}MB.`);
        continue;
      }

      newFiles.push(f);
      if (!multiple) break;
    }

    if (newFiles.length > 0) {
      if (multiple) {
        onFilesChange([...files, ...newFiles]);
      } else {
        onFilesChange([newFiles[0]]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="w-full">
      {/* Drop Zone Card */}
      <div
        id="file-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-red-500 bg-red-50/70 scale-[1.01]'
            : 'border-slate-300/90 bg-white/80 backdrop-blur-md hover:border-red-400 hover:bg-white/95 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMimeTypes}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
          id="file-upload-input"
        />

        <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 transition-transform group-hover:scale-110 shadow-xs border border-red-100/80">
          <UploadCloud className="h-8 w-8 sm:h-9 sm:w-9 animate-pulse" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md">
          {subtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl btn-gradient-primary btn-shimmer px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all min-h-[46px] cursor-pointer"
            id="choose-files-button"
          >
            <Plus className="w-5 h-5 mr-2" />
            {buttonText}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-500">
          <span className="font-mono bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-slate-600 border border-slate-200/80 shadow-2xs">
            {acceptedTypes.join(', ')}
          </span>
          <span>• Max {maxSizeMb}MB</span>
        </div>

        {/* Security assurance */}
        <div className="mt-5 flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50/80 backdrop-blur-xs px-3 py-1 rounded-full border border-emerald-200/80">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your files never leave your device (100% In-Browser Privacy)</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          id="upload-error-alert"
          className="mt-4 flex items-center space-x-2 rounded-xl bg-red-50/90 backdrop-blur-xs p-4 text-sm text-red-700 border border-red-200/90 shadow-xs animate-shake"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold text-red-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* File List Card (if multiple or single file uploaded) */}
      {showList && files.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-4 shadow-sm" id="uploaded-files-list">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <span className="text-sm font-bold text-slate-700">
              Selected {files.length === 1 ? 'File' : `Files (${files.length})`}
            </span>
            {files.length > 1 && (
              <button
                type="button"
                onClick={() => onFilesChange([])}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-xl bg-white/80 backdrop-blur-xs p-3 border border-slate-200/80 hover:bg-white transition-colors shadow-2xs"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-slate-800" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
