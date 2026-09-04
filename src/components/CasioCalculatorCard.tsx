import React from 'react';
import { Calculator, ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';

export interface CasioCalculatorCardProps {
  onNavigateToStore?: () => void;
  className?: string;
}

export const CasioCalculatorCard: React.FC<CasioCalculatorCardProps> = ({
  onNavigateToStore,
  className = '',
}) => {
  return (
    <div
      id="casio-exam-calculator-card"
      className={`bg-linear-to-r from-amber-50 via-orange-50/50 to-amber-50/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-amber-200/90 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left icon and info */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Mandatory Exam Tool
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Permitted in JNTU, AU, SVU &amp; Autonomous Hall Tickets</span>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Casio fx-991CW ClassWiz Scientific Calculator
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Essential non-programmable scientific calculator with natural textbook display. Permitted across all engineering semester examinations, internal lab evaluations, and GATE prep.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
          {onNavigateToStore && (
            <button
              type="button"
              onClick={onNavigateToStore}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span>More Student Gear</span>
            </button>
          )}

          <a
            id="buy-casio-calc-cta"
            href="https://link.amazon/B0cSKT99f"
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-slate-950 font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group"
          >
            <span>View on Amazon</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
