/**
 * Web Share API utilities for sharing processed PDF documents and tool URLs.
 * Handles file sharing, URL sharing, permission checks, and fallback mechanisms.
 */

export interface ShareTarget {
  blob?: Blob;
  fileName?: string;
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native-file' | 'native-url' | 'clipboard' | 'fallback' | 'aborted';
  message?: string;
}

/**
 * Checks if the browser supports the Web Share API.
 */
export const isWebShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
};

/**
 * Checks if the browser can share a specific file using Web Share API Level 2.
 */
export const canShareFile = (file: File): boolean => {
  if (!isWebShareSupported()) return false;
  try {
    if (typeof navigator.canShare === 'function') {
      return navigator.canShare({ files: [file] });
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Creates a File instance from a Blob with appropriate MIME type.
 */
export const createFileFromBlob = (blob: Blob, fileName: string): File => {
  let mimeType = blob.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'zip':
        mimeType = 'application/zip';
        break;
      case 'txt':
        mimeType = 'text/plain';
        break;
      default:
        mimeType = 'application/pdf';
    }
  }

  return new File([blob], fileName, {
    type: mimeType,
    lastModified: Date.now(),
  });
};

/**
 * Shares a processed file directly via the Web Share API.
 * Falls back to URL sharing or clipboard if file sharing is unsupported.
 */
export const shareProcessedFile = async (target: ShareTarget): Promise<ShareResult> => {
  const { blob, fileName = 'document.pdf', title = 'Processed Document', text, url } = target;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || `I just processed "${fileName}" locally using PDFMaster!`;

  // 1. Try native file sharing if blob is provided
  if (blob && isWebShareSupported()) {
    try {
      const file = createFileFromBlob(blob, fileName);
      if (canShareFile(file)) {
        await navigator.share({
          files: [file],
          title: title || fileName,
          text: shareText,
        });
        return { success: true, method: 'native-file', message: 'File shared successfully!' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'aborted', message: 'Share was cancelled.' };
      }
      console.warn('Native file share failed or not allowed, falling back:', err);
    }
  }

  // 2. Try native URL sharing if file share was unavailable
  if (isWebShareSupported()) {
    try {
      await navigator.share({
        title: title || fileName,
        text: shareText,
        url: currentUrl,
      });
      return { success: true, method: 'native-url', message: 'Link shared successfully!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'aborted', message: 'Share was cancelled.' };
      }
      console.warn('Native URL share failed:', err);
    }
  }

  // 3. Fallback to copying URL to clipboard
  const copied = await copyToClipboard(currentUrl);
  if (copied) {
    return {
      success: true,
      method: 'clipboard',
      message: 'Tool link copied to clipboard!',
    };
  }

  return {
    success: false,
    method: 'fallback',
    message: 'Could not share. Please copy the link manually.',
  };
};

/**
 * Shares the tool page URL directly via Web Share API or clipboard.
 */
export const sharePageUrl = async (options: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<ShareResult> => {
  const currentUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
  const title = options.title || 'PDFMaster - Free Privacy-First PDF Tools';
  const text = options.text || 'Process and convert PDF files directly in your browser with 100% privacy.';

  if (isWebShareSupported()) {
    try {
      await navigator.share({
        title,
        text,
        url: currentUrl,
      });
      return { success: true, method: 'native-url', message: 'Shared successfully!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'aborted', message: 'Share was cancelled.' };
      }
      console.warn('Native Web Share failed:', err);
    }
  }

  const copied = await copyToClipboard(currentUrl);
  if (copied) {
    return {
      success: true,
      method: 'clipboard',
      message: 'Page link copied to clipboard!',
    };
  }

  return {
    success: false,
    method: 'fallback',
    message: 'Could not share URL.',
  };
};

/**
 * Copies text to clipboard with fallback.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch {
    return false;
  }
};

/**
 * Generates direct social share URLs for fallback sharing.
 */
export const getSocialShareUrls = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('Check out this PDF Tool')}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
};
