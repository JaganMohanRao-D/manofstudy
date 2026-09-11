import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Stamp,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Scissors,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Minimize2,
  Camera,
  Eye,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { PdfToolDefinition, PdfFileItem, PdfProcessProgress } from '../../types';
import {
  formatBytes,
  downloadBlob,
  mergePdfs,
  splitPdf,
  compressPdf,
  pdfToWord,
  pdfToPowerpoint,
  pdfToExcel,
  wordTextToPdf,
  powerpointToPdf,
  excelToPdf,
  editPdfOverlay,
  pdfToJpg,
  imagesToPdf,
  signPdfDocument,
  watermarkPdf,
  rotatePdf,
  htmlToPdf,
  unlockPdf,
  protectPdf,
  organizePdf,
  convertToPdfA,
  repairPdf,
  addPageNumbers,
  scanToPdf,
  ocrPdf,
  comparePdfs,
  redactPdf,
  cropPdf,
  generatePdfFormFields,
  summarizePdf,
  exportPdfToMarkdown,
} from '../../utils/pdfToolkitEngine';
import { formatPdfErrorMessage } from '../../utils/pdfErrorHelper';

interface PdfToolModalProps {
  tool: PdfToolDefinition;
  onClose: () => void;
}

export const PdfToolModal: React.FC<PdfToolModalProps> = ({ tool, onClose }) => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [fileB, setFileB] = useState<PdfFileItem | null>(null); // For compare tool
  const [progress, setProgress] = useState<PdfProcessProgress>({
    isProcessing: false,
    progressPercent: 0,
    statusMessage: '',
  });

  // Tool Specific States
  // Split
  const [splitMode, setSplitMode] = useState<'range' | 'all_pages'>('range');
  const [splitRange, setSplitRange] = useState<string>('1-2');

  // Compress
  const [compressLevel, setCompressLevel] = useState<number>(0.65);

  // Watermark
  const [watermarkText, setWatermarkText] = useState<string>('JAVISAK');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(-45);
  const [watermarkColor, setWatermarkColor] = useState<string>('#475569');

  // Rotate
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);

  // Page numbers
  const [numPosition, setNumPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-right');
  const [numFormat, setNumFormat] = useState<'page-x-of-y' | 'x-of-y' | 'dash-x-dash'>('page-x-of-y');

  // Protect / Unlock Password
  const [passwordInput, setPasswordInput] = useState<string>('');

  // Edit Overlay
  const [overlayText, setOverlayText] = useState<string>('APPROVED - JAVISAK');
  const [overlayPage, setOverlayPage] = useState<number>(1);
  const [overlayColor, setOverlayColor] = useState<string>('#0284c7');

  // Crop margins
  const [cropMargins, setCropMargins] = useState({ top: 30, bottom: 30, left: 30, right: 30 });

  // HTML content for HTML to PDF
  const [htmlCode, setHtmlCode] = useState<string>(
    '<h1>Student Project Report</h1>\n<p>Generated smoothly with JAVISAK client-side engine.</p>'
  );

  // Sign Pad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [signPage, setSignPage] = useState<number>(1);

  // Organize pages list (mock indices until loaded)
  const [organizeIndices, setOrganizeIndices] = useState<number[]>([0, 1, 2, 3]);

  // AI Summary & Markdown Results
  const [summaryData, setSummaryData] = useState<{
    wordCount: number;
    readingTimeMin: number;
    keyTakeaways: string[];
    executiveSummary: string;
  } | null>(null);

  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  // Compare Results
  const [compareData, setCompareData] = useState<{
    pageCountA: number;
    pageCountB: number;
    wordCountDiff: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileBInputRef = useRef<HTMLInputElement>(null);

  // Initialize Canvas for Signature
  useEffect(() => {
    if (tool.id === 'sign-pdf' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tool.id]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles: File[] = Array.from(e.target.files);

    const items: PdfFileItem[] = selectedFiles.map((file: File) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      sizeBytes: file.size,
    }));

    if (tool.multipleFiles) {
      setFiles((prev) => [...prev, ...items]);
    } else {
      setFiles([items[0]]);
    }
  };

  const handleFileBDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    setFileB({
      id: `docB-${Date.now()}`,
      file: f,
      name: f.name,
      sizeBytes: f.size,
    });
  };

  // Move files up/down for merge
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  // Main Execution Function
  const handleExecute = async () => {
    if (tool.id === 'html-to-pdf') {
      // HTML to PDF doesn't require a file upload
    } else if (files.length === 0) {
      alert('Please upload at least one required file.');
      return;
    }

    setProgress({
      isProcessing: true,
      progressPercent: 5,
      statusMessage: `Starting ${tool.name}...`,
      error: undefined,
    });

    try {
      const mainFile = files[0]?.file;

      switch (tool.id) {
        case 'merge-pdf': {
          if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
          const res = await mergePdfs(files.map((f) => f.file), (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Merged ${files.length} PDFs into ${res.pageCount} pages (${formatBytes(res.size)})!`,
            downloadUrl,
            downloadFilename: `Merged_Document_${Date.now()}.pdf`,
          });
          break;
        }

        case 'split-pdf': {
          const res = await splitPdf(mainFile, { mode: splitMode, rangeString: splitRange }, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: res.isZip ? 'All pages split into ZIP package!' : 'Page range extracted successfully!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'compress-pdf': {
          const res = await compressPdf(mainFile, compressLevel, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Compressed by ${res.ratio}! (${formatBytes(res.originalSize)} → ${formatBytes(res.newSize)})`,
            downloadUrl,
            downloadFilename: `${mainFile.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
            resultStats: {
              originalSize: formatBytes(res.originalSize),
              newSize: formatBytes(res.newSize),
              reductionPercent: res.ratio,
            },
          });
          break;
        }

        case 'pdf-to-word': {
          const res = await pdfToWord(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Converted PDF text layer into editable Word document!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'pdf-to-powerpoint': {
          const res = await pdfToPowerpoint(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          const secondaryDownloadUrl = res.zipBlob ? URL.createObjectURL(res.zipBlob) : undefined;
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Converted pages into 16:9 presentation slides (.pptx)!',
            downloadUrl,
            downloadFilename: res.filename,
            secondaryDownloadUrl,
            secondaryFilename: `${mainFile.name.replace(/\.pdf$/i, '')}_Slides_Package.zip`,
          });
          break;
        }

        case 'pdf-to-excel': {
          const res = await pdfToExcel(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Parsed tabular matrix to Excel CSV format!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'word-to-pdf': {
          const res = await wordTextToPdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Compiled text document into vector A4 PDF!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'powerpoint-to-pdf': {
          const res = await powerpointToPdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Converted presentation notes to landscape PDF!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'excel-to-pdf': {
          const res = await excelToPdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Rendered spreadsheet rows into formatted PDF report!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'pdf-to-jpg': {
          const res = await pdfToJpg(mainFile, 0.9, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Rendered all pages to high-res JPG images in ZIP!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'jpg-to-pdf': {
          const res = await imagesToPdf(files.map((f) => f.file), (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Compiled ${res.pageCount} images into centered A4 PDF!`,
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'sign-pdf': {
          if (!canvasRef.current) throw new Error('Signature pad is unavailable.');
          const signatureDataUrl = canvasRef.current.toDataURL('image/png');
          const res = await signPdfDocument(
            mainFile,
            signatureDataUrl,
            {
              pageNumber: signPage,
              posX: 380,
              posY: 60,
              width: 150,
              height: 55,
            },
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Signature stamped cleanly on Page ${signPage}!`,
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'watermark-pdf': {
          const res = await watermarkPdf(
            mainFile,
            watermarkText,
            {
              opacity: watermarkOpacity,
              angle: watermarkAngle,
              fontSize: 38,
              color: watermarkColor,
            },
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Watermark stamped across all pages!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'rotate-pdf': {
          const res = await rotatePdf(mainFile, rotateAngle, 'all', (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Rotated document by ${rotateAngle}°!`,
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'html-to-pdf': {
          const res = await htmlToPdf(htmlCode, 'JAVISAK Document', (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Rendered HTML to vector PDF document!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'unlock-pdf': {
          const res = await unlockPdf(mainFile, passwordInput, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Permissions and restrictions removed successfully!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'protect-pdf': {
          const res = await protectPdf(mainFile, passwordInput || '1234', (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Security locks and metadata encryption applied!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'organize-pdf': {
          const res = await organizePdf(mainFile, organizeIndices, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Organized layout compiled (${res.newPageCount} pages)!`,
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'pdf-to-pdfa': {
          const res = await convertToPdfA(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Converted to ISO PDF/A-1b Archival standard!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'repair-pdf': {
          const res = await repairPdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Repaired document structure (${res.restoredPages} pages restored)!`,
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'page-numbers': {
          const res = await addPageNumbers(
            mainFile,
            {
              position: numPosition,
              format: numFormat,
              fontSize: 10,
              startNumber: 1,
            },
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Page numbers stamped across entire document!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'scan-to-pdf': {
          const urls = files.map((f) => URL.createObjectURL(f.file));
          const res = await scanToPdf(urls, 'bw_contrast', (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Clean high-contrast scanned PDF compiled!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'ocr-pdf': {
          const res = await ocrPdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Extracted ${res.wordCount} searchable words from document!`,
            downloadUrl,
            downloadFilename: `${mainFile.name.replace(/\.pdf$/i, '')}_Searchable.txt`,
          });
          break;
        }

        case 'compare-pdf': {
          if (!fileB) throw new Error('Please select both Document A and Document B to compare.');
          const res = await comparePdfs(mainFile, fileB.file, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          setCompareData({
            pageCountA: res.pageCountA,
            pageCountB: res.pageCountB,
            wordCountDiff: res.wordCountDiff,
          });
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Comparison complete! Diff: ${res.wordCountDiff >= 0 ? '+' : ''}${res.wordCountDiff} words.`,
          });
          break;
        }

        case 'redact-pdf': {
          // Standard black box redaction over bottom area / student ID zone
          const res = await redactPdf(
            mainFile,
            [
              { pageNumber: 1, x: 50, y: 100, width: 250, height: 35 },
              { pageNumber: 1, x: 50, y: 150, width: 200, height: 25 },
            ],
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Sanitized and sealed permanent redaction blocks!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'crop-pdf': {
          const res = await cropPdf(mainFile, cropMargins, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Adjusted mediaBox crop boundaries!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'pdf-forms': {
          const res = await generatePdfFormFields(
            mainFile,
            [
              { pageNumber: 1, fieldName: 'Student_Name', defaultValue: 'Enter Full Name', x: 100, y: 650, width: 220, height: 24 },
              { pageNumber: 1, fieldName: 'Roll_Number', defaultValue: 'Enter Roll / Hall Ticket No', x: 100, y: 610, width: 220, height: 24 },
            ],
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Injected fillable interactive text input fields!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'edit-pdf': {
          const res = await editPdfOverlay(
            mainFile,
            {
              overlayText,
              targetPage: overlayPage,
              posX: 60,
              posY: 720,
              fontSize: 16,
              color: overlayColor,
            },
            (pct, msg) => {
              setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
            }
          );
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Overlay text stamped onto document!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        case 'ai-summarizer': {
          const res = await summarizePdf(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          setSummaryData(res);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: `Analyzed ${res.wordCount} words (~${res.readingTimeMin} min read)!`,
          });
          break;
        }

        case 'translate-markdown': {
          const res = await exportPdfToMarkdown(mainFile, (pct, msg) => {
            setProgress((prev) => ({ ...prev, progressPercent: pct, statusMessage: msg }));
          });
          setMarkdownOutput(res.markdown);
          const downloadUrl = URL.createObjectURL(res.blob);
          setProgress({
            isProcessing: false,
            progressPercent: 100,
            statusMessage: 'Exported into structured GitHub Markdown format!',
            downloadUrl,
            downloadFilename: res.filename,
          });
          break;
        }

        default:
          throw new Error('Tool runner not found.');
      }
    } catch (err: any) {
      console.error('PDF Tool execution error:', err);
      const friendlyError = formatPdfErrorMessage(err);
      setProgress({
        isProcessing: false,
        progressPercent: 0,
        statusMessage: 'Execution failed',
        error: friendlyError,
      });
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownOutput);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{tool.name}</h2>
              {tool.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{tool.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Workspace Form */}
        <div className="space-y-5">
          {/* File Upload Zone (if tool needs files) */}
          {tool.id !== 'html-to-pdf' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {tool.id === 'compare-pdf' ? 'Upload Document A' : 'Select or Drop Document'}
              </label>

              {files.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-all space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to choose {tool.multipleFiles ? 'files' : 'a file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Accepts {tool.acceptedFileTypes} • 100% processed locally on your device
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tool.acceptedFileTypes}
                    multiple={tool.multipleFiles}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {files.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                        <span className="text-slate-400 shrink-0">({formatBytes(item.sizeBytes)})</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {tool.id === 'merge-pdf' && files.length > 1 && (
                          <>
                            <button
                              onClick={() => moveFile(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveFile(index, 'down')}
                              disabled={index === files.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setFiles((prev) => prev.filter((f) => f.id !== item.id))}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {tool.multipleFiles && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      + Add More Files
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tool.acceptedFileTypes}
                    multiple={tool.multipleFiles}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* Secondary File Upload for Compare PDF */}
          {tool.id === 'compare-pdf' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Upload Document B (Comparison)</label>
              {!fileB ? (
                <div
                  onClick={() => fileBInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50"
                >
                  <p className="text-xs font-semibold text-slate-700">Click to upload second PDF</p>
                  <input
                    ref={fileBInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileBDrop}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-800 truncate">{fileB.name}</span>
                    <span className="text-slate-400">({formatBytes(fileB.sizeBytes)})</span>
                  </div>
                  <button onClick={() => setFileB(null)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TOOL SPECIFIC SETTINGS */}
          {/* ------------------------------------------------------------- */}

          {/* Split PDF Controls */}
          {tool.id === 'split-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-semibold text-slate-800 block">Splitting Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode('range')}
                  className={`p-2.5 rounded-lg border font-medium text-left transition-colors ${
                    splitMode === 'range'
                      ? 'bg-sky-500 text-white border-sky-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Custom Page Range
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('all_pages')}
                  className={`p-2.5 rounded-lg border font-medium text-left transition-colors ${
                    splitMode === 'all_pages'
                      ? 'bg-sky-500 text-white border-sky-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Split All Pages (ZIP)
                </button>
              </div>

              {splitMode === 'range' && (
                <div className="space-y-1 pt-1">
                  <label className="text-slate-600 block">Page Range (e.g., 1-3, 5, 7-10)</label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="1-3, 5"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Compress Quality Slider */}
          {tool.id === 'compress-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Compression Strength</span>
                <span className="font-mono font-bold text-sky-700">
                  {compressLevel <= 0.5 ? 'Extreme (Smallest Size)' : compressLevel <= 0.7 ? 'Recommended (Balanced)' : 'High Quality'}
                </span>
              </div>
              <input
                type="range"
                min="0.35"
                max="0.85"
                step="0.05"
                value={compressLevel}
                onChange={(e) => setCompressLevel(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Maximum Shrink</span>
                <span>Balanced</span>
                <span>Best Clarity</span>
              </div>
            </div>
          )}

          {/* Watermark Controls */}
          {tool.id === 'watermark-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="CONFIDENTIAL / JAVISAK"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Angle: {watermarkAngle}°</label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="15"
                    value={watermarkAngle}
                    onChange={(e) => setWatermarkAngle(parseInt(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Color</label>
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sign PDF Pad */}
          {tool.id === 'sign-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Draw Signature</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Target Page:</span>
                  <input
                    type="number"
                    min="1"
                    value={signPage}
                    onChange={(e) => setSignPage(parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1 bg-white border border-slate-300 rounded text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-200 rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={drawSignature}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawSignature}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 touch-none cursor-crosshair"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Draw your signature above with mouse or touch. It will be cleanly stamped onto Page {signPage}.
              </p>
            </div>
          )}

          {/* Rotate PDF Controls */}
          {tool.id === 'rotate-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-semibold text-slate-800 block">Rotation Angle</span>
              <div className="grid grid-cols-3 gap-3">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotateAngle(deg as any)}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      rotateAngle === deg
                        ? 'bg-sky-500 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    +{deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page Numbers Controls */}
          {tool.id === 'page-numbers' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Position</label>
                  <select
                    value={numPosition}
                    onChange={(e) => setNumPosition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Format</label>
                  <select
                    value={numFormat}
                    onChange={(e) => setNumFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="page-x-of-y">Page 1 of N</option>
                    <option value="x-of-y">1 / N</option>
                    <option value="dash-x-dash">- 1 -</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Password Input for Protect or Unlock */}
          {(tool.id === 'protect-pdf' || tool.id === 'unlock-pdf') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <label className="font-semibold text-slate-800 block">
                {tool.id === 'protect-pdf' ? 'Set Document Password' : 'Enter Password (if locked)'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          )}

          {/* Edit PDF Text Overlay */}
          {tool.id === 'edit-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Text to Overlay</label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Target Page</label>
                  <input
                    type="number"
                    min="1"
                    value={overlayPage}
                    onChange={(e) => setOverlayPage(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Color</label>
                  <input
                    type="color"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HTML Code Editor */}
          {tool.id === 'html-to-pdf' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <label className="font-semibold text-slate-800 block">HTML Document Template / Code</label>
              <textarea
                rows={5}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}
        </div>

        {/* Progress & Status */}
        {progress.isProcessing && (
          <div className="space-y-2 bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs">
            <div className="flex items-center justify-between font-semibold text-sky-900">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                {progress.statusMessage || 'Processing document...'}
              </span>
              <span>{progress.progressPercent}%</span>
            </div>
            <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {progress.error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900">Document Processing Notice</p>
              <p className="text-rose-700 leading-relaxed">{progress.error}</p>
            </div>
          </div>
        )}

        {/* Success Output & Download Section */}
        {progress.downloadUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">Process Completed Successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{progress.statusMessage}</p>
              </div>
            </div>

            {progress.resultStats && (
              <div className="grid grid-cols-3 gap-2 bg-white/70 p-3 rounded-lg text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Original</span>
                  <span className="font-bold text-slate-800">{progress.resultStats.originalSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Compressed</span>
                  <span className="font-bold text-emerald-700">{progress.resultStats.newSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Saved</span>
                  <span className="font-bold text-sky-700">{progress.resultStats.reductionPercent}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  if (progress.downloadUrl && progress.downloadFilename) {
                    const link = document.createElement('a');
                    link.href = progress.downloadUrl;
                    link.download = progress.downloadFilename;
                    link.click();
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {progress.downloadFilename}
              </button>

              {progress.secondaryDownloadUrl && progress.secondaryFilename && (
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = progress.secondaryDownloadUrl!;
                    link.download = progress.secondaryFilename!;
                    link.click();
                  }}
                  className="py-3 px-4 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  title="Download slide deck package (.zip)"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Slide Deck (.zip)
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Summarizer Result View */}
        {summaryData && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                AI Document Summary
              </span>
              <span className="text-slate-500">
                <strong>{summaryData.wordCount}</strong> words • <strong>{summaryData.readingTimeMin}</strong> min read
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 block">Executive Overview:</span>
              <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {summaryData.executiveSummary}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 block">Key Takeaways:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                {summaryData.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Markdown Export Preview */}
        {markdownOutput && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Markdown Preview</span>
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={markdownOutput}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 focus:outline-none"
            />
          </div>
        )}

        {/* Compare Result View */}
        {compareData && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <span className="font-bold text-slate-900 block">Document Difference Diagnostics</span>
            <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Doc A Pages</span>
                <span className="font-bold text-slate-800">{compareData.pageCountA}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Doc B Pages</span>
                <span className="font-bold text-slate-800">{compareData.pageCountB}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Word Difference</span>
                <span
                  className={`font-bold ${
                    compareData.wordCountDiff === 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {compareData.wordCountDiff >= 0 ? `+${compareData.wordCountDiff}` : compareData.wordCountDiff} words
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero server upload • Runs 100% in client memory</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>

            {!progress.downloadUrl && !summaryData && !markdownOutput && !compareData && (
              <button
                onClick={handleExecute}
                disabled={progress.isProcessing}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {progress.isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Execute {tool.name}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
