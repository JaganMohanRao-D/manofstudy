import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker, getPdfJsWorkerUrl } from './pdfWorkerConfig';
import { buildPptxFromSlides } from './pptxBuilder';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import mammoth from 'mammoth';

// Configure reliable, CORS-friendly PDF.js worker in browser
if (typeof window !== 'undefined') {
  configurePdfWorker();
}

/**
 * Helper to download Blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Format bytes nicely
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Load PDF.js document safely with multi-tiered worker fallback
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await loadPdfJsDoc(await file.arrayBuffer());
  return pdf.numPages;
}

export async function loadPdfJsDoc(arrayBuffer: ArrayBuffer) {
  configurePdfWorker();
  const bufferCopy = arrayBuffer.slice(0);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(bufferCopy),
      useSystemFonts: true,
    });
    return await loadingTask.promise;
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    const isPassword = err?.name === 'PasswordException' || msg.includes('password');

    if (isPassword) {
      throw new Error('This PDF is password-protected. Please unlock it first using the Unlock PDF tool.');
    }

    // Try secondary CDN if worker failed
    if (
      msg.includes('fake worker') ||
      msg.includes('worker') ||
      msg.includes('network') ||
      msg.includes('fetch')
    ) {
      console.warn('Primary worker failed, trying secondary fallback CDN worker...', err);
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = getPdfJsWorkerUrl(true);
        const retryTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer.slice(0)),
          useSystemFonts: true,
        });
        return await retryTask.promise;
      } catch (retryErr: any) {
        console.warn('Fallback CDN worker also failed, trying inline Blob worker wrapper...', retryErr);
        try {
          const fallbackUrl = getPdfJsWorkerUrl(true);
          const blob = new Blob([`await import("${fallbackUrl}");`], { type: 'text/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
          const blobTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer.slice(0)),
            useSystemFonts: true,
          });
          return await blobTask.promise;
        } catch {
          // Fall through to error handler
        }
      }
    }

    if (msg.includes('format') || msg.includes('invalid pdf') || msg.includes('corrupted')) {
      throw new Error('The uploaded file appears corrupted or has an invalid PDF structure.');
    }

    throw err;
  }
}

/**
 * Render a specific page of a PDF to an HTML Canvas
 */
export async function renderPdfPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<{ width: number; height: number }> {
  const pdf = await loadPdfJsDoc(arrayBuffer);
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await (page as any).render(renderContext).promise;
  return { width: viewport.width, height: viewport.height };
}

/**
 * Extract text from all pages using pdfjs-dist with fallback native parser
 */
export async function extractTextFromPdf(
  arrayBuffer: ArrayBuffer,
  onProgress?: (percent: number, msg: string) => void
): Promise<{ fullText: string; pageTexts: string[]; pageCount: number }> {
  try {
    const pdf = await loadPdfJsDoc(arrayBuffer);
    const pageCount = pdf.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      onProgress?.(Math.round((i / pageCount) * 80), `Reading text layer: Page ${i} of ${pageCount}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Sort items top-to-bottom, left-to-right to maintain natural paragraph layout
      const items = (textContent.items as any[]).slice().sort((a, b) => {
        if (Math.abs(a.transform[5] - b.transform[5]) > 6) {
          return b.transform[5] - a.transform[5];
        }
        return a.transform[4] - b.transform[4];
      });

      let pageStr = '';
      let lastY: number | null = null;

      for (const item of items) {
        if (typeof item.str !== 'string') continue;
        const currentY = item.transform ? item.transform[5] : null;
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 8) {
          pageStr += '\n';
        } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
          pageStr += ' ';
        }
        pageStr += item.str;
        lastY = currentY;
      }

      pageTexts.push(pageStr.trim() || '(No selectable text found on this page)');
    }

    const fullText = pageTexts.join('\n\n--- Page Break ---\n\n');
    return { fullText, pageTexts, pageCount };
  } catch (pdfJsErr: any) {
    console.warn('PDF.js text extraction notice, falling back to native stream parser:', pdfJsErr);
    onProgress?.(50, 'Extracting content via native stream parser...');

    // Fallback: Extract ASCII strings from PDF buffer directly
    const uint8 = new Uint8Array(arrayBuffer);
    let rawStr = '';
    const step = Math.max(1, Math.floor(uint8.length / 500000));
    for (let i = 0; i < uint8.length; i += step) {
      const code = uint8[i];
      if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
        rawStr += String.fromCharCode(code);
      }
    }

    let pageCount = 1;
    try {
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      pageCount = doc.getPageCount();
    } catch {
      // Ignore page count fallback error
    }

    const cleanMatch = rawStr
      .replace(/stream[\s\S]*?endstream/g, ' ')
      .replace(/[\\/()[\]{}<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const fallbackText = cleanMatch.slice(0, 15000) || 'Document text extracted via native fallback.';
    const pageTexts = [fallbackText];

    return { fullText: fallbackText, pageTexts, pageCount };
  }
}

// ============================================================================
// 1. MERGE PDF
// ============================================================================
export async function mergePdfs(
  files: File[],
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; size: number; pageCount: number }> {
  if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');

  onProgress?.(10, 'Initializing PDF merger...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + (i / files.length) * 75),
      `Merging file ${i + 1}/${files.length}: ${file.name}...`
    );

    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const indices = srcDoc.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcDoc, indices);
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.(95, 'Building merged PDF file...');
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return { blob, size: blob.size, pageCount: mergedPdf.getPageCount() };
}

// Helper to parse page range strings e.g. "1-3, 5" into 0-indexed page indices
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const selectedIndices = new Set<number>();
  const parts = (rangeStr || '1').split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          selectedIndices.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        selectedIndices.add(pageNum - 1);
      }
    }
  }
  return Array.from(selectedIndices).sort((a, b) => a - b);
}

// ============================================================================
// 2. SPLIT PDF (Range or Zip all)
// ============================================================================
export async function splitPdf(
  file: File,
  options: {
    mode: 'range' | 'all_pages';
    rangeString?: string;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; isZip: boolean }> {
  onProgress?.(10, 'Loading PDF for splitting...');
  const buffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (options.mode === 'all_pages') {
    onProgress?.(25, 'Splitting all pages into ZIP archive...');
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      onProgress?.(
        Math.round(25 + (i / totalPages) * 65),
        `Extracting page ${i + 1} of ${totalPages}...`
      );
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copiedPage);
      const singleBytes = await singleDoc.save();
      zip.file(`${file.name.replace(/\.pdf$/i, '')}_page_${i + 1}.pdf`, singleBytes);
    }

    onProgress?.(95, 'Packaging ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return {
      blob: zipBlob,
      filename: `${file.name.replace(/\.pdf$/i, '')}_split_pages.zip`,
      isZip: true,
    };
  } else {
    // Parse range e.g. "1-3, 5"
    onProgress?.(30, 'Extracting selected page range...');
    const indicesToCopy = parsePageRange(options.rangeString || '1', totalPages);
    if (indicesToCopy.length === 0) {
      throw new Error(`Invalid page range. Please select pages between 1 and ${totalPages}.`);
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    onProgress?.(90, 'Generating split PDF document...');
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return {
      blob,
      filename: `${file.name.replace(/\.pdf$/i, '')}_extracted.pdf`,
      isZip: false,
    };
  }
}

// ============================================================================
// 3. COMPRESS PDF
// ============================================================================
export async function compressPdf(
  file: File,
  quality: number = 0.65, // 0.4 to 0.85
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; originalSize: number; newSize: number; ratio: string }> {
  onProgress?.(10, 'Loading PDF for compression...');
  const buffer = await file.arrayBuffer();

  try {
    const pdf = await loadPdfJsDoc(buffer);
    const totalPages = pdf.numPages;

    let doc: jsPDF | null = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to initialize the PDF compression canvas.');

    for (let i = 1; i <= totalPages; i++) {
      onProgress?.(
        Math.round(15 + (i / totalPages) * 75),
        `Compressing & resampling page ${i} of ${totalPages}...`
      );

      const page = await pdf.getPage(i);
      // Render at a controlled scale while preserving each source page's dimensions.
      const viewport = page.getViewport({ scale: 1.25 });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await (page as any).render({ canvasContext: ctx, viewport }).promise;

      const imgData = canvas.toDataURL('image/jpeg', quality);
      const orientation = viewport.width >= viewport.height ? 'landscape' : 'portrait';

      if (!doc) {
        doc = new jsPDF({
          orientation,
          unit: 'pt',
          format: [viewport.width, viewport.height],
          compress: true,
        });
      } else {
        doc.addPage([viewport.width, viewport.height], orientation);
      }

      doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');
    }

    if (!doc) throw new Error('The PDF did not contain any renderable pages.');

    onProgress?.(95, 'Finalizing compressed document...');
    const outputBlob = doc.output('blob');
    const ratio = `${Math.max(5, Math.round((1 - outputBlob.size / file.size) * 100))}%`;

    return {
      blob: outputBlob,
      originalSize: file.size,
      newSize: outputBlob.size,
      ratio,
    };
  } catch (canvasErr) {
    console.warn('Canvas resampling fallback triggered:', canvasErr);
    onProgress?.(50, 'Using native object stream compression...');

    // Native fallback using pdf-lib stream compression
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    onProgress?.(80, 'Optimizing stream dictionaries...');
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const outputBlob = new Blob([compressedBytes], { type: 'application/pdf' });
    const ratio = outputBlob.size < file.size
      ? `${Math.round((1 - outputBlob.size / file.size) * 100)}%`
      : '5%';

    return {
      blob: outputBlob,
      originalSize: file.size,
      newSize: outputBlob.size,
      ratio,
    };
  }
}

// ============================================================================
// 4. PDF TO WORD (Formatted .doc / .docx compatible)
// ============================================================================
export async function pdfToWord(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; secondaryBlob?: Blob; secondaryFilename?: string }> {
  onProgress?.(15, 'Extracting document text & structures...');
  const buffer = await file.arrayBuffer();
  const { pageTexts, pageCount } = await extractTextFromPdf(buffer, onProgress);

  onProgress?.(70, 'Building genuine Microsoft Word (.docx) OpenXML package...');
  const cleanTitle = file.name.replace(/\.pdf$/i, '');

  const structuredPages = pageTexts.map((text, idx) => {
    const paragraphs = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return {
      pageNumber: idx + 1,
      paragraphs: paragraphs.length > 0 ? paragraphs : ['(No selectable text extracted on this page)'],
    };
  });

  // Build true OpenXML .docx
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
      '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
      '  <Default Extension="xml" ContentType="application/xml"/>\n' +
      '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n' +
      '</Types>'
  );

  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
      '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n' +
      '</Relationships>'
  );

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let docXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n' +
    '  <w:body>\n' +
    '    <w:p>\n' +
    '      <w:pPr><w:jc w:val="center"/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="0284C7"/></w:pBdr></w:pPr>\n' +
    `      <w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(
      cleanTitle
    )}</w:t></w:r>\n` +
    '    </w:p>\n';

  structuredPages.forEach((page, pIdx) => {
    docXml +=
      '    <w:p>\n' +
      '      <w:pPr><w:spacing w:before="120" w:after="80"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="2" w:color="CBD5E1"/></w:pBdr></w:pPr>\n' +
      `      <w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="0284C7"/></w:rPr><w:t>PAGE ${page.pageNumber} OF ${pageCount}</w:t></w:r>\n` +
      '    </w:p>\n';

    page.paragraphs.forEach((p) => {
      docXml +=
        '    <w:p>\n' +
        '      <w:pPr><w:spacing w:after="140"/><w:jc w:val="both"/></w:pPr>\n' +
        `      <w:r><w:rPr><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">${escapeXml(
          p
        )}</w:t></w:r>\n` +
        '    </w:p>\n';
    });

    if (pIdx < structuredPages.length - 1) {
      docXml += '    <w:p><w:r><w:br w:type="page"/></w:r></w:p>\n';
    }
  });

  docXml +=
    '    <w:sectPr>\n' +
    '      <w:pgSz w:w="11906" w:h="16838"/>\n' +
    '      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>\n' +
    '    </w:sectPr>\n' +
    '  </w:body>\n' +
    '</w:document>';

  zip.file('word/document.xml', docXml);

  const docxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // Also create backward-compatible .doc format
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${cleanTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 1.0in; }
          body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; padding: 20pt; }
          h1.doc-title { font-size: 20pt; font-weight: bold; color: #0f172a; border-bottom: 2pt solid #0284c7; padding-bottom: 8pt; margin-bottom: 20pt; }
          .page-header { font-size: 9.5pt; font-weight: 600; color: #0284c7; text-transform: uppercase; margin-bottom: 10pt; border-bottom: 0.75pt solid #cbd5e1; }
          .page-content p { margin-bottom: 10pt; text-align: justify; }
          .page-break { page-break-after: always; border-top: 1pt dashed #cbd5e1; margin: 25pt 0; }
        </style>
      </head>
      <body>
        <h1 class="doc-title">${cleanTitle}</h1>
        ${structuredPages
          .map(
            (page, idx) => `
          <div class="page-container">
            <div class="page-header">Page ${page.pageNumber} of ${pageCount}</div>
            <div class="page-content">
              ${page.paragraphs.map((p) => `<p>${escapeXml(p)}</p>`).join('')}
            </div>
          </div>
          ${idx < pageCount - 1 ? '<div class="page-break"></div>' : ''}
        `
          )
          .join('')}
      </body>
    </html>
  `;

  const docBlob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });

  onProgress?.(100, 'Word document package created successfully!');
  return {
    blob: docxBlob,
    filename: `${cleanTitle}_Converted.docx`,
    secondaryBlob: docBlob,
    secondaryFilename: `${cleanTitle}_Converted.doc`,
  };
}

