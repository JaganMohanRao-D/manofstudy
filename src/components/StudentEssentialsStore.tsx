import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Laptop,
  BookOpen,
  Smartphone,
  Headphones,
  Keyboard,
  MousePointer,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { affiliateCatalog, AffiliateProduct } from '../data/affiliatesData';

export interface StudentEssentialsStoreProps {
  initialCategory?: string;
  onNavigateToRoadmaps?: () => void;
}

type CategoryTabKey =
  | 'all'
  | 'engineering'
  | 'entrance'
  | 'mindset'
  | 'audio'
  | 'peripherals';

interface CategoryTab {
  id: CategoryTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

export const StudentEssentialsStore: React.FC<StudentEssentialsStoreProps> = ({
  initialCategory,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTabKey>(() => {
    if (initialCategory === 'Engineering & Laptops' || initialCategory === 'engineering') return 'engineering';
    if (initialCategory === 'EAPCET & NEET Prep' || initialCategory === 'entrance') return 'entrance';
    if (initialCategory === 'Mindset & Books' || initialCategory === 'mindset') return 'mindset';
    if (initialCategory === 'Audio & Tech' || initialCategory === 'audio') return 'audio';
    if (initialCategory === 'Keyboards & Mice' || initialCategory === 'peripherals') return 'peripherals';
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const getProductCategoryKey = (product: AffiliateProduct): CategoryTabKey => {
    if (product.category === 'Engineering Tools' || product.category === 'Coding Laptops') {
      return 'engineering';
    }
    if (product.category === 'Entrance Exam Prep') {
      return 'entrance';
    }
    if (product.category === 'Growth & Books') {
      return 'mindset';
    }
    if (product.category === 'Smartphones & Audio') {
      return 'audio';
    }
    if (product.category === 'Keyboards & Mice') {
      return 'peripherals';
    }
    return 'all';
  };

  const categories: CategoryTab[] = useMemo(() => {
    const counts: Record<CategoryTabKey, number> = {
      all: affiliateCatalog.length,
      engineering: 0,
      entrance: 0,
      mindset: 0,
      audio: 0,
      peripherals: 0,
    };

    affiliateCatalog.forEach((item) => {
      const key = getProductCategoryKey(item);
      if (key !== 'all') {
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return [
      { id: 'all', label: 'All Essentials', icon: ShoppingBag, count: counts.all },
      { id: 'engineering', label: 'Engineering & Laptops', icon: Laptop, count: counts.engineering },
      { id: 'entrance', label: 'EAPCET & NEET Prep', icon: BookOpen, count: counts.entrance },
      { id: 'mindset', label: 'Mindset & Books', icon: Sparkles, count: counts.mindset },
      { id: 'audio', label: 'Audio & Tech', icon: Headphones, count: counts.audio },
      { id: 'peripherals', label: 'Keyboards & Mice', icon: Keyboard, count: counts.peripherals },
    ];
  }, []);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    affiliateCatalog.forEach((p) => {
      if (activeTab === 'all' || getProductCategoryKey(p) === activeTab) {
        types.add(p.type);
      }
    });
    return Array.from(types).sort();
  }, [activeTab]);

  const filteredProducts = useMemo(() => {
    return affiliateCatalog.filter((item) => {
      // Category filter
      if (activeTab !== 'all') {
        const itemCatKey = getProductCategoryKey(item);
        if (itemCatKey !== activeTab) return false;
      }

      // Type pill filter
      if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesTag = item.tag.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubtitle && !matchesTag && !matchesType && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, selectedTypeFilter, searchQuery]);

  // Helper for item icon
  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'calculator':
        return <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'headphones':
        return <Headphones className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case 'keyboard':
        return <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'mouse':
        return <MousePointer className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('mandatory') || t.includes('neet complete') || t.includes('eapcet')) {
      return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    if (t.includes('top pick') || t.includes('best value') || t.includes('pro performance')) {
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (t.includes('stoic') || t.includes('philosophy') || t.includes('financial')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (t.includes('silent') || t.includes('clean desk') || t.includes('ergonomic')) {
      return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    }
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header Section */}
      <div
        id="store-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 md:p-10 border border-slate-700 shadow-xl"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Student Essentials &amp; Academic Store</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            🎓 Verified Student Essentials &amp; Academic Gear
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Handpicked engineering calculators, curated PYQ bundles, coding setups, and noise-cancelling audio for Telugu scholars.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>JNTU / Autonomous Exam Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Amazon Verified Portals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tested by Engineering Alumni</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive Controls & Category Tabs */}
      <div className="space-y-4">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="store-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculator, laptop, EAPCET PYQs, mouse..."
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {filteredProducts.length}
            </span>{' '}
            {filteredProducts.length === 1 ? 'item found' : 'items found'}
            {searchQuery && <span>for "{searchQuery}"</span>}
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div
          id="store-category-tabs"
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                id={`store-tab-${cat.id}`}
                type="button"
                onClick={() => {
                  setActiveTab(cat.id);
                  setSelectedTypeFilter('all');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Sub-type Pills (if multiple available) */}
        {availableTypes.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-xs flex items-center gap-1 pr-1 font-medium">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedTypeFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            {availableTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTypeFilter === t
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modern Product Grid: 3-column on desktop, 1-col on mobile */}
      {filteredProducts.length > 0 ? (
        <div
          id="store-products-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {filteredProducts.map((product) => {
            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md relative overflow-hidden"
              >
                {/* Top Badge & Type Indicator */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                      {getItemIcon(product.type)}
                      <span>{product.type}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTagColor(
                        product.tag
                      )}`}
                    >
                      {product.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-3.5 space-y-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {product.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {product.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Area with Amazon Pill Button */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[170px]">{product.category}</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Authentic Gear</span>
                    </span>
                  </div>

                  <a
                    id={`buy-btn-${product.id}`}
                    href={product.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="w-full bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group/btn"
                    title={`View ${product.title} on Amazon India`}
                  >
                    <span>View on Amazon</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No essentials match "{searchQuery}"
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try checking for typos or clear your search query to see all 34 curated student products.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setSelectedTypeFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Trust & Verification Footnote */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> StudyMacha participates in verified academic and equipment partner programs. Links open directly to authentic items on Amazon India. Prices and availability are subject to change.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">
          Updated for Academic Year 2026–2027
        </span>
      </div>
    </div>
  );
};
