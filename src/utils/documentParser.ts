import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { configurePdfWorker } from './pdfWorkerConfig';

// Configure reliable pdfjs worker in browser
if (typeof window !== 'undefined') {
  configurePdfWorker();
}

/**
 * Extract clean plain text from any uploaded PDF, DOCX, or TXT file client-side.
 */
export async function extractTextFromDocument(file: File): Promise<{ text: string; pageCount?: number; fileType: string }> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'txt' || extension === 'md' || extension === 'rtf' || extension === 'json') {
    const text = await file.text();
    return { text: text.trim(), fileType: extension.toUpperCase() };
  }

  if (extension === 'docx' || extension === 'doc') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return {
        text: result.value.trim(),
        fileType: 'DOCX',
      };
    } catch (err) {
      console.warn('DOCX parse failed, falling back to basic stream reader:', err);
      const text = await file.text();
      return { text: text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim(), fileType: 'DOCX' };
    }
  }

  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map((item: any) => item.str || '');
        fullText += pageStrings.join(' ') + '\n\n';
      }

      if (fullText.trim().length > 20) {
        return {
          text: fullText.trim(),
          pageCount: numPages,
          fileType: 'PDF',
        };
      }
    } catch (pdfErr) {
      console.warn('pdfjs extraction failed, trying binary stream heuristic:', pdfErr);
    }

    // Fallback: extract ASCII strings from PDF stream
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binaryStr = '';
      const step = Math.max(1, Math.floor(uint8.length / 500000));
      for (let i = 0; i < uint8.length; i += step) {
        const code = uint8[i];
        if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
          binaryStr += String.fromCharCode(code);
        }
      }
      
      const cleanMatch = binaryStr
        .replace(/stream[\s\S]*?endstream/g, ' ')
        .replace(/[\\/()[\]{}<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        text: cleanMatch.slice(0, 8000),
        fileType: 'PDF (Fallback)',
      };
    } catch {
      return {
        text: '',
        fileType: 'PDF',
      };
    }
  }

  // Generic fallback
  const text = await file.text();
  return { text: text.trim(), fileType: extension.toUpperCase() || 'FILE' };
}
