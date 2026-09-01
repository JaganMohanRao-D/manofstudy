import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  GraduationCap,
  Image as ImageIcon,
  FileSearch,
  FileText,
  Calculator,
  Bot,
  Zap,
  Lock,
} from 'lucide-react';
import { ToolTab, ToolMeta } from './types';
import { Header } from './components/Header';
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
    id: 'attendance',
    name: 'Attendance Defender',
    shortName: 'Attendance',
    category: 'academic',
    description: 'Smart bunk & recovery margin calculator with 75% thresholds',
    badge: 'Tool 01',
  },
  {
    id: 'gpa',
    name: 'Global GPA Hub',
    shortName: 'GPA Hub',
    category: 'academic',
    description: 'VTU/AICTE percentage converter & future SGPA goal predictor',
    badge: 'Tool 02',
  },
  {
    id: 'internal-calc',
    name: 'Internal Cutoff Estimator',
    shortName: 'Internal Calc',
    category: 'academic',
    description: '80:20 mid evaluation & external semester target marks finder',
    badge: 'Tool 03',
  },
  {
    id: 'resizer',
    name: 'Exam Image Resizer',
    shortName: 'Image Resizer',
    category: 'document',
    description: 'Client-side photo/signature compression to exact 20KB–500KB',
    badge: 'Tool 04',
  },
  {
    id: 'resume-checker',
    name: 'ATS Resume Matcher',
    shortName: 'ATS Matcher',
    category: 'document',
    description: 'Direct PDF/DOCX parsing, ATS diagnostics & 1-click builder',
    badge: 'Tool 05',
  },
  {
    id: 'humanizer',
    name: 'AI Text Humanizer',
    shortName: 'AI Humanizer',
    category: 'writing',
    description: 'Real-feel AI pattern scanner & natural conversational rewriter',
    badge: 'Tool 06',
  },
  {
    id: 'pdf-tools',
    name: 'PDF Power Tools',
    shortName: 'PDF Suite',
    category: 'document',
    description: 'Zero-server WebAssembly PDF merge & custom page range extract',
    badge: 'Tool 07',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>('attendance');

  // Sync activeTab with URL hash for bookmarking and history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'gpa') {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 tech-grid-pattern-light">
      
      {/* Sticky Top Navigation & Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Quick Tool Selector Carousel / Grid */}
        <section id="quick-tool-selector" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              Student Utility Suite
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              7 In-Browser Tools • 100% Client-Side Private
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {TOOLS_CONFIG.map((tool) => {
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

        {/* Dynamic Tool Content with Smooth Animation */}
        <section id="active-tool-viewport" className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
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

        {/* Educational Guides Section */}
        <EducationalGuideAndSeo />
      </main>

      {/* Global Minimalist Footer */}
      <footer id="app-footer" className="border-t border-slate-200 bg-white text-slate-600 py-8 px-4 sm:px-6 lg:px-8 mt-16 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-slate-900">
                STUDYMACHA
              </span>
              <span className="text-xs text-slate-500">• 100% Client-Side In-Browser Engine</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>Zero server telemetry. All data stays confidential in your browser.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 text-xs">
            {TOOLS_CONFIG.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className="text-left text-slate-600 hover:text-sky-600 transition-colors p-1 truncate cursor-pointer font-medium"
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 STUDYMACHA. Designed for distraction-free student success.</span>
            <span>All operations run locally in browser memory.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
