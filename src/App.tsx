import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radar,
  ShieldCheck,
  GraduationCap,
  Image as ImageIcon,
  FileSearch,
  FileText,
  Calculator,
  Bot,
  Zap,
  Lock,
  Mail,
  Copy,
  Check,
  Shield,
  HelpCircle,
  Sparkles,
  Layers,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { ToolTab, ToolMeta } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LegalModals, LegalModalType } from './components/LegalModals';
import { ApEapcetRadar } from './components/ApEapcetRadar';
import { AttendanceDefender } from './components/AttendanceDefender';
import { GlobalGpaHub } from './components/GlobalGpaHub';
import { ImageResizer } from './components/ImageResizer';
import { AtsResumeMatcher } from './components/AtsResumeMatcher';
import { AiHumanizer } from './components/AiHumanizer';
import { PdfPowerTools } from './components/PdfPowerTools';
import { InternalExamEstimator } from './components/InternalExamEstimator';
import { EducationalGuideAndSeo } from './components/EducationalGuideAndSeo';

export const TOOLS_CONFIG: ToolMeta[] = [
  {
    id: 'pdf-tools',
    name: '30+ PDF Power Tools',
    shortName: '30+ PDF Tools',
    category: 'document',
    description: 'Zero-server WebAssembly PDF merge, split, compress, watermark, redact & convert',
    badge: '30 Tools',
  },
  {
    id: 'eapcet-radar',
    name: 'AP EAPCET Vacancy Radar',
    shortName: 'EAPCET Radar',
    category: 'counselling',
    description: 'Phase 2 live college vacancies, branch intake & fee structure scanner',
    badge: 'LIVE • Phase 2',
  },
  {
    id: 'resume-checker',
    name: 'ATS Resume Matcher',
    shortName: 'ATS Matcher',
    category: 'document',
    description: 'Direct PDF/DOCX parsing, ATS diagnostics & 1-click builder',
    badge: 'Career • ATS',
  },
  {
    id: 'resizer',
    name: 'Exam Image Resizer',
    shortName: 'Image Resizer',
    category: 'document',
    description: 'Client-side photo/signature compression to exact 20KB–500KB',
    badge: 'Exact KB',
  },
  {
    id: 'attendance',
    name: 'Attendance Defender',
    shortName: 'Attendance',
    category: 'academic',
    description: 'Smart bunk & recovery margin calculator with 75% thresholds',
    badge: 'Academic 01',
  },
  {
    id: 'gpa',
    name: 'Global GPA Hub',
    shortName: 'GPA Hub',
    category: 'academic',
    description: 'VTU/AICTE percentage converter & future SGPA goal predictor',
    badge: 'Academic 02',
  },
  {
    id: 'internal-calc',
    name: 'Internal Cutoff Estimator',
    shortName: 'Internal Calc',
    category: 'academic',
    description: '80:20 mid evaluation & external semester target marks finder',
    badge: 'Academic 03',
  },
  {
    id: 'humanizer',
    name: 'AI Text Humanizer',
    shortName: 'AI Humanizer',
    category: 'writing',
    description: 'Real-feel AI pattern scanner & natural conversational rewriter',
    badge: 'AI Scanner',
  },
];

