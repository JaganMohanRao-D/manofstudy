import React from 'react';
import { Laptop, Calculator, ExternalLink, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { affiliateCatalog } from '../data/affiliatesData';

export interface BranchToolsBannerProps {
  branchName?: string;
  branchCode?: string;
  onNavigateToStore?: (category?: string) => void;
  className?: string;
}

export const BranchToolsBanner: React.FC<BranchToolsBannerProps> = ({
  branchName,
  branchCode,
  onNavigateToStore,
  className = '',
}) => {
  // Handpick top 2 essentials for engineering roadmaps
  const calcItem = affiliateCatalog.find((i) => i.id === 'calc-1') || affiliateCatalog[0];
  const laptopItem = affiliateCatalog.find((i) => i.id === 'lap-1') || affiliateCatalog[1];

  const titleText = branchCode
    ? `Recommended Engineering Tools & Coding Gear for ${branchCode}`
    : 'Recommended Tools & Laptops for Engineering Branches';

  return (
    <div
      id="branch-recommended-tools-banner"
      className={`bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-md ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wide">
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span>Academic Store Verified</span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
            {titleText}
          </h3>

          <p className="text-xs text-slate-300 max-w-xl mt-0.5">
            Handpicked hardware essentials, exam calculators, and coding laptops recommended for coursework and technical projects.
          </p>
        </div>

        {onNavigateToStore && (
          <button
            type="button"
            onClick={() => onNavigateToStore('Engineering & Laptops')}
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Explore Full Student Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Featured Quick Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
        {/* Item 1: Casio Calculator */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex items-center justify-between gap-3 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-600/60">
              <img
                src={calcItem.imageUrl}
                alt={calcItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Mandatory Tool
                </span>
                <span className="text-[10px] text-slate-400">• Exam Allowed</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[190px] sm:max-w-[210px]">
                {calcItem.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate max-w-[190px] sm:max-w-[210px]">
                {calcItem.subtitle}
              </p>
            </div>
          </div>

          <a
            href={calcItem.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="shrink-0 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
          >
            <span>Amazon</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Item 2: Performance Coding Laptop */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3.5 flex items-center justify-between gap-3 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-600/60">
              <img
                src={laptopItem.imageUrl}
                alt={laptopItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Top Pick for CSE &amp; ECE
                </span>
                <span className="text-[10px] text-slate-400">• 16GB RAM</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[190px] sm:max-w-[210px]">
                {laptopItem.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate max-w-[190px] sm:max-w-[210px]">
                {laptopItem.subtitle}
              </p>
            </div>
          </div>

          <a
            href={laptopItem.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="shrink-0 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
          >
            <span>Amazon</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
