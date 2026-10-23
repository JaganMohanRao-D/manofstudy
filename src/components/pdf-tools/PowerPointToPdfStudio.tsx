import React, { useState, useRef, useCallback } from 'react';
import {
  Layers,
  Upload,
  FileCheck,
  CheckCircle2,
  Download,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertCircle,
  Monitor,
  ListOrdered,
  Image as ImageIcon,
  Grid,
  Hash,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  inspectPptx,
  powerpointToPdf,
  PptxInspectionResult,
  PowerpointToPdfOptions,
  formatBytes,
} from '../../utils/pdfToolkitEngine';

interface PowerPointToPdfStudioProps {
  onBackToHub?: () => void;
}

/**
 * Creates a valid Open XML .pptx File in browser memory for instant testing
 */
async function generateSamplePptx(): Promise<File> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide4.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // 3. ppt/presentation.xml (16:9 widescreen 12192000 x 6858000 EMUs = 960 x 540 pt)
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
    <p:sldId id="258" r:id="rId3"/>
    <p:sldId id="259" r:id="rId4"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  // 4. ppt/_rels/presentation.xml.rels
  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide4.xml"/>
</Relationships>`
  );

  // Helper to generate a styled slide XML
  const makeSlide = (title: string, subtitle: string, bullets: string[], bgHex: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill>
          <a:srgbClr val="${bgHex}"/>
        </a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="600000"/><a:ext cx="10500000" cy="1200000"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:pPr algn="l"/>
            <a:r>
              <a:rPr sz="2800" b="1"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>${title}</a:t>
            </a:r>
          </a:p>
          ${
            subtitle
              ? `<a:p><a:pPr algn="l"/><a:r><a:rPr sz="1500"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill></a:rPr><a:t>${subtitle}</a:t></a:r></a:p>`
              : ''
          }
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="2000000"/><a:ext cx="10500000" cy="3800000"/></a:xfrm>
          <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
          <a:ln w="9525"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          ${bullets
            .map(
              (b) => `<a:p>
            <a:pPr algn="l"/>
            <a:r>
              <a:rPr sz="1600"><a:solidFill><a:srgbClr val="1E293B"/></a:solidFill></a:rPr>
              <a:t>• ${b}</a:t>
            </a:r>
          </a:p>`
            )
            .join('')}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

  zip.file('ppt/slides/slide1.xml', makeSlide(
    'B.Tech Final Year Seminar: AI in Healthcare',
    'Student: Jagan Mohan Rao | Guide: Dr. K. Ramanathan',
    [
      'Real-time diagnostic screening using multi-modal deep neural networks',
      'Zero-latency edge inference on low-cost medical tablets',
      'Compliant with HIPAA data governance and patient privacy protocols',
      'Presented at Department of Computer Science & Engineering Seminar Hall',
    ],
    'F8FAFC'
  ));

  zip.file('ppt/slides/slide2.xml', makeSlide(
    'Problem Statement & Objectives',
    'Bridging Diagnostic Turnaround Times in Rural Clinics',
    [
      'High specialist-to-patient deficit in primary healthcare centers',
      'Average radiological reporting delay: 48 to 72 hours',
      'Proposed solution: On-device automated pathology classification',
      'Target metric: Area Under Curve (AUC) > 0.94 on benchmark chest X-rays',
    ],
    'F1F5F9'
  ));

  zip.file('ppt/slides/slide3.xml', makeSlide(
    'System Architecture & Pipeline',
    'High-Throughput Mobile Pipeline with Local Vector Storage',
    [
      'Phase 1: High-fidelity image pre-processing with CLAHE contrast enhancement',
      'Phase 2: MobileNet-V3 feature extractor fine-tuned on clinical datasets',
      'Phase 3: Quantized ONNX runtime executing in sub-250ms on mobile hardware',
      'Phase 4: Encrypted offline local report generation in vector PDF format',
    ],
    'F8FAFC'
  ));

  zip.file('ppt/slides/slide4.xml', makeSlide(
    'Conclusions & Viva Defense Summary',
    'Key Project Outcomes & Future Roadmap',
    [
      'Achieved 96.2% sensitivity on validation cohort of 2,400 scans',
      'Zero external cloud transmission ensures complete patient data sovereignty',
      'Successfully defended during CSE Viva Voce with Grade A',
      'Open-source codebase and offline diagnostic package prepared for distribution',
    ],
    'F0FDF4'
  ));

  // Slide relationship files
  const emptySlideRel = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;
  zip.file('ppt/slides/_rels/slide1.xml.rels', emptySlideRel);
  zip.file('ppt/slides/_rels/slide2.xml.rels', emptySlideRel);
  zip.file('ppt/slides/_rels/slide3.xml.rels', emptySlideRel);
  zip.file('ppt/slides/_rels/slide4.xml.rels', emptySlideRel);

  const pptxBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  return new File([pptxBlob], 'AI_Healthcare_Seminar_Presentation.pptx', {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}

export const PowerPointToPdfStudio: React.FC<PowerPointToPdfStudioProps> = ({ onBackToHub }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspection, setInspection] = useState<PptxInspectionResult | null>(null);
  const [inspectError, setInspectError] = useState<string>('');

  // Conversion options
  const [aspectRatio, setAspectRatio] = useState<'auto' | '16:9' | '4:3' | 'a4'>('auto');
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('');
  const [preserveBackgrounds, setPreserveBackgrounds] = useState<boolean>(true);
  const [preserveImages, setPreserveImages] = useState<boolean>(true);
  const [preserveTables, setPreserveTables] = useState<boolean>(true);
  const [includeSlideNumbers, setIncludeSlideNumbers] = useState<boolean>(true);
  const [customFooterText, setCustomFooterText] = useState<string>('Naa College • Presentation Handout');

  // Processing & Result
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultPageCount, setResultPageCount] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection & auto inspection
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      setInspectError('Please select a modern PowerPoint presentation (.pptx). Older binary .ppt files can be opened and saved as .pptx first.');
      setSelectedFile(null);
      setInspection(null);
      return;
    }

    setInspectError('');
    setErrorMessage('');
    setSelectedFile(file);
    setIsInspecting(true);
    setResultBlob(null);
    setPreviewUrl('');

    try {
      const details = await inspectPptx(file);
      setInspection(details);
    } catch (err) {
      console.error('Failed to inspect PowerPoint file:', err);
      setInspectError(err instanceof Error ? err.message : 'Could not read presentation structure.');
    } finally {
      setIsInspecting(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressPercent(5);
    setStatusMessage('Parsing presentation slide structure...');
    setErrorMessage('');

    try {
      const options: PowerpointToPdfOptions = {
        aspectRatio,
        pageRange: pageRangeMode === 'custom' ? customRange : 'all',
        preserveBackgrounds,
        preserveImages,
        preserveTables,
        includeSlideNumbers,
        customFooterText: customFooterText.trim() || undefined,
      };

      const res = await powerpointToPdf(selectedFile, options, (pct, msg) => {
        setProgressPercent(pct);
        setStatusMessage(msg);
      });

      setResultBlob(res.blob);
      setResultFilename(res.filename);
      setResultPageCount(res.pageCount);
      const url = URL.createObjectURL(res.blob);
      setPreviewUrl(url);

      setProgressPercent(100);
      setStatusMessage(`Converted ${res.pageCount} slides to PDF!`);
    } catch (err) {
      console.error('PowerPoint conversion failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Conversion failed. Please verify the .pptx file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async () => {
    setIsInspecting(true);
    try {
      const sample = await generateSamplePptx();
      await handleFile(sample);
    } catch (err) {
      console.error('Could not generate sample presentation:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFilename || 'PowerPoint_Converted.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setInspection(null);
    setResultBlob(null);
    setPreviewUrl('');
    setErrorMessage('');
    setInspectError('');
    setProgressPercent(0);
    setStatusMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="text-xs font-semibold text-pink-700 hover:text-pink-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← Back to 30+ Tools Hub
            </button>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-pink-600" />
            PowerPoint to PDF Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% In-Browser &amp; Zero Server Uploads
          </span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-pink-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-pink-100 text-pink-700 border border-pink-200">
              Open XML Vector Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Strict Slide Sequence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Aspect Ratio Preserved
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            PowerPoint to PDF Converter
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Convert university seminar, thesis viva, lecture slides, and project presentations (.pptx) into crisp, landscape or portrait vector PDF documents. Slide sequence, 16:9 widescreen or 4:3 standard aspect ratios, typography formatting, backgrounds, and embedded diagrams are accurately preserved.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload & Inspection + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Dropzone & Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-white border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 shadow-xs group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 group-hover:scale-105 group-hover:bg-pink-100 transition-all">
                <Layers className="w-8 h-8" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Drop your PowerPoint (.pptx) file here
              </h2>
              <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
                Supports Microsoft PowerPoint, Google Slides exports, Apple Keynote PPTX, and LibreOffice Impress presentations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select .pptx File
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  disabled={isInspecting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Try 4-Slide Seminar Sample
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>✓ Zero file upload</span>
                <span>•</span>
                <span>✓ Private client-side WebAssembly</span>
                <span>•</span>
                <span>✓ High resolution</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Selected File Card */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-700 shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {formatBytes(selectedFile.size)} • Microsoft PowerPoint Presentation (.pptx)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-pink-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-pink-200 transition-colors cursor-pointer shrink-0"
                >
                  Change File
                </button>
              </div>

              {/* Inspection Status & Detected Metrics */}
              {isInspecting && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-600" />
                  <span>Inspecting presentation metadata, slide order, and aspect ratio...</span>
                </div>
              )}

              {inspection && (
                <div className="space-y-4">
                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-pink-50/60 border border-pink-100">
                      <div className="flex items-center gap-1.5 text-pink-700 text-xs font-semibold mb-1">
                        <ListOrdered className="w-3.5 h-3.5" />
                        Slide Count
                      </div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {inspection.slideCount} Slides
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Sequential XML order
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold mb-1">
                        <Monitor className="w-3.5 h-3.5" />
                        Aspect Ratio
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {inspection.aspectRatioLabel}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {inspection.nativeWidthPt} × {inspection.nativeHeightPt} pt
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Privacy
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        100% Offline
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Local memory buffer
                      </div>
                    </div>
                  </div>

                  {/* Slide Order & Titles Sequence Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-pink-600" />
                        Verified Slide Sequence ({inspection.slideTitles.length} Shown)
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Order verified from presentation.xml
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {inspection.slideTitles.map((title, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700"
                        >
                          <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate font-medium">{title}</span>
                          <span className="ml-auto text-[10px] text-slate-400 font-mono shrink-0">
                            slide{idx + 1}.xml
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {inspectError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{inspectError}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Tip Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-pink-600" />
              How Formatting and Slide Order are Preserved
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Unlike generic cloud converters that flatten slides into blurry snapshots, our browser Open XML parser reads each slide&apos;s coordinate transforms, vector shapes, typography run sizes, paragraph alignments, and embedded high-resolution pictures to compile a sharp vector PDF at native aspect ratio.
            </p>
          </div>
        </div>

        {/* Right Column: Aspect Ratio & Conversion Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-pink-600" />
              Conversion &amp; Layout Options
            </h2>

            {/* 1. Aspect Ratio Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800 block">
                Target Slide Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'auto',
                    label: 'Preserve Native',
                    desc: inspection ? inspection.aspectRatioLabel : 'Exact PPTX Dimensions',
                  },
                  {
                    id: '16:9',
                    label: '16:9 Widescreen',
                    desc: 'Standard HD (960×540 pt)',
                  },
                  {
                    id: '4:3',
                    label: '4:3 Standard',
                    desc: 'Traditional (720×540 pt)',
                  },
                  {
                    id: 'a4',
                    label: 'A4 Landscape',
                    desc: 'Print-ready handout',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAspectRatio(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      aspectRatio === opt.id
                        ? 'border-pink-500 bg-pink-50/70 text-pink-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold leading-snug">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Slide Range Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-800 block">
                Slide Range
              </label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="rangeMode"
                    checked={pageRangeMode === 'all'}
                    onChange={() => setPageRangeMode('all')}
                    className="accent-pink-600"
                  />
                  <span>All Slides ({inspection ? inspection.slideCount : 'Entire deck'})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="rangeMode"
                    checked={pageRangeMode === 'custom'}
                    onChange={() => setPageRangeMode('custom')}
                    className="accent-pink-600"
                  />
                  <span>Custom Range</span>
                </label>
              </div>

              {pageRangeMode === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="e.g. 1-4, 7, 9-12"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-pink-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter comma-separated page numbers or ranges. Slide sequence order is preserved.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Formatting Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <label className="text-xs font-semibold text-slate-800 block">
                Formatting Preservation
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={preserveBackgrounds}
                  onChange={(e) => setPreserveBackgrounds(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span>Preserve slide theme colors &amp; solid backgrounds</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={preserveImages}
                  onChange={(e) => setPreserveImages(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span>Preserve high-resolution photos &amp; diagrams</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={preserveTables}
                  onChange={(e) => setPreserveTables(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span>Preserve tables and structured data grids</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSlideNumbers}
                  onChange={(e) => setIncludeSlideNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span>Stamp footer slide numbering (&quot;Slide X of Y&quot;)</span>
              </label>
            </div>

            {/* 4. Custom Footer Label */}
            {includeSlideNumbers && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Footer Brand / Student Watermark
                </label>
                <input
                  type="text"
                  value={customFooterText}
                  onChange={(e) => setCustomFooterText(e.target.value)}
                  placeholder="e.g. CSE Final Year Viva Defense"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-pink-500 text-slate-700"
                />
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Convert Action Button */}
            <button
              type="button"
              disabled={!selectedFile || isProcessing || isInspecting}
              onClick={handleConvert}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !selectedFile || isProcessing || isInspecting
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting Slides... ({progressPercent}%)</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Convert to Vector PDF</span>
                </>
              )}
            </button>

            {/* Processing Progress Bar */}
            {isProcessing && (
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-pink-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 text-center font-medium">
                  {statusMessage || 'Processing PowerPoint slides...'}
                </div>
              </div>
            )}
          </div>

          {/* Success & Download Card */}
          {resultBlob && !isProcessing && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold">Conversion Complete!</h3>
                  <p className="text-[11px] text-emerald-700">
                    Compiled {resultPageCount} slides into formatted PDF ({formatBytes(resultBlob.size)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="Preview PDF"
                  >
                    <Eye className="w-4 h-4 text-emerald-700" />
                    Preview
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Live Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-bold text-slate-800 truncate">
                  {resultFilename || 'PowerPoint_Converted.pdf'} ({resultPageCount} Slides)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 px-2 py-1 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={previewUrl}
                title="PowerPoint to PDF Live Preview"
                className="w-full h-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
