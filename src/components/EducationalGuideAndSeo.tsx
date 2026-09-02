import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  Calculator,
  FileText,
  Bot,
  Sparkles,
} from 'lucide-react';

export const EducationalGuideAndSeo: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      category: 'Counselling Tools',
      question: 'How does the AP EAPCET Phase 2 Vacancy Radar track leftover seats?',
      answer:
        'The Radar processes institutional seat matrices across Andhra Pradesh universities, autonomous colleges, and affiliated institutions following Phase 1 reporting. It tracks branch-wise intake, leftover vacant seats, and official government-notified annual fee structures, enabling students to plan optimal Phase 2 web options.',
    },
    {
      category: 'Academic Tools',
      question: 'How does the Attendance Defender calculate bunkable and required classes?',
      answer:
        'The engine applies strict percentage threshold inequalities: for safe attendance (Attendance > Min Required), bunkable classes B = floor((Attended - (MinReq/100) * Conducted) / (MinReq/100)). For deficit status, required consecutive classes R = ceil(((MinReq/100) * Conducted - Attended) / (1 - (MinReq/100))). It dynamically updates as upcoming schedules shift.',
    },
    {
      category: 'Academic Tools',
      question: 'How is the Internal Exam Cutoff & External Marks calculated?',
      answer:
        'Internals are consolidated based on your university guideline (e.g. 80:20 weighted average of two midterms: 0.8 * High + 0.2 * Low, or Best-of-2) plus Assignment and Attendance marks. Required External Score = Target Total Marks Required - Consolidated Internal Scored. It also checks university external passing criteria (typically 35% or 40% minimum in semester finals).',
    },
    {
      category: 'Academic Tools',
      question: 'What conversion formula is used in Global GPA Hub for Indian Universities?',
      answer:
        'Global GPA Hub supports JNTU, Anna University, VTU Karnataka [Percentage = (CGPA - 0.75) * 10], Osmania OU, Andhra AU, VIT, SRM, Amrita, CBSE Standard [Percentage = CGPA * 9.5], and AICTE Standard [Percentage = (CGPA - 0.75) * 10]. It also translates marks into First Class with Distinction (FCD) and 4.0 US Equivalents.',
    },
    {
      category: 'Career & Documents',
      question: 'How does the ATS Resume Keyword Matcher & 1-Click Builder work?',
      answer:
        'The parser performs client-side tokenization of uploaded PDF, DOCX, or TXT files, extracts technical n-grams and soft skills, and evaluates quantifiable metrics and weak action verbs. The 1-Click Builder restructures your content into a clean single-column ATS layout with missing target keywords integrated and exports to clean PDF.',
    },
    {
      category: 'Writing & AI',
      question: 'How does the AI Text Humanizer & Pattern Scanner analyze and rewrite text?',
      answer:
        'The scanner evaluates statistical sentence burstiness (variance in sentence length), lexical perplexity, passive voice markers, and robotic transition cliches. The deep humanizer engine converts monotonous AI paragraphs into dynamic human cadences across Academic, Casual, or Professional tones.',
    },
    {
      category: 'Privacy & Security',
      question: 'Is my data secure when using Client-Side PDF Quick Tools and Image Resizer?',
      answer:
        'Yes, 100% private. All PDF merging, page splitting, document parsing, image resizing, and AI humanization happen entirely inside your browser memory. No documents, resumes, or photos are ever uploaded to any remote server.',
    },
  ];

  return (
    <div className="space-y-8 pt-8 border-t border-slate-200">
      {/* Guide Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <BookOpen className="w-3.5 h-3.5" />
          <span>METHODOLOGY, FORMULAS & DOCUMENTATION</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Engine Specifications & Academic Formula Guide
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Understand the mathematical models, formulas, and client-side processing algorithms powering STUDYMACHA.
        </p>
      </div>

      {/* Technical Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sky-600">
            <Calculator className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Academic Engine</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Implements official university formulas (AICTE, VTU, JNTU, Anna University, OU, VIT) for SGPA/CGPA percentage conversions, 80:20 weighted mid evaluations, and 75% attendance bunk thresholds.
          </p>
        </div>

        {/* Document Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileText className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Document Processing</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero-server WebAssembly PDF merging, page extraction, bicubic image resizing, and exact KB binary size budgeting for official exam portals (UPSC, GATE, SSC).
          </p>
        </div>

        {/* AI & Career Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sky-600">
            <Bot className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Career & AI Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Client-side PDF/DOCX resume parsing, ATS keyword matching, 1-click ATS builder, and linguistic AI burstiness pattern scanning & deep humanization.
          </p>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          Frequently Asked Questions (FAQs)
        </h3>

        <div className="divide-y divide-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-4 first:pt-2 last:pb-2">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-sky-700 border border-slate-200 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-3 pl-3 pr-4 text-xs text-slate-600 leading-relaxed border-l-2 border-sky-500">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
