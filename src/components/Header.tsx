import React, { useState } from 'react';
import { Search, Menu, X, ChevronDown, Home, GraduationCap, Map, Trophy, Sparkles, BookOpen, ShieldCheck, FileText, Image as ImageIcon, Heart, Wrench, Route, Calculator, ClipboardCheck, Info, Mail } from 'lucide-react';
import { ToolTab, WorkspaceView, LegalModalType } from '../types';

export interface HeaderProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
  activeTab?: ToolTab;
  setActiveTab?: (tab: ToolTab) => void;
  onSelectEapcetPhase?: (phase: string) => void;
  onOpenLegal?: (type: LegalModalType) => void;
  onOpenCommandPalette?: () => void;
  onOpenSupport?: () => void;
}

type NavItem = { label: string; workspace: WorkspaceView; tab?: ToolTab; icon: React.ComponentType<{ className?: string }> };

const AP_TOOLS: NavItem[] = [
  { label: 'AP EAPCET College Predictor', workspace: 'ap-predictor', icon: Map },
  { label: 'AP EAPCET Rank Predictor', workspace: 'ap-rank-predictor', icon: Calculator },
  { label: 'AP Top B.Tech Colleges', workspace: 'ap-top-colleges', icon: Trophy },
  { label: 'AP Allotments — Namewise', workspace: 'ap-allotments', icon: ClipboardCheck },
  { label: 'AP EAPCET Vacancy Radar', workspace: 'eapcet-radar', icon: Search },
];
const TG_TOOLS: NavItem[] = [
  { label: 'TG EAPCET College Predictor', workspace: 'tg-predictor', icon: Map },
  { label: 'TG Top B.Tech Colleges', workspace: 'tg-top-colleges', icon: Trophy },
  { label: 'TG EAPCET Allotments — Namewise', workspace: 'tg-allotments', icon: ClipboardCheck },
];
const OTHER_TOOLS: NavItem[] = [
  { label: 'AI Student Gap Analyzer', workspace: 'gap-analyzer', icon: Sparkles },
  { label: 'Attendance Defender', workspace: 'attendance', icon: ShieldCheck },
  { label: 'Study Guides', workspace: 'guides', icon: BookOpen },
  { label: 'PDF Tools', workspace: 'utilities', tab: 'pdf-tools', icon: FileText },
  { label: 'Image Compressor', workspace: 'utilities', tab: 'resizer', icon: ImageIcon },
  { label: 'Engineering Roadmaps', workspace: 'roadmaps', icon: Route },
  { label: 'Internships Radar', workspace: 'internships', icon: GraduationCap },
  { label: 'Major Projects Hub', workspace: 'projects', icon: Wrench },
  { label: 'GPA Hub', workspace: 'gpa', icon: Calculator },
  { label: 'Academics', workspace: 'academics', icon: BookOpen },
];

