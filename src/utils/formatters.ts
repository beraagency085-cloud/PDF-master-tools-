import JSZip from 'jszip';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function downloadBlob(blob: Blob, fileName: string) {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  a.target = '_self';

  document.body.appendChild(a);
  a.click();

  // Safely cleanup DOM element and blob URL without interfering with download trigger
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch {
      // Ignored
    }
  }, 1500);
}

export async function createAndDownloadZip(
  files: { fileName: string; blob: Blob }[],
  zipName: string = 'pdfmaster_files.zip'
) {
  const zip = new JSZip();
  files.forEach((f) => {
    zip.file(f.fileName, f.blob);
  });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipName);
}
