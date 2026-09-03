import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  FileCheck,
  SlidersHorizontal,
  Scissors,
  Files,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Minimize2,
  Stamp,
  RotateCw,
  Unlock,
  Wrench,
  Hash,
  Camera,
  SearchCode,
  GitCompare,
  EyeOff,
  Crop,
  FormInput,
  Bot,
  FileDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PdfToolCategory, PdfToolDefinition } from '../types';
import { ALL_PDF_TOOLS } from '../data/pdfToolsData';
import { PdfToolModal } from './pdf-tools/PdfToolModal';

export const PdfPowerTools: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PdfToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<PdfToolDefinition | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: ALL_PDF_TOOLS.length,
      convert: ALL_PDF_TOOLS.filter((t) => t.category === 'convert').length,
      edit: ALL_PDF_TOOLS.filter((t) => t.category === 'edit').length,
      secure: ALL_PDF_TOOLS.filter((t) => t.category === 'secure').length,
      optimize: ALL_PDF_TOOLS.filter((t) => t.category === 'optimize').length,
    };
  }, []);

  // Filtered tools
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_PDF_TOOLS.filter((tool) => {
      const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.acceptedFileTypes.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Icon mapping for each tool
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'merge-pdf':
        return <Files className="w-5 h-5 text-sky-600" />;
      case 'split-pdf':
        return <Scissors className="w-5 h-5 text-sky-600" />;
      case 'compress-pdf':
        return <Minimize2 className="w-5 h-5 text-emerald-600" />;
      case 'pdf-to-word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'pdf-to-powerpoint':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'pdf-to-excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'word-to-pdf':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'powerpoint-to-pdf':
        return <Layers className="w-5 h-5 text-orange-600" />;
      case 'excel-to-pdf':
        return <FileSpreadsheet className="w-5 h-5 text-teal-600" />;
      case 'edit-pdf':
        return <Stamp className="w-5 h-5 text-purple-600" />;
      case 'pdf-to-jpg':
        return <ImageIcon className="w-5 h-5 text-rose-600" />;
      case 'jpg-to-pdf':
        return <ImageIcon className="w-5 h-5 text-pink-600" />;
      case 'sign-pdf':
        return <Sparkles className="w-5 h-5 text-sky-600" />;
      case 'watermark-pdf':
        return <Stamp className="w-5 h-5 text-indigo-600" />;
      case 'rotate-pdf':
        return <RotateCw className="w-5 h-5 text-cyan-600" />;
      case 'html-to-pdf':
        return <FileCode className="w-5 h-5 text-violet-600" />;
      case 'unlock-pdf':
        return <Unlock className="w-5 h-5 text-emerald-600" />;
      case 'protect-pdf':
        return <Lock className="w-5 h-5 text-amber-600" />;
      case 'organize-pdf':
        return <Layers className="w-5 h-5 text-blue-600" />;
      case 'pdf-to-pdfa':
        return <FileCheck className="w-5 h-5 text-slate-700" />;
      case 'repair-pdf':
        return <Wrench className="w-5 h-5 text-rose-600" />;
      case 'page-numbers':
        return <Hash className="w-5 h-5 text-sky-600" />;
      case 'scan-to-pdf':
        return <Camera className="w-5 h-5 text-teal-600" />;
      case 'ocr-pdf':
        return <SearchCode className="w-5 h-5 text-indigo-600" />;
      case 'compare-pdf':
        return <GitCompare className="w-5 h-5 text-purple-600" />;
      case 'redact-pdf':
        return <EyeOff className="w-5 h-5 text-rose-700" />;
      case 'crop-pdf':
        return <Crop className="w-5 h-5 text-blue-600" />;
      case 'pdf-forms':
        return <FormInput className="w-5 h-5 text-sky-600" />;
      case 'ai-summarizer':
        return <Bot className="w-5 h-5 text-sky-600" />;
      case 'translate-markdown':
        return <FileDown className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div id="pdf-power-tools-container" className="space-y-4">
      {/* Filter and Search Bar */}
      <div
        id="pdf-filter-bar"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Tools ({categoryCounts.all})
          </button>
          <button
            onClick={() => setSelectedCategory('convert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'convert'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Convert ({categoryCounts.convert})
          </button>
          <button
            onClick={() => setSelectedCategory('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'edit'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Edit &amp; Organize ({categoryCounts.edit})
          </button>
          <button
            onClick={() => setSelectedCategory('secure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'secure'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Secure &amp; Repair ({categoryCounts.secure})
          </button>
          <button
            onClick={() => setSelectedCategory('optimize')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'optimize'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Optimize &amp; AI ({categoryCounts.optimize})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PDF tools..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tools Grid (30 Tools) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            id={`pdf-card-${tool.id}`}
            onClick={() => setActiveTool(tool)}
            className="group bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 group-hover:bg-sky-50 group-hover:border-sky-200 flex items-center justify-center transition-colors">
                  {getToolIcon(tool.id)}
                </div>
                {tool.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 transition-colors">
                    {tool.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">No PDF tools found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Active Modal Runner */}
      {activeTool && (
        <PdfToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
      )}
    </div>
  );
};
