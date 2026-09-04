import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  ChevronRight,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  Search,
  ArrowRight,
  Check,
  Compass,
  GraduationCap,
  ShieldCheck,
  Code2,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { GUIDES_CHAPTERS, GuideChapter, GuideSection } from '../data/guidesData';

// Helper to render bold **text** and inline `code`
const renderInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((part, bIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={bIdx} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((codePart, cIdx) => {
      if (codePart.startsWith('`') && codePart.endsWith('`')) {
        return (
          <code
            key={`${bIdx}-${cIdx}`}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs font-semibold"
          >
            {codePart.slice(1, -1)}
          </code>
        );
      }
      return codePart;
    });
  });
};

// Formatted Markdown and Table Component
const FormattedMarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const rawBlocks = content.split(/\n\s*\n/);

  return (
    <div className="space-y-4">
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if code block ```
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const inner = trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre
              key={bIdx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-sky-300 leading-relaxed"
            >
              <code>{inner}</code>
            </pre>
          );
        }

        // Check if markdown table block
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        const isTable =
          lines.length >= 2 &&
          lines[0].startsWith('|') &&
          lines[0].endsWith('|') &&
          lines.some((l) => l.includes('---'));

        if (isTable) {
          const parseRow = (line: string) =>
            line
              .split('|')
              .map((c) => c.trim())
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

          const headers = parseRow(lines[0]);
          const dataRows = lines
            .slice(1)
            .filter((l) => !l.includes('---'))
            .map(parseRow);

          return (
            <div
              key={bIdx}
              className="overflow-x-auto my-6 rounded-xl border border-slate-700/60 shadow-lg"
            >
              <table className="w-full text-left border-collapse border border-slate-700/60 rounded-xl">
                <thead>
                  <tr className="bg-slate-800/80 text-cyan-300 font-bold border-b border-slate-700">
                    {headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="p-3 text-xs sm:text-sm font-bold border-b border-slate-700 whitespace-nowrap"
                      >
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="p-3 border-b border-slate-800/60 text-slate-300 text-sm hover:bg-slate-800/30 transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-3 text-xs sm:text-sm leading-relaxed align-top"
                        >
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Check if bullet list
        const isBulletList = lines.every(
          (l) => l.startsWith('- ') || l.startsWith('* ')
        );
        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-2.5 my-3 pl-1">
              {lines.map((item, iIdx) => {
                const itemContent = item.replace(/^[-*]\s+/, '');
                return (
                  <li key={iIdx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
                    <span>{renderInlineMarkdown(itemContent)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if numbered list
        const isNumberedList = lines.every((l) => /^\d+\.\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-3 my-3 pl-1">
              {lines.map((item, iIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)$/);
                const num = match ? match[1] : `${iIdx + 1}`;
                const itemContent = match ? match[2] : item;
                return (
                  <li key={iIdx} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold shrink-0 mt-0.5">
                      {num}
                    </span>
                    <div className="flex-1">{renderInlineMarkdown(itemContent)}</div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Default Paragraph
        return (
          <p
            key={bIdx}
            className="leading-relaxed text-slate-700 dark:text-slate-300 text-sm sm:text-base"
          >
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export interface GuidesHubProps {
  onSelectWorkspace?: (workspace: string) => void;
  initialChapterId?: string;
}

export const GuidesHub: React.FC<GuidesHubProps> = ({
  onSelectWorkspace,
  initialChapterId,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(
    initialChapterId || GUIDES_CHAPTERS[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const categories = ['All', 'Counselling', 'Academic', 'Career', 'Survival', 'Hardware'];

  const filteredChapters = useMemo(() => {
    return GUIDES_CHAPTERS.filter((ch) => {
      const matchesCategory =
        selectedCategory === 'All' || ch.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.sections.some(
          (sec) =>
            sec.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sec.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeChapter = useMemo(() => {
    return (
      GUIDES_CHAPTERS.find((ch) => ch.id === activeChapterId) ||
      GUIDES_CHAPTERS[0]
    );
  }, [activeChapterId]);

  const handleShareChapter = (chapter: GuideChapter) => {
    const url = `${window.location.origin}${window.location.pathname}#guide-${chapter.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getToolLinkForChapter = (chapterNumber: number) => {
    switch (chapterNumber) {
      case 1:
        return { ws: 'eapcet', label: 'Launch EAPCET Phase-2 Seat Radar' };
      case 2:
        return { ws: 'attendance', label: 'Open Attendance Defender & Bunk Calc' };
      case 3:
        return { ws: 'gpa', label: 'Use GPA Hub & Internal Cutoff Estimator' };
      case 4:
      case 5:
        return { ws: 'roadmaps', label: 'Explore 24-Branch Career Roadmaps' };
      case 6:
        return { ws: 'dsa', label: 'Open DSA Placement Tracker' };
      case 7:
        return { ws: 'gpa', label: 'Calculate Internal Exam Safety Margins' };
      case 8:
        return { ws: 'essentials', label: 'Browse Verified Student Hardware Store' };
      default:
        return null;
    }
  };

  const toolAction = getToolLinkForChapter(activeChapter.chapterNumber);

  return (
    <div id="guides-hub" className="space-y-8">
      {/* Editorial Hub Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              8-CHAPTER EDITORIAL COMPENDIUM
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              Verified Academic Guidance 2026
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Student &amp; Tier-3 Survival Editorial Hub
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Authoritative, field-tested guides for students in Andhra Pradesh and Telangana. From decoding Phase-2 seat surrender dynamics and avoiding attendance detention to self-taught coding mastery and budget developer workstations.
          </p>

          {/* Quick Category Switcher & Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, formulas, rules..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Table of Contents (Left) + Rich Chapter Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Chapter Navigation */}
        <div className="lg:col-span-4 space-y-3 sticky top-20">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Table of Contents ({filteredChapters.length} Chapters)
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Select Chapter
            </span>
          </div>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {filteredChapters.map((ch) => {
              const isActive = ch.id === activeChapterId;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterId(ch.id);
                    const el = document.getElementById('guide-reader-pane');
                    if (el && window.innerWidth < 1024) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      CH {ch.chapterNumber}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ch.readTime}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-xs sm:text-sm font-bold leading-snug ${
                      isActive
                        ? 'text-blue-900 dark:text-blue-200'
                        : 'text-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {ch.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ch.summary}
                  </p>
                </button>
              );
            })}

            {filteredChapters.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs text-slate-500">No chapters match your search filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-xs text-blue-600 font-semibold underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Reader View */}
        <div
          id="guide-reader-pane"
          className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
        >
          {/* Chapter Metadata & Action Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Chapter {activeChapter.chapterNumber} • {activeChapter.badge}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {activeChapter.readTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareChapter(activeChapter)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Copy direct chapter link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Chapter</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {activeChapter.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* In-Chapter Interactive Tool Shortcut (If applicable) */}
            {toolAction && onSelectWorkspace && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300">
                    Interactive Companion Utility
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Test the mathematical principles and live vacancy databases discussed in this chapter.
                  </p>
                </div>
                <button
                  onClick={() => onSelectWorkspace(toolAction.ws)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <span>{toolAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Chapter Body Sections */}
          <div className="prose prose-slate dark:prose-invert max-w-4xl space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            {activeChapter.sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  {section.heading}
                </h2>

                <FormattedMarkdownContent content={section.content} />

                {/* Optional Structured Table */}
                {section.table && (
                  <div className="overflow-x-auto my-6 rounded-xl border border-slate-700/60 shadow-lg">
                    <table className="w-full text-left border-collapse border border-slate-700/60 rounded-xl">
                      <thead>
                        <tr className="bg-slate-800/80 text-cyan-300 font-bold border-b border-slate-700">
                          {section.table.headers.map((h, hIdx) => (
                            <th
                              key={hIdx}
                              className="p-3 text-xs sm:text-sm font-bold border-b border-slate-700 whitespace-nowrap"
                            >
                              {renderInlineMarkdown(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {section.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="p-3 border-b border-slate-800/60 text-slate-300 text-sm hover:bg-slate-800/30 transition-colors"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="p-3 text-xs sm:text-sm leading-relaxed align-top"
                              >
                                {renderInlineMarkdown(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Optional Key Takeaways Checklist */}
                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Takeaways &amp; Rules
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optional Callout Box */}
                {section.callout && (
                  <div
                    className={`p-5 rounded-2xl border space-y-2 transition-all shadow-sm ${
                      section.callout.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        : section.callout.type === 'tip'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : section.callout.type === 'checklist'
                        ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-200'
                        : section.callout.type === 'empowerment'
                        ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border-indigo-500/60 text-slate-100 shadow-2xl p-6 rounded-3xl'
                        : 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      {section.callout.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {section.callout.type === 'tip' && <Lightbulb className="w-4 h-4 text-emerald-600" />}
                      {section.callout.type === 'info' && <Info className="w-4 h-4 text-sky-600" />}
                      {section.callout.type === 'checklist' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      {section.callout.type === 'empowerment' && <Sparkles className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />}
                      <span className={section.callout.type === 'empowerment' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-extrabold uppercase tracking-wide' : ''}>
                        {section.callout.title}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${section.callout.type === 'empowerment' ? 'text-slate-200 italic font-medium border-l-2 border-cyan-400/80 pl-3.5 mt-2 py-0.5' : 'opacity-95'}`}>
                      {section.callout.text}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Chapter Navigation Footer (Previous / Next) */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {activeChapter.chapterNumber > 1 ? (
              <button
                onClick={() => {
                  const prev = GUIDES_CHAPTERS.find(
                    (c) => c.chapterNumber === activeChapter.chapterNumber - 1
                  );
                  if (prev) {
                    setActiveChapterId(prev.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                ← Previous Chapter
              </button>
            ) : <div />}

            {activeChapter.chapterNumber < GUIDES_CHAPTERS.length && (
              <button
                onClick={() => {
                  const next = GUIDES_CHAPTERS.find(
                    (c) => c.chapterNumber === activeChapter.chapterNumber + 1
                  );
                  if (next) {
                    setActiveChapterId(next.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Next: Chapter {activeChapter.chapterNumber + 1} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesHub;
