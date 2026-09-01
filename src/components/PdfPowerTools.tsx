import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Files,
  Scissors,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import {
  mergePdfFiles,
  extractPdfPages,
  getPdfInfo,
  parsePageRangeString,
  downloadBlob,
  PdfMetadata,
} from '../utils/pdfUtils';
import { PdfFileItem, PdfProcessProgress } from '../types';

export const PdfPowerTools: React.FC = () => {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<PdfFileItem[]>([]);
  const [mergeProgress, setMergeProgress] = useState<PdfProcessProgress>({
    isProcessing: false,
    progressPercent: 0,
    statusMessage: '',
  });

  // Split state
  const [splitFile, setSplitFile] = useState<PdfFileItem | null>(null);
  const [splitMeta, setSplitMeta] = useState<PdfMetadata | null>(null);
  const [pageRangeInput, setPageRangeInput] = useState<string>('1');
  const [selectedPagesSet, setSelectedPagesSet] = useState<Set<number>>(new Set([1]));
  const [splitProgress, setSplitProgress] = useState<PdfProcessProgress>({
    isProcessing: false,
    progressPercent: 0,
    statusMessage: '',
  });

  const mergeInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

  // Helper formatting bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --------------------------------------------------------------------------
  // MERGE ACTIONS
  // --------------------------------------------------------------------------
  const handleMergeFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: PdfFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          sizeBytes: file.size,
        });
      }
    }

    setMergeFiles((prev) => [...prev, ...newItems]);
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= mergeFiles.length) return;

    const updated = [...mergeFiles];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMergeFiles(updated);
  };

  const removeMergeFile = (id: string) => {
    setMergeFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) return;

    setMergeProgress({
      isProcessing: true,
      progressPercent: 5,
      statusMessage: 'Preparing PDF merge...',
    });

    try {
      const rawFiles = mergeFiles.map((item) => item.file);
      const result = await mergePdfFiles(rawFiles, (pct, msg) => {
        setMergeProgress({
          isProcessing: true,
          progressPercent: pct,
          statusMessage: msg,
        });
      });

      downloadBlob(result.blob, `Merged_Document_${Date.now()}.pdf`);

      setMergeProgress({
        isProcessing: false,
        progressPercent: 100,
        statusMessage: `Merged ${mergeFiles.length} files successfully! (${formatBytes(result.sizeBytes)}, ${result.pageCount} pages)`,
      });
    } catch (err: unknown) {
      setMergeProgress({
        isProcessing: false,
        progressPercent: 0,
        statusMessage: 'Error during PDF merge',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // --------------------------------------------------------------------------
  // SPLIT ACTIONS
  // --------------------------------------------------------------------------
  const handleSplitFileSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    const item: PdfFileItem = {
      id: `${file.name}-${Date.now()}`,
      file,
      name: file.name,
      sizeBytes: file.size,
    };

    setSplitFile(item);
    setSplitProgress({ isProcessing: true, progressPercent: 30, statusMessage: 'Reading page count...' });

    try {
      const meta = await getPdfInfo(file);
      setSplitMeta(meta);
      setPageRangeInput(meta.pageCount > 1 ? '1-2' : '1');
      setSelectedPagesSet(new Set(meta.pageCount > 1 ? [1, 2] : [1]));
      setSplitProgress({ isProcessing: false, progressPercent: 100, statusMessage: `Ready: ${meta.pageCount} pages detected` });
    } catch (err: unknown) {
      setSplitProgress({
        isProcessing: false,
        progressPercent: 0,
        statusMessage: 'Failed to inspect PDF',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleRangeInputChange = (value: string) => {
    setPageRangeInput(value);
    if (!splitMeta) return;
    const indices0 = parsePageRangeString(value, splitMeta.pageCount);
    const set1 = new Set(indices0.map((i) => i + 1));
    setSelectedPagesSet(set1);
  };

  const togglePageSelection = (pageNum: number) => {
    const updated = new Set<number>(selectedPagesSet);
    if (updated.has(pageNum)) {
      updated.delete(pageNum);
    } else {
      updated.add(pageNum);
    }
    setSelectedPagesSet(updated);
    const sorted = Array.from<number>(updated).sort((a: number, b: number) => a - b);
    setPageRangeInput(sorted.join(', '));
  };

  const handleExecuteSplit = async () => {
    if (!splitFile || !splitMeta) return;
    const pages0 = Array.from<number>(selectedPagesSet).map((p: number) => p - 1);
    if (pages0.length === 0) {
      alert('Please select at least 1 page to extract.');
      return;
    }

    setSplitProgress({
      isProcessing: true,
      progressPercent: 10,
      statusMessage: 'Extracting selected pages...',
    });

    try {
      const result = await extractPdfPages(splitFile.file, pages0, (pct, msg) => {
        setSplitProgress({
          isProcessing: true,
          progressPercent: pct,
          statusMessage: msg,
        });
      });

      downloadBlob(result.blob, `Extracted_${splitFile.name.replace(/\.pdf$/i, '')}_Pages_${pages0.length}.pdf`);

      setSplitProgress({
        isProcessing: false,
        progressPercent: 100,
        statusMessage: `Successfully extracted ${result.pageCount} pages (${formatBytes(result.sizeBytes)})!`,
      });
    } catch (err: unknown) {
      setSplitProgress({
        isProcessing: false,
        progressPercent: 0,
        statusMessage: 'Error during page extraction',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header Banner */}
      <section className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>PDF Power Tools</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Client-Side PDF Merger & Page Extractor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Powered by pure in-browser WebAssembly binary streams. Reorder and merge multiple PDFs into one consolidated document or extract custom page ranges with zero server uploads. 100% confidential.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium self-start lg:self-auto">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-200 pt-4">
          <button
            onClick={() => setMode('merge')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
              mode === 'merge'
                ? 'bg-sky-500 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>1. PDF Merge ({mergeFiles.length} files)</span>
          </button>

          <button
            onClick={() => setMode('split')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
              mode === 'split'
                ? 'bg-sky-500 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>2. PDF Split & Extract</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODE 1: PDF MERGE */}
      {/* ========================================================================= */}
      {mode === 'merge' && (
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            onClick={() => mergeInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleMergeFilesSelected(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-sm"
          >
            <input
              ref={mergeInputRef}
              type="file"
              multiple
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleMergeFilesSelected(e.target.files)}
            />
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Click to browse or Drag & Drop PDF files here
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select 2 or more PDF documents to combine into a single consolidated file.
            </p>
          </div>

          {/* Files List & Reordering Table */}
          {mergeFiles.length > 0 && (
            <div className="rounded-2xl border bg-white border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Files to Merge ({mergeFiles.length})
                  </h3>
                </div>
                <button
                  onClick={() => setMergeFiles([])}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Remove All
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {mergeFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-bold text-sky-600 border border-slate-200 shrink-0 text-xs">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-slate-900 font-medium truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{formatBytes(item.sizeBytes)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => moveMergeFile(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 border border-slate-200 transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveMergeFile(index, 'down')}
                        disabled={index === mergeFiles.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 border border-slate-200 transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeMergeFile(item.id)}
                        title="Delete File"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress & Merge Action Button */}
              {mergeProgress.isProcessing && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>{mergeProgress.statusMessage}</span>
                    <span className="text-sky-600 font-bold">{mergeProgress.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                      style={{ width: `${mergeProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {mergeProgress.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{mergeProgress.error}</span>
                </div>
              )}

              {mergeProgress.statusMessage && !mergeProgress.isProcessing && !mergeProgress.error && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{mergeProgress.statusMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleExecuteMerge}
                  disabled={mergeFiles.length < 2 || mergeProgress.isProcessing}
                  className="w-full py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {mergeProgress.isProcessing
                      ? 'Merging PDFs...'
                      : `Merge & Download (${mergeFiles.length} Files)`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: PDF SPLIT & EXTRACT */}
      {/* ========================================================================= */}
      {mode === 'split' && (
        <div className="space-y-6">
          {!splitFile ? (
            <div
              onClick={() => splitInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleSplitFileSelected(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-sm"
            >
              <input
                ref={splitInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => handleSplitFileSelected(e.target.files)}
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Click or Drop 1 PDF to Split / Extract Pages
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Upload your document to select, extract, and download specific pages or ranges.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white border-slate-200 p-5 sm:p-6 space-y-5 shadow-sm">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{splitFile.name}</h4>
                    <p className="text-xs text-slate-500">
                      {formatBytes(splitFile.sizeBytes)} • {splitMeta?.pageCount || '...'} Total Pages
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSplitFile(null);
                    setSplitMeta(null);
                  }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>

              {/* Page Range Input Controls */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                  Select Page Range to Extract (e.g. 1-3, 5, 8-10)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pageRangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <button
                    onClick={() => {
                      if (!splitMeta) return;
                      const all = Array.from({ length: splitMeta.pageCount }, (_, i) => i + 1);
                      setSelectedPagesSet(new Set(all));
                      setPageRangeInput(`1-${splitMeta.pageCount}`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition-all duration-200 ease-out active:scale-95 cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {/* Visual Page Grid */}
              {splitMeta && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Or click thumbnails below to toggle individual pages:</span>
                    <span className="text-sky-600 font-semibold">
                      {selectedPagesSet.size} of {splitMeta.pageCount} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    {splitMeta.pages.map((p) => {
                      const isSelected = selectedPagesSet.has(p.pageNumber);
                      return (
                        <button
                          key={p.pageNumber}
                          onClick={() => togglePageSelection(p.pageNumber)}
                          className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center p-2 text-xs transition-all duration-200 ease-out active:scale-95 cursor-pointer relative ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 text-sky-700 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <FileText className="w-4 h-4 mb-1 opacity-70" />
                          <span>p.{p.pageNumber}</span>
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-sky-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress & Split Action Button */}
              {splitProgress.isProcessing && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>{splitProgress.statusMessage}</span>
                    <span className="text-sky-600 font-bold">{splitProgress.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                      style={{ width: `${splitProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {splitProgress.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{splitProgress.error}</span>
                </div>
              )}

              {splitProgress.statusMessage && !splitProgress.isProcessing && !splitProgress.error && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{splitProgress.statusMessage}</span>
                </div>
              )}

              <button
                onClick={handleExecuteSplit}
                disabled={selectedPagesSet.size === 0 || splitProgress.isProcessing}
                className="w-full py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {splitProgress.isProcessing
                    ? 'Extracting Pages...'
                    : `Extract & Download ${selectedPagesSet.size} Pages`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
