import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Compass,
  FileText,
  Award,
  FileCheck,
  Image,
  Calendar,
  Calculator,
  Percent,
  Bot,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  Layers,
  Flame,
  ShieldCheck,
  Scale,
  GraduationCap,
  Scissors,
  Lock,
  Unlock,
  Stamp,
  FileDown,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Terminal,
  ShoppingBag,
  Heart,
  Briefcase,
  Star,
  ShieldAlert,
  Users,
  BookOpen,
} from 'lucide-react';
import { ToolTab } from '../types';
import { ENGINEERING_ROADMAPS } from '../data/engineeringRoadmapsData';
import { LegalModalType } from './LegalModals';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tab: ToolTab) => void;
  onSelectBranchRoadmap?: (branchId: string) => void;
  onOpenLegal?: (type: LegalModalType) => void;
  onOpenSupport?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Core Tools' | 'Engineering Roadmaps (24 Branches)' | 'PDF Power Tools' | 'Quick Actions';
  badge: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onSelectBranchRoadmap,
  onOpenLegal,
  onOpenSupport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input whenever palette opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build full registry of command palette items
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 1. Primary Tools
    items.push(
      {
        id: 'tool-gap-analyzer',
        title: 'AI Student Gap Analyzer',
        subtitle: 'Understand where you are, identify your skill gaps, and see what to work on next.',
        category: 'Core Tools',
        badge: 'AI Diagnostic',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        keywords: ['gap', 'analyzer', 'skills', 'career', 'roadmap', 'what next', 'simulator', 'placement gap', 'ai'],
        action: () => onSelectTool('gap-analyzer'),
      },
      {
        id: 'tool-campus-connect',
        title: 'MOS CampusConnect — Student Network',
        subtitle: 'Real campus updates, senior guidance, and peer doubt resolution across colleges',
        category: 'Core Tools',
        badge: 'NEW',
        icon: <Users className="w-4 h-4 text-emerald-500" />,
        keywords: ['campus', 'connect', 'community', 'doubt', 'query', 'viva', 'lab', 'cbit', 'ou', 'jntu', 'vnr', 'notes', 'placement'],
        action: () => onSelectTool('campus-connect'),
      },
      {
        id: 'tool-tg-top-colleges',
        title: 'Top B.Tech Colleges in Telangana',
        subtitle: 'Branch-specific OC allotment analysis with optional district filtering',
        category: 'Core Tools',
        badge: 'Data Analysis',
        icon: <Trophy className="w-4 h-4 text-sky-500" />,
        keywords: ['top colleges', 'telangana colleges', 'oc rank', 'median rank', 'district', 'eapcet', 'tg'],
        action: () => onSelectTool('tg-top-colleges' as ToolTab),
      },
      {
        id: 'tool-tg-predictor',
        title: 'TG EAPCET College Predictor',
        subtitle: 'Check admission chances across 151 colleges using 71,646 official 2026 allotment cutoffs',
        category: 'Core Tools',
        badge: '2026 Phase-3 Data',
        icon: <Compass className="w-4 h-4 text-emerald-500" />,
        keywords: ['predictor', 'college predictor', 'tg predictor', 'rank buffer', 'admission chances', 'closing rank', 'web options', 'tg eapcet', 'cutoff', 'counseling', 'buffer'],
        action: () => onSelectTool('tg-predictor'),
      },
      {
        id: 'tool-tg-top-colleges',
        title: 'Top B.Tech Colleges in Telangana',
        subtitle: 'Data-driven rankings based on valid OC allotment ranks for every engineering branch',
        category: 'Core Tools',
        badge: 'OC Rankings',
        icon: <Award className="w-4 h-4 text-amber-500" />,
        keywords: ['top colleges', 'ranking', 'best engineering colleges', 'top btech', 'telangana top colleges', 'oc rank', 'median rank', 'cse colleges', 'cbit', 'vnr', 'jnth'],
        action: () => onSelectTool('tg-top-colleges'),
      },
      {
        id: 'tool-tg-allotments',
        title: 'TG EAPCET 2026 Final Phase Allotments & Cutoffs',
        subtitle: 'Official candidate allotments, cutoff ranks & admission stats',
        category: 'Core Tools',
        badge: 'TG 2026',
        icon: <Award className="w-4 h-4 text-rose-500" />,
        keywords: ['tg', 'tgeapcet', 'tg eapcet', 'telangana', 'allotment', 'cutoff', 'ranks', '2026', 'counseling', 'jntuh', 'ou'],
        action: () => onSelectTool('tg-allotments'),
      },
      {
        id: 'tool-eapcet-radar',
        title: 'AP EAPCET Phase 2 Vacancy Radar',
        subtitle: 'Live leftover seats, college intake matrix & official branch fees',
        category: 'Core Tools',
        badge: 'Counselling',
        icon: <Flame className="w-4 h-4 text-rose-500" />,
        keywords: ['eapcet', 'phase 2', 'leftover', 'seats', 'cutoff', 'counseling', 'colleges', 'fee', 'vacancy'],
        action: () => onSelectTool('eapcet-radar'),
      },
      {
        id: 'tool-projects',
        title: 'Campus Placement Major Projects Hub',
        subtitle: '15+ high-impact resume projects with architectural diagrams (URL shortener, Blockchain, OS)',
        category: 'Core Tools',
        badge: 'Major Projects',
        icon: <Star className="w-4 h-4 text-amber-500" />,
        keywords: ['project', 'major project', 'resume', 'architecture', 'blockchain', 'url shortener', 'scheduler', 'placement'],
        action: () => {
          onSelectTool('projects' as any);
        },
      },
      {
        id: 'tool-internships',
        title: 'Verified Student Internships Radar',
        subtitle: '100% verified non-scam internships: AICTE Portal, GSoC, DRDO/ISRO Trainees, LFX',
        category: 'Core Tools',
        badge: 'Internships',
        icon: <Briefcase className="w-4 h-4 text-emerald-500" />,
        keywords: ['internship', 'aicte', 'gsoc', 'google summer of code', 'isro', 'drdo', 'stipend', 'trainee'],
        action: () => {
          onSelectTool('internships' as any);
        },
      },
      {
        id: 'tool-roadmaps',
        title: 'Engineering Branch Roadmaps',
        subtitle: '24 branch semester-by-semester career blueprints & PDF guides',
        category: 'Core Tools',
        badge: 'Roadmaps',
        icon: <Compass className="w-4 h-4 text-indigo-500" />,
        keywords: ['roadmap', 'curriculum', 'cse', 'ece', 'branch', 'syllabus', 'career', 'semester', 'software'],
        action: () => onSelectTool('roadmaps'),
      },
      {
        id: 'tool-pdf-tools',
        title: 'free pdf tools for students',
        subtitle: 'In-browser PDF merge, split, excel to pdf, image to pdf, protect & AI summary',
        category: 'Core Tools',
        badge: 'free pdf tools for students',
        icon: <FileText className="w-4 h-4 text-emerald-500" />,
        keywords: ['pdf', 'merge', 'split', 'excel to pdf', 'image to pdf', 'protect', 'summarize', 'free pdf tools for students'],
        action: () => onSelectTool('pdf-tools'),
      },
      {
        id: 'tool-scholarships',
        title: 'Scholarships Radar',
        subtitle: 'Verified 2026 national, state & corporate scholarship application links',
        category: 'Core Tools',
        badge: 'Funding',
        icon: <Award className="w-4 h-4 text-amber-500" />,
        keywords: ['scholarship', 'financial aid', 'nsp', 'reliance', 'hdfc', 'pragati', 'aicte', 'funding', 'fees'],
        action: () => onSelectTool('scholarships'),
      },
      {
        id: 'tool-resume-checker',
        title: 'ATS Resume Matcher',
        subtitle: 'Job description matching, score diagnostics & PDF parser',
        category: 'Core Tools',
        badge: 'Career',
        icon: <FileCheck className="w-4 h-4 text-sky-500" />,
        keywords: ['resume', 'ats', 'cv', 'job', 'interview', 'placement', 'hiring'],
        action: () => onSelectTool('resume-checker'),
      },
      {
        id: 'tool-resizer',
        title: 'Exam Image Resizer',
        subtitle: 'Exact 20KB–500KB client-side passport photo & signature compression',
        category: 'Core Tools',
        badge: 'Utility',
        icon: <Image className="w-4 h-4 text-purple-500" />,
        keywords: ['resizer', 'image', 'photo', 'signature', '20kb', '50kb', 'gate', 'upsc', 'compress image'],
        action: () => onSelectTool('resizer'),
      },
      {
        id: 'tool-attendance',
        title: 'Attendance Defender',
        subtitle: 'Smart 75% bunk margin calculator & recovery lecture planner',
        category: 'Core Tools',
        badge: 'Academic',
        icon: <Calendar className="w-4 h-4 text-cyan-500" />,
        keywords: ['attendance', 'bunk', '75 percent', 'classes', 'leave', 'absence', 'condonation'],
        action: () => onSelectTool('attendance'),
      },
      {
        id: 'tool-gpa',
        title: 'Global GPA Hub',
        subtitle: 'VTU/AICTE percentage converter & future target SGPA planner',
        category: 'Core Tools',
        badge: 'Academic',
        icon: <Percent className="w-4 h-4 text-blue-500" />,
        keywords: ['gpa', 'cgpa', 'sgpa', 'percentage', 'grade', 'marks', 'vtu', 'jntu'],
        action: () => onSelectTool('gpa'),
      },
      {
        id: 'tool-internal-calc',
        title: 'Internal Cutoff Estimator',
        subtitle: '80:20 mid evaluation & external semester target marks finder',
        category: 'Core Tools',
        badge: 'Academic',
        icon: <Calculator className="w-4 h-4 text-orange-500" />,
        keywords: ['internal', 'mid exam', 'cutoff', 'target marks', 'external', '80 20 rule'],
        action: () => onSelectTool('internal-calc'),
      },
      {
        id: 'tool-vault',
        title: 'Placement Viva Flashcards & Code Vault',
        subtitle: '100% in-browser interview flashcards (OOPs, OS, DBMS, CN) and practical lab code snippets',
        category: 'Core Tools',
        badge: 'Placement & Lab',
        icon: <Terminal className="w-4 h-4 text-emerald-500" />,
        keywords: ['vault', 'viva', 'flashcards', 'practical', 'lab', 'oops', 'dbms', 'os', 'networks', 'python', 'c', 'cpp', 'placement', 'interview'],
        action: () => onSelectTool('vault' as any),
      },
      {
        id: 'tool-backlog',
        title: 'Smart Backlog Recovery Planner',
        subtitle: 'Calculate external pass marks required and 30-day revision checklist',
        category: 'Core Tools',
        badge: 'Academic Recovery',
        icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
        keywords: ['backlog', 'supply', 'exam', 'recovery', 'pass marks', 'internals', 'cutoff', 'checklist', 'study plan'],
        action: () => onSelectTool('backlog' as any),
      },
      {
        id: 'tool-essentials',
        title: '🛍️ Student Essentials & Academic Gear Store',
        subtitle: 'Casio fx-991CW calculators, engineering laptops, EAPCET/NEET PYQs & study audio',
        category: 'Core Tools',
        badge: 'Amazon Store',
        icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
        keywords: ['store', 'gear', 'essentials', 'calculator', 'casio', 'fx991cw', 'laptop', 'amazon', 'books', 'pyq', 'keyboard', 'mouse', 'headphones'],
        action: () => onSelectTool('essentials'),
      },
      {
        id: 'tool-guides-hub',
        title: 'MOS Student Knowledge HUB (9 Chapters)',
        subtitle: 'Chapter 9: Demystifying Engineering Seat Allotment, OC quota math & Phase-2 sliding rules',
        category: 'Core Tools',
        badge: '9 Chapters',
        icon: <BookOpen className="w-4 h-4 text-blue-500" />,
        keywords: [
          'guides',
          'editorial',
          'chapter 9',
          'reservation',
          'quota',
          'seat allotment',
          'open category',
          'oc',
          'general',
          'ews',
          'obc',
          'sc',
          'st',
          'phase 2',
          'sliding',
          'attendance',
          'knowledge hub',
        ],
        action: () => onSelectTool('guides'),
      }
    );

    // 2. Engineering Roadmaps (All 24 Branches)
    ENGINEERING_ROADMAPS.forEach((branch) => {
      items.push({
        id: `branch-roadmap-${branch.id}`,
        title: `${branch.code} — ${branch.name}`,
        subtitle: `${branch.categoryLabel} • ${branch.strategicOverview.targetRoles.slice(0, 2).join(', ')}`,
        category: 'Engineering Roadmaps (24 Branches)',
        badge: branch.code,
        icon: <Compass className="w-4 h-4 text-indigo-600" />,
        keywords: [
          branch.code.toLowerCase(),
          branch.name.toLowerCase(),
          branch.category.toLowerCase(),
          ...branch.strategicOverview.targetRoles.map((r) => r.toLowerCase()),
          ...branch.skillsMatrix.industryTools.map((t) => t.toLowerCase()),
          ...branch.strategicOverview.keyCompetitiveExams.map((e) => e.toLowerCase()),
          'roadmap',
          'curriculum',
        ],
        action: () => {
          onSelectTool('roadmaps');
          if (onSelectBranchRoadmap) {
            onSelectBranchRoadmap(branch.id);
          }
        },
      });
    });

    // 3. Popular PDF Quick Actions
    const pdfDirectTools = [
      { name: 'Merge PDF', desc: 'Combine multiple PDF files into one orderly document', icon: <Layers className="w-4 h-4 text-emerald-600" /> },
      { name: 'Compress PDF', desc: 'Reduce PDF file size up to 90% while keeping quality', icon: <FileDown className="w-4 h-4 text-emerald-600" /> },
      { name: 'Split PDF', desc: 'Extract specific pages or page ranges from a PDF', icon: <Scissors className="w-4 h-4 text-emerald-600" /> },
      { name: 'PDF to Word', desc: 'Convert PDF files into editable DOCX format', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
      { name: 'Image to PDF', desc: 'Convert JPG, PNG images into a clean single PDF', icon: <Image className="w-4 h-4 text-emerald-600" /> },
      { name: 'Protect / Lock PDF', desc: 'Encrypt PDF with strong password security', icon: <Lock className="w-4 h-4 text-emerald-600" /> },
      { name: 'Unlock PDF', desc: 'Remove password restrictions from PDF files', icon: <Unlock className="w-4 h-4 text-emerald-600" /> },
      { name: 'Watermark PDF', desc: 'Stamp custom confidentiality watermark across pages', icon: <Stamp className="w-4 h-4 text-emerald-600" /> },
    ];

    pdfDirectTools.forEach((p) => {
      items.push({
        id: `pdf-quick-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: p.name,
        subtitle: p.desc,
        category: 'PDF Power Tools',
        badge: 'PDF',
        icon: p.icon,
        keywords: ['pdf', p.name.toLowerCase(), 'tools', 'document'],
        action: () => onSelectTool('pdf-tools'),
      });
    });

    // 4. Quick Actions & Community
    items.push(
      {
        id: 'action-reviews',
        title: 'Student & Parent Reviews',
        subtitle: 'Read authentic college testimonials or submit your feedback',
        category: 'Quick Actions',
        badge: 'Community',
        icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
        keywords: ['review', 'feedback', 'comment', 'testimonial', 'rating', 'community', 'pvpsit', 'srkr', 'vishnu', 'aditya'],
        action: () => {
          const el = document.getElementById('student-testimonials-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        id: 'action-faq',
        title: 'Frequently Asked Questions (FAQ)',
        subtitle: 'Engineering roadmaps, PDF privacy, scholarships & developer mission',
        category: 'Quick Actions',
        badge: 'Help',
        icon: <HelpCircle className="w-4 h-4 text-sky-500" />,
        keywords: ['faq', 'questions', 'developer', 'mission', 'btech', 'pdf tools', 'roadmaps', 'scholarships', 'privacy'],
        action: () => {
          const el = document.getElementById('student-faq-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        id: 'action-support-mos',
        title: '☕ Support the Developer / Keep MAN OF STUDY Free',
        subtitle: 'Help us pay server and scraper bills with a quick contribution via UPI',
        category: 'Quick Actions',
        badge: 'Donate',
        icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />,
        keywords: ['support', 'donate', 'donation', 'upi', 'developer', 'chai', 'coffee', 'fund', 'contribute', 'free forever', 'man of study', 'mos'],
        action: () => onOpenSupport?.(),
      },
      {
        id: 'action-grievance',
        title: 'Contact Grievance Officer',
        subtitle: 'Direct support for student grievances & counseling assistance',
        category: 'Quick Actions',
        badge: 'Support',
        icon: <ShieldCheck className="w-4 h-4 text-slate-500" />,
        keywords: ['grievance', 'support', 'contact', 'officer', 'email', 'help'],
        action: () => onOpenLegal?.('contact'),
      },
      {
        id: 'action-privacy',
        title: 'Privacy Policy & Student Data Security',
        subtitle: 'Learn how our zero-server client-side WebAssembly tools protect privacy',
        category: 'Quick Actions',
        badge: 'Legal',
        icon: <Scale className="w-4 h-4 text-slate-500" />,
        keywords: ['privacy', 'terms', 'security', 'client side', 'data'],
        action: () => onOpenLegal?.('privacy'),
      }
    );

    return items;
  }, [onSelectTool, onSelectBranchRoadmap, onOpenLegal, onOpenSupport]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return allCommands;
    }
    return allCommands.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      );
    });
  }, [searchQuery, allCommands]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLDivElement>(
        `[data-cmd-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredCommands.length === 0 ? 0 : (prev - 1 + filteredCommands.length) % filteredCommands.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 sm:pt-20 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="command-palette-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] transition-all transform scale-100"
      >
        {/* Top Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a tool name, roadmap (CSE, ECE, Robotics), or command..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors mr-2 cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono font-semibold px-2 py-1 rounded bg-slate-200 text-slate-600">
            <span>ESC</span>
          </div>
        </div>

        {/* Quick Filter Tag Chips */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] bg-white">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick:
          </span>
          {[
            { label: 'All', q: '' },
            { label: 'free pdf tools for students', q: 'pdf' },
            { label: 'Roadmaps', q: 'roadmap' },
            { label: 'Robotics', q: 'robotics' },
            { label: 'CSE', q: 'cse' },
            { label: 'ECE / VLSI', q: 'vlsi' },
            { label: 'EAPCET', q: 'eapcet' },
            { label: 'Scholarships', q: 'scholarship' },
            { label: 'Resume', q: 'resume' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSearchQuery(item.q)}
              className={`px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                searchQuery.toLowerCase() === item.q.toLowerCase()
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-cmd-index={index}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/90 text-slate-900 border border-indigo-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white border-indigo-200 shadow-2xs'
                          : 'bg-slate-100 border-slate-200/80'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold truncate text-slate-900">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            isSelected
                              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                      {item.category}
                    </span>
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center transition-opacity ${
                        isSelected ? 'opacity-100 text-indigo-600' : 'opacity-0'
                      }`}
                    >
                      <CornerDownLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                No matching tools or roadmaps found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try searching for &quot;PDF&quot;, &quot;Roadmap&quot;, &quot;Robotics&quot;, &quot;CSE&quot;, or &quot;Scholarship&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Bottom Shortcut Guide Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] shadow-2xs">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] shadow-2xs">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] shadow-2xs">
                ↵
              </kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] shadow-2xs">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-medium">
            Showing {filteredCommands.length} of {allCommands.length} items
          </span>
        </div>
      </div>
    </div>
  );
};