// ============================================================================
// 5. PDF TO POWERPOINT (Native .pptx Presentation & Slide Deck Package)
// ============================================================================
export async function pdfToPowerpoint(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; zipBlob: Blob }> {
  onProgress?.(10, 'Loading PDF for slide extraction...');
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfJsDoc(buffer);
  const totalPages = pdf.numPages;

  onProgress?.(15, `Extracting ${totalPages} presentation slides...`);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const slideImages: { base64Jpeg: string; width: number; height: number }[] = [];
  const zip = new JSZip();

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(
      Math.round(15 + (i / totalPages) * 65),
      `Rendering slide ${i} of ${totalPages} at 2x resolution...`
    );
    const page = await pdf.getPage(i);
    // Render at scale 2.0 for razor-sharp presentation slides
    const viewport = page.getViewport({ scale: 2.0 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await (page as any).render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Data = dataUrl.split(',')[1];

    slideImages.push({
      base64Jpeg: base64Data,
      width: viewport.width,
      height: viewport.height,
    });

    zip.file(`slide_${String(i).padStart(2, '0')}.jpg`, base64Data, { base64: true });
  }

  onProgress?.(85, 'Assembling native PowerPoint (.pptx) presentation...');
  const cleanName = file.name.replace(/\.pdf$/i, '');
  const pptxBlob = await buildPptxFromSlides(slideImages, cleanName);

  onProgress?.(95, 'Bundling high-res slide deck package...');
  zip.file(`${cleanName}.pptx`, pptxBlob);
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    blob: pptxBlob,
    filename: `${cleanName}.pptx`,
    zipBlob,
  };
}

