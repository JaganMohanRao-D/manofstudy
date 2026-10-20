import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
  BookOpen,
  FileCheck2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Mail,
  Compass,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'all' | 'mission' | 'roadmaps' | 'pdf' | 'scholarships' | 'eapcet';
  categoryLabel: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
  actionText?: string;
  actionTarget?: {
    type: 'workspace' | 'legal' | 'email';
    target?: string;
    modal?: 'privacy' | 'terms' | 'disclaimer';
  };
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-mission-story',
    category: 'mission',
    categoryLabel: 'Mission & Vision',
    icon: Sparkles,
    question: 'Why was NAA COLLEGE built, and who is behind it?',
    answer:
      'NAA COLLEGE was created by engineering student Dunna Jagan Mohan Rao to bring useful academic resources and practical tools together for students in India.',
    actionText: 'Learn About the Vision',
    actionTarget: { type: 'workspace', target: 'about' },
  },
  {
    id: 'faq-roadmap-guidance',
    category: 'roadmaps',
    categoryLabel: 'Engineering Roadmaps',
    icon: Compass,
    question: 'How are the 4-year engineering roadmaps organized?',
    answer:
      'Our roadmaps span 10+ core engineering branches (CSE, AI/ML, Data Science, ECE, EEE, Mechanical, Civil, Chemical, etc.). Each roadmap divides your college journey semester-by-semester across Foundational Core, Deep Technical Specialization, Industry Certifications, Open-Source Projects, and Placement/GATE Prep.',
    actionText: 'Explore Engineering Roadmaps',
    actionTarget: { type: 'workspace', target: 'roadmaps' },
  },
  {
    id: 'faq-pdf-security',
    category: 'pdf',
    categoryLabel: 'PDF Tools & Privacy',
    icon: ShieldCheck,
    question: 'Are my uploaded PDF files and documents stored on your servers?',
    answer:
      'Many PDF operations, such as merging, splitting, and conversion, run in your browser. The AI PDF summariser extracts text and sends it to Google Gemini for processing. Do not submit Aadhaar details, hall tickets, marksheets, or other sensitive information to AI features. Check the description of the specific tool before using it.',
    actionText: 'Launch Private PDF Studio',
    actionTarget: { type: 'workspace', target: 'pdftools' },
  },
  {
    id: 'faq-scholarship-verification',
    category: 'scholarships',
    categoryLabel: 'Scholarships Directory',
    icon: GraduationCap,
    question: 'How do you verify scholarships and grants listed on the platform?',
    answer:
      'Scholarship records include the source notes and links available to us, but details may be incomplete or change. Check eligibility, current deadlines, required documents, and benefits directly with the scheme provider before applying.',
    actionText: 'View 2026 Scholarships',
    actionTarget: { type: 'workspace', target: 'scholarships' },
  },
  {
    id: 'faq-eapcet-allotments',
    category: 'eapcet',
    categoryLabel: 'EAPCET Counseling',
    icon: BookOpen,
    question: 'How does the TG / AP EAPCET counseling explorer work?',
    answer:
      'Our EAPCET intelligence system is indexed directly from official government final-phase counseling allotments. Students can explore candidate cutoffs, filter by reservation quota (OC, BC-A/B/C/D/E, SC, ST, EWS), analyze gender cutoffs, and use our rank predictor to estimate realistic admissions.',
    actionText: 'Open TG EAPCET Explorer',
    actionTarget: { type: 'workspace', target: 'tg-eapcet' },
  },
  {
    id: 'faq-platform-support',
    category: 'mission',
    categoryLabel: 'Platform Support',
    icon: UserCheck,
    question: 'Is NAA COLLEGE free to use, and how is it supported?',
    answer:
      'NAA COLLEGE provides free access to student tools and resources. Voluntary contributions help cover practical technical costs, and the website may display advertising to support ongoing development.',
    actionText: 'Support NAA COLLEGE',
    actionTarget: { type: 'workspace', target: 'support' },
  },
  {
    id: 'faq-privacy-legal',
    category: 'mission',
    categoryLabel: 'Data & Privacy',
    icon: FileCheck2,
    question: 'What personal data does NAA COLLEGE collect from students?',
    answer:
      'Public academic tools generally do not require sign-in. Some collaborative features use Firebase authentication, and AI-assisted features may send submitted text to Google Gemini. Review the relevant privacy disclosures and avoid submitting sensitive personal information.',
    actionText: 'Read Privacy Policy',
    actionTarget: { type: 'legal', modal: 'privacy' },
  },
  {
    id: 'faq-internships-careers',
    category: 'roadmaps',
    categoryLabel: 'Career & Internships',
    icon: Briefcase,
    question: 'Where can I find verified internships for 1st, 2nd, and 3rd year students?',
    answer:
      'Check out our Student Internship Radar. We filter real corporate portals (Google Summer of Code, Microsoft Engage, ISRO START, DRDO apprenticeships, AICTE Internships) categorized by academic year suitability, stipend transparency, and official verification badges.',
    actionText: 'Go to Internship Radar',
    actionTarget: { type: 'workspace', target: 'internships' },
  },
];

interface StudentFaqProps {
  onSelectWorkspace?: (wsId: string) => void;
  onOpenLegal?: (modal: 'privacy' | 'terms' | 'disclaimer') => void;
  onOpenSupport?: () => void;
}

