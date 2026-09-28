import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, GraduationCap, ExternalLink, Calendar, IndianRupee, Share2,
  Copy, Check, ShieldCheck, Sparkles, ArrowUpRight, SlidersHorizontal,
  Building2, Clock3, BadgeCheck, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { ScholarshipDetailsModal } from './ScholarshipDetailsModal';

export interface IndianScholarship {
  id: string;
  title: string;
  provider: string;
  category: string;
  target: string;
  eligibility: string;
  amount: string;
  deadline: string;
  apply_link: string;
  status?: string;
  source_note?: string;
  last_verified?: string;
}

export function isExclusivelyForGirls(s: IndianScholarship): boolean {
  const text = (s.title + ' ' + s.target + ' ' + s.eligibility).toLowerCase();
  return (
    ['aicte-pragati-2026', 'kotak-kanya-2026', 'amazon-afe-2026', 'loreal-women-science-2026',
      'begum-hazrat-mahal-2026', 'santoor-2026', 'rolls-royce-unnati-2026'].includes(s.id) ||
    text.includes('girl students only') ||
    text.includes('female students') ||
    text.includes('for young women') ||
    text.includes('girl student')
  );
}

export function getScholarshipSummary(s: IndianScholarship): string {
  const text = s.eligibility || '';
  if (text.length <= 150) return text;
  return text.slice(0, 147).trimEnd() + '…';
}

type Filter = 'all' | 'open' | 'government' | 'private' | 'state' | 'engineering' | 'girls';

const categoryClass = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('state')) return 'border-violet-400/20 bg-violet-400/10 text-violet-300';
  if (c.includes('government')) return 'border-sky-400/20 bg-sky-400/10 text-sky-300';
  return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
};

const isOpen = (s: IndianScholarship) => (s.status || '').toLowerCase().includes('open');

type ScholarshipVisualTheme = {
  scene: string;
  accent: string;
};

const scholarshipVisualThemes: Record<string, ScholarshipVisualTheme> = {
  'central-sector-csss-2026': { scene: 'Indian university student studying with books and laptop in a modern campus library, academic achievement and opportunity', accent: 'from-sky-500/80 to-indigo-700/80' },
  'top-class-sc-2026': { scene: 'Indian college student in a modern university setting, inclusive higher education, academic excellence, confident future', accent: 'from-indigo-500/80 to-violet-700/80' },
  'pm-yasasvi-top-class-college-2026': { scene: 'Indian undergraduate student in a contemporary college campus, education opportunity, books and laptop, hopeful future', accent: 'from-cyan-500/80 to-blue-700/80' },
  'aicte-pragati-2026': { scene: 'Indian female engineering student working on a laptop with subtle engineering and technology elements in a university lab', accent: 'from-fuchsia-500/80 to-rose-700/80' },
  'aicte-saksham-2026': { scene: 'Indian engineering student with accessible modern university technology and inclusive campus environment, optimistic academic setting', accent: 'from-teal-500/80 to-cyan-700/80' },
  'aicte-swanath-2026': { scene: 'Indian college student studying independently in a supportive modern academic environment, resilience and educational opportunity', accent: 'from-emerald-500/80 to-teal-700/80' },
  'inspire-she-2026': { scene: 'Indian science student in a bright research laboratory with books, microscope and subtle scientific atmosphere', accent: 'from-violet-500/80 to-fuchsia-700/80' },
  'post-matric-sc-2026': { scene: 'Indian college student from a diverse campus community studying with laptop and books, higher education opportunity', accent: 'from-blue-500/80 to-indigo-700/80' },
  'post-matric-obc-2026': { scene: 'Indian student in a university classroom studying with laptop and books, educational opportunity and achievement', accent: 'from-amber-500/80 to-orange-700/80' },
  'post-matric-minority-2026': { scene: 'diverse Indian university students studying together in a modern campus library, inclusive education and opportunity', accent: 'from-slate-500/80 to-blue-700/80' },
  'reliance-ug-2026': { scene: 'Indian first-year university student with laptop and books in a premium modern campus, technology and academic ambition', accent: 'from-blue-500/80 to-cyan-700/80' },
  'reliance-pg-2026': { scene: 'Indian postgraduate student working on advanced computer science and technology research in a modern university lab', accent: 'from-cyan-500/80 to-blue-800/80' },
  'hdfc-ecss-2026': { scene: 'Indian college student studying with laptop and books in a warm modern academic environment, support and opportunity', accent: 'from-emerald-500/80 to-green-700/80' },
  'tata-pankh-2026': { scene: 'Indian student on a modern university campus with a subtle uplifting light and abstract wing-like shapes suggesting opportunity and growth', accent: 'from-orange-500/80 to-amber-700/80' },
  'lic-golden-jubilee-2026': { scene: 'Indian university student receiving an academic opportunity in a dignified modern campus setting, achievement and education', accent: 'from-yellow-500/80 to-amber-700/80' },
};