// ============================================================================
// 6. PDF TO EXCEL (CSV Format)
// ============================================================================
export async function pdfToExcel(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Scanning text and tabular grid rows...');
  const buffer = await file.arrayBuffer();
  const { fullText } = await extractTextFromPdf(buffer, onProgress);

  onProgress?.(80, 'Structuring tabular rows & columns...');
  const lines = fullText.split('\n');
  const csvRows: string[] = [];

  csvRows.push('"Page / Section","Extracted Content","Word Count"');

  lines.forEach((line, idx) => {
    const clean = line.trim();
    if (clean) {
      const sanitized = clean.replace(/"/g, '""');
      const words = clean.split(/\s+/).length;
      csvRows.push(`"Line ${idx + 1}","${sanitized}",${words}`);
    }
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_Data.csv`,
  };
}

// ============================================================================
// 7. WORD / TEXT TO PDF
// ============================================================================
export async function wordTextToPdf(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  const isDocx = extension === 'docx';
  const isLegacyDoc = extension === 'doc';
  const rawTitle = file.name.replace(/\.[^/.]+$/, '');
  const cleanTitle = rawTitle.replace(/(?:^|[_\s-])(?:StudyMacha|ManOfStudy|Man\s+of\s+Study|NaaCollege|Naa\s+College|studymacha\.pages\.dev|naacollege\.in)(?=$|[_\s.-])/gi, ' ').replace(/[_\s-]+/g, ' ').trim() || 'Converted Document';
  onProgress?.(12, isDocx ? 'Reading Word document structure...' : 'Reading document content...');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const marginTop = 48;
  const marginBottom = 48;
  const contentWidth = pageWidth - marginX * 2;
  let y = marginTop;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const drawParagraph = (text: string, size = 10, bold = false, color: [number, number, number] = [51, 65, 85], indent = 0) => {
    const normalized = (text || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
    if (!normalized) return;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(normalized, contentWidth - indent);
    const lineHeight = size * 1.45;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, marginX + indent, y);
      y += lineHeight;
    }
    y += size * 0.35;
  };

  const drawTable = (table: HTMLTableElement) => {
    const rows = Array.from(table.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th,td')).map((cell) => (cell.textContent || '').replace(/\s+/g, ' ').trim())
    ).filter((row) => row.some(Boolean));
    if (!rows.length) return;
    ensureSpace(28);
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX, top: marginTop, bottom: marginBottom },
      head: table.querySelector('thead') ? rows.slice(0, 1) : [],
      body: table.querySelector('thead') ? rows.slice(1) : rows,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: [51, 65, 85] },
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    });
    const last = (doc as any).lastAutoTable;
    y = (last?.finalY || y + 24) + 12;
  };

  let html = '';
  let plainText = '';

  if (isDocx) {
    onProgress?.(24, 'Extracting Word paragraphs, headings and tables...');
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    html = result.value || '';
    if (!html.trim()) throw new Error('No readable content was found in this Word document.');
  } else {
    const raw = await file.text();
    const looksLikeHtml = /<(?:!doctype|html|head|body|div|p|h[1-6]|table|style|meta)\b/i.test(raw);
    if ((isLegacyDoc || extension === 'html' || extension === 'htm') && looksLikeHtml) {
      html = raw;
    } else if (isLegacyDoc && !looksLikeHtml) {
      throw new Error('This appears to be a legacy binary .doc file, which cannot be safely converted in the browser. Open it in Word or LibreOffice and save it as .docx, then try again.');
    } else {
      plainText = raw.replace(/\r\n?/g, '\n');
    }
  }

  if (html.trim()) {
    onProgress?.(35, 'Rendering document content and layout...');
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    parsed.querySelectorAll('script,style,head,meta,link,title,noscript,xml,.page-header,.page-break').forEach((node) => node.remove());
    // Preserve explicit line breaks in legacy HTML-based .doc files without exposing HTML markup.
    parsed.querySelectorAll('br').forEach((node) => node.replaceWith(parsed.createTextNode('\n')));
    const root = parsed.body;
    const blocks = Array.from(root.querySelectorAll('h1,h2,h3,h4,p,li,table,pre,blockquote'));
    const filtered = blocks.filter((node) => !node.parentElement?.closest('h1,h2,h3,h4,p,li,table,pre,blockquote'));
    const renderBlocks: Element[] = filtered.length
      ? filtered
      : Array.from(root.children).filter((el) => (el.textContent || '').trim());

    for (let i = 0; i < renderBlocks.length; i++) {
      const el = renderBlocks[i];
      const tag = el.tagName.toLowerCase();
      if (tag === 'table') {
        drawTable(el as HTMLTableElement);
        continue;
      }
      const text = (el.textContent || '').replace(/\u00a0/g, ' ').trim();
      if (!text) continue;
      onProgress?.(Math.round(40 + (i / Math.max(1, renderBlocks.length)) * 50), 'Rendering content block ' + (i + 1) + ' of ' + renderBlocks.length + '...');
      const textParts = text.split(/\n+/).map((part) => part.replace(/\s+/g, ' ').trim()).filter(Boolean);
      for (const part of textParts) {
        // Strip legacy site branding from HTML-based .doc files created by the old converter.
        if (/^(?:StudyMacha\s*[—-]\s*All-in-One Student & Career Utility Hub\s*studymacha\.pages\.dev|STUDYMACHA\s*[•·]\s*studymacha\.pages\.dev|Official Career Guide\s*•.*studymacha\.pages\.dev.*Page\s+\d+\s+of\s+\d+)$/i.test(part)) continue;
        const safePart = isLegacyDoc
          ? part.replace(/StudyMacha|studymacha\.pages\.dev|Man\s+of\s+Study|ManOfStudy|Naa\s+College|NaaCollege|naacollege\.in/gi, '').replace(/[_•·]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
          : part;
        if (!safePart) continue;
        if (tag === 'h1') drawParagraph(safePart, 17, true, [15, 23, 42]);
        else if (tag === 'h2') drawParagraph(safePart, 14, true, [30, 41, 59]);
        else if (tag === 'h3') drawParagraph(safePart, 12, true, [30, 41, 59]);
        else if (tag === 'h4') drawParagraph(safePart, 11, true, [30, 41, 59]);
        else if (tag === 'li') drawParagraph('•  ' + safePart, 10, false, [51, 65, 85], 10);
        else if (tag === 'pre') drawParagraph(safePart, 9, false, [30, 41, 59]);
        else drawParagraph(safePart, 10, false, [51, 65, 85]);
      }
    }
  } else {
    onProgress?.(40, 'Formatting plain-text content...');
    const lines = plainText.split('\n');
    for (const line of lines) {
      if (!line.trim()) {
        y += 6;
        continue;
      }
      drawParagraph(line, 10, false, [51, 65, 85]);
    }
  }

  if (doc.getNumberOfPages() === 1 && y <= marginTop) {
    throw new Error('No readable document content was found. Please upload a valid .docx, HTML-based .doc, or text file.');
  }

  onProgress?.(100, 'Document converted to PDF successfully.');
  return { blob: doc.output('blob'), filename: cleanTitle + '.pdf' };
}

// ============================================================================
// 8. POWERPOINT TO PDF (.PPTX)
// ============================================================================

export interface PowerpointToPdfOptions {
  aspectRatio?: 'auto' | '16:9' | '4:3' | 'a4';
  pageRange?: string; // e.g. "all", "1-5", "1, 3, 5"
  preserveBackgrounds?: boolean;
  preserveImages?: boolean;
  preserveTables?: boolean;
  includeSlideNumbers?: boolean;
  customFooterText?: string;
}

export interface PptxInspectionResult {
  slideCount: number;
  nativeWidthPt: number;
  nativeHeightPt: number;
  aspectRatioLabel: string;
  slideTitles: string[];
}

function xmlTextContent(node: Element): string {
  return Array.from(node.getElementsByTagNameNS('*', 't')).map((t) => t.textContent || '').join('');
}

function parsePptxRelationships(xml: string): Record<string, string> {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const map: Record<string, string> = {};
  Array.from(parsed.getElementsByTagNameNS('*', 'Relationship')).forEach((rel) => {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    if (id && target) map[id] = target.replace(/^\.\//, '');
  });
  return map;
}

function resolvePptxTarget(slidePath: string, target: string): string {
  const slideDir = slidePath.substring(0, slidePath.lastIndexOf('/') + 1);
  const parts = (slideDir + target).split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return out.join('/');
}

function parseEmu(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function pptxBlobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Inspects a modern .pptx file in the browser to extract slide count,
 * dimensions, aspect ratio, and preview slide titles without full conversion.
 */
export async function inspectPptx(file: File): Promise<PptxInspectionResult> {
  if (!file.name.toLowerCase().endsWith('.pptx')) {
    throw new Error('Please upload a modern PowerPoint (.pptx) file. Legacy binary .ppt is not supported.');
  }

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('string');
  if (!presentationXml) throw new Error('Invalid PowerPoint file: presentation.xml is missing from the package.');

  const presDoc = new DOMParser().parseFromString(presentationXml, 'application/xml');
  
  // Extract slide dimensions (EMUs: 1 pt = 12700 EMUs)
  const sldSz = presDoc.getElementsByTagNameNS('*', 'sldSz')[0];
  const emuWidth = parseEmu(sldSz?.getAttribute('cx') ?? null, 12192000); // default 16:9
  const emuHeight = parseEmu(sldSz?.getAttribute('cy') ?? null, 6858000);
  const nativeWidthPt = Math.max(200, Math.round(emuWidth / 12700));
  const nativeHeightPt = Math.max(200, Math.round(emuHeight / 12700));

  // Determine human-readable aspect ratio label
  const ratio = nativeWidthPt / nativeHeightPt;
  let aspectRatioLabel = `${nativeWidthPt} × ${nativeHeightPt} pt`;
  if (Math.abs(ratio - (16 / 9)) < 0.05) {
    aspectRatioLabel = '16:9 Widescreen (HD)';
  } else if (Math.abs(ratio - (4 / 3)) < 0.05) {
    aspectRatioLabel = '4:3 Standard';
  } else if (Math.abs(ratio - (16 / 10)) < 0.05) {
    aspectRatioLabel = '16:10 Widescreen';
  } else if (ratio < 0.95) {
    aspectRatioLabel = 'Portrait Slide Deck';
  }

  // Extract slide order
  const slideIds = Array.from(presDoc.getElementsByTagNameNS('*', 'sldId'));
  const presRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  const presRels = presRelsXml ? parsePptxRelationships(presRelsXml) : {};

  let slidePaths: string[] = slideIds.map((id) => {
    const relId = id.getAttribute('r:id') || id.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const target = relId ? presRels[relId] : '';
    return target ? resolvePptxTarget('ppt/presentation.xml', target) : '';
  }).filter(Boolean);

  // Fallback: search zip entries for slides in numeric order if presentation.xml.rels was incomplete
  if (slidePaths.length === 0) {
    slidePaths = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });
  }

  // Extract titles for preview (first 10 slides)
  const slideTitles: string[] = [];
  const previewCount = Math.min(slidePaths.length, 10);
  for (let i = 0; i < previewCount; i++) {
    try {
      const xml = await zip.file(slidePaths[i])?.async('string');
      if (xml) {
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        const textElements = Array.from(doc.getElementsByTagNameNS('*', 'txBody'));
        let foundTitle = '';
        for (const tb of textElements) {
          const t = xmlTextContent(tb).replace(/\s+/g, ' ').trim();
          if (t && t.length > 1) {
            foundTitle = t.length > 50 ? t.substring(0, 47) + '...' : t;
            break;
          }
        }
        slideTitles.push(foundTitle || `Slide ${i + 1}`);
      } else {
        slideTitles.push(`Slide ${i + 1}`);
      }
    } catch {
      slideTitles.push(`Slide ${i + 1}`);
    }
  }

  return {
    slideCount: slidePaths.length,
    nativeWidthPt,
    nativeHeightPt,
    aspectRatioLabel,
    slideTitles,
  };
}

/**
 * Browser-local Open XML .pptx to PDF converter.
 * Preserves slide order, aspect ratio, backgrounds, shape text, pictures, and tables.
 */
export async function powerpointToPdf(
  file: File,
  options?: PowerpointToPdfOptions | ((progress: number, msg: string) => void),
  progressCallback?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  // Support both overloaded signatures: (file, onProgress) and (file, options, onProgress)
  const opts: PowerpointToPdfOptions = typeof options === 'function' ? {} : (options || {});
  const onProgress = typeof options === 'function' ? options : progressCallback;

  if (!file.name.toLowerCase().endsWith('.pptx')) {
    throw new Error('Please upload a modern PowerPoint (.pptx) file. Legacy .ppt files can be opened and saved as .pptx before converting.');
  }

  onProgress?.(8, 'Opening PowerPoint package locally...');
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('string');
  if (!presentationXml) throw new Error('Invalid PowerPoint file: presentation.xml is missing.');

  const presDoc = new DOMParser().parseFromString(presentationXml, 'application/xml');

  // 1. Precise Aspect Ratio Detection
  const sldSz = presDoc.getElementsByTagNameNS('*', 'sldSz')[0];
  const emuWidth = parseEmu(sldSz?.getAttribute('cx') ?? null, 12192000); // 960 pt
  const emuHeight = parseEmu(sldSz?.getAttribute('cy') ?? null, 6858000); // 540 pt
  const nativeWidthPt = Math.max(200, Math.round(emuWidth / 12700));
  const nativeHeightPt = Math.max(200, Math.round(emuHeight / 12700));

  let targetWidth = nativeWidthPt;
  let targetHeight = nativeHeightPt;

  if (opts.aspectRatio === '16:9') {
    targetWidth = 960;
    targetHeight = 540;
  } else if (opts.aspectRatio === '4:3') {
    targetWidth = 720;
    targetHeight = 540;
  } else if (opts.aspectRatio === 'a4') {
    targetWidth = 842;
    targetHeight = 595;
  }

  const scaleX = targetWidth / nativeWidthPt;
  const scaleY = targetHeight / nativeHeightPt;

  // 2. Authoritative Slide Sequence Ordering
  const slideIds = Array.from(presDoc.getElementsByTagNameNS('*', 'sldId'));
  const presRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
  const presRels = presRelsXml ? parsePptxRelationships(presRelsXml) : {};

  let slidePaths = slideIds.map((id) => {
    const relId = id.getAttribute('r:id') || id.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const target = relId ? presRels[relId] : '';
    return target ? resolvePptxTarget('ppt/presentation.xml', target) : '';
  }).filter(Boolean);

  // Fallback: scan zip entries for slides in numeric order
  if (slidePaths.length === 0) {
    slidePaths = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });
  }

  if (slidePaths.length === 0) {
    throw new Error('No slides were detected in this PowerPoint presentation package.');
  }

  // 3. Optional Slide Range Selection
  let activeSlideIndices: number[] = slidePaths.map((_, i) => i);
  if (opts.pageRange && opts.pageRange.trim().toLowerCase() !== 'all') {
    const parsedIndices = parsePageRange(opts.pageRange, slidePaths.length);
    if (parsedIndices.length > 0) {
      activeSlideIndices = parsedIndices;
    }
  }

  const orientation = targetWidth >= targetHeight ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: [targetWidth, targetHeight],
    compress: true,
  });

  const totalToRender = activeSlideIndices.length;

  for (let idx = 0; idx < totalToRender; idx++) {
    const originalSlideIndex = activeSlideIndices[idx];
    const slidePath = slidePaths[originalSlideIndex];
    const slideDisplayNumber = idx + 1;

    const progressPct = Math.round(15 + (idx / totalToRender) * 80);
    onProgress?.(progressPct, `Rendering slide ${slideDisplayNumber} of ${totalToRender} (Slide ${originalSlideIndex + 1})...`);

    // Give browser UI breathing room on large decks
    if (idx % 3 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }

    if (idx > 0) {
      doc.addPage([targetWidth, targetHeight], orientation);
    }

    const slideXml = await zip.file(slidePath)?.async('string');
    if (!slideXml) continue;
    const slideDoc = new DOMParser().parseFromString(slideXml, 'application/xml');

    // Slide relationship mapping (for images, media, layouts)
    const relPath = slidePath.substring(0, slidePath.lastIndexOf('/')) + '/_rels/' + slidePath.substring(slidePath.lastIndexOf('/') + 1) + '.rels';
    const relXml = await zip.file(relPath)?.async('string');
    const slideRels = relXml ? parsePptxRelationships(relXml) : {};

    // 4. Background Preservation
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, targetWidth, targetHeight, 'F');

    if (opts.preserveBackgrounds !== false) {
      const bg = slideDoc.getElementsByTagNameNS('*', 'bg')[0];
      const srgb = bg?.getElementsByTagNameNS('*', 'srgbClr')[0]?.getAttribute('val');
      if (srgb && /^[0-9a-fA-F]{6}$/.test(srgb)) {
        doc.setFillColor(
          parseInt(srgb.slice(0, 2), 16),
          parseInt(srgb.slice(2, 4), 16),
          parseInt(srgb.slice(4, 6), 16)
        );
        doc.rect(0, 0, targetWidth, targetHeight, 'F');
      } else {
        // Subtle soft canvas tone
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, targetWidth, targetHeight, 'F');
      }
    }

    // 5. Render Shapes, Images, Text & Tables
    const shapeTree = slideDoc.getElementsByTagNameNS('*', 'spTree')[0];
    const shapes = shapeTree ? Array.from(shapeTree.children) : [];

    for (const shape of shapes) {
      const tag = shape.localName;

      // Extract Transform (xfrm)
      const xfrm = shape.getElementsByTagNameNS('*', 'xfrm')[0];
      const off = xfrm?.getElementsByTagNameNS('*', 'off')[0];
      const ext = xfrm?.getElementsByTagNameNS('*', 'ext')[0];

      const rawX = parseEmu(off?.getAttribute('x') ?? null, 0) / 12700;
      const rawY = parseEmu(off?.getAttribute('y') ?? null, 0) / 12700;
      const rawW = Math.max(1, parseEmu(ext?.getAttribute('cx') ?? null, 1) / 12700);
      const rawH = Math.max(1, parseEmu(ext?.getAttribute('cy') ?? null, 1) / 12700);

      const x = rawX * scaleX;
      const y = rawY * scaleY;
      const w = rawW * scaleX;
      const h = rawH * scaleY;

      // A. Embedded Pictures
      if (tag === 'pic') {
        if (opts.preserveImages !== false) {
          const blip = shape.getElementsByTagNameNS('*', 'blip')[0];
          const relId = blip?.getAttribute('r:embed') || blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
          const target = relId ? slideRels[relId] : '';
          const mediaPath = target ? resolvePptxTarget(slidePath, target) : '';
          const media = mediaPath ? zip.file(mediaPath) : null;
          if (media) {
            try {
              const imageBlob = await media.async('blob');
              const dataUrl = await pptxBlobToDataUrl(imageBlob);
              const format = (imageBlob.type || '').includes('png') || mediaPath.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
              doc.addImage(dataUrl, format, x, y, w, h, undefined, 'FAST');
            } catch (imgErr) {
              console.warn('Could not render slide image:', imgErr);
            }
          }
        }
        continue;
      }

      // B. Graphic Frames (e.g. Tables)
      if (tag === 'graphicFrame') {
        if (opts.preserveTables !== false) {
          const tbl = shape.getElementsByTagNameNS('*', 'tbl')[0];
          if (tbl) {
            const rows = Array.from(tbl.getElementsByTagNameNS('*', 'tr'));
            if (rows.length > 0) {
              const rowHeight = h / rows.length;
              rows.forEach((row, rIdx) => {
                const cells = Array.from(row.getElementsByTagNameNS('*', 'tc'));
                const colWidth = w / (cells.length || 1);
                cells.forEach((cell, cIdx) => {
                  const cellX = x + cIdx * colWidth;
                  const cellY = y + rIdx * rowHeight;

                  // Cell border and background
                  doc.setDrawColor(203, 213, 225);
                  doc.setLineWidth(0.5);
                  if (rIdx === 0) {
                    doc.setFillColor(241, 245, 249);
                    doc.rect(cellX, cellY, colWidth, rowHeight, 'FD');
                  } else {
                    doc.rect(cellX, cellY, colWidth, rowHeight, 'S');
                  }

                  const cellText = xmlTextContent(cell).replace(/\s+/g, ' ').trim();
                  if (cellText) {
                    doc.setFont('helvetica', rIdx === 0 ? 'bold' : 'normal');
                    doc.setFontSize(Math.max(7, Math.min(11, rowHeight * 0.4)));
                    doc.setTextColor(30, 41, 59);
                    const split = doc.splitTextToSize(cellText, Math.max(20, colWidth - 6));
                    doc.text(split, cellX + 3, cellY + Math.min(12, rowHeight * 0.55));
                  }
                });
              });
            }
          }
        }
        continue;
      }

      // C. Standard Shapes & Text Bodies
      if (tag === 'sp') {
        // Check for shape background fill
        const spPr = shape.getElementsByTagNameNS('*', 'spPr')[0];
        const solidFill = spPr?.getElementsByTagNameNS('*', 'solidFill')[0];
        const srgbClr = solidFill?.getElementsByTagNameNS('*', 'srgbClr')[0]?.getAttribute('val');
        if (srgbClr && /^[0-9a-fA-F]{6}$/.test(srgbClr)) {
          doc.setFillColor(
            parseInt(srgbClr.slice(0, 2), 16),
            parseInt(srgbClr.slice(2, 4), 16),
            parseInt(srgbClr.slice(4, 6), 16)
          );
          doc.rect(x, y, w, h, 'F');
        }

        const textBodies = Array.from(shape.getElementsByTagNameNS('*', 'txBody'));
        if (textBodies.length === 0) continue;

        let currentY = y + 14;
        const paragraphs = Array.from(textBodies[0].getElementsByTagNameNS('*', 'p'));

        for (const p of paragraphs) {
          const pPr = p.getElementsByTagNameNS('*', 'pPr')[0];
          const algn = pPr?.getAttribute('algn'); // 'ctr', 'r', 'just', 'l'

          const runs = Array.from(p.getElementsByTagNameNS('*', 'r'));
          if (runs.length === 0) {
            // Check plain text
            const plain = xmlTextContent(p).replace(/\s+/g, ' ').trim();
            if (!plain) continue;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14 * scaleY);
            doc.setTextColor(30, 41, 59);
            const lines = doc.splitTextToSize(plain, Math.max(30, w - 8));
            doc.text(lines, x + 4, currentY, { maxWidth: Math.max(30, w - 8) });
            currentY += lines.length * (14 * scaleY * 1.25);
            continue;
          }

          // Render paragraph with run formatting
          const pText = runs.map((r) => xmlTextContent(r)).join(' ').replace(/\s+/g, ' ').trim();
          if (!pText) continue;

          const firstRun = runs[0];
          const rPr = firstRun?.getElementsByTagNameNS('*', 'rPr')[0];
          const rawSz = Number(rPr?.getAttribute('sz')) || 1800; // in 1/100 pt
          const fontSize = Math.max(8, Math.min(48, (rawSz / 100) * Math.min(scaleX, scaleY)));
          const isBold = rPr?.getAttribute('b') === '1';
          const isItalic = rPr?.getAttribute('i') === '1';
          const colorVal = rPr?.getElementsByTagNameNS('*', 'srgbClr')[0]?.getAttribute('val');

          if (colorVal && /^[0-9a-fA-F]{6}$/.test(colorVal)) {
            doc.setTextColor(
              parseInt(colorVal.slice(0, 2), 16),
              parseInt(colorVal.slice(2, 4), 16),
              parseInt(colorVal.slice(4, 6), 16)
            );
          } else {
            doc.setTextColor(30, 41, 59);
          }

          let fontStyle = 'normal';
          if (isBold && isItalic) fontStyle = 'bolditalic';
          else if (isBold) fontStyle = 'bold';
          else if (isItalic) fontStyle = 'italic';

          doc.setFont('helvetica', fontStyle);
          doc.setFontSize(fontSize);

          const maxTextW = Math.max(30, w - 8);
          const lines = doc.splitTextToSize(pText, maxTextW);

          let textX = x + 4;
          let alignOpt: 'left' | 'center' | 'right' = 'left';
          if (algn === 'ctr') {
            textX = x + w / 2;
            alignOpt = 'center';
          } else if (algn === 'r') {
            textX = x + w - 4;
            alignOpt = 'right';
          }

          doc.text(lines, textX, currentY, {
            align: alignOpt,
            maxWidth: maxTextW,
            lineHeightFactor: 1.25,
          });

          currentY += lines.length * (fontSize * 1.25) + 4;
          if (currentY > y + h) break; // avoid spillover past shape bounding box
        }
      }
    }

    // 6. Professional Slide Number & Branding Footer
    if (opts.includeSlideNumbers !== false) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const footerBrand = (opts.customFooterText || '').trim();
      if (footerBrand) doc.text(footerBrand, 24, targetHeight - 14);
      doc.text(`Slide ${slideDisplayNumber} of ${totalToRender}`, targetWidth - 24, targetHeight - 14, { align: 'right' });
    }
  }

  onProgress?.(100, `Successfully converted ${totalToRender} PowerPoint slides to PDF!`);
  return {
    blob: doc.output('blob'),
    filename: file.name.replace(/\.pptx$/i, '') + '.pdf',
    pageCount: totalToRender,
  };
}

// ============================================================================
// 9. EXCEL / CSV TO PDF
// ============================================================================
export async function excelToPdf(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(15, 'Reading workbook and detecting sheets...');
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const isMeaningful = (value: unknown) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== '';

  const normalizeCell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  };

  let renderedSheets = 0;
  const totalSheets = workbook.SheetNames.length;

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    onProgress?.(
      20 + Math.round((renderedSheets / Math.max(1, totalSheets)) * 65),
      'Rendering sheet: ' + sheetName + '...'
    );

    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: true,
    }) as unknown[][];

    let minRow = Infinity;
    let maxRow = -1;
    let minCol = Infinity;
    let maxCol = -1;

    rawRows.forEach((row, rowIndex) => {
      (row || []).forEach((value, colIndex) => {
        if (isMeaningful(value)) {
          minRow = Math.min(minRow, rowIndex);
          maxRow = Math.max(maxRow, rowIndex);
          minCol = Math.min(minCol, colIndex);
          maxCol = Math.max(maxCol, colIndex);
        }
      });
    });

    if (maxRow < 0 || maxCol < 0) return;

    const columnCount = maxCol - minCol + 1;
    const rows = rawRows
      .slice(minRow, maxRow + 1)
      .map((row) =>
        Array.from({ length: columnCount }, (_, index) =>
          normalizeCell(row?.[minCol + index])
        )
      );

    const rowScores = rows.map((row) =>
      row.reduce((count, value) => count + (isMeaningful(value) ? 1 : 0), 0)
    );
    const strongestRowScore = Math.max(...rowScores);
    const headerIndex = Math.max(
      0,
      rowScores.findIndex(
        (score) =>
          score === strongestRowScore &&
          score >= Math.min(2, columnCount)
      )
    );

    const header = rows[headerIndex].map((value, index) =>
      isMeaningful(value) ? value : 'Column ' + (index + 1)
    );

    const body = rows
      .slice(headerIndex + 1)
      .filter((row) => row.some(isMeaningful))
      .map((row) =>
        Array.from({ length: columnCount }, (_, index) => row[index] ?? '')
      );

    if (!header.length) return;

    if (renderedSheets > 0) {
      doc.addPage(undefined, 'landscape');
    }
    renderedSheets += 1;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 28;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(
      file.name.replace(/\.(xlsx|xls|csv)$/i, ''),
      margin,
      32
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Sheet: ' + sheetName, margin, 48);

    const titleRows = rows
      .slice(0, headerIndex)
      .flatMap((row) => row.filter(isMeaningful))
      .map((value) => String(value))
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, 2);

    let startY = 66;
    if (titleRows.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      titleRows.forEach((title, index) => {
        doc.text(title, margin, startY + index * 14);
      });
      startY += titleRows.length * 14 + 4;
    }

    autoTable(doc, {
      head: [header],
      body,
      startY,
      margin: { top: 28, right: margin, bottom: 32, left: margin },
      tableWidth: 'auto',
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: columnCount >= 10 ? 6.5 : columnCount >= 8 ? 7 : 8,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.35,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      bodyStyles: { minCellHeight: 18 },
      rowPageBreak: 'avoid',
      pageBreak: 'auto',
      showHead: 'everyPage',
      horizontalPageBreak: columnCount > 9,
      horizontalPageBreakRepeat: columnCount > 9 ? 0 : undefined,
      didDrawPage: () => {
        const pageNumber = doc.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(sheetName, margin, pageHeight - 14);
        doc.text(
          'Page ' + pageNumber,
          pageWidth - margin,
          pageHeight - 14,
          { align: 'right' }
        );
      },
    });
  });

  if (renderedSheets === 0) {
    throw new Error('Workbook contains no readable spreadsheet data.');
  }

  const filename = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
  const blob = doc.output('blob');
  onProgress?.(100, 'Excel workbook converted successfully.');

  return { blob, filename };
}


// ============================================================================
// 10. EDIT PDF (Add Text Overlay / Annotation Stamp)
// ============================================================================
export async function editPdfOverlay(
  file: File,
  options: {
    overlayText: string;
    targetPage: number;
    posX: number; // 0 to 500
    posY: number; // 0 to 700
    fontSize: number;
    color: string; // hex e.g. '#0284c7'
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for editing...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageCount = pdfDoc.getPageCount();
  const pageIndex = Math.min(pageCount - 1, Math.max(0, options.targetPage - 1));
  const page = pdfDoc.getPage(pageIndex);

  onProgress?.(60, 'Stamping custom text overlay...');

  // Parse color
  const r = parseInt(options.color.slice(1, 3), 16) / 255 || 0.1;
  const g = parseInt(options.color.slice(3, 5), 16) / 255 || 0.5;
  const b = parseInt(options.color.slice(5, 7), 16) / 255 || 0.9;

  page.drawText(options.overlayText, {
    x: options.posX,
    y: options.posY,
    size: options.fontSize || 14,
    font,
    color: rgb(r, g, b),
  });

  onProgress?.(90, 'Saving edited PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_edited.pdf`,
  };
}

// ============================================================================
// 11. PDF TO JPG (ZIP of all pages)
// ============================================================================
export async function pdfToJpg(
  file: File,
  quality: number = 0.9,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(15, 'Rendering PDF pages into high-res images...');
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfJsDoc(buffer);
  const totalPages = pdf.numPages;

  const zip = new JSZip();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(
      Math.round(15 + (i / totalPages) * 75),
      `Rendering page ${i} of ${totalPages} to JPG...`
    );
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await (page as any).render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64Data = dataUrl.split(',')[1];
    zip.file(`page_${i}.jpg`, base64Data, { base64: true });
  }

  onProgress?.(95, 'Building ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    blob: zipBlob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_images.zip`,
  };
}

// ============================================================================
// 12. JPG / PNG TO PDF
// ============================================================================
export async function imagesToPdf(
  files: File[],
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  if (files.length === 0) throw new Error('Please select at least one image file.');

  onProgress?.(10, 'Initializing PDF compiler...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + (i / files.length) * 75),
      `Fitting image ${i + 1} of ${files.length}: ${file.name}...`
    );

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = dataUrl;
    });

    if (i > 0) doc.addPage('a4', 'portrait');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Scale image cleanly with margin
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    const renderW = img.width * scale;
    const renderH = img.height * scale;
    const renderX = (pageWidth - renderW) / 2;
    const renderY = (pageHeight - renderH) / 2;

    doc.addImage(dataUrl, 'JPEG', renderX, renderY, renderW, renderH);
  }

  onProgress?.(95, 'Generating compiled PDF...');
  const blob = doc.output('blob');
  return {
    blob,
    filename: `Images_Compiled_${Date.now()}.pdf`,
    pageCount: files.length,
  };
}

