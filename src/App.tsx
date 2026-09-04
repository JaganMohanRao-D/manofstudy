import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
  GraduationCap,
  FileText,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ToolTab, ToolMeta } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LegalModals, LegalModalType } from './components/LegalModals';
import { ApEapcetRadar, EapcetPhaseTab } from './components/ApEapcetRadar';
import { AttendanceDefender } from './components/AttendanceDefender';
import { GlobalGpaHub } from './components/GlobalGpaHub';
import { ImageResizer } from './components/ImageResizer';
import { AtsResumeMatcher } from './components/AtsResumeMatcher';
import { AiHumanizer } from './components/AiHumanizer';
import { PdfPowerTools } from './components/PdfPowerTools';
import { InternalExamEstimator } from './components/InternalExamEstimator';
import { ScholarshipsHub } from './components/ScholarshipsHub';
import { EngineeringRoadmaps } from './components/EngineeringRoadmaps';
import { EducationalGuideAndSeo } from './components/EducationalGuideAndSeo';
import { StudentFaq } from './components/StudentFaq';
import { StudentTestimonials } from './components/StudentTestimonials';
import { CommandPalette } from './components/CommandPalette';
import { CleanAdBanner } from './components/CleanAdBanner';

export const TOOLS_CONFIG: ToolMeta[] = [
  {
    id: 'eapcet-radar',
    name: 'AP EAPCET Phase 2 Vacancy Radar',
    shortName: 'EAPCET Phase 2',
    category: 'counselling',
    description: 'Live AP EAPCET Phase 2 leftover seats, college matrices & official branch fee schedules',
    badge: 'Phase 2 Live',
  },
  {
    id: 'roadmaps',
    name: 'Engineering Branch Roadmaps',
    shortName: 'Branch Roadmaps',
    category: 'counselling',
    description: '4-year semester-by-semester blueprints, software, projects & PDF exports for 24 counseling branches',
    badge: '24 Branches',
  },
  {
    id: 'scholarships',
    name: 'Scholarships Radar',
    shortName: 'Scholarships Radar',
    category: 'academic',
    description: 'Verified 2026 national, state & corporate scholarships with direct official apply links',
    badge: '22+ Live',
  },
  {
    id: 'pdf-tools',
    name: '30+ PDF Power Tools',
    shortName: '30+ PDF Tools',
    category: 'document',
    description: 'Zero-server WebAssembly PDF merge, split, compress, watermark, redact & convert',
    badge: '30 Tools',
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('eapcet-radar');
  const [eapcetPhase, setEapcetPhase] = useState<EapcetPhaseTab>('phase2');
  const [legalModal, setLegalModal] = useState<LegalModalType | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [targetRoadmapBranchId, setTargetRoadmapBranchId] = useState<string | undefined>(undefined);

  const supportEmail = 'support.jamord@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Global Ctrl/Cmd + K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync activeTab with URL hash for bookmarking and history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (
        hash === 'eapcet-radar' ||
        hash === 'eapcet' ||
        hash === 'phase1' ||
        hash === 'phase2' ||
        hash === 'radar' ||
        hash === 'vacancy' ||
        hash === 'predictor'
      ) {
        setActiveTab('eapcet-radar');
        setEapcetPhase('phase2');
      } else if (hash.startsWith('roadmap') || hash === 'curriculum' || hash === 'branch') {
        setActiveTab('roadmaps');
      } else if (hash === 'scholarships' || hash === 'scholarship') {
        setActiveTab('scholarships');
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

  const handleSelectEapcetPhase = () => {
    setEapcetPhase('phase2');
    setActiveTab('eapcet-radar');
    window.location.hash = 'eapcet-radar';
  };

  const handleSelectToolFromPalette = (tab: ToolTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    setIsCommandPaletteOpen(false);

    // Smooth scroll to active tool viewport
    setTimeout(() => {
      const el = document.getElementById('active-tool-viewport');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSelectBranchRoadmapFromPalette = (branchId: string) => {
    setTargetRoadmapBranchId(branchId);
    setActiveTab('roadmaps');
    window.location.hash = `roadmaps?branch=${branchId}`;
    setIsCommandPaletteOpen(false);

    setTimeout(() => {
      const el = document.getElementById('active-roadmap-view') || document.getElementById('active-tool-viewport');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 tech-grid-pattern-light flex flex-col justify-between">
      {/* 1. Modern Header with Search, Dropdowns & Quick Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSelectEapcetPhase={handleSelectEapcetPhase}
        onOpenLegal={(type) => setLegalModal(type)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1 w-full">
        {/* Compact Hero Section */}
        <HeroSection />

        {/* Dynamic Tool Viewport */}
        <section id="active-tool-viewport" className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'eapcet-radar' && (
              <motion.div
                key={`eapcet-radar-${eapcetPhase}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ApEapcetRadar initialTab={eapcetPhase} />
              </motion.div>
            )}

            {activeTab === 'roadmaps' && (
              <motion.div
                key="roadmaps"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <EngineeringRoadmaps
                  targetBranchId={targetRoadmapBranchId}
                  onSelectBranch={(branchId) => setTargetRoadmapBranchId(branchId)}
                />
              </motion.div>
            )}

            {activeTab === 'scholarships' && (
              <motion.div
                key="scholarships"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ScholarshipsHub />
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

        {/* 3. High-Trust Testimonials & Interactive Feedback */}
        <StudentTestimonials />

        {/* 4. Educational Guides & Methodology Documentation */}
        <EducationalGuideAndSeo />

        {/* 5. Comprehensive Expandable Student FAQ */}
        <StudentFaq
          onSelectTab={(tab) => handleTabChange(tab)}
          onOpenLegal={(type) => setLegalModal(type)}
        />
      </main>

      {/* Clean Iframe Adsterra Display Banner: Just above the footer across main pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CleanAdBanner />
      </div>

      {/* 5. Comprehensive AdSense-Ready Footer */}
      <footer
        id="app-footer"
        className="border-t border-slate-200 bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8 mt-16 shadow-xs"
      >
        <div className="max-w-7xl mx-auto space-y-9">
          {/* Identity & Support Email Desk */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                  STUDY<span className="text-sky-600">MACHA</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  VERIFIED STUDENT PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Independent educational &amp; career guidance hub for Telugu engineering students. Providing verified AP EAPCET leftover seat matrices, national and corporate scholarship alerts, and 100% private in-browser document tools.
              </p>
            </div>

            {/* Official Support Email Desk */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Official Support &amp; Enquiries
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
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy support email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setLegalModal('contact')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>

          {/* 4-Column Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            {/* Column 1: AP EAPCET Vacancies & Leftover Seats */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-600" />
                AP EAPCET &amp; Admissions
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <button
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-semibold text-rose-700"
                  >
                    <span>🔥 Phase 2 Left Over Seats Matrix</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    Top Engineering Colleges &amp; Fee Schedules
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSelectEapcetPhase()}
                    className="hover:text-rose-600 transition-colors text-left cursor-pointer"
                  >
                    Category Quota Guidance (OC/BC/SC/ST/EWS)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('roadmaps')}
                    className="hover:text-indigo-600 transition-colors text-left cursor-pointer font-semibold text-indigo-700 flex items-center gap-1.5"
                  >
                    <span>🧭 24 Branch Career Roadmaps (4-Year Action Plans)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Free Utilities & Student Tools */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                Free Utilities &amp; Student Tools
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <button
                    onClick={() => handleTabChange('pdf-tools')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    30+ WebAssembly PDF Tools (Merge, Split, Watermark)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('resizer')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Exam Image &amp; Signature Resizer (20KB–50KB)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('resume-checker')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    ATS Resume Keyword Matcher &amp; 1-Click Builder
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('attendance')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Attendance Defender (75% Minimum Rule Calculator)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('gpa')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Global GPA &amp; CGPA Hub (VTU, JNTU, AICTE Standard)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('humanizer')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    AI Text Humanizer &amp; Linguistic Perplexity Scanner
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Scholarships & Government Schemes */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Scholarships &amp; Grants
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer font-medium text-slate-800"
                  >
                    Reliance Foundation UG (₹2 Lakhs Grant)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    HDFC Bank Parivartan ECSS Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    LIC Golden Jubilee Scholarship Programme
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    Kotak Kanya Scholarship for Girl Engineers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    AICTE Pragati &amp; Saksham Schemes (NSP)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('scholarships')}
                    className="hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    Amazon Future Engineer (AFE) Scholarship
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal, Compliance & Community */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-800" />
                Legal &amp; Compliance
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <button
                    onClick={() => setLegalModal('about')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    About StudyMacha
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLegalModal('privacy')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy (100% In-Memory)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLegalModal('terms')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLegalModal('disclaimer')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Legal Disclaimers &amp; Attribution
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLegalModal('contact')}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer"
                  >
                    Contact Grievance Officer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('student-faq-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer flex items-center gap-1.5 font-semibold text-slate-800"
                  >
                    <span>❓ Student FAQs &amp; Knowledge Base</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('student-testimonials-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-sky-600 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⭐ Student Reviews &amp; Feedback</span>
                  </button>
                </li>
              </ul>
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
              <span>100% In-Memory Sandbox • No Personal Files or Resumes Stored on Remote Servers</span>
            </div>
            <div>
              <span>© 2026 StudyMacha Platform. Official Support: </span>
              <a href={`mailto:${supportEmail}`} className="font-mono text-slate-700 hover:text-sky-600 font-semibold">
                {supportEmail}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Legal & Contact Modal */}
      <LegalModals
        type={legalModal}
        onClose={() => setLegalModal(null)}
        onSwitchType={(type) => setLegalModal(type)}
      />

      {/* 7. Global Command Palette (Ctrl/Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectToolFromPalette}
        onSelectBranchRoadmap={handleSelectBranchRoadmapFromPalette}
      />
    </div>
  );
}