type CategoryFilter = 'all' | 'pdf' | 'career' | 'academic' | 'counselling';

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('eapcet-radar');
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const supportEmail = 'support.jamord@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Sync activeTab with URL hash for bookmarking and history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'eapcet-radar' || hash === 'eapcet' || hash === 'phase2' || hash === 'radar' || hash === 'vacancy') {
        setActiveTab('eapcet-radar');
      } else if (hash === 'gpa') {
        setActiveTab('gpa');
      } else if (hash === 'resizer' || hash === 'image') {
        setActiveTab('resizer');
      } else if (hash === 'resume-checker' || hash === 'resume' || hash === 'ats') {
        setActiveTab('resume-checker');
      } else if (hash === 'humanizer' || hash === 'ai' || hash === 'scanner') {
        setActiveTab('humanizer');
      } else if (hash === 'pdf-tools' || hash === 'pdf') {
        setActiveTab('pdf-tools');
      } else if (hash === 'internal-calc' || hash === 'internal' || hash === 'cutoff') {
        setActiveTab('internal-calc');
      } else if (hash === 'attendance') {
        setActiveTab('attendance');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: ToolTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const getToolIcon = (id: ToolTab) => {
    switch (id) {
      case 'eapcet-radar':
        return Radar;
      case 'attendance':
        return ShieldCheck;
      case 'gpa':
        return GraduationCap;
      case 'internal-calc':
        return Calculator;
      case 'resizer':
        return ImageIcon;
      case 'resume-checker':
        return FileSearch;
      case 'humanizer':
        return Bot;
      case 'pdf-tools':
        return FileText;
    }
  };

  const filteredTools = TOOLS_CONFIG.filter((tool) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'pdf') return tool.id === 'pdf-tools';
    if (categoryFilter === 'career') return tool.id === 'resume-checker' || tool.id === 'humanizer' || tool.id === 'resizer';
    if (categoryFilter === 'academic') return tool.category === 'academic';
    if (categoryFilter === 'counselling') return tool.id === 'eapcet-radar';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 tech-grid-pattern-light flex flex-col justify-between">
      
      {/* Sticky Top Navigation & Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenLegal={(type) => setLegalModal(type)}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 flex-1 w-full">
        
        {/* Global Positioning & Trust Hero Section */}
        <HeroSection
          onSelectTool={handleTabChange}
          activeTab={activeTab}
        />

        {/* Feature Grid & Category Tool Showcase */}
        <section id="quick-tool-selector" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600" />
                Universal Productivity Suite
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                International Document &amp; Career Engines alongside Specialized Indian Academic Trackers
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {(
                [
                  { id: 'all', label: 'All Tools (8)' },
                  { id: 'pdf', label: 'PDF Suite (30)' },
                  { id: 'career', label: 'Career & ATS' },
                  { id: 'academic', label: 'Academic & GPA' },
                  { id: 'counselling', label: 'AP EAPCET' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tool Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {filteredTools.map((tool) => {
              const Icon = getToolIcon(tool.id);
              const isActive = activeTab === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleTabChange(tool.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 ease-out active:scale-95 cursor-pointer flex flex-col justify-between relative group ${
                    isActive
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm ring-2 ring-sky-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                      {tool.badge}
                    </span>
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold block truncate transition-colors ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-sky-700'}`}>
                      {tool.shortName}
                    </span>
                    <span className={`text-[10px] capitalize block truncate mt-0.5 ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                      {tool.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Active Tool Viewport */}
        <section id="active-tool-viewport" className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'eapcet-radar' && (
              <motion.div
                key="eapcet-radar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ApEapcetRadar />
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <AttendanceDefender />
              </motion.div>
            )}

            {activeTab === 'gpa' && (
              <motion.div
                key="gpa"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <GlobalGpaHub />
              </motion.div>
            )}

            {activeTab === 'internal-calc' && (
              <motion.div
                key="internal-calc"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <InternalExamEstimator />
              </motion.div>
            )}

            {activeTab === 'resizer' && (
              <motion.div
                key="resizer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ImageResizer />
              </motion.div>
            )}

            {activeTab === 'resume-checker' && (
              <motion.div
                key="resume-checker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <AtsResumeMatcher />
              </motion.div>
            )}

            {activeTab === 'humanizer' && (
              <motion.div
                key="humanizer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <AiHumanizer />
              </motion.div>
            )}

            {activeTab === 'pdf-tools' && (
              <motion.div
                key="pdf-tools"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <PdfPowerTools />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Educational Guides & Methodology Documentation */}
        <EducationalGuideAndSeo />
      </main>

      {/* Global SaaS Footer with Official Legal & Support Credentials */}
      <footer id="app-footer" className="border-t border-slate-200 bg-white text-slate-600 py-10 px-4 sm:px-6 lg:px-8 mt-16 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Footer Row: Identity, Support Email & In-Memory Guarantee */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  STUDYMACHA
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Global Utility Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering international professionals and Indian scholars with lightning-fast, client-side PDF manipulation, ATS resume optimization, exact KB exam image compression, and real-time AP EAPCET vacancy tracking.
              </p>
            </div>

            {/* Official Support Email Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                    Official Support Desk
                  </span>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors font-mono"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                <button
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy support email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setLegalModal('contact')}
                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Contact Form
                </button>
              </div>
            </div>
          </div>

          {/* Middle Footer Row: Dual Value Grid & Tools Directory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Column 1: International Document & Career Tools */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Global Document &amp; Career Suite
              </h4>
              <ul className="space-y-1.5 text-slate-500">
                <li>
                  <button onClick={() => handleTabChange('pdf-tools')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    30+ WebAssembly PDF Tools (Merge, Split, Watermark)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('resume-checker')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    ATS Resume Keyword Diagnostic &amp; 1-Click Builder
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('resizer')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    Exam Image &amp; Signature Exact KB Resizer (20–500 KB)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('humanizer')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    AI Text Humanizer &amp; Linguistic Perplexity Scanner
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Indian Academic & Counselling Utilities */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                Indian University &amp; Counselling
              </h4>
              <ul className="space-y-1.5 text-slate-500">
                <li>
                  <button onClick={() => handleTabChange('eapcet-radar')} className="hover:text-rose-600 transition-colors text-left cursor-pointer font-medium text-slate-700">
                    AP EAPCET Phase 2 College Vacancy Radar &amp; Fees
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('attendance')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    Attendance Defender (75% Statutory Threshold Bunk Engine)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('gpa')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    Global GPA Hub (VTU, JNTU, AICTE, Anna Univ Formulas)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('internal-calc')} className="hover:text-sky-600 transition-colors text-left cursor-pointer">
                    80:20 Mid Evaluation &amp; Semester Pass Cutoff Finder
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust, Privacy Architecture & Compliance */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Privacy Architecture &amp; Legal
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Zero server uploads. All processing takes place in your local browser sandbox. AdSense compliant with transparent third-party ad disclosures.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <button
                  onClick={() => setLegalModal('about')}
                  className="text-slate-600 hover:text-sky-600 underline font-medium cursor-pointer"
                >
                  About Us
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setLegalModal('contact')}
                  className="text-slate-600 hover:text-sky-600 underline font-medium cursor-pointer"
                >
                  Contact Us
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="text-slate-600 hover:text-sky-600 underline font-medium cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="text-slate-600 hover:text-sky-600 underline font-medium cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => setLegalModal('disclaimer')}
                  className="text-slate-600 hover:text-sky-600 underline font-medium cursor-pointer"
                >
                  Disclaimer
                </button>
              </div>
            </div>
          </div>

          {/* Prominent Legal Disclaimer & Safe Harbor Protection Zone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="uppercase tracking-wider">Independent Platform &amp; Legal Safe Harbor</span>
              </div>
              <button
                onClick={() => setLegalModal('disclaimer')}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Read Full Disclosures →
              </button>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              <strong>Disclaimer:</strong> StudyMacha is an independent informational and utility platform. AP EAPCET data, college vacancy counts, and scholarship listings are aggregated from publicly available official portals for educational guidance only. StudyMacha is <strong>NOT affiliated with APSCHE, APCFSS, National Scholarship Portal (NSP), or any government body</strong>. Official cutoffs, deadlines, and seat allotments are subject to change by respective authorities. Users must verify all critical details on official government portals.
            </p>
          </div>

          {/* Bottom Copyright & Security Statement */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% In-Memory Sandbox • No Personal Files Stored on Servers</span>
            </div>
            <div>
              <span>© 2026 StudyMacha Platform. For assistance: </span>
              <a href={`mailto:${supportEmail}`} className="font-mono text-slate-700 hover:text-sky-600 font-semibold">
                {supportEmail}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Interactive Legal & Contact Modal */}
      <LegalModals
        type={legalModal}
        onClose={() => setLegalModal(null)}
        onSwitchType={(type) => setLegalModal(type)}
      />
    </div>
  );
}