export const Header: React.FC<HeaderProps> = ({ activeWorkspace = 'hub', onSelectWorkspace, setActiveTab, onOpenCommandPalette, onOpenLegal, onOpenSupport }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'ap' | 'tg' | 'other' | null>(null);

  const navigate = (item: NavItem) => {
    if (item.tab && setActiveTab) setActiveTab(item.tab);
    onSelectWorkspace?.(item.workspace);
    setMobileOpen(false);
    setOpenMenu(null);
  };
  const goHome = () => {
    onSelectWorkspace?.('hub');
    setMobileOpen(false);
    setOpenMenu(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Dropdown = ({ label, menu, items }: { label: string; menu: 'ap' | 'tg' | 'other'; items: NavItem[] }) => (
    <div className="relative">
      <button type="button" onClick={() => setOpenMenu(openMenu === menu ? null : menu)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors" aria-expanded={openMenu === menu}>
        {label}<ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === menu ? 'rotate-180' : ''}`} />
      </button>
      {openMenu === menu && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-cyan-400/15 bg-[#07101d]/98 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl z-[80]">
          {items.map((item) => { const Icon = item.icon; return (
            <button key={`${menu}-${item.label}`} type="button" onClick={() => navigate(item)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-cyan-400/10 hover:text-white transition-colors">
              <span className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-300/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-cyan-300" /></span>
              <span className="leading-tight">{item.label}</span>
            </button>
          ); })}
        </div>
      )}
    </div>
  );

  return (
    <header id="main-header" className="mos-k-nav sticky top-0 z-50 w-full text-white shadow-lg shadow-black/20">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-3 sm:px-5 lg:px-7">
        <button type="button" id="brand-logo" onClick={goHome} className="group flex min-w-0 shrink-0 items-center gap-2.5 text-left" aria-label="Naa College home">
          <span className="mos-brand-mark relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/15 bg-[#07101d] p-0.5 shadow-lg" aria-hidden="true">
            <img src="/Naa%20College%20logo.webp" alt="" width="40" height="40" className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105" loading="eager" />
          </span>
          <span className="min-w-0 sm:block">
            <span className="mos-brand-wordmark block whitespace-nowrap text-[17px] font-black tracking-[-0.03em] text-white sm:text-[19px]">Naa College</span>
            <span className="mos-brand-tagline block whitespace-nowrap text-[9px] font-medium tracking-[0.08em] text-slate-500 uppercase">Student utility platform</span>
          </span>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">
          <button type="button" onClick={goHome} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${activeWorkspace === 'hub' ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}><Home className="w-4 h-4" /> Home</button>
          <a href="/blog/" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/8 hover:text-white">Blog</a>
          <Dropdown label="For AP" menu="ap" items={AP_TOOLS} />
          <Dropdown label="For TG" menu="tg" items={TG_TOOLS} />
          <button type="button" onClick={() => navigate({ label: 'Scholarships', workspace: 'scholarships', icon: GraduationCap })} className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${activeWorkspace === 'scholarships' ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}>Scholarships</button>
          <button type="button" onClick={() => navigate({ label: 'Mock Tests', workspace: 'mock-tests', icon: GraduationCap })} className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${['mock-tests','cbt-mock-test','eapcet-cbt'].includes(activeWorkspace) ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}>Mock Tests</button>
          <Dropdown label="Other Tools" menu="other" items={OTHER_TOOLS} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" id="header-command-palette-trigger" onClick={onOpenCommandPalette} className="hidden lg:inline-flex h-9 items-center gap-2 rounded-xl border border-cyan-300/10 bg-white/5 px-2.5 text-slate-300 hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-white transition-colors sm:px-3" title="Search tools" aria-label="Search Naa College tools"><Search className="h-4 w-4 text-cyan-300" /><span className="hidden xl:inline text-xs font-medium">Search tools</span></button>
          <button type="button" id="header-support-btn" onClick={onOpenSupport} className="inline-flex h-9 w-9 sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-0 sm:px-3 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 hover:text-white transition-colors" aria-label="Support Naa College" title="Support Naa College"><Heart className="h-3.5 w-3.5" /><span className="hidden sm:inline">Support</span></button>
          <button type="button" onClick={() => setMobileOpen((v) => !v)} id="header-hamburger-drawer-btn" className="order-first inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-white/5 text-slate-200 hover:bg-cyan-400/10 lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mos-mobile-navigation-panel" className="border-t border-cyan-300/10 bg-[#040b16] px-3 pb-4 pt-2 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            <button type="button" onClick={goHome} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10">Home</button>
            <a href="/blog/" onClick={() => setMobileOpen(false)} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10">Blog</a>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenCommandPalette?.(); }} id="mobile-search-tools" className="group mb-2 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/[0.10] to-cyan-300/[0.06] px-3.5 py-3 text-left shadow-lg shadow-cyan-950/10 transition hover:border-cyan-300/35 hover:bg-cyan-400/[0.14]" aria-label="Search Naa College tools">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-[#07101d] text-cyan-300"><Search className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">Search Naa College</span><span className="mt-0.5 block text-[11px] text-slate-400">Find tools by name or what you need</span></span>
              <span className="text-lg text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300">⌕</span>
            </button>
            <MobileGroup title="For AP" items={AP_TOOLS} onSelect={navigate} />
            <MobileGroup title="For TG" items={TG_TOOLS} onSelect={navigate} />
            <button type="button" onClick={() => navigate({ label: 'Scholarships', workspace: 'scholarships', icon: GraduationCap })} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10">Scholarships</button>
            <button type="button" onClick={() => navigate({ label: 'Mock Tests', workspace: 'mock-tests', icon: GraduationCap })} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-cyan-400/10">Mock Tests</button>
            <MobileGroup title="Other Tools" items={OTHER_TOOLS} onSelect={navigate} />
            <div className="mt-3 border-t border-white/8 pt-3">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">About & Information</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setMobileOpen(false); onOpenLegal?.('about'); }} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-white"><Info className="h-4 w-4 shrink-0 text-cyan-300" />About Us</button>
                <button type="button" onClick={() => { setMobileOpen(false); onOpenLegal?.('privacy'); }} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-white"><ShieldCheck className="h-4 w-4 shrink-0 text-cyan-300" />Privacy Policy</button>
                <button type="button" onClick={() => { setMobileOpen(false); onOpenLegal?.('terms'); }} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-white"><FileText className="h-4 w-4 shrink-0 text-cyan-300" />Terms of Service</button>
                <button type="button" onClick={() => { setMobileOpen(false); onOpenLegal?.('contact'); }} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-white"><Mail className="h-4 w-4 shrink-0 text-cyan-300" />Contact Developer</button>
              </div>
            </div>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenSupport?.(); }} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-3 py-3 text-sm font-bold text-cyan-200"><Heart className="h-4 w-4" /> Support Naa College</button>
          </div>
        </div>
      )}
    </header>
  );
};

const MobileGroup: React.FC<{ title: string; items: NavItem[]; onSelect: (item: NavItem) => void }> = ({ title, items, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  return <div className="rounded-xl border border-cyan-300/8 bg-white/[0.02]">
    <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-slate-200">{title}<ChevronDown className={`h-4 w-4 text-cyan-300 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
    {expanded && <div className="border-t border-cyan-300/8 p-1">{items.map((item) => { const Icon = item.icon; return <button key={`${title}-${item.label}`} type="button" onClick={() => onSelect(item)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-cyan-400/10 hover:text-white"><Icon className="h-4 w-4 shrink-0 text-cyan-300" />{item.label}</button>; })}</div>}
  </div>;
};

export default Header;
