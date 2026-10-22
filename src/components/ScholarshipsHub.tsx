import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, GraduationCap, ExternalLink, CalendarDays, IndianRupee, Share2,
  Copy, Check, ShieldCheck, SlidersHorizontal, Bookmark, BookmarkCheck,
  X, ArrowUpRight, Clock3, RotateCcw, ChevronDown, Building2, Sparkles,
  MapPin, Wallet, Users, Filter, AlertCircle, FileText
} from 'lucide-react';
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
  description?: string;
  documents?: string[];
  application_steps?: string[];
  level?: string;
  state?: string;
  tags?: string[];
  dateAdded?: string | null;
  official_source_url?: string;
  guideline_url?: string;
}

type MainFilter = 'all' | 'open' | 'closing' | 'expired' | 'saved';
type SortMode = 'deadline' | 'newest' | 'amount' | 'az';
type EducationFilter = 'all' | 'school' | 'intermediate' | 'diploma' | 'undergraduate' | 'postgraduate';
type StateFilter = 'all' | 'andhra-pradesh' | 'telangana' | 'national' | 'other';
type CategoryFilter = 'all' | 'government' | 'state' | 'private' | 'merit' | 'need' | 'girls' | 'sc-st-obc';
type AmountFilter = 'all' | 'under-10000' | '10000-50000' | '50000-100000' | 'over-100000';

const STORAGE_KEY = 'naa-college-saved-scholarships-v1';
const PAGE_SIZE = 12;
const TODAY = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

function deadlineDate(s: IndianScholarship): Date | null {
  const raw = String(s.deadline || '');
  const iso = raw.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const long = raw.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (!long) return null;
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  return new Date(Number(long[3]), months.indexOf(long[2].toLowerCase()), Number(long[1]));
}

export function scholarshipDeadlineState(s: IndianScholarship): 'open' | 'closing' | 'expired' | 'unconfirmed' {
  const date = deadlineDate(s);
  const originalStatus = String(s.status || '').toLowerCase();
  if (date) {
    const days = Math.ceil((date.getTime() - TODAY().getTime()) / 86400000);
    if (days < 0 || /closed|expired|ended/.test(originalStatus)) return 'expired';
    if (/open|renewal|registration live/.test(originalStatus)) return days <= 7 ? 'closing' : 'open';
    return 'unconfirmed';
  }
  if (/closed|expired|ended/.test(originalStatus)) return 'expired';
  if (!date && s.official_source_url && /applications listed as open on official portal/i.test(originalStatus)) return 'open';
  return 'unconfirmed';
}

export function isExclusivelyForGirls(s: IndianScholarship): boolean {
  const text = (s.title + ' ' + s.target + ' ' + s.eligibility + ' ' + (s.tags || []).join(' ')).toLowerCase();
  return ['aicte-pragati-2026', 'kotak-kanya-2026', 'amazon-afe-2026', 'loreal-women-science-2026', 'santoor-2026', 'rolls-royce-unnati-2026'].includes(s.id) ||
    text.includes('girl students only') || text.includes('female students only') || text.includes('for young women') || text.includes('girl student');
}

