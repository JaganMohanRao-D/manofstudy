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
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6 text-slate-100">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-700/70 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,.18),_transparent_34%),linear-gradient(135deg,#0b1220,#101a2c)] p-5 sm:p-7 lg:p-9 shadow-2xl">
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
        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[.18em] text-emerald-300 font-bold">Featured opportunity</div>
              <div className="mt-1 text-sm text-slate-400">High-interest programmes in the current directory</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFeaturedIndex(i => (i - 1 + featured.length) % featured.length)} className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800" aria-label="Previous featured scholarship">‹</button>
              <button onClick={() => setFeaturedIndex(i => (i + 1) % featured.length)} className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800" aria-label="Next featured scholarship">›</button>
            </div>
          </div>
          <button onClick={() => setSelectedScholarship(currentFeatured)} className="w-full text-left rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04] p-4 sm:p-5 hover:border-emerald-300/30 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${categoryClass(currentFeatured.category)}`}>{currentFeatured.category}</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">{currentFeatured.status || 'Cycle-based'}</span>
                </div>
                <h2 className="mt-3 text-lg sm:text-xl font-bold text-white">{currentFeatured.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{currentFeatured.provider} • {currentFeatured.target}</p>
              </div>
              <div className="lg:min-w-[300px] rounded-xl border border-emerald-400/20 bg-slate-950/50 p-4">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Scholarship amount</div>
                <div className="mt-1 text-base sm:text-lg font-black text-white">{currentFeatured.amount}</div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Calendar className="h-3.5 w-3.5" /> {currentFeatured.deadline}</div>
              </div>
              <ArrowUpRight className="hidden lg:block h-5 w-5 text-slate-500" />
            </div>
          </button>
        </div>
      )}

      <div className="sticky top-2 z-20 rounded-2xl border border-slate-700 bg-slate-950/95 backdrop-blur-xl p-3 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship, provider, engineering, SC, girls, amount, course…"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-10 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 shrink-0" />
            {filterButtons.map(btn => (
              <button key={btn.id} onClick={() => setFilter(btn.id)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${filter === btn.id ? 'border-emerald-300 bg-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}>
                {btn.label} <span className={filter === btn.id ? 'opacity-70' : 'text-slate-500'}>· {btn.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-200">
          <span>{loadError}</span>
          <button onClick={loadData} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/20 px-3 py-1.5 font-bold hover:bg-red-400/10"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Scholarship opportunities</h2>
          <p className="text-xs text-slate-500 mt-1">Showing {filtered.length} of {scholarships.length} entries</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Amounts are displayed as published / verified for the listed scheme.</div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-80 rounded-2xl border border-slate-800 bg-slate-900 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const girls = isExclusivelyForGirls(s);
            return (
              <article key={s.id} className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-slate-600 transition-all overflow-hidden">
                <div className="p-4 sm:p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0"><GraduationCap className="h-4 w-4 text-emerald-300" /></div>
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-bold text-slate-400">{s.provider}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${categoryClass(s.category)}`}>{s.category}</span>
                          {girls && <span className="rounded-md border border-pink-400/20 bg-pink-400/10 px-1.5 py-0.5 text-[9px] font-bold text-pink-300">Girls</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${isOpen(s) ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{s.status || 'Cycle-based'}</span>
                  </div>

                  <h3 className="mt-4 text-[15px] font-bold leading-6 text-white group-hover:text-emerald-300 transition-colors">{s.title}</h3>

                  <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[.04] p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-300"><IndianRupee className="h-3 w-3" /> Amount / benefit</div>
                    <div className="mt-1.5 text-sm font-black leading-5 text-white">{s.amount}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                      <div className="text-slate-500">Who can apply</div>
                      <div className="mt-1 line-clamp-3 text-slate-300">{s.target}</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                      <div className="text-slate-500">Deadline</div>
                      <div className="mt-1 line-clamp-3 text-slate-300">{s.deadline}</div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-slate-400">{getScholarshipSummary(s)}</p>
                </div>

                <div className="border-t border-slate-800 p-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setSelectedScholarship(s)} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-[11px] font-bold text-slate-200 hover:border-slate-500">View details</button>
                    <a href={s.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-2.5 text-[11px] font-black text-slate-950 hover:bg-emerald-300">Apply / source <ExternalLink className="h-3.5 w-3.5" /></a>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button onClick={() => share(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-emerald-300"><Share2 className="h-3 w-3" /> Share</button>
                    <button onClick={() => copyLink(s)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-white">
                      {copiedId === s.id ? <><Check className="h-3 w-3 text-emerald-300" /> Copied</> : <><Copy className="h-3 w-3" /> Copy source</>}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-14 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-slate-700" />
          <h3 className="mt-3 font-bold text-white">No matching scholarships</h3>
          <p className="mt-1 text-xs text-slate-500">Try another keyword or reset the filters.</p>
          <button onClick={() => {setSearchQuery(''); setFilter('all');}} className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200">Reset filters</button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div>
            <h3 className="font-bold text-white">How Man of Study handles scholarship data</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Award amounts are intentionally shown instead of hidden behind a button. “Open”, “Cycle-based” and “State scheme” describe the directory status, not a guarantee of eligibility. Always confirm the final amount, documents and closing date on the linked application/source page before submitting.
            </p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            ['1', 'Read eligibility', 'Check category, course, marks, income and institution rules.'],
            ['2', 'Check the amount', 'The card shows the published award or clearly says when it varies.'],
            ['3', 'Apply at source', 'Use the linked official/partner application page and never pay an agent.'],
          ].map(([n,t,d]) => <div key={n} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5"><div className="text-xs font-black text-emerald-300">{n}</div><div className="mt-1 text-xs font-bold text-white">{t}</div><div className="mt-1 text-[10px] leading-4 text-slate-500">{d}</div></div>)}
        </div>
      </div>

      {selectedScholarship && <ScholarshipDetailsModal scholarship={selectedScholarship} onClose={() => setSelectedScholarship(null)} />}
    </section>
  );
};

export const ScholarshipsRadar = ScholarshipsHub;
