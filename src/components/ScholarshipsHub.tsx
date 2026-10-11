import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, GraduationCap, ExternalLink, Calendar, IndianRupee, Share2,
  Copy, Check, ShieldCheck, ArrowUpRight, SlidersHorizontal,
  BadgeCheck, RefreshCw, X
} from 'lucide-react';
import { ScholarshipDetailsModal } from './ScholarshipDetailsModal';
import { ScholarshipDetailPage, scholarshipSlug } from './ScholarshipDetailPage';

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
  gender?: string;
}

export function isExclusivelyForGirls(s: IndianScholarship): boolean {
  const text = `${s.title} ${s.target} ${s.eligibility}`.toLowerCase();
  return ['aicte-pragati-2026', 'kotak-kanya-2026', 'amazon-afe-2026', 'loreal-women-science-2026',
    'begum-hazrat-mahal-2026', 'santoor-2026', 'rolls-royce-unnati-2026'].includes(s.id) ||
    text.includes('girl students only') || text.includes('female students') ||
    text.includes('for young women') || text.includes('girl student');
}

export function getScholarshipSummary(s: IndianScholarship): string {
  return s.eligibility || 'Eligibility details available in the scholarship record.';
}

type Filter = 'all' | 'open' | 'closed' | 'government' | 'private' | 'state' | 'engineering' | 'girls';
type EducationFilter = 'all' | 'school' | 'intermediate' | 'diploma' | 'undergraduate' | 'postgraduate';
const effectiveStatus = (s: IndianScholarship) => {
  const explicitDate = s.deadline.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (/open/i.test(s.status || '')) {
    if (!explicitDate) return 'Cycle status not confirmed';
    const monthIndex = ['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(explicitDate[2].toLowerCase());
    const deadlineDate = new Date(Number(explicitDate[3]), monthIndex, Number(explicitDate[1]), 23, 59, 59);
    if (!Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now()) return 'Closed — listed deadline passed';
    return 'Listed as open — verify provider';
  }
  return s.status || 'Check official source';
};
const isOpen = (s: IndianScholarship) => effectiveStatus(s).toLowerCase().startsWith('listed as open');

const SCHOLARSHIP_HERO_IMAGE = '/Scholorship_images/manofstudy_scholorship%20_hero%20page.png';

const categoryClass = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('state')) return 'border-violet-400/20 bg-violet-400/10 text-violet-300';
  if (c.includes('government')) return 'border-sky-400/20 bg-sky-400/10 text-sky-300';
  return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
};

