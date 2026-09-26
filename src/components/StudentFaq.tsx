import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  BookOpen,
  FileText,
  GraduationCap,
  ShieldCheck,
  User,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Heart,
  Mail,
  Zap,
} from 'lucide-react';
import { ToolTab, LegalModalType } from '../types';

export interface StudentFaqProps {
  onSelectTab?: (tab: ToolTab) => void;
  onOpenLegal?: (type: LegalModalType) => void;
}

type FaqCategory = 'all' | 'roadmaps' | 'pdf' | 'scholarships' | 'privacy' | 'developer';

interface FaqItem {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  answer: string;
  actionText?: string;
  actionTarget?: { type: 'tab'; tab: ToolTab } | { type: 'legal'; modal: LegalModalType } | { type: 'email' };
}

export const StudentFaq: React.FC<StudentFaqProps> = ({ onSelectTab, onOpenLegal }) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set(['faq-developer-mission', 'faq-roadmaps-overview']));

  const faqList: FaqItem[] = [
    // --- ABOUT THE DEVELOPER & MISSION ---
    {
      id: 'faq-developer-mission',
      category: 'developer',
      categoryLabel: 'About the Developer',
      icon: User,
      question: 'Who created MAN OF STUDY, and what is the core mission behind the platform?',
      answer:
        'MAN OF STUDY was conceived, architected, and engineered by JAGAN MOHAN RAO DUNNA with a dedicated mission to empower fellow engineering scholars nationwide. Having directly navigated the realities of university curricula, information asymmetry in campus placements, and fragmented scholarship notifications, the creator built MAN OF STUDY as a free, privacy-first companion. Our purpose is to democratize high-grade curriculum blueprints, career roadmaps, and client-side academic utilities, enabling every student to thrive and succeed in life regardless of institutional tier.',
      actionText: 'Contact Developer Desk',
      actionTarget: { type: 'email' },
    },
    {
      id: 'faq-developer-costs',
      category: 'developer',
      categoryLabel: 'About the Developer',
      icon: Heart,
      question: 'Is MAN OF STUDY completely free for engineering students?',
      answer:
        'Yes, 100% free and open access. Every tool—from the 24 Engineering Branch Roadmaps with downloadable PDF blueprints, to the TG/AP EAPCET Leftover Seat & Allotment Explorer, Scholarships Hub, Attendance Defender, and Client-Side PDF Power Tools—is freely accessible without mandatory paywalls, subscription fees, or account logins.',
      actionText: 'Explore Verified Tools',
      actionTarget: { type: 'tab', tab: 'tg-allotments' },
    },
    {
      id: 'faq-developer-feedback',
      category: 'developer',
      categoryLabel: 'About the Developer',
      icon: Sparkles,
      question: 'How can students submit feedback or request new academic tools?',
      answer:
        'We actively incorporate student community suggestions. You can reach out directly via our official support desk at support.jamord@gmail.com with syllabus updates, new college cutoff requests, or tool suggestions. Every bug report and feature request is reviewed and prioritized by the student engineering team.',
      actionText: 'Official Contact Form',
      actionTarget: { type: 'legal', modal: 'contact' },
    },

    // --- ENGINEERING ROADMAPS ---
    {
      id: 'faq-roadmaps-overview',
      category: 'roadmaps',
      categoryLabel: 'Engineering Roadmaps',
      icon: BookOpen,
      question: 'How are the 4-Year Engineering Branch Roadmaps structured?',
      answer:
        'Each roadmap provides a structured semester-by-semester journey spanning all four years of undergraduate engineering. Year 1 builds fundamental mathematical and computational logic; Year 2 cements core engineering sciences and labs; Year 3 tackles advanced specializations, industry tech stacks, and internships; and Year 4 focuses on major capstone projects, GATE/GRE gates, and corporate campus placement mastery.',
      actionText: 'Open 24 Branch Roadmaps',
      actionTarget: { type: 'tab', tab: 'roadmaps' },
    },
    {
      id: 'faq-roadmaps-tier3',
      category: 'roadmaps',
      categoryLabel: 'Engineering Roadmaps',
      icon: Zap,
      question: 'What is the "Tier-3 Reality Check" included in every roadmap?',
      answer:
        'Most university curricula lag behind rapid industry requirements, and tier-3 colleges rarely host Tier-1 product campus drives. The "Tier-3 Reality Check" provides pragmatic, unvarnished advice on bypassing campus recruitment limitations: building high-signal open-source portfolios, winning national hackathons, cold-emailing startup founders, mastering Data Structures & Algorithms, and targeting high-growth off-campus employment.',
      actionText: 'Browse Roadmap Hub',
      actionTarget: { type: 'tab', tab: 'roadmaps' },
    },
    {
      id: 'faq-roadmaps-pdf',
      category: 'roadmaps',
      categoryLabel: 'Engineering Roadmaps',
      icon: FileText,
      question: 'Can I export the engineering branch roadmaps as printable PDFs?',
      answer:
        'Yes. Every branch modal features an instantaneous "Download Full PDF" button. The blueprint is generated 100% client-side in high-resolution vector format, including full 4-year subject targets, industry tech stack recommendations, tier-3 tactical guidelines, compensation matrices, and pro tips. It is perfectly formatted for offline reading or pinning to your study desk.',
      actionText: 'View & Export Roadmaps',
      actionTarget: { type: 'tab', tab: 'roadmaps' },
    },

    // --- PDF POWER TOOLS & DOCUMENT UTILITIES ---
    {
      id: 'faq-pdf-security',
      category: 'pdf',
      categoryLabel: 'PDF Tools & Privacy',
      icon: Lock,
      question: 'Are my uploaded documents and assignments safe when using PDF Power Tools?',
      answer:
        'MAN OF STUDY operates under a strict Zero-Server architecture for document processing. When you merge semester marksheets, split syllabus booklets, add text watermarks, or convert PDFs, your files are processed entirely inside your browser memory (RAM) using client-side WebAssembly and pdf-lib. Zero bytes of your documents or personal files are ever uploaded or transmitted to any external server.',
      actionText: 'Open PDF Power Tools',
      actionTarget: { type: 'tab', tab: 'pdf-tools' },
    },
    {
      id: 'faq-pdf-limits',
      category: 'pdf',
      categoryLabel: 'PDF Tools & Privacy',
      icon: FileText,
      question: 'Are there any file size or document count limitations on the PDF utilities?',
      answer:
        'Because all processing occurs directly on your device, there are no artificial server-side quotas or hourly rate limits. You can combine dozens of lecture modules, split multi-hundred-page textbooks, or watermark project reports smoothly, constrained solely by your local device available memory.',
      actionText: 'Launch Document Tools',
      actionTarget: { type: 'tab', tab: 'pdf-tools' },
    },

    // --- SCHOLARSHIPS HUB ---
    {
      id: 'faq-scholarships-types',
      category: 'scholarships',
      categoryLabel: 'Scholarships Hub',
      icon: GraduationCap,
      question: 'What types of scholarships are tracked in the MAN OF STUDY Scholarships Hub?',
      answer:
        'We monitor verified national, state, and corporate scholarship programs for undergraduate engineers. These include national schemes (National Scholarship Portal, Pragati & Saksham for girls/differently-abled, PMSS), Andhra Pradesh & Telangana state programs (Post-Matric Tuition Fee Reimbursement RTF, Maintenance Fee MTF, ePASS), and premier corporate CSR grants (Reliance Foundation, Tata Capital Pankh, Aditya Birla, HDFC Badhte Kadam, ONGC, and Google Generation).',
      actionText: 'Explore Scholarships Hub',
      actionTarget: { type: 'tab', tab: 'scholarships' },
    },
    {
      id: 'faq-scholarships-links',
      category: 'scholarships',
      categoryLabel: 'Scholarships Hub',
      icon: ExternalLink,
      question: 'Are the scholarship application links verified and direct?',
      answer:
        'Yes. Every opportunity in our directory is manually verified and links straight to the official government or trust portal (e.g. scholarships.gov.in, buddy4study, or corporate foundation sites). We provide explicit transparency on annual family income ceilings, minimum qualifying academic percentages, and application closing windows.',
      actionText: 'Check Eligibility & Apply',
      actionTarget: { type: 'tab', tab: 'scholarships' },
    },
    {
      id: 'faq-scholarships-docs',
      category: 'scholarships',
      categoryLabel: 'Scholarships Hub',
      icon: CheckCircle2,
      question: 'What core documents do engineering students need for scholarship applications?',
      answer:
        'Most engineering scholarship portals require: (1) Current Academic Year Bonafide Student Certificate, (2) Competent Authority Income Certificate with matching family PAN/Ration card, (3) Caste/Community Certificate (if applicable), (4) Class 10 & 12 Consolidated Marksheets, (5) Previous Semester CGPA Grade Cards, (6) College Admission Allotment Order with Tuition Fee Receipt, and (7) Active Savings Bank Account seeded with Aadhaar.',
      actionText: 'View Scholarships Radar',
      actionTarget: { type: 'tab', tab: 'scholarships' },
    },

    // --- PRIVACY POLICY & DATA INTEGRITY ---
    {
      id: 'faq-privacy-policy',
      category: 'privacy',
      categoryLabel: 'Privacy & Security',
      icon: ShieldCheck,
      question: 'How does MAN OF STUDY protect student data and comply with privacy best practices?',
      answer:
        'MAN OF STUDY is designed from the ground up to respect student digital autonomy. We do not require account registration, passwords, phone numbers, or academic profile harvesting. All calculations—including Attendance percentages, Internal/External score estimations, CGPA conversions, and resume parsing—run locally in your browser. We never monetize or sell personal student information.',
      actionText: 'Read Full Privacy Policy',
      actionTarget: { type: 'legal', modal: 'privacy' },
    },
    {
      id: 'faq-privacy-ads',
      category: 'privacy',
      categoryLabel: 'Privacy & Security',
      icon: Lock,
      question: 'How do website advertisements work, and can I dismiss them without tracking?',
      answer:
        'To cover bandwidth and domain hosting infrastructure while maintaining free student access, MAN OF STUDY utilizes non-intrusive native monetization units. If you dismiss or hide any ad unit, your choice is preserved for your active session and 24 hours locally in your browser storage (sessionStorage/localStorage). We never use intrusive pop-up loops, background redirects, or personal behavioral tracking.',
      actionText: 'View Compliance & Terms',
      actionTarget: { type: 'legal', modal: 'terms' },
    },
  ];

  const categories: { id: FaqCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'developer', label: 'About Developer & Mission', icon: User },
    { id: 'roadmaps', label: 'Engineering Roadmaps', icon: BookOpen },
    { id: 'pdf', label: 'PDF Tools & Security', icon: FileText },
    { id: 'scholarships', label: 'Scholarships Hub', icon: GraduationCap },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  ];

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return faqList.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery, faqList]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenFaqIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setOpenFaqIds(new Set());
  };

  const handleAction = (item: FaqItem) => {
    if (!item.actionTarget) return;

    if (item.actionTarget.type === 'tab' && onSelectTab) {
      onSelectTab(item.actionTarget.tab);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } else if (item.actionTarget.type === 'legal' && onOpenLegal) {
      onOpenLegal(item.actionTarget.modal);
    } else if (item.actionTarget.type === 'email') {
      window.location.href = 'mailto:support.jamord@gmail.com?subject=[MAN%20OF%20STUDY%20Inquiry]%20Student%20Query';
    }
  };

  return (
    <section
      id="student-faq-section"
      className="my-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
      aria-labelledby="faq-section-heading"
    >
      {/* Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-50 text-slate-900 p-6 sm:p-8 border-b border-slate-200">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Support &amp; Knowledge Base</span>
            </div>

            <h2
              id="faq-section-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Frequently Asked Questions
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Transparent answers regarding our 4-year engineering roadmaps, 100% private browser PDF tools, verified
              scholarships, data privacy policies, and the student mission behind MAN OF STUDY.
            </p>
          </div>

          {/* Search Bar & Fast Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="faq-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries (e.g. roadmaps, pdf security, B.Tech mission, scholarships)..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-800 px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="faq-expand-all-btn"
                type="button"
                onClick={expandAll}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 active:scale-98 text-xs font-bold text-slate-700 transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                Expand All
              </button>
              <button
                id="faq-collapse-all-btn"
                type="button"
                onClick={collapseAll}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 active:scale-98 text-xs font-bold text-slate-700 transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`faq-category-tab-${cat.id}`}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="p-4 sm:p-8 space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No questions matched your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for keywords like "developer", "scholarship", "privacy", "roadmaps", or "pdf".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              const Icon = faq.icon;

              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-sky-300 bg-sky-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Question Accordion Button */}
                  <button
                    type="button"
                    id={`faq-btn-${faq.id}`}
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                          isOpen
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 block">
                          {faq.categoryLabel}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600 bg-sky-100' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expandable Answer Body */}
                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="px-4 sm:px-5 pb-5 pt-1 border-t border-sky-100/60 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 animate-in fade-in duration-150"
                    >
                      <p className="pl-11.5 pr-2">{faq.answer}</p>

                      {faq.actionText && (
                        <div className="pl-11.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAction(faq)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer"
                          >
                            <span>{faq.actionText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Mission Callout */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                Built by a B.Tech Student for Engineering Scholars
              </h4>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                MAN OF STUDY was created by an engineering student dedicated to helping his fellow peers excel academically,
                demystify career roadmaps, discover life-changing scholarships, and protect their privacy with modern browser-first tools.
              </p>
            </div>
          </div>

          <a
            href="mailto:support.jamord@gmail.com?subject=[MAN%20OF%20STUDY%20Student%20Desk]%20Hello"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-98 border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs transition-all cursor-pointer min-h-[42px]"
          >
            <Mail className="w-4 h-4 text-sky-600" />
            <span>Write to the Developer</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StudentFaq;