const getScholarshipVisualTheme = (s: IndianScholarship): ScholarshipVisualTheme => {
  if (scholarshipVisualThemes[s.id]) return scholarshipVisualThemes[s.id];
  const text = (s.title + ' ' + s.target + ' ' + s.category).toLowerCase();
  if (/girl|women|female/.test(text)) {
    return { scene: 'Indian female university student studying with laptop and books in a modern campus, education and opportunity', accent: 'from-fuchsia-500/80 to-rose-700/80' };
  }
  if (/science|research|stem|technology|engineering|computer/.test(text)) {
    return { scene: 'Indian engineering or science student working with laptop and modern academic technology in a university lab', accent: 'from-cyan-500/80 to-blue-700/80' };
  }
  if (/government|central|state/.test(text)) {
    return { scene: 'Indian university student studying with books and laptop in a modern public university campus, education opportunity', accent: 'from-sky-500/80 to-indigo-700/80' };
  }
  return { scene: 'Indian university student studying with books and laptop in a modern campus, education opportunity and academic growth', accent: 'from-emerald-500/80 to-teal-700/80' };
};

const getScholarshipAiImageUrl = (s: IndianScholarship): string => {
  const theme = getScholarshipVisualTheme(s);
  const prompt = [
    'premium editorial scholarship website hero illustration',
    theme.scene,
    'photorealistic but polished, natural Indian setting, cinematic soft lighting, sophisticated blue and emerald educational palette',
    'clean composition with empty darker space around the lower-left area for a website text overlay',
    'no logos, no brand marks, no seals, no government emblems, no watermarks, no readable text, no letters, no fake certificates',
    '16:9 horizontal composition'
  ].join(', ');
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&nologo=true`;
};

const ScholarshipVisual: React.FC<{ scholarship: IndianScholarship; compact?: boolean }> = ({ scholarship, compact = false }) => {
  const theme = getScholarshipVisualTheme(scholarship);
  const [failed, setFailed] = useState(false);
  const titleParts = scholarship.title.split(/[:—–]/).map(part => part.trim()).filter(Boolean);

  return (
    <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-48'} w-full bg-slate-900`}>
      {!failed ? (
        <img
          src={getScholarshipAiImageUrl(scholarship)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.accent}`}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/15 bg-white/10 blur-sm" />
          <div className="absolute -left-8 bottom-[-50px] h-40 w-40 rounded-full border border-white/10 bg-black/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="max-w-[92%] text-white drop-shadow-lg">
          <div className="text-[9px] font-black uppercase tracking-[.18em] text-emerald-200/90">Scholarship opportunity</div>
          <div className="mt-1 text-base sm:text-lg font-black leading-tight">{titleParts[0]}</div>
          {titleParts[1] && <div className="text-xs sm:text-sm font-bold leading-tight text-white/90">{titleParts.slice(1).join(' — ')}</div>}
        </div>
      </div>
    </div>
  );
};

export const ScholarshipsHub: React.FC = () => {
  const [scholarships, setScholarships] = useState<IndianScholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<IndianScholarship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/indian_scholarships.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid scholarship data');
      setScholarships(data);
    } catch {
      setLoadError('Scholarship data could not be loaded. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => ({
    total: scholarships.length,
    open: scholarships.filter(isOpen).length,
    government: scholarships.filter(s => /government|state government/i.test(s.category)).length,
    engineering: scholarships.filter(s => /engineer|b\\.tech|technical|professional|computer science|diploma/i.test(
      (s.title + ' ' + s.target + ' ' + s.eligibility).toLowerCase()
    )).length,
  }), [scholarships]);

  const featured = useMemo(() => scholarships.filter(s =>
    ['central-sector-csss-2026', 'aicte-pragati-2026', 'reliance-ug-2026', 'hdfc-ecss-2026',
      'tata-pankh-2026', 'lic-golden-jubilee-2026', 'ugc-pg-2026'].includes(s.id)
  ), [scholarships]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scholarships.filter(s => {
      const text = (s.title + ' ' + s.provider + ' ' + s.category + ' ' + s.target + ' ' +
        s.eligibility + ' ' + s.amount + ' ' + s.deadline).toLowerCase();

      const filterMatch =
        filter === 'all' ? true :
        filter === 'open' ? isOpen(s) :
        filter === 'government' ? /government/i.test(s.category) :
        filter === 'state' ? /state government/i.test(s.category) :
        filter === 'private' ? /private|csr/i.test(s.category) :
        filter === 'engineering' ? /engineer|b\\.tech|technical|professional|computer science|diploma/i.test(text) :
        filter === 'girls' ? isExclusivelyForGirls(s) : true;

      return filterMatch && (!q || text.includes(q));
    });
  }, [scholarships, searchQuery, filter]);

  const currentFeatured = featured[featuredIndex % Math.max(featured.length, 1)];

  const copyLink = async (s: IndianScholarship) => {
    try {
      await navigator.clipboard.writeText(s.apply_link);
      setCopiedId(s.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const share = (s: IndianScholarship) => {
    const text = `🎓 ${s.title}\\n💰 ${s.amount}\\n🎯 ${s.target}\\n📅 ${s.deadline}\\n\\nApply: ${s.apply_link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const filterButtons: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'open', label: 'Open now', count: stats.open },
    { id: 'government', label: 'Government', count: scholarships.filter(s => /government/i.test(s.category)).length },
    { id: 'private', label: 'Private / CSR', count: scholarships.filter(s => /private|csr/i.test(s.category)).length },
    { id: 'state', label: 'State schemes', count: scholarships.filter(s => /state government/i.test(s.category)).length },
    { id: 'engineering', label: 'Engineering', count: stats.engineering },
    { id: 'girls', label: 'For girls', count: scholarships.filter(isExclusivelyForGirls).length },
  ];

  return (
    <section className="mos-scholarships-hub w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6 text-[var(--mos-text-primary)]">
      <div className="mos-scholarship-hero relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,.18),_transparent_34%),linear-gradient(135deg,#0b1220,#101a2c)] p-5 sm:p-7 lg:p-9 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.3fr_.7fr] gap-7 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" /> 2026 Scholarship Directory
            </div>
            <h1 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Find scholarships with the <span className="text-emerald-300">amount upfront.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-slate-300">
              Government, state and verified private/CSR opportunities — with award amounts, eligibility, deadlines, status and application sources clearly separated.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-slate-300">No hidden reward amounts</span>
              <span className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-slate-300">Official-source first</span>
              <span className="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-slate-300">Verified 22 Sep 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Opportunities', stats.total, GraduationCap],
              ['Open / active', stats.open, Clock3],
              ['Government', stats.government, ShieldCheck],
              ['Engineering-friendly', stats.engineering, Sparkles],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
                <Icon className="h-4 w-4 text-emerald-300" />
                <div className="mt-3 text-xl sm:text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentFeatured && (
        <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-emerald-600 dark:text-emerald-400 font-bold">Featured opportunity</div>
              <div className="mt-1 text-sm text-[var(--mos-text-muted)]">High-interest programmes in the current directory</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFeaturedIndex(i => (i - 1 + featured.length) % featured.length)} className="p-2 rounded-lg border border-[var(--mos-border)] hover:border-[var(--mos-border-strong)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] cursor-pointer" aria-label="Previous featured scholarship">‹</button>
              <button onClick={() => setFeaturedIndex(i => (i + 1) % featured.length)} className="p-2 rounded-lg border border-[var(--mos-border)] hover:border-[var(--mos-border-strong)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] cursor-pointer" aria-label="Next featured scholarship">›</button>
            </div>
          </div>
          <button onClick={() => setSelectedScholarship(currentFeatured)} className="group w-full text-left rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] hover:border-emerald-500/40 transition-colors cursor-pointer overflow-hidden">
            <ScholarshipVisual scholarship={currentFeatured} compact />
            <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${categoryClass(currentFeatured.category)}`}>{currentFeatured.category}</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{currentFeatured.status || 'Cycle-based'}</span>
                </div>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-[var(--mos-text-primary)]">{currentFeatured.title}</h2>
                <p className="mt-1 text-xs text-[var(--mos-text-muted)]">{currentFeatured.provider} • {currentFeatured.target}</p>
              </div>
              <div className="lg:min-w-[300px] rounded-xl border border-emerald-500/20 bg-[var(--mos-surface)] p-4 shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Scholarship amount</div>
                <div className="mt-1 text-base sm:text-lg font-black text-[var(--mos-text-primary)]">{currentFeatured.amount}</div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--mos-text-muted)]"><Calendar className="h-3.5 w-3.5" /> {currentFeatured.deadline}</div>
              </div>
              <ArrowUpRight className="hidden lg:block h-5 w-5 text-[var(--mos-text-muted)]" />
            </div>
          </button>
        </div>
      )}

      <div className="sticky top-2 z-20 rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)]/95 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mos-text-muted)]" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship, provider, engineering, SC, girls, amount, course…"
              className="w-full rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-10 py-3 text-sm text-[var(--mos-text-primary)] placeholder:text-[var(--mos-text-muted)] outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)]" aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <SlidersHorizontal className="h-4 w-4 text-[var(--mos-text-muted)] shrink-0" />
            {filterButtons.map(btn => (
              <button key={btn.id} onClick={() => setFilter(btn.id)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${filter === btn.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--mos-border)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)] hover:border-[var(--mos-border-strong)]'}`}>
                {btn.label} <span className={filter === btn.id ? 'opacity-90' : 'text-[var(--mos-text-muted)]'}>· {btn.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-600 dark:text-red-300">
          <span>{loadError}</span>
          <button onClick={loadData} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/20 px-3 py-1.5 font-bold hover:bg-red-400/10 cursor-pointer"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--mos-text-primary)]">Scholarship opportunities</h2>
          <p className="text-xs text-[var(--mos-text-muted)] mt-1">Showing {filtered.length} of {scholarships.length} entries</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--mos-text-muted)]"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Amounts are displayed as published / verified for the listed scheme.</div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-80 rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const girls = isExclusivelyForGirls(s);
            return (
              <article key={s.id} className="group flex flex-col rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] hover:border-emerald-500/40 transition-all overflow-hidden shadow-xs">
                <ScholarshipVisual scholarship={s} />
                <div className="p-4 sm:p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div>
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-bold text-[var(--mos-text-muted)]">{s.provider}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${categoryClass(s.category)}`}>{s.category}</span>
                          {girls && <span className="rounded-md border border-pink-400/20 bg-pink-400/10 px-1.5 py-0.5 text-[9px] font-bold text-pink-600 dark:text-pink-300">Girls</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${isOpen(s) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-muted)]'}`}>{s.status || 'Cycle-based'}</span>
                  </div>

                  <h3 className="mt-4 text-[15px] font-bold leading-6 text-[var(--mos-text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{s.title}</h3>

                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[.05] p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-600 dark:text-emerald-400"><IndianRupee className="h-3 w-3" /> Amount / benefit</div>
                    <div className="mt-1.5 text-sm font-black leading-5 text-[var(--mos-text-primary)]">{s.amount}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3">
                      <div className="text-[var(--mos-text-muted)]">Who can apply</div>
                      <div className="mt-1 line-clamp-3 text-[var(--mos-text-secondary)]">{s.target}</div>
                    </div>
                    <div className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3">
                      <div className="text-[var(--mos-text-muted)]">Deadline</div>
                      <div className="mt-1 line-clamp-3 text-[var(--mos-text-secondary)]">{s.deadline}</div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-[var(--mos-text-muted)]">{getScholarshipSummary(s)}</p>
                </div>

                <div className="border-t border-[var(--mos-border)] p-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setSelectedScholarship(s)} className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-2.5 text-[11px] font-bold text-[var(--mos-text-primary)] hover:border-[var(--mos-border-strong)] cursor-pointer">View details</button>
                    <a href={s.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 text-[11px] font-black cursor-pointer transition-colors">Apply / source <ExternalLink className="h-3.5 w-3.5" /></a>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button onClick={() => share(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--mos-text-muted)] hover:text-emerald-500 cursor-pointer"><Share2 className="h-3 w-3" /> Share</button>
                    <button onClick={() => copyLink(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)] cursor-pointer">
                      {copiedId === s.id ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy source</>}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--mos-border)] bg-[var(--mos-surface-muted)] py-14 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-[var(--mos-text-muted)]" />
          <h3 className="mt-3 font-bold text-[var(--mos-text-primary)]">No matching scholarships</h3>
          <p className="mt-1 text-xs text-[var(--mos-text-muted)]">Try another keyword or reset the filters.</p>
          <button onClick={() => {setSearchQuery(''); setFilter('all');}} className="mt-4 rounded-xl bg-[var(--mos-surface)] border border-[var(--mos-border)] px-4 py-2 text-xs font-bold text-[var(--mos-text-primary)] cursor-pointer">Reset filters</button>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <div>
            <h3 className="font-bold text-[var(--mos-text-primary)]">How Man of Study handles scholarship data</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--mos-text-muted)]">
              Award amounts are intentionally shown instead of hidden behind a button. “Open”, “Cycle-based” and “State scheme” describe the directory status, not a guarantee of eligibility. Always confirm the final amount, documents and closing date on the linked application/source page before submitting.
            </p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            ['1', 'Read eligibility', 'Check category, course, marks, income and institution rules.'],
            ['2', 'Check the amount', 'The card shows the published award or clearly says when it varies.'],
            ['3', 'Apply at source', 'Use the linked official/partner application page and never pay an agent.'],
          ].map(([n,t,d]) => (
            <div key={n} className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3.5">
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{n}</div>
              <div className="mt-1 text-xs font-bold text-[var(--mos-text-primary)]">{t}</div>
              <div className="mt-1 text-[10px] leading-4 text-[var(--mos-text-muted)]">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedScholarship && <ScholarshipDetailsModal scholarship={selectedScholarship} onClose={() => setSelectedScholarship(null)} />}
    </section>
  );
};

export const ScholarshipsRadar = ScholarshipsHub;