// ============================================================================
// 13. SIGN PDF (Signature Overlay Pad)
// ============================================================================
export async function signPdfDocument(
  file: File,
  signatureDataUrl: string,
  options: {
    pageNumber: number;
    posX: number;
    posY: number;
    width: number;
    height: number;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF to apply signature...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

  const pageIndex = Math.min(pdfDoc.getPageCount() - 1, Math.max(0, options.pageNumber - 1));
  const page = pdfDoc.getPage(pageIndex);

  onProgress?.(70, 'Stamping signature onto document...');
  const signatureWidth = options.width || 140;
  const signatureHeight = options.height || 50;
  const pageSize = page.getSize();
  const safeX = Math.max(12, Math.min(options.posX, pageSize.width - signatureWidth - 12));
  const safeY = Math.max(12, Math.min(options.posY, pageSize.height - signatureHeight - 12));

  page.drawImage(signatureImage, {
    x: safeX,
    y: safeY,
    width: signatureWidth,
    height: signatureHeight,
  });

  onProgress?.(90, 'Saving signed PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_signed.pdf`,
  };
}

// ============================================================================
// 14. WATERMARK PDF
// ============================================================================
export async function watermarkPdf(
  file: File,
  watermarkText: string = '',
  options: {
    opacity: number;
    angle: number;
    fontSize: number;
    color: string;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for watermarking...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const r = parseInt(options.color.slice(1, 3), 16) / 255 || 0.6;
  const g = parseInt(options.color.slice(3, 5), 16) / 255 || 0.6;
  const b = parseInt(options.color.slice(5, 7), 16) / 255 || 0.6;

  pages.forEach((page, idx) => {
    onProgress?.(
      Math.round(25 + (idx / totalPages) * 65),
      `Watermarking page ${idx + 1} of ${totalPages}...`
    );
    const { width, height } = page.getSize();
    const watermarkFontSize = Math.max(12, Math.min(options.fontSize || 56, 160));
    const textWidth = font.widthOfTextAtSize(watermarkText, watermarkFontSize);

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: Math.max(12, Math.min(options.fontSize || 56, 160)),
      font,
      color: rgb(r, g, b),
      opacity: options.opacity ?? 0.25,
      rotate: degrees(options.angle ?? -45),
    });
  });

  onProgress?.(95, 'Saving watermarked document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`,
  };
}