export const StudentFaq: React.FC<StudentFaqProps> = ({
  onSelectWorkspace,
  onOpenLegal,
  onOpenSupport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set());

  const categories = [
    { id: 'all', label: 'All Queries', icon: HelpCircle },
    { id: 'mission', label: 'Mission & Ethics', icon: Sparkles },
    { id: 'roadmaps', label: 'Roadmaps & Prep', icon: Compass },
    { id: 'pdf', label: 'Private PDF Studio', icon: ShieldCheck },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'eapcet', label: 'EAPCET Intelligence', icon: BookOpen },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

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
    setOpenFaqIds(new Set(FAQ_ITEMS.map((f) => f.id)));
  };

  const collapseAll = () => {
    setOpenFaqIds(new Set());
  };

  const handleAction = (item: FaqItem) => {
    if (!item.actionTarget) return;

    if (item.actionTarget.type === 'workspace') {
      if (item.actionTarget.target === 'support' && onOpenSupport) {
        onOpenSupport();
      } else if (onSelectWorkspace && item.actionTarget.target) {
        onSelectWorkspace(item.actionTarget.target);
      }
    } else if (item.actionTarget.type === 'legal' && onOpenLegal && item.actionTarget.modal) {
      onOpenLegal(item.actionTarget.modal);
    } else if (item.actionTarget.type === 'email') {
      window.location.href = 'mailto:support.jamord@gmail.com?subject=[Naa%20College%20Inquiry]%20Student%20Query';
    }
  };

  return (
    <section
      id="student-faq-section"
      className="mos-k-faq my-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
      aria-labelledby="faq-section-heading"
    >
      {/* Container Card */}
      <div className="bg-[var(--mos-surface)] rounded-3xl border border-[var(--mos-border)] shadow-sm overflow-hidden text-[var(--mos-text-primary)]">
        {/* Header Banner */}
        <div className="bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] p-6 sm:p-8 border-b border-[var(--mos-border)]">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Student Support &amp; Knowledge Base</span>
            </div>

            <h2
              id="faq-section-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--mos-text-primary)] leading-tight"
            >
              Frequently Asked Questions
            </h2>

            <p className="text-sm sm:text-base text-[var(--mos-text-secondary)] leading-relaxed">
              Transparent answers regarding our engineering roadmaps, browser-based PDF utilities, scholarship information, data privacy policies, and
              scholarships, data privacy policies, and the student mission behind NAA COLLEGE.
            </p>
          </div>

          {/* Search Bar & Fast Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--mos-text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="faq-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries (e.g. roadmaps, pdf security, B.Tech mission, scholarships)..."
                className="w-full pl-11 pr-4 py-3 bg-[var(--mos-input-bg)] border border-[var(--mos-input-border)] rounded-2xl text-xs sm:text-sm text-[var(--mos-text-primary)] placeholder:text-[var(--mos-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)] px-1.5 py-0.5 rounded-md hover:bg-[var(--mos-surface-muted)]"
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
                className="px-4 py-3 rounded-2xl bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] active:scale-98 text-xs font-bold text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                Expand All
              </button>
              <button
                id="faq-collapse-all-btn"
                type="button"
                onClick={collapseAll}
                className="px-4 py-3 rounded-2xl bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] active:scale-98 text-xs font-bold text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] transition-all cursor-pointer min-h-[44px] shadow-2xs"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="bg-[var(--mos-surface-muted)] border-b border-[var(--mos-border)] p-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                    : 'bg-[var(--mos-surface)] text-[var(--mos-text-secondary)] border border-[var(--mos-border)] hover:bg-[var(--mos-surface-muted)] hover:text-[var(--mos-text-primary)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[var(--mos-text-muted)]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="p-4 sm:p-8 space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[var(--mos-surface-muted)] rounded-2xl border border-dashed border-[var(--mos-border)]">
              <HelpCircle className="w-10 h-10 text-[var(--mos-text-muted)] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[var(--mos-text-primary)]">No questions matched your search</h3>
              <p className="text-xs text-[var(--mos-text-muted)] mt-1 max-w-sm mx-auto">
                Try searching for keywords like "developer", "scholarship", "privacy", "roadmaps", or "pdf".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--mos-text-primary)] text-[var(--mos-page-bg)] text-xs font-bold cursor-pointer"
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
                      ? 'border-sky-500/40 bg-sky-500/[.05] shadow-xs'
                      : 'border-[var(--mos-border)] bg-[var(--mos-surface)] hover:border-[var(--mos-border-strong)]'
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
                            : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                          {faq.categoryLabel}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--mos-text-primary)] leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600 dark:text-sky-400 bg-sky-500/10' : 'text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expandable Answer Body */}
                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="px-4 sm:px-5 pb-5 pt-1 border-t border-sky-500/20 text-xs sm:text-sm text-[var(--mos-text-secondary)] leading-relaxed space-y-4 animate-in fade-in duration-150"
                    >
                      <p className="pl-11.5 pr-2">{faq.answer}</p>

                      {faq.actionText && (
                        <div className="pl-11.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAction(faq)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer"
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
        <div className="bg-[var(--mos-surface-muted)] border-t border-[var(--mos-border)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-[var(--mos-text-primary)]">
                Built by a B.Tech Student for Engineering Scholars
              </h4>
              <p className="text-xs text-[var(--mos-text-secondary)] max-w-2xl leading-relaxed">
                NAA COLLEGE was created by an engineering student dedicated to helping his fellow peers excel academically,
                demystify career roadmaps, discover life-changing scholarships, and protect their privacy with modern browser-first tools.
              </p>
            </div>
          </div>

          <a
            href="mailto:support.jamord@gmail.com?subject=[MAN%20OF%20STUDY%20Student%20Desk]%20Hello"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] active:scale-98 border border-[var(--mos-border)] text-[var(--mos-text-primary)] font-bold text-xs shadow-2xs transition-all cursor-pointer min-h-[42px]"
          >
            <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Write to the Developer</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StudentFaq;