function inferLevel(s: IndianScholarship): EducationFilter[] {
  if (s.level) {
    const text = s.level.toLowerCase();
    const found: EducationFilter[] = [];
    if (/\bschool\b|class 9|class 10/.test(text)) found.push('school');
    if (/\bintermediate\b|class 11|class 12|12th/.test(text)) found.push('intermediate');
    if (/\bdiploma\b|\bpolytechnic\b|\biti\b/.test(text)) found.push('diploma');
    if (/\bundergraduate\b|\bug\b|\bbachelor\b|\bdegree\b|\bb\.tech\b|\bengineering\b/.test(text)) found.push('undergraduate');
    if (/\bpostgraduate\b|\bpg\b|\bmaster\b/.test(text)) found.push('postgraduate');
    if (found.length) return found;
  }
  const t = (s.title + ' ' + s.target + ' ' + s.eligibility).toLowerCase();
  const levels: EducationFilter[] = [];
  if (/\bclass\s*(?:[1-9]|1[0-2])\b|\bschool\b|\bnmmss\b/.test(t)) levels.push('school');
  if (/\bintermediate\b|\bclass\s*(?:11|12|xii)\b|\b12th\b/.test(t)) levels.push('intermediate');
  if (/\bdiploma\b|\bpolytechnic\b|\biti\b/.test(t)) levels.push('diploma');
  if (/\bundergraduate\b|\bug\b|\bb\.?tech\b|\bbachelor\b|\bengineering\b|\bdegree course\b|college and university students/.test(t)) levels.push('undergraduate');
  if (/\bpostgraduate\b|\bpg\b|\bmaster'?s?\b|higher education of st students/.test(t)) levels.push('postgraduate');
  return levels.length ? levels : ['undergraduate'];
}

function inferredState(s: IndianScholarship): StateFilter {
  const text = ((s.state || '') + ' ' + s.category + ' ' + s.title + ' ' + s.target + ' ' + s.provider).toLowerCase();
  if (/andhra pradesh|jnanabhumi|vidya deevena|vasathi deevena/.test(text)) return 'andhra-pradesh';
  if (/telangana|epass/.test(text)) return 'telangana';
  if (/all india|national|central sector|aicte|government of india|ministry of|nsp/.test(text)) return 'national';
  if (/state government|state scheme/.test(text)) return 'other';
  return 'national';
}

function categoryMatches(s: IndianScholarship, filter: CategoryFilter): boolean {
  const text = (s.title + ' ' + s.category + ' ' + s.target + ' ' + s.eligibility + ' ' + (s.tags || []).join(' ')).toLowerCase();
  if (filter === 'all') return true;
  if (filter === 'government') return /government|central|nsp|aicte|ugc|department of|ministry of/.test(text);
  if (filter === 'state') return /state government|andhra pradesh|telangana|jnanabhumi|epass|state scheme/.test(text);
  if (filter === 'private') return /private|csr|foundation|bank|reliance|tata|kotak|hdfc|sbi|lic|google|amazon/.test(text);
  if (filter === 'merit') return /merit|academic performance|marks|rank/.test(text);
  if (filter === 'need') return /need-based|financial hardship|low-income|income|economically weaker|welfare/.test(text);
  if (filter === 'girls') return isExclusivelyForGirls(s);
  return /\bsc\b|\bst\b|obc|ebc|dnt|scheduled caste|scheduled tribe|backward class/.test(text);
}

function amountNumber(s: IndianScholarship): number | null {
  const text = String(s.amount || '').replace(/,/g, '');
  const match = text.match(/(?:₹|rs\.?\s*)(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  let value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const rest = text.slice(match.index || 0, (match.index || 0) + match[0].length + 10).toLowerCase();
  if (/lakh|lac/.test(text.toLowerCase())) value *= 100000;
  else if (/crore/.test(text.toLowerCase())) value *= 10000000;
  else if (/month|monthly|\/month/.test(text.toLowerCase())) value *= 12;
  else if (/total over|over the degree|duration/.test(text.toLowerCase())) return null;
  return value;
}

function statusLabel(s: IndianScholarship): string {
  const state = scholarshipDeadlineState(s);
  if (state === 'expired') return 'Closed / expired';
  if (state === 'closing') return 'Closing soon';
  if (state === 'open') return 'Open — verify portal';
  return 'Cycle not confirmed';
}

function daysRemaining(s: IndianScholarship): number | null {
  const d = deadlineDate(s);
  if (!d) return null;
  return Math.ceil((d.getTime() - TODAY().getTime()) / 86400000);
}

function externalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const statusStyles = {
  open: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  closing: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  expired: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  unconfirmed: 'border-[var(--mos-border)] bg-[var(--mos-surface-muted)] text-[var(--mos-text-muted)]'
};

export const ScholarshipsHub: React.FC = () => {
  const [scholarships, setScholarships] = useState<IndianScholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mainFilter, setMainFilter] = useState<MainFilter>('all');
  const [educationFilter, setEducationFilter] = useState<EducationFilter>('all');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('deadline');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [copyError, setCopyError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/indian_scholarships.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Scholarship data request failed');
      const data: unknown = await response.json();
      if (!Array.isArray(data) || data.some((item: any) => !item || !item.id || !item.title || !item.provider || !externalUrl(item.official_source_url || item.apply_link))) {
        throw new Error('Scholarship data has an invalid structure');
      }
      setScholarships(data as IndianScholarship[]);
    } catch {
      setLoadError('Scholarships could not be loaded. Please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds)); } catch { /* Storage may be disabled. */ }
  }, [savedIds]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [debouncedQuery, mainFilter, educationFilter, stateFilter, categoryFilter, amountFilter, sortMode, showSaved]);

  const filtered = useMemo(() => {
    const list = scholarships.filter((s) => {
      const text = [s.title, s.provider, s.category, s.target, s.eligibility, s.amount, s.deadline, s.state || '', s.level || '', ...(s.tags || [])].join(' ').toLowerCase();
      if (debouncedQuery && !text.includes(debouncedQuery)) return false;
      const deadlineState = scholarshipDeadlineState(s);
      if (showSaved && !savedIds.includes(s.id)) return false;
      if (mainFilter === 'open' && deadlineState !== 'open' && deadlineState !== 'closing') return false;
      if (mainFilter === 'closing' && deadlineState !== 'closing') return false;
      if (mainFilter === 'expired' && deadlineState !== 'expired') return false;
      if (mainFilter === 'saved' && !savedIds.includes(s.id)) return false;
      if (educationFilter !== 'all' && !inferLevel(s).includes(educationFilter)) return false;
      if (stateFilter !== 'all' && inferredState(s) !== stateFilter) return false;
      if (!categoryMatches(s, categoryFilter)) return false;
      if (amountFilter !== 'all') {
        const amount = amountNumber(s);
        if (amount === null) return false;
        if (amountFilter === 'under-10000' && amount >= 10000) return false;
        if (amountFilter === '10000-50000' && (amount < 10000 || amount > 50000)) return false;
        if (amountFilter === '50000-100000' && (amount < 50000 || amount > 100000)) return false;
        if (amountFilter === 'over-100000' && amount <= 100000) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sortMode === 'az') return a.title.localeCompare(b.title);
      if (sortMode === 'newest') {
        const da = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const db = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return db - da || a.title.localeCompare(b.title);
      }
      if (sortMode === 'amount') return (amountNumber(b) ?? -1) - (amountNumber(a) ?? -1);
      const da = deadlineDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = deadlineDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db || a.title.localeCompare(b.title);
    });
  }, [scholarships, debouncedQuery, mainFilter, educationFilter, stateFilter, categoryFilter, amountFilter, sortMode, savedIds, showSaved]);

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setMainFilter('all');
    setEducationFilter('all');
    setStateFilter('all');
    setCategoryFilter('all');
    setAmountFilter('all');
    setSortMode('deadline');
    setShowSaved(false);
  };

  const toggleSaved = (id: string) => {
    setSavedIds((current) => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const copyText = async (value: string, s: IndianScholarship) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError('');
      setCopiedId(s.id);
    } catch {
      setCopyError('Copy is blocked by this browser. You can still open or share the scholarship page.');
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const shareScholarship = async (s: IndianScholarship) => {
    const url = 'https://naacollege.in/scholarships/' + scholarshipSlug(s.title) + '/';
    try {
      if (navigator.share) {
        await navigator.share({ title: s.title, text: 'Scholarship details on Naa College', url });
      } else {
        await copyText(url, s);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) await copyText(url, s);
    }
  };

  const filterCount = [educationFilter !== 'all', stateFilter !== 'all', categoryFilter !== 'all', amountFilter !== 'all', mainFilter !== 'all'].filter(Boolean).length;
  const totalOpen = scholarships.filter(s => scholarshipDeadlineState(s) === 'open').length;
  const totalClosing = scholarships.filter(s => scholarshipDeadlineState(s) === 'closing').length;
  const totalExpired = scholarships.filter(s => scholarshipDeadlineState(s) === 'expired').length;
  const visibleItems = filtered.slice(0, visibleCount);
  const activeChips: { label: string; clear: () => void }[] = [];
  if (debouncedQuery) activeChips.push({ label: 'Search: ' + searchQuery, clear: () => setSearchQuery('') });
  if (mainFilter !== 'all') activeChips.push({ label: mainFilter === 'saved' ? 'Saved' : mainFilter === 'closing' ? 'Closing soon' : mainFilter === 'expired' ? 'Expired' : 'Open', clear: () => setMainFilter('all') });
  if (educationFilter !== 'all') activeChips.push({ label: 'Level: ' + educationFilter, clear: () => setEducationFilter('all') });
  if (stateFilter !== 'all') activeChips.push({ label: 'Location: ' + stateFilter.replace('-', ' '), clear: () => setStateFilter('all') });
  if (categoryFilter !== 'all') activeChips.push({ label: 'Category: ' + categoryFilter, clear: () => setCategoryFilter('all') });
  if (amountFilter !== 'all') activeChips.push({ label: 'Amount: ' + amountFilter.replace(/-/g, ' '), clear: () => setAmountFilter('all') });

  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').startsWith('/scholarships/')) return <ScholarshipDetailPage />;

  const filterControls = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--mos-text-muted)]">Scholarship type</span><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as CategoryFilter)} className="w-full min-w-0 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2.5 text-sm text-[var(--mos-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="all">All categories</option><option value="government">Government</option><option value="state">State schemes</option><option value="private">Private / foundation</option><option value="merit">Merit-based</option><option value="need">Need-based / welfare</option><option value="girls">For girls</option><option value="sc-st-obc">SC / ST / OBC</option></select></label>
      <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--mos-text-muted)]">Education level</span><select value={educationFilter} onChange={e => setEducationFilter(e.target.value as EducationFilter)} className="w-full min-w-0 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2.5 text-sm text-[var(--mos-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="all">All levels</option><option value="school">School</option><option value="intermediate">Intermediate</option><option value="diploma">Diploma / ITI</option><option value="undergraduate">Undergraduate / B.Tech</option><option value="postgraduate">Postgraduate</option></select></label>
      <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--mos-text-muted)]">State / coverage</span><select value={stateFilter} onChange={e => setStateFilter(e.target.value as StateFilter)} className="w-full min-w-0 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2.5 text-sm text-[var(--mos-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="all">All locations</option><option value="andhra-pradesh">Andhra Pradesh</option><option value="telangana">Telangana</option><option value="national">National / All India</option><option value="other">Other state schemes</option></select></label>
      <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--mos-text-muted)]">Benefit range</span><select value={amountFilter} onChange={e => setAmountFilter(e.target.value as AmountFilter)} className="w-full min-w-0 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2.5 text-sm text-[var(--mos-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="all">Any / varies</option><option value="under-10000">Under ₹10,000</option><option value="10000-50000">₹10,000–₹50,000</option><option value="50000-100000">₹50,000–₹1 lakh</option><option value="over-100000">Over ₹1 lakh</option></select></label>
      <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-semibold text-[var(--mos-text-muted)]">Sort by</span><select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} className="w-full min-w-0 rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] px-3 py-2.5 text-sm text-[var(--mos-text-primary)] outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="deadline">Deadline: soonest</option><option value="newest">Newest added</option><option value="amount">Amount: high to low</option><option value="az">Name: A–Z</option></select></label>
    </div>
  );

  return (
    <section className="mos-scholarships-hub mx-auto w-full max-w-7xl space-y-7 px-3 py-5 text-[var(--mos-text-primary)] sm:px-5 sm:py-8 lg:px-8">
      <header className="mos-scholarship-hero relative overflow-hidden rounded-[24px] border border-[var(--mos-border)] p-5 shadow-sm sm:rounded-[28px] sm:p-8 lg:p-10">
        <div aria-hidden="true" className="mos-scholarship-orbit mos-scholarship-orbit-one pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full blur-3xl" /><div aria-hidden="true" className="mos-scholarship-orbit mos-scholarship-orbit-two pointer-events-none absolute -bottom-24 right-1/3 h-40 w-40 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700 dark:text-emerald-300"><Sparkles className="h-3.5 w-3.5" /> Scholarship finder · 2026–27</div>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Big dreams deserve <span className="mos-scholarship-gradient-text">opportunities.</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mos-text-secondary)] sm:text-base">Discover scholarships, understand your options, and find funding opportunities for your educational journey.</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[var(--mos-text-muted)]"><span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Official-source links where available</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-3 py-1.5"><Bookmark className="h-3.5 w-3.5" /> Save for later</span></div>
        </div>
        <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ label: 'In the directory', value: scholarships.length, icon: GraduationCap }, { label: 'Open · verify portal', value: totalOpen, icon: Check }, { label: 'Closing in 7 days', value: totalClosing, icon: Clock3 }, { label: 'Expired / closed', value: totalExpired, icon: CalendarDays }].map((item) => {
            const Icon = item.icon;
            return <div key={item.label} className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)]/75 p-3.5 sm:p-4"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-medium text-[var(--mos-text-muted)] sm:text-xs">{item.label}</span><Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div><div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{loading ? '—' : item.value}</div></div>;
          })}
        </div>
      </header>

      <section className="mos-scholarship-controls rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-3 shadow-sm sm:p-4" aria-label="Scholarship search and filters">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1.15fr)_auto] lg:items-start">
          <div className="mos-scholarship-search relative min-w-0 w-full"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mos-text-muted)]" /><input type="text" autoComplete="off" aria-label="Search scholarships by name, provider or tag" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search scholarship, provider, B.Tech, merit…" className="mos-scholarship-search-input w-full rounded-xl border border-[var(--mos-input-border)] bg-[var(--mos-input-bg)] text-sm text-[var(--mos-text-primary)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25" />{searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--mos-text-muted)] hover:bg-[var(--mos-surface-muted)] focus-visible:outline-2 focus-visible:outline-emerald-500"><X className="h-4 w-4" /></button>}</div>
          <button type="button" onClick={() => { setShowSaved(v => !v); setMainFilter('all'); }} className={'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-emerald-500 ' + (showSaved ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--mos-border)] bg-[var(--mos-surface-muted)] hover:border-emerald-500/50')}><BookmarkCheck className="h-4 w-4" /> Saved <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10">{savedIds.length}</span></button>
          <button type="button" onClick={() => setShowMobileFilters(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-4 text-sm font-semibold transition hover:border-emerald-500/50 focus-visible:outline-2 focus-visible:outline-emerald-500 sm:hidden"><Filter className="h-4 w-4" /> Filters {filterCount > 0 && <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">{filterCount}</span>}</button>
          <div className="hidden min-w-0 sm:block lg:col-span-2">{filterControls}</div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--mos-border)] pt-3">
          {[{ id: 'all' as MainFilter, label: 'All scholarships' }, { id: 'open' as MainFilter, label: 'Open' }, { id: 'closing' as MainFilter, label: 'Closing soon' }, { id: 'expired' as MainFilter, label: 'Expired' }, { id: 'saved' as MainFilter, label: 'Saved' }].map(tab => <button type="button" key={tab.id} onClick={() => { setMainFilter(tab.id); if (tab.id === 'saved') setShowSaved(false); }} className={'rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-emerald-500 ' + (mainFilter === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--mos-text-secondary)] hover:bg-[var(--mos-surface-muted)]')}>{tab.label}</button>)}
          <span className="ml-auto text-xs text-[var(--mos-text-muted)]">{loading ? 'Loading…' : filtered.length + ' matching scholarships'}</span>
        </div>
        {activeChips.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{activeChips.map((chip, i) => <button key={chip.label + i} type="button" onClick={chip.clear} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] text-[var(--mos-text-secondary)] hover:bg-emerald-500/10">{chip.label}<X className="h-3 w-3" /></button>)}<button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"><RotateCcw className="h-3 w-3" /> Clear all</button></div>}
      </section>

      {loadError && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" /><div className="min-w-0 flex-1"><p className="font-semibold">We couldn’t load the scholarship list.</p><p className="mt-1 text-[var(--mos-text-secondary)]">{loadError}</p><button type="button" onClick={loadData} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500">Try again</button></div></div>}
      {copyError && <div role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-[var(--mos-text-secondary)]">{copyError}</div>}

      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold tracking-tight sm:text-2xl">Scholarship opportunities</h2><p className="mt-1 text-sm text-[var(--mos-text-muted)]">Showing {loading ? '—' : visibleItems.length} of {filtered.length} matching results</p></div><p className="max-w-lg text-xs leading-5 text-[var(--mos-text-muted)]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Cycle status is calculated from listed dates where possible. Always confirm the current rules on the provider’s site.</p></div>

      {loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[330px] animate-pulse rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface-muted)]" />)}</div> :
        !loadError && filtered.length > 0 ? <div className="mos-scholarship-results-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((s) => {
            const state = scholarshipDeadlineState(s);
            const days = daysRemaining(s);
            const saved = savedIds.includes(s.id);
            const level = inferLevel(s).map(x => ({ school: 'School', intermediate: 'Intermediate', diploma: 'Diploma', undergraduate: 'UG / B.Tech', postgraduate: 'PG' }[x])).join(' · ');
            const tags = (s.tags && s.tags.length ? s.tags : [s.category, ...(isExclusivelyForGirls(s) ? ['Girls'] : []), ...( /engineer|b\\.tech|technical|diploma/i.test(s.title + ' ' + s.target) ? ['Engineering'] : [] )]).slice(0, 3);
            return <article key={s.id} className="mos-scholarship-card group flex min-w-0 flex-col rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
              <div className="flex-1 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-sm font-black text-emerald-700 dark:text-emerald-300" aria-hidden="true">{(s.provider || 'S').trim().charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[var(--mos-text-muted)]" title={s.provider}>{s.provider}</p><div className="mt-1 flex flex-wrap gap-1.5">{tags.slice(0, 2).map(tag => <span key={tag} className="rounded-md border border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--mos-text-secondary)]">{tag}</span>)}{s.dateAdded && !Number.isNaN(new Date(s.dateAdded).getTime()) && (Date.now() - new Date(s.dateAdded).getTime() < 14 * 86400000) && <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300"><Sparkles className="h-3 w-3" /> New</span>}</div></div>
                  <button type="button" onClick={() => toggleSaved(s.id)} aria-label={saved ? 'Remove ' + s.title + ' from saved scholarships' : 'Save ' + s.title} aria-pressed={saved} title={saved ? 'Saved' : 'Save scholarship'} className={'rounded-lg border p-2 transition focus-visible:outline-2 focus-visible:outline-emerald-500 ' + (saved ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-transparent text-[var(--mos-text-muted)] hover:border-[var(--mos-border)] hover:bg-[var(--mos-surface-muted)]')}><Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /></button>
                </div>
                <a href={'/scholarships/' + scholarshipSlug(s.title) + '/'} className="mos-scholarship-title-link mt-4 block rounded-xl px-3 py-3 text-base font-black leading-6 sm:text-lg" aria-label={'View details for ' + s.title}>
                  <span className="mos-scholarship-title-kicker">SCHOLARSHIP OPPORTUNITY</span>
                  <h3 className="mos-scholarship-shining-title">{s.title}</h3>
                </a>
                <div className="mos-scholarship-facts mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="mos-scholarship-fact mos-scholarship-amount"><p>AMOUNT / AWARD</p><strong>{s.amount || 'Amount not confirmed'}</strong></div>
                  <div className="mos-scholarship-fact mos-scholarship-deadline"><p>DEADLINE</p><strong>{s.deadline || 'Current deadline not confirmed'}</strong></div>
                </div>
                <div className="mos-scholarship-info-block mt-3">
                  <h4><FileText className="h-3.5 w-3.5" /> SCHOLARSHIP DETAILS</h4>
                  <p className="line-clamp-3">{s.description || s.target || 'Review the provider guidelines for programme details.'}</p>
                </div>
                <div className="mos-scholarship-info-block mos-scholarship-eligibility mt-2">
                  <h4><GraduationCap className="h-3.5 w-3.5" /> ELIGIBILITY</h4>
                  <p className="line-clamp-3">{s.eligibility || s.target || 'Eligibility requirements are not confirmed in this record.'}</p>
                  <p className="mos-scholarship-level">{level || 'Education level depends on scheme rules'} · {inferredState(s) === 'andhra-pradesh' ? 'Andhra Pradesh' : inferredState(s) === 'telangana' ? 'Telangana' : inferredState(s) === 'national' ? 'National / All India' : 'State-specific'}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--mos-border)] pt-3">
                  <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ' + statusStyles[state]}><CalendarDays className="h-3 w-3" />{statusLabel(s)}</span>
                  <span className="text-xs font-semibold text-[var(--mos-text-secondary)]">{days === null ? 'Date not confirmed' : days < 0 ? 'Deadline passed' : days === 0 ? 'Due today' : days + ' day' + (days === 1 ? '' : 's') + ' left'}</span>
                </div>
                {state === 'closing' && <div className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">Deadline is within the next 7 days — verify before applying.</div>}
              </div>
              <div className="grid grid-cols-1 gap-2 border-t border-[var(--mos-border)] p-4 sm:grid-cols-2">
                <a href={'/scholarships/' + scholarshipSlug(s.title) + '/'} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-sky-500/25 bg-sky-500/[.07] px-3 py-2.5 text-xs font-bold text-[var(--mos-text-primary)] transition hover:border-sky-500/50 hover:bg-sky-500/10 focus-visible:outline-2 focus-visible:outline-sky-500">View Full Details <ArrowUpRight className="h-3.5 w-3.5" /></a>
                {externalUrl(s.official_source_url || s.apply_link) ? <a href={s.official_source_url || s.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">{s.official_source_url ? 'Visit official source' : 'Open listing'} <ExternalLink className="h-3.5 w-3.5" /></a> : <button type="button" disabled className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--mos-surface-muted)] px-3 py-2.5 text-xs font-bold text-[var(--mos-text-muted)]" title="No valid application URL is available">Link unavailable</button>}
                <button type="button" onClick={() => shareScholarship(s)} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[var(--mos-text-muted)] transition hover:bg-[var(--mos-surface-muted)] hover:text-[var(--mos-text-primary)] focus-visible:outline-2 focus-visible:outline-emerald-500"><Share2 className="h-3.5 w-3.5" /> Share</button>
                <button type="button" onClick={() => copyText('https://naacollege.in/scholarships/' + scholarshipSlug(s.title) + '/', s)} className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-[var(--mos-text-muted)] transition hover:bg-[var(--mos-surface-muted)] hover:text-[var(--mos-text-primary)] focus-visible:outline-2 focus-visible:outline-emerald-500">{copiedId === s.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copiedId === s.id ? 'Copied link' : 'Copy link'}</button>
              </div>
            </article>;
          })}
        </div> : !loadError && <div className="rounded-2xl border border-dashed border-[var(--mos-border)] bg-[var(--mos-surface-muted)] px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)]"><Search className="h-5 w-5 text-[var(--mos-text-muted)]" /></div><h3 className="mt-4 text-lg font-bold">No matching scholarships</h3><p className="mx-auto mt-1 max-w-md text-sm text-[var(--mos-text-muted)]">Try a different search or remove a filter to see more opportunities.</p><button type="button" onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"><RotateCcw className="h-4 w-4" /> Reset filters</button></div>}

      {!loading && !loadError && filtered.length > visibleItems.length && <div className="flex justify-center"><button type="button" onClick={() => setVisibleCount(n => n + PAGE_SIZE)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface)] px-5 py-3 text-sm font-bold transition hover:border-emerald-500/50 hover:bg-emerald-500/5 focus-visible:outline-2 focus-visible:outline-emerald-500">Load more scholarships <ChevronDown className="h-4 w-4" /></button></div>}

      <footer className="rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><h2 className="font-bold">A quick note on accuracy</h2><p className="mt-1 text-sm leading-6 text-[var(--mos-text-secondary)]">Scholarship cycles, eligibility, amounts and documents can change. This directory labels dates only when a clear deadline is present; a listed cycle is not a guarantee that applications are still being accepted. Confirm scheme-specific rules on the official provider portal before applying.</p><div className="mt-3 flex flex-wrap gap-2"><a href="https://scholarships.gov.in/All-Scholarships" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-3 py-2 text-xs font-semibold hover:border-emerald-500/50">National Scholarship Portal <ExternalLink className="h-3 w-3" /></a><a href="https://jnanabhumi.ap.gov.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-3 py-2 text-xs font-semibold hover:border-emerald-500/50">AP JnanaBhumi <ExternalLink className="h-3 w-3" /></a><a href="https://telanganaepass.cgg.gov.in/epassonlinelinks.jsp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--mos-border)] px-3 py-2 text-xs font-semibold hover:border-emerald-500/50">Telangana ePASS <ExternalLink className="h-3 w-3" /></a></div></div></div></footer>

      {showMobileFilters && <div className="fixed inset-0 z-[9998] sm:hidden" role="dialog" aria-modal="true" aria-label="Scholarship filters"><button type="button" aria-label="Close filters" onClick={() => setShowMobileFilters(false)} className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" /><div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-[var(--mos-border)] bg-[var(--mos-surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Filters</h2><p className="mt-1 text-xs text-[var(--mos-text-muted)]">Narrow the list to what matters to you.</p></div><button type="button" onClick={() => setShowMobileFilters(false)} aria-label="Close filters" className="rounded-xl border border-[var(--mos-border)] p-2"><X className="h-4 w-4" /></button></div><div className="mt-5">{filterControls}</div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => { clearFilters(); setShowMobileFilters(false); }} className="rounded-xl border border-[var(--mos-border)] px-4 py-3 text-sm font-semibold">Clear all</button><button type="button" onClick={() => setShowMobileFilters(false)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Show {filtered.length} results</button></div></div></div>}

    </section>
  );
};

export const ScholarshipsRadar = ScholarshipsHub;
