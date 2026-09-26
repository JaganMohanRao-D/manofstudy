import React, { useState, useMemo } from 'react';
import {
  FileText,
  Files,
  Scissors,
  FileSpreadsheet,
  FileCode,
  RotateCw,
  Crop,
  Wrench,
  Image as ImageIcon,
  Camera,
  Minimize2,
  PenTool,
  Stamp,
  Hash,
  AlignLeft,
  Tag,
  Sparkles,
  Lock,
  Unlock,
  GitCompare,
  EyeOff,
  Layers,
  Search,
  ArrowUpDown,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { ALL_PDF_TOOLS } from '../data/pdfToolsData';
import { PdfToolDefinition, PdfToolCategory } from '../types';
import { PdfToolModal } from './pdf-tools/PdfToolModal';
import { PowerPointToPdfStudio } from './pdf-tools/PowerPointToPdfStudio';
import { PdfToolsForFree } from './PdfToolsForFree';

export { PdfToolsForFree, PowerPointToPdfStudio };

export const PdfPowerTools: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PdfToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTool, setActiveModalTool] = useState<PdfToolDefinition | null>(null);
  const [viewMode, setViewMode] = useState<'hub' | 'classic' | 'pptx-studio'>('hub');

  // Map icons dynamically
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'word-to-pdf':
      case 'pdf-to-word':
        return FileText;
      case 'powerpoint-to-pdf':
      case 'pdf-to-powerpoint':
        return Layers;
      case 'excel-to-pdf':
      case 'pdf-to-excel':
        return FileSpreadsheet;
      case 'html-to-pdf':
        return FileCode;
      case 'pdf-to-pdfa':
        return ShieldCheck;
      case 'merge-pdf':
        return Files;
      case 'split-pdf':
        return Scissors;
      case 'extract-pages':
        return Files;
      case 'organize-pdf':
        return ArrowUpDown;
      case 'rotate-pdf':
        return RotateCw;
      case 'crop-pdf':
        return Crop;
      case 'repair-pdf':
        return Wrench;
      case 'images-to-pdf':
      case 'pdf-to-jpg':
        return ImageIcon;
      case 'image-compressor':
        return Sparkles;
      case 'scan-to-pdf':
        return Camera;
      case 'compress-pdf':
        return Minimize2;
      case 'sign-pdf':
        return PenTool;
      case 'watermark-pdf':
        return Stamp;
      case 'page-numbers':
        return Hash;
      case 'pdf-to-text':
        return AlignLeft;
      case 'pdf-metadata':
        return Tag;
      case 'summarize-pdf':
        return Sparkles;
      case 'ocr-pdf':
        return Search;
      case 'protect-pdf':
        return Lock;
      case 'unlock-pdf':
        return Unlock;
      case 'compare-pdf':
        return GitCompare;
      case 'redact-pdf':
        return EyeOff;
      default:
        return FileText;
    }
  };

  const categories: { id: PdfToolCategory; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Tools', count: ALL_PDF_TOOLS.length },
      { id: 'convert', label: 'Document Conversion', count: ALL_PDF_TOOLS.filter((t) => t.category === 'convert').length },
      { id: 'manage', label: 'PDF Management', count: ALL_PDF_TOOLS.filter((t) => t.category === 'manage').length },
      { id: 'image', label: 'PDF & Images', count: ALL_PDF_TOOLS.filter((t) => t.category === 'image').length },
      { id: 'utilities', label: 'Text & Utilities', count: ALL_PDF_TOOLS.filter((t) => t.category === 'utilities').length },
    ];
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_PDF_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        tool.name.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        (tool.subtitle && tool.subtitle.toLowerCase().includes(q)) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.keywords && tool.keywords.some((k) => k.toLowerCase().includes(q))) ||
        (tool.fileHint && tool.fileHint.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  if (viewMode === 'classic') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => setViewMode('hub')}
            className="text-xs font-semibold text-pink-700 hover:text-pink-800 flex items-center gap-1.5 cursor-pointer"
          >
            ← Switch to 30+ Tools Hub
          </button>
          <span className="text-xs text-slate-500">Classic Inline Quick Workspace</span>
        </div>
        <PdfToolsForFree />
      </div>
    );
  }

  if (viewMode === 'pptx-studio') {
    return (
      <PowerPointToPdfStudio onBackToHub={() => setViewMode('hub')} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-pink-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-pink-100 text-pink-700 border border-pink-200">
                100% Free &amp; Offline
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Zero Cloud Uploads
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                30+ High-Speed Tools
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Indian Exam Presets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              free pdf tools for students
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Complete client-side PDF and document suite. Convert Word, PPT, Excel, split, merge, compress, sign, OCR, and format documents directly in your browser.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setViewMode('pptx-studio')}
              className="px-3.5 py-2 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Open PowerPoint to PDF Studio"
            >
              <Layers className="w-3.5 h-3.5 text-pink-600" />
              <span>PPTX to PDF Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('classic')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Switch to inline classic view"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Classic View</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Indian Exam Shortcuts Pill */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            Exam Essentials:
          </span>
          {[
            { id: 'powerpoint-to-pdf', label: 'PowerPoint (.pptx) to PDF (16:9 / 4:3)' },
            { id: 'extract-pages', label: 'Extract Admit Card / Marksheet' },
            { id: 'compress-pdf', label: 'Compress < 200 KB / 100 KB' },
            { id: 'merge-pdf', label: 'Merge Certificates' },
            { id: 'pdf-to-word', label: 'PDF to Word (.docx)' },
            { id: 'images-to-pdf', label: 'Photo/ID to PDF' },
          ].map((examTool) => {
            const toolDef = ALL_PDF_TOOLS.find((t) => t.id === examTool.id);
            return (
              <button
                key={examTool.id}
                type="button"
                onClick={() => {
                  if (examTool.id === 'powerpoint-to-pdf') {
                    setViewMode('pptx-studio');
                  } else if (toolDef) {
                    setActiveModalTool(toolDef);
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-50/70 hover:bg-pink-100/80 text-pink-800 border border-pink-200/70 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{examTool.label}</span>
                <ChevronRight className="w-3 h-3 text-pink-500" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 30+ tools (e.g. Word, SSC, Compress)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching tools found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for common terms like "docx", "merge", "resize", "split", or "watermark".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredTools.map((tool) => {
            const Icon = getToolIcon(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  if (tool.id === 'powerpoint-to-pdf') {
                    setViewMode('pptx-studio');
                  } else {
                    setActiveModalTool(tool);
                  }
                }}
                className="group p-4 bg-white hover:bg-pink-50/20 border border-slate-200 hover:border-pink-300 rounded-2xl text-left transition-all duration-150 shadow-xs hover:shadow-sm flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-pink-100 group-hover:text-pink-700 text-slate-700 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-700 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {tool.subtitle || tool.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">{tool.fileHint || 'Multiple formats'}</span>
                  <span className="font-semibold text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Open <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Modal */}
      {activeModalTool && (
        <PdfToolModal tool={activeModalTool} onClose={() => setActiveModalTool(null)} />
      )}
    </div>
  );
};

export default PdfPowerTools;

