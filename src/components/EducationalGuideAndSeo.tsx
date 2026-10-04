import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  Calculator,
  FileText,
  Bot,
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
        'The Radar uses available college and seat information to show branch-wise vacant seats, fee details, and useful Phase 2 web-option information so students can make better choices.',
    },
    {
      category: 'Study Tools',
      question: 'How does the Attendance Defender calculate bunkable and required classes?',
      answer:
        'It uses your attendance percentage and the required minimum to show how many classes you can safely miss or how many you need to attend to reach the required percentage.',
    },
    {
      category: 'Study Tools',
      question: 'How is the Internal Exam Cutoff & External Marks calculated?',
      answer:
        'The calculator uses the marks and evaluation rules you select, including internal exams, assignments, attendance, and the required final-exam score, to estimate what you need to reach your target.',
    },
    {
      category: 'Marks & GPA',
      question: 'What conversion rules are used in Global GPA Hub for Indian Universities?',
      answer:
        'Global GPA Hub supports common university and education-board conversion rules for CGPA, percentage, and related grade calculations. Always check your university rules before using a converted value for an official application.',
    },
    {
      category: 'Career Tools',
      question: 'How does the resume keyword matcher and builder work?',
      answer:
        'You can upload your resume, check how well it matches a target role, find useful missing keywords, and create a cleaner ATS-friendly version of your resume.',
    },
    {
      category: 'Writing & AI',
      question: 'How does the AI writing helper improve text?',
      answer:
        'It looks at sentence structure, tone, and readability and can help rewrite text in a more natural style for academic, casual, or professional use.',
    },
    {
      category: 'Privacy & Security',
      question: 'Is my data secure when using the PDF and image tools?',
      answer:
        'These browser-based tools are designed to process supported files locally in your browser. Files used by these tools are not intentionally uploaded to a remote server for processing.',
    },
  ];

  return (
    <div className="space-y-8 pt-8 border-t border-white/10 text-slate-200">
      {/* Student-friendly guide header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-200 border border-cyan-300/15">
          <BookOpen className="w-3.5 h-3.5" />
          <span>HOW OUR STUDENT TOOLS WORK</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Simple tools, explained clearly
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          A quick look at how Man of Study helps with admissions, marks, documents, careers, and everyday student tasks.
        </p>
      </div>

      {/* Student-friendly feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Study & Marks */}
        <div className="rounded-2xl bg-[#0b1728]/90 border border-white/10 p-5 space-y-3 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-cyan-300">
            <Calculator className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Study & Marks Tools</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Helpful calculators for CGPA, percentage, internal marks, attendance, and other common college calculations using relevant university rules.
          </p>
        </div>

        {/* Documents */}
        <div className="rounded-2xl bg-[#0b1728]/90 border border-white/10 p-5 space-y-3 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-emerald-300">
            <FileText className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">PDF & Document Tools</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Work with PDFs, images, and documents in your browser — including merging, extracting pages, resizing images, and preparing files for student applications.
          </p>
        </div>

        {/* Career & AI */}
        <div className="rounded-2xl bg-[#0b1728]/90 border border-white/10 p-5 space-y-3 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 text-cyan-300">
            <Bot className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Career & Writing Tools</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Improve resumes, check job-related keywords, build cleaner resume layouts, and get help making academic or professional writing easier to read.
          </p>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      <div className="rounded-2xl bg-[#0b1728]/90 border border-white/10 p-6 space-y-4 shadow-lg shadow-black/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-300" />
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-4 first:pt-2 last:pb-2">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-200 border border-cyan-300/10 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180 text-cyan-300' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-3 pl-3 pr-4 text-xs text-slate-300 leading-relaxed border-l-2 border-cyan-400">
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

export default EducationalGuideAndSeo;
