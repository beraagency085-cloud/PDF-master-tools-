import React, { useState } from 'react';
import { Share2, Check, Smartphone, ChevronDown } from 'lucide-react';
import {
  isWebShareSupported,
  shareProcessedFile,
  sharePageUrl,
  createFileFromBlob,
  canShareFile,
} from '../utils/shareUtils';
import { ShareModal } from './ShareModal';

export interface ShareButtonProps {
  mode?: 'file' | 'url';
  blob?: Blob;
  fileName?: string;
  fileSize?: number;
  toolTitle?: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  id?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  mode = 'url',
  blob,
  fileName,
  fileSize,
  toolTitle,
  url,
  variant = 'secondary',
  size = 'md',
  label,
  className = '',
  id,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [justShared, setJustShared] = useState(false);

  const isFileMode = mode === 'file' && !!blob && !!fileName;
  const webShareSupported = isWebShareSupported();

  const defaultLabel = isFileMode ? 'Share File' : 'Share';
  const displayLabel = label || defaultLabel;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If Web Share is supported, try directly sharing on user action
    if (webShareSupported) {
      if (isFileMode && blob && fileName) {
        try {
          const file = createFileFromBlob(blob, fileName);
          // If browser specifically supports file sharing, execute immediately
          if (canShareFile(file)) {
            const res = await shareProcessedFile({
              blob,
              fileName,
              title: fileName,
              url,
            });
            if (res.success) {
              setJustShared(true);
              setTimeout(() => setJustShared(false), 2500);
              return;
            }
            if (res.method === 'aborted') {
              return;
            }
          }
        } catch {
          // Fall through to modal
        }
      } else {
        // Sharing URL
        try {
          const res = await sharePageUrl({
            title: toolTitle ? `${toolTitle} - PDFMaster` : 'PDFMaster Tools',
            text: `Free in-browser PDF tool: ${toolTitle || 'PDFMaster'}`,
            url,
          });
          if (res.success) {
            setJustShared(true);
            setTimeout(() => setJustShared(false), 2500);
            return;
          }
          if (res.method === 'aborted') {
            return;
          }
        } catch {
          // Fall through to modal
        }
      }
    }

    // If native share isn't supported, or failed, or inside restrictive iframe: open modal
    setModalOpen(true);
  };

  // Button styles based on variant
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'btn-gradient-primary btn-shimmer text-white shadow-md hover:shadow-lg active:scale-[0.98]';
      break;
    case 'secondary':
      variantStyles =
        'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] border border-slate-200/80';
      break;
    case 'outline':
      variantStyles =
        'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-2xs active:scale-[0.98]';
      break;
    case 'minimal':
      variantStyles =
        'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent';
      break;
  }

  // Size styles
  let sizeStyles = '';
  let iconSize = 'w-4 h-4';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs rounded-xl';
      iconSize = 'w-3.5 h-3.5';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2.5 text-sm rounded-xl';
      iconSize = 'w-4 h-4';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-4 text-base rounded-2xl';
      iconSize = 'w-5 h-5';
      break;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${variantStyles} ${sizeStyles} ${className}`}
        id={id || `share-btn-${mode}`}
        title={`Share ${isFileMode ? fileName : toolTitle || 'Page'} via Web Share API`}
      >
        {justShared ? (
          <Check className={`${iconSize} text-emerald-500`} />
        ) : (
          <Share2 className={`${iconSize} shrink-0`} />
        )}
        <span>{justShared ? 'Shared!' : displayLabel}</span>
      </button>

      {/* Share Modal Popup fallback / options */}
      <ShareModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        toolTitle={toolTitle}
        blob={blob}
        fileName={fileName}
        fileSize={fileSize}
        url={url}
      />
    </>
  );
};