export const ScholarshipsHub: React.FC = () => {
  const [scholarships, setScholarships] = useState<IndianScholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<IndianScholarship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [educationFilter, setEducationFilter] = useState<EducationFilter>('all');
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
    engineering: scholarships.filter(s => /engineer|b\.tech|technical|professional|computer science|diploma/i.test(`${s.title} ${s.target} ${s.eligibility}`.toLowerCase())).length,
  }), [scholarships]);

  const featured = useMemo(() => scholarships.filter(s => [
    'central-sector-csss-2026', 'amazon-afe-2026', 'aicte-pragati-2026', 'reliance-ug-2026',
    'hdfc-ecss-2026', 'tata-pankh-2026', 'lic-golden-jubilee-2026', 'sbi-asha-2026'
  ].includes(s.id)), [scholarships]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scholarships.filter(s => {
      const text = `${s.title} ${s.provider} ${s.category} ${s.target} ${s.eligibility} ${s.amount} ${s.deadline}`.toLowerCase();
      const filterMatch =
        filter === 'all' ? true :
        filter === 'open' ? isOpen(s) :
        filter === 'closed' ? effectiveStatus(s).toLowerCase().includes('closed') :
        filter === 'government' ? /government/i.test(s.category) :
        filter === 'state' ? /state government/i.test(s.category) :
        filter === 'private' ? /private|csr/i.test(s.category) :
        filter === 'engineering' ? /engineer|b\.tech|technical|professional|computer science|diploma/i.test(text) :
        isExclusivelyForGirls(s);
      const targetText = (s.target + ' ' + s.eligibility + ' ' + s.title).toLowerCase();
      const educationMatch =
        educationFilter === 'all' ? true :
        educationFilter === 'school' ? /class 1|class 9|school student|school students|class 10|class 11|class 12/.test(targetText) :
        educationFilter === 'intermediate' ? /intermediate|class 11|class 12|class xii|12th/.test(targetText) :
        educationFilter === 'diploma' ? /diploma|polytechnic|iti/.test(targetText) :
        educationFilter === 'undergraduate' ? /\bug\b|b\.tech|undergraduate|degree course|bachelor/.test(targetText) :
        /postgraduate|\bpg\b|master/.test(targetText);
      return filterMatch && educationMatch && (!q || text.includes(q));
    });
  }, [scholarships, searchQuery, filter, educationFilter]);

  const currentFeatured = featured.length ? featured[featuredIndex % featured.length] : null;

  const copyLink = async (s: IndianScholarship) => {
    try {
      await navigator.clipboard.writeText(s.apply_link);
      setCopiedId(s.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const share = (s: IndianScholarship) => {
    const text = [
      'NAA COLLEGE | SCHOLARSHIP UPDATE',
      '',
      `🎓 ${s.title}`,
      `💰 ${s.amount}`,
      `🎯 ${s.target}`,
      `📅 ${s.deadline}`,
      '',
      `Details: https://naacollege.in/scholarships/${scholarshipSlug(s.title)}/`,
      `Application/source: ${s.apply_link}`,
    ].join('\n');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const filterButtons: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'open', label: 'Listed open*', count: stats.open },
    { id: 'closed', label: 'Closed', count: scholarships.filter(s => effectiveStatus(s).toLowerCase().includes('closed')).length },
    { id: 'government', label: 'Government', count: scholarships.filter(s => /government/i.test(s.category)).length },
    { id: 'private', label: 'Private / CSR', count: scholarships.filter(s => /private|csr/i.test(s.category)).length },
    { id: 'state', label: 'State schemes', count: scholarships.filter(s => /state government/i.test(s.category)).length },
    { id: 'engineering', label: 'Engineering', count: stats.engineering },
    { id: 'girls', label: 'For girls', count: scholarships.filter(isExclusivelyForGirls).length },
  ];

  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').startsWith('/scholarships/')) return <ScholarshipDetailPage />;

  return (
    <section className="mos-scholarships-hub w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6 text-[var(--mos-text-primary)]">
      <div className="mos-scholarship-hero overflow-hidden rounded-[28px] border border-[var(--mos-border)] bg-[var(--mos-surface)] shadow-xl">
        <div className="w-full h-[150px] sm:h-[185px] md:h-[210px] bg-slate-950 overflow-hidden">
          <img src={SCHOLARSHIP_HERO_IMAGE} alt="Scholarship portal" fetchPriority="high" decoding="async" className="block h-full w-full object-cover object-top" />
        </div>
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> 2026 Scholarship Directory</div>
          <h1 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--mos-text-primary)]">Find scholarships that <span className="text-emerald-600 dark:text-emerald-300">fit your future.</span></h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base leading-6 text-[var(--mos-text-secondary)]">Explore government, state, CSR and private scholarships with eligibility, published amounts and application sources in one student-friendly directory.</p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl">
            {[[stats.total, 'Scholarships'], [stats.open, 'Listed open*'], [stats.government, 'Government'], [stats.engineering, 'Engineering']].map(([n, label]) => <div key={String(label)} className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-3"><div className="text-lg sm:text-xl font-black text-[var(--mos-text-primary)]">{n}</div><div className="mt-0.5 text-[10px] text-[var(--mos-text-muted)]">{label}</div></div>)}
          </div>
        </div>
      </div>

      {currentFeatured && (
        <div className="rounded-3xl border border-emerald-500/20 bg-[var(--mos-surface)] p-3 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3 px-1 pb-3"><div><div className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-600 dark:text-emerald-400">Featured scholarship</div><p className="mt-1 text-xs text-[var(--mos-text-muted)]">Quick view • {featuredIndex + 1} / {featured.length}</p></div>{featured.length > 1 && <div className="flex gap-2"><button onClick={() => setFeaturedIndex(i => (i - 1 + featured.length) % featured.length)} className="p-2 rounded-lg border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] cursor-pointer" aria-label="Previous featured scholarship">‹</button><button onClick={() => setFeaturedIndex(i => (i + 1) % featured.length)} className="p-2 rounded-lg border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] cursor-pointer" aria-label="Next featured scholarship">›</button></div>}</div>
          <button onClick={() => setSelectedScholarship(currentFeatured)} className="group w-full text-left rounded-2xl border border-emerald-500/20 bg-emerald-500/[.04] hover:border-emerald-500/40 transition-colors cursor-pointer overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${categoryClass(currentFeatured.category)}`}>{currentFeatured.category}</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{effectiveStatus(currentFeatured)}</span>
              </div>
              <div className="mt-3 grid lg:grid-cols-[1fr_auto] gap-5 items-center">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--mos-text-primary)]">{currentFeatured.title}</h2>
                  <p className="mt-1 text-xs text-[var(--mos-text-muted)]">{currentFeatured.provider} • {currentFeatured.target}</p>
                </div>
                <div className="lg:min-w-[300px] rounded-xl border border-emerald-500/20 bg-[var(--mos-surface)] p-4 shadow-xs">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Scholarship amount</div>
                  <div className="mt-1 text-base sm:text-lg font-black text-[var(--mos-text-primary)]">{currentFeatured.amount}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--mos-text-muted)]"><Calendar className="h-3.5 w-3.5" /> {currentFeatured.deadline}</div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${categoryClass(currentFeatured.category)}`}>{currentFeatured.category}</span><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">{currentFeatured.status || 'Cycle-based'}</span></div><h2 className="mt-3 text-lg sm:text-xl font-bold text-[var(--mos-text-primary)]">{currentFeatured.title}</h2><p className="mt-1 text-xs text-[var(--mos-text-muted)]">{currentFeatured.provider} • {currentFeatured.target}</p></div>
              <div className="lg:min-w-[300px] rounded-xl border border-emerald-500/20 bg-[var(--mos-surface)] p-4 shadow-xs"><div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Scholarship amount</div><div className="mt-1 text-base sm:text-lg font-black text-[var(--mos-text-primary)]">{currentFeatured.amount}</div><div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--mos-text-muted)]"><Calendar className="h-3.5 w-3.5" /> {currentFeatured.deadline}</div></div>
              <ArrowUpRight className="hidden lg:block h-5 w-5 text-[var(--mos-text-muted)]" />
            </div>
          </button>
        </div>
      )}

      <div className="sticky top-2 z-20 rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)]/95 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mos-text-muted)]" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by scholarship, provider, engineering, SC, girls, amount, course…" className="w-full rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-10 py-3 text-sm text-[var(--mos-text-primary)] placeholder:text-[var(--mos-text-muted)] outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10" />{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mos-text-muted)]" aria-label="Clear search"><X className="h-4 w-4" /></button>}</div>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2 text-xs text-[var(--mos-text-secondary)]">
            <span className="shrink-0">Study level</span>
            <select aria-label="Filter by education level" value={educationFilter} onChange={e => setEducationFilter(e.target.value as EducationFilter)} className="min-w-0 bg-transparent py-1 text-xs text-[var(--mos-text-primary)] outline-none">
              <option value="all">All levels</option><option value="school">School</option><option value="intermediate">Intermediate</option><option value="diploma">Diploma / ITI</option><option value="undergraduate">Undergraduate</option><option value="postgraduate">Postgraduate</option>
            </select>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar"><SlidersHorizontal className="h-4 w-4 text-[var(--mos-text-muted)] shrink-0" />{filterButtons.map(btn => <button key={btn.id} onClick={() => setFilter(btn.id)} className={`shrink-0 rounded-xl border px-3 py-2 text-[11px] font-bold cursor-pointer ${filter === btn.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--mos-border)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-secondary)]'}`}>{btn.label} <span className={filter === btn.id ? 'opacity-90' : 'text-[var(--mos-text-muted)]'}>· {btn.count}</span></button>)}</div>
        </div>
      </div>

      {loadError && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-600 dark:text-red-300"><span>{loadError}</span><button onClick={loadData} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/20 px-3 py-1.5 font-bold cursor-pointer"><RefreshCw className="h-3.5 w-3.5" /> Retry</button></div>}

      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-[var(--mos-text-primary)]">Scholarship opportunities</h2><p className="text-xs text-[var(--mos-text-muted)] mt-1">Showing {filtered.length} of {scholarships.length} entries</p></div><div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--mos-text-muted)]"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Confirm the current amount, eligibility and deadline with the provider before applying.</div></div>

      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] animate-pulse" />)}</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(s => { const girls = isExclusivelyForGirls(s); return (
        <article key={s.id} className="group flex flex-col rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] hover:border-emerald-500/40 transition-all overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 flex-1">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 min-w-0"><div className="h-9 w-9 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div><div className="min-w-0"><div className="truncate text-[11px] font-bold text-[var(--mos-text-muted)]">{s.provider}</div><div className="mt-1 flex flex-wrap gap-1.5"><span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${categoryClass(s.category)}`}>{s.category}</span>{girls && <span className="rounded-md border border-pink-400/20 bg-pink-400/10 px-1.5 py-0.5 text-[9px] font-bold text-pink-600 dark:text-pink-300">Girls</span>}</div></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${isOpen(s) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-[var(--mos-surface-muted)] text-[var(--mos-text-muted)]'}`}>{effectiveStatus(s)}</span></div>
            <h3 className="mt-4 text-[15px] font-bold leading-6 text-[var(--mos-text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{s.title}</h3>
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[.05] p-3.5"><div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-600 dark:text-emerald-400"><IndianRupee className="h-3 w-3" /> Amount / benefit</div><div className="mt-1.5 text-sm font-black leading-5 text-[var(--mos-text-primary)]">{s.amount}</div></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]"><div className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3"><div className="text-[var(--mos-text-muted)]">Who can apply</div><div className="mt-1 text-[var(--mos-text-secondary)]">{s.target}</div></div><div className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3"><div className="text-[var(--mos-text-muted)]">Deadline</div><div className="mt-1 text-[var(--mos-text-secondary)]">{s.deadline}</div></div></div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--mos-text-muted)]">{getScholarshipSummary(s)}</p>
          </div>
          <div className="border-t border-[var(--mos-border)] p-3.5"><div className="grid grid-cols-2 gap-2"><a href={'/scholarships/' + scholarshipSlug(s.title) + '/'} className="inline-flex items-center justify-center rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-2.5 text-[11px] font-bold text-[var(--mos-text-primary)] hover:border-emerald-500/40">View details</a><a href={s.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 text-[11px] font-black cursor-pointer">Apply / source <ExternalLink className="h-3.5 w-3.5" /></a></div><div className="mt-2 flex items-center justify-between gap-2"><button onClick={() => share(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--mos-text-muted)] hover:text-emerald-500 cursor-pointer"><Share2 className="h-3 w-3" /> Share</button><button onClick={() => copyLink(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--mos-text-muted)] cursor-pointer">{copiedId === s.id ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy source</>}</button></div></div>
        </article>
      ); })}</div>}

      {!loading && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--mos-border)] bg-[var(--mos-surface-muted)] py-14 text-center"><GraduationCap className="mx-auto h-10 w-10 text-[var(--mos-text-muted)]" /><h3 className="mt-3 font-bold text-[var(--mos-text-primary)]">No matching scholarships</h3><p className="mt-1 text-xs text-[var(--mos-text-muted)]">Try another keyword or reset the filters.</p><button onClick={() => { setSearchQuery(''); setFilter('all'); setEducationFilter('all'); }} className="mt-4 rounded-xl bg-[var(--mos-surface)] border border-[var(--mos-border)] px-4 py-2 text-xs font-bold cursor-pointer">Reset filters</button></div>}

      <div className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 sm:p-6 shadow-xs"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><div><h3 className="font-bold text-[var(--mos-text-primary)]">How Naa College handles scholarship data</h3><p className="mt-1 text-xs leading-5 text-[var(--mos-text-muted)]">Award amounts are intentionally shown instead of hidden behind a button. “Open”, “Cycle-based” and “State scheme” describe the directory status, not a guarantee of eligibility. Always confirm the final amount, documents and closing date on the linked application/source page before submitting.</p></div></div><div className="mt-4 grid sm:grid-cols-3 gap-3">{[['1','Read eligibility','Check category, course, marks, income and institution rules.'],['2','Check the amount','The card shows the published award or clearly says when it varies.'],['3','Apply at source','Use the linked official/partner application page and never pay an agent.']].map(([n,t,d]) => <div key={n} className="rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] p-3.5"><div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{n}</div><div className="mt-1 text-xs font-bold text-[var(--mos-text-primary)]">{t}</div><div className="mt-1 text-[10px] leading-4 text-[var(--mos-text-muted)]">{d}</div></div>)}</div></div>

      {selectedScholarship && <ScholarshipDetailsModal scholarship={selectedScholarship} onClose={() => setSelectedScholarship(null)} />}
    </section>
  );
};

export const ScholarshipsRadar = ScholarshipsHub;