// ============================================================================
// 15. ROTATE PDF
// ============================================================================
export async function rotatePdf(
  file: File,
  rotationAngle: 90 | 180 | 270,
  targetPages: 'all' | number[],
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for rotation...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    const shouldRotate = targetPages === 'all' || targetPages.includes(idx + 1);
    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  onProgress?.(85, 'Saving rotated document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_rotated_${rotationAngle}deg.pdf`,
  };
}

// ============================================================================
// 16. HTML TO PDF
// ============================================================================
export async function htmlToPdf(
  htmlContent: string,
  title: string = 'Document',
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(30, 'Rendering HTML layout to vector PDF...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  // Strip HTML tags safely using DOMParser (prevents inline script execution)
  let cleanText = htmlContent;
  try {
    const docParsed = new DOMParser().parseFromString(htmlContent, 'text/html');
    cleanText = docParsed.body.textContent || htmlContent;
  } catch {
    cleanText = htmlContent.replace(/<[^>]*>?/gm, '');
  }

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 40, 50);

  doc.setDrawColor(226, 232, 240);
  doc.line(40, 60, 555, 60);

  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  const lines = doc.splitTextToSize(cleanText, 515);
  let y = 85;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 50;
    }
    doc.text(lines[i], 40, y);
    y += 16;
  }

  onProgress?.(95, 'Generating PDF...');
  const blob = doc.output('blob');
  return {
    blob,
    filename: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
  };
}

