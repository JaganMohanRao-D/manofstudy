import * as pdfjsLib from 'pdfjs-dist';

let isConfigured = false;

/**
 * Resolves the appropriate PDF.js worker filename based on the installed pdfjs-dist version.
 * Modern pdfjs-dist (v4+, v6+) uses ES module workers (.mjs or .min.mjs).
 */
export function getPdfJsWorkerUrl(useFallback = false): string {
  const version = pdfjsLib.version || '6.3.289';
  const major = parseInt(version.split('.')[0] || '6', 10);
  const workerFile = major >= 4 ? 'pdf.worker.min.mjs' : 'pdf.worker.min.js';

  if (useFallback) {
    return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/${workerFile}`;
  }
  return `https://unpkg.com/pdfjs-dist@${version}/build/${workerFile}`;
}

/**
 * Configure GlobalWorkerOptions.workerSrc to a reliable, CORS-friendly CDN.
 * Fixes the critical "Execution Failed - Setting up fake worker failed" error.
 */
export function configurePdfWorker(forceFallback = false): string {
  if (typeof window === 'undefined') return '';

  const workerUrl = getPdfJsWorkerUrl(forceFallback);

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    isConfigured = true;
  } catch (err) {
    console.warn('PDF.js worker initialization notice:', err);
  }

  return workerUrl;
}

// Auto-configure on load in browser
if (typeof window !== 'undefined' && !isConfigured) {
  configurePdfWorker();
}
