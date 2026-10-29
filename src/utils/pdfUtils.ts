import { PDFDocument } from 'pdf-lib';

export interface ExtractedPageInfo {
  pageNumber: number;
  width: number;
  height: number;
}

export interface PdfMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  producer?: string;
  pages: ExtractedPageInfo[];
}

/**
 * Inspect a PDF file and return its page count and basic dimensions
 */
export async function getPdfInfo(file: File): Promise<PdfMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const pages: ExtractedPageInfo[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      pageNumber: i + 1,
      width: Math.round(width),
      height: Math.round(height),
    });
  }

  return {
    pageCount,
    title: pdfDoc.getTitle() || undefined,
    author: pdfDoc.getAuthor() || undefined,
    producer: pdfDoc.getProducer() || undefined,
    pages,
  };
}

/**
 * Merge multiple PDF files in given order into a single PDF
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; url: string; sizeBytes: number; pageCount: number }> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  onProgress?.(10, 'Initializing PDF merger engine...');
  const mergedPdf = await PDFDocument.create();

  const totalFiles = files.length;
  let processedFiles = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + (i / totalFiles) * 70),
      `Reading & merging (${i + 1}/${totalFiles}): ${file.name}...`
    );

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }

    processedFiles++;
  }

  onProgress?.(90, 'Assembling & serializing master PDF document...');
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  onProgress?.(100, 'Merge completed successfully!');

  return {
    blob,
    url,
    sizeBytes: blob.size,
    pageCount: mergedPdf.getPageCount(),
  };
}

/**
 * Parse page range string like "1-3, 5, 8-10" into 0-indexed integer array
 */
export function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const selectedIndices = new Set<number>();
  if (!rangeStr.trim()) return [];

  const parts = rangeStr.split(/[,;\s]+/);

  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          selectedIndices.add(p - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        selectedIndices.add(page - 1);
      }
    }
  }

  return Array.from(selectedIndices).sort((a, b) => a - b);
}

/**
 * Extract specific pages from a PDF file
 */
export async function extractPdfPages(
  file: File,
  pageIndices0Based: number[],
  onProgress?: (progress: number, message: string) => void
): Promise<{ blob: Blob; url: string; sizeBytes: number; pageCount: number }> {
  if (pageIndices0Based.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  onProgress?.(20, 'Loading source PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validIndices = pageIndices0Based.filter(i => i >= 0 && i < totalPages);
  if (validIndices.length === 0) {
    throw new Error('Selected page numbers are outside the document page range.');
  }

  onProgress?.(50, `Extracting ${validIndices.length} selected pages...`);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, validIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  onProgress?.(85, 'Building extracted document...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  onProgress?.(100, 'Extraction complete!');

  return {
    blob,
    url,
    sizeBytes: blob.size,
    pageCount: newPdf.getPageCount(),
  };
}

/**
 * Helper to trigger immediate browser file download
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