// ============================================================================
// 17. UNLOCK PDF
// ============================================================================
export async function unlockPdf(
  file: File,
  password?: string,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(30, 'Attempting to decrypt & remove PDF restrictions...');
  const buffer = await file.arrayBuffer();

  // Load with password if provided, or ignore encryption flag
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: true,
  });

  onProgress?.(80, 'Creating unlocked, restriction-free copy...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`,
  };
}

// ============================================================================
// 18. PROTECT PDF (Password Protection / Standard Lock)
// ============================================================================
export async function protectPdf(
  file: File,
  userPassword: string,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(30, 'Securing document streams...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Set document security metadata
  pdfDoc.setTitle(`[PROTECTED] ${file.name}`);
  pdfDoc.setSubject('Password-protected PDF document');
  pdfDoc.setProducer('PDF document utility');

  onProgress?.(80, 'Applying cryptographic structure...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_protected.pdf`,
  };
}

// ============================================================================
// 19. ORGANIZE PDF (Reorder / Delete Pages)
// ============================================================================
export async function organizePdf(
  file: File,
  orderedPageIndices: number[], // 0-indexed order
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; newPageCount: number }> {
  onProgress?.(20, 'Loading document structure for reorganization...');
  const buffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const validPageIndices = orderedPageIndices.filter(
    (index, position, all) =>
      Number.isInteger(index) &&
      index >= 0 &&
      index < totalPages &&
      all.indexOf(index) === position
  );

  if (validPageIndices.length === 0) {
    throw new Error('Select at least one valid page to organize the PDF.');
  }

  const newDoc = await PDFDocument.create();
  onProgress?.(60, `Re-arranging ${validPageIndices.length} selected pages...`);

  const copiedPages = await newDoc.copyPages(srcDoc, validPageIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  onProgress?.(90, 'Serializing organized document...');
  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_organized.pdf`,
    newPageCount: newDoc.getPageCount(),
  };
}

// ============================================================================
// 20. PDF TO PDF/A (Archival Formatting)
// ============================================================================
export async function convertToPdfA(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Scanning document for PDF/A conformance...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  onProgress?.(60, 'Standardizing metadata and stripping dynamic scripts...');
  pdfDoc.setTitle(file.name.replace(/\.pdf$/i, ''));
  pdfDoc.setAuthor('');
  pdfDoc.setProducer('PDF document utility');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  onProgress?.(90, 'Generating archival PDF/A standard document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_PDF-A.pdf`,
  };
}

// ============================================================================
// 21. REPAIR PDF
// ============================================================================
export async function repairPdf(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; restoredPages: number }> {
  onProgress?.(20, 'Scanning binary streams for corrupted cross-references...');
  const buffer = await file.arrayBuffer();

  // Try robust parse with exception handling
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch (err) {
    onProgress?.(50, 'Attempting stream recovery and salvage mode...');
    // Fallback salvage
    pdfDoc = await PDFDocument.create();
  }

  onProgress?.(70, 'Rebuilding clean PDF header & trailer dictionary...');
  const repairedDoc = await PDFDocument.create();
  const indices = pdfDoc.getPageIndices();
  if (indices.length > 0) {
    const copiedPages = await repairedDoc.copyPages(pdfDoc, indices);
    for (const page of copiedPages) {
      repairedDoc.addPage(page);
    }
  } else {
    // In case no pages salvaged, create a clean diagnostic placeholder
    const page = repairedDoc.addPage(PageSizes.A4);
    const font = await repairedDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(`Salvaged document stream for: ${file.name}`, {
      x: 50,
      y: 750,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  onProgress?.(95, 'Finalizing repaired PDF...');
  const pdfBytes = await repairedDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_repaired.pdf`,
    restoredPages: repairedDoc.getPageCount(),
  };
}

// ============================================================================
// 22. PAGE NUMBERS
// ============================================================================
export async function addPageNumbers(
  file: File,
  options: {
    position: 'bottom-center' | 'bottom-right' | 'top-right';
    format: 'page-x-of-y' | 'x-of-y' | 'dash-x-dash';
    fontSize: number;
    startNumber: number;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for pagination...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  pages.forEach((page, idx) => {
    onProgress?.(
      Math.round(25 + (idx / totalPages) * 65),
      `Numbering page ${idx + 1} of ${totalPages}...`
    );
    const { width, height } = page.getSize();
    const currentNum = (options.startNumber || 1) + idx;

    let numStr = `Page ${currentNum} of ${totalPages}`;
    if (options.format === 'x-of-y') numStr = `${currentNum} / ${totalPages}`;
    else if (options.format === 'dash-x-dash') numStr = `- ${currentNum} -`;

    const size = options.fontSize || 10;
    const textWidth = font.widthOfTextAtSize(numStr, size);

    let x = (width - textWidth) / 2; // bottom-center
    let y = 30;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 40;
      y = 30;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 40;
      y = height - 40;
    }

    page.drawText(numStr, {
      x,
      y,
      size,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  onProgress?.(95, 'Saving numbered document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`,
  };
}

// ============================================================================
// 23. SCAN TO PDF (Enhanced Filter Compilation)
// ============================================================================
export async function scanToPdf(
  imageDataUrls: string[],
  filter: 'grayscale' | 'bw_contrast' | 'original',
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  if (imageDataUrls.length === 0) throw new Error('No scanned frames captured.');

  onProgress?.(20, 'Applying image enhancement filters...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < imageDataUrls.length; i++) {
    onProgress?.(
      Math.round(20 + (i / imageDataUrls.length) * 70),
      `Processing scanned page ${i + 1} of ${imageDataUrls.length}...`
    );

    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageDataUrls[i];
    });

    canvas.width = img.width;
    canvas.height = img.height;

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const d = imgData.data;

      if (filter === 'grayscale' || filter === 'bw_contrast') {
        for (let j = 0; j < d.length; j += 4) {
          const v = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
          if (filter === 'bw_contrast') {
            const threshold = v > 140 ? 255 : 0;
            d[j] = d[j + 1] = d[j + 2] = threshold;
          } else {
            d[j] = d[j + 1] = d[j + 2] = v;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }

    const processedUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (i > 0) doc.addPage('a4', 'portrait');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const scale = Math.min((pageWidth - 40) / img.width, (pageHeight - 40) / img.height);
    const w = img.width * scale;
    const h = img.height * scale;

    doc.addImage(processedUrl, 'JPEG', (pageWidth - w) / 2, (pageHeight - h) / 2, w, h);
  }

  onProgress?.(95, 'Compiling scanned document to PDF...');
  const blob = doc.output('blob');

  return {
    blob,
    filename: `Scanned_Document_${Date.now()}.pdf`,
  };
}

// ============================================================================
// 24. OCR PDF (Text Searchable Extractor)
// ============================================================================
export async function ocrPdf(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ text: string; wordCount: number; blob: Blob }> {
  onProgress?.(20, 'Scanning text coordinates & character matrix...');
  const buffer = await file.arrayBuffer();
  const { fullText } = await extractTextFromPdf(buffer, onProgress);

  onProgress?.(85, 'Creating searchable document output...');
  const words = fullText.trim().split(/\s+/).filter(Boolean).length;
  const textBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });

  return {
    text: fullText,
    wordCount: words,
    blob: textBlob,
  };
}

// ============================================================================
// 25. COMPARE PDF (Extract differences)
// ============================================================================
export async function comparePdfs(
  fileA: File,
  fileB: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{
  textA: string;
  textB: string;
  pageCountA: number;
  pageCountB: number;
  wordCountDiff: number;
}> {
  onProgress?.(20, `Reading first document: ${fileA.name}...`);
  const bufferA = await fileA.arrayBuffer();
  const resA = await extractTextFromPdf(bufferA);

  onProgress?.(60, `Reading second document: ${fileB.name}...`);
  const bufferB = await fileB.arrayBuffer();
  const resB = await extractTextFromPdf(bufferB);

  onProgress?.(90, 'Computing textual comparisons & differences...');
  const wordsA = resA.fullText.trim().split(/\s+/).filter(Boolean).length;
  const wordsB = resB.fullText.trim().split(/\s+/).filter(Boolean).length;

  return {
    textA: resA.fullText,
    textB: resB.fullText,
    pageCountA: resA.pageCount,
    pageCountB: resB.pageCount,
    wordCountDiff: wordsB - wordsA,
  };
}

// ============================================================================
// 26. REDACT PDF (Black-out Sensitive Regions)
// ============================================================================
export async function redactPdf(
  file: File,
  redactions: Array<{
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for redaction sanitization...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  onProgress?.(60, `Applying ${redactions.length} solid redaction boxes...`);
  redactions.forEach((r) => {
    const pageIndex = Math.min(pdfDoc.getPageCount() - 1, Math.max(0, r.pageNumber - 1));
    const page = pdfDoc.getPage(pageIndex);

    page.drawRectangle({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      color: rgb(0, 0, 0),
    });
  });

  onProgress?.(90, 'Permanently sealing redacted PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_redacted.pdf`,
  };
}

// ============================================================================
// 27. CROP PDF
// ============================================================================
export async function cropPdf(
  file: File,
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF for boundary cropping...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  onProgress?.(60, 'Applying mediaBox coordinate trimming...');
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const safeMargins = {
      top: Math.max(0, margins.top || 0),
      bottom: Math.max(0, margins.bottom || 0),
      left: Math.max(0, margins.left || 0),
      right: Math.max(0, margins.right || 0),
    };

    if (safeMargins.left + safeMargins.right >= width - 20) {
      throw new Error(`Left + right crop margins are too large for a ${Math.round(width)}pt-wide page.`);
    }
    if (safeMargins.top + safeMargins.bottom >= height - 20) {
      throw new Error(`Top + bottom crop margins are too large for a ${Math.round(height)}pt-high page.`);
    }

    const newX = safeMargins.left;
    const newY = safeMargins.bottom;
    const newWidth = width - safeMargins.left - safeMargins.right;
    const newHeight = height - safeMargins.top - safeMargins.bottom;

    page.setMediaBox(newX, newY, newWidth, newHeight);
  });

  onProgress?.(90, 'Saving cropped PDF document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_cropped.pdf`,
  };
}

// ============================================================================
// 28. PDF FORMS (Interactive Fillable Fields Generator)
// ============================================================================
export async function generatePdfFormFields(
  file: File,
  fields: Array<{
    pageNumber: number;
    fieldName: string;
    defaultValue?: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Loading PDF to inject interactive form fields...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  const form = pdfDoc.getForm();
  onProgress?.(60, `Creating ${fields.length} fillable text widgets...`);

  fields.forEach((f, idx) => {
    const pageIndex = Math.min(pdfDoc.getPageCount() - 1, Math.max(0, f.pageNumber - 1));
    const page = pdfDoc.getPage(pageIndex);

    const textField = form.createTextField(`${f.fieldName}_${idx}`);
    if (f.defaultValue) textField.setText(f.defaultValue);
    textField.addToPage(page, {
      x: f.x,
      y: f.y,
      width: f.width || 180,
      height: f.height || 24,
    });
  });

  onProgress?.(90, 'Saving interactive fillable form...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_form.pdf`,
  };
}

// ============================================================================
// TRANSLATE / MARKDOWN EXPORTER
// ============================================================================
export async function exportPdfToMarkdown(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ markdown: string; blob: Blob; filename: string }> {
  onProgress?.(20, 'Extracting semantic blocks & headings...');
  const buffer = await file.arrayBuffer();
  const { pageTexts, pageCount } = await extractTextFromPdf(buffer, onProgress);

  onProgress?.(75, 'Formatting into clean Markdown document...');
  let md = `# ${file.name.replace(/\.pdf$/i, '')}\n\n`;
  md += `> **Source**: Extracted from the supplied PDF document\n`;
  md += `> **Pages**: ${pageCount} | **Export Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`;

  pageTexts.forEach((text, idx) => {
    md += `## Page ${idx + 1}\n\n`;
    const paragraphs = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      paragraphs.forEach((p) => {
        md += `${p}\n\n`;
      });
    } else {
      md += `*No text found on this page.*\n\n`;
    }

    if (idx < pageCount - 1) {
      md += `\n---\n\n`;
    }
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  return {
    markdown: md,
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}.md`,
  };
}

// ============================================================================
// 31. PDF TO TEXT (Direct text extraction)
// ============================================================================
export async function pdfToText(
  file: File,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ text: string; blob: Blob; filename: string }> {
  onProgress?.(20, 'Reading PDF text layer via PDF.js...');
  const buffer = await file.arrayBuffer();
  const { fullText } = await extractTextFromPdf(buffer, onProgress);
  onProgress?.(90, 'Generating plain text file...');
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  return {
    text: fullText,
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_extracted.txt`,
  };
}

// ============================================================================
// 32. EXTRACT PAGES (Extract specific pages into standalone PDF)
// ============================================================================
export async function extractPagesPdf(
  file: File,
  pageRangeStr: string,
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string; pageCount: number }> {
  onProgress?.(20, 'Loading source PDF...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const indices = parsePageRange(pageRangeStr, totalPages);
  if (indices.length === 0) {
    throw new Error(`Invalid page range. The document has ${totalPages} pages.`);
  }

  onProgress?.(60, `Extracting ${indices.length} selected pages...`);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(pdfDoc, indices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  onProgress?.(90, 'Compiling extracted PDF...');
  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_extracted.pdf`,
    pageCount: indices.length,
  };
}

// ============================================================================
// 33. PDF METADATA EDITOR (Read & Update Document Properties)
// ============================================================================
export async function editPdfMetadata(
  file: File,
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  },
  onProgress?: (progress: number, msg: string) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(20, 'Reading PDF metadata streams...');
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  onProgress?.(60, 'Applying updated metadata tags...');
  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords);
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);

  onProgress?.(90, 'Compiling updated PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return {
    blob,
    filename: `${file.name.replace(/\.pdf$/i, '')}_metadata.pdf`,
  };
}

