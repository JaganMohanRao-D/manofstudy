import React, { useState } from 'react';
import {
  Compass,
  Download,
  Calendar,
  Layers,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Shield,
  Cpu,
  Wrench,
  Building2,
  Terminal,
  FlaskConical,
  Binary,
  Coins,
  Landmark,
  Dna,
  HeartPulse,
  Sprout,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { BranchRoadmap } from '../../types';

interface BranchCardProps {
  branch: BranchRoadmap;
  onOpenModal: (branch: BranchRoadmap) => void;
  onDownloadPdf: (e: React.MouseEvent, branch: BranchRoadmap) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onOpenModal,
  onDownloadPdf,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Category-based aesthetic gradients and watermarks
  const categoryTheme = React.useMemo(() => {
    const cat = branch.bannerCategory || branch.category;
    switch (cat) {
      case 'security':
        return {
          gradient: 'from-zinc-950 via-emerald-950 to-teal-950 border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          accentText: 'text-emerald-400',
          icon: Shield,
          watermarkColor: 'text-emerald-500/10',
          glow: 'from-emerald-600/20',
        };
      case 'electronics':
        return {
          gradient: 'from-slate-950 via-sky-950 to-amber-950/60 border-amber-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-400',
          icon: Cpu,
          watermarkColor: 'text-amber-500/10',
          glow: 'from-amber-600/20',
        };
      case 'mechanical':
        return {
          gradient: 'from-zinc-950 via-rose-950/70 to-slate-950 border-rose-500/30',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
          accentText: 'text-rose-400',
          icon: Wrench,
          watermarkColor: 'text-rose-500/10',
          glow: 'from-rose-600/20',
        };
      case 'civil':
        return {
          gradient: 'from-stone-950 via-amber-950/60 to-slate-950 border-stone-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-400',
          icon: Building2,
          watermarkColor: 'text-amber-500/10',
          glow: 'from-amber-600/20',
        };
      case 'biotech':
        return {
          gradient: 'from-teal-950 via-emerald-950 to-cyan-950 border-teal-500/30',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
          accentText: 'text-teal-400',
          icon: FlaskConical,
          watermarkColor: 'text-teal-500/10',
          glow: 'from-teal-600/20',
        };
      case 'science':
        return {
          gradient: 'from-slate-950 via-cyan-950 to-blue-950 border-cyan-500/30',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
          accentText: 'text-cyan-400',
          icon: Binary,
          watermarkColor: 'text-cyan-500/10',
          glow: 'from-cyan-600/20',
        };
      case 'commerce':
        return {
          gradient: 'from-slate-950 via-emerald-950/80 to-amber-950/70 border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          accentText: 'text-emerald-400',
          icon: Coins,
          watermarkColor: 'text-emerald-500/10',
          glow: 'from-emerald-600/20',
        };
      case 'humanities':
        return {
          gradient: 'from-stone-950 via-purple-950/60 to-slate-950 border-purple-500/30',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
          accentText: 'text-purple-400',
          icon: Landmark,
          watermarkColor: 'text-purple-500/10',
          glow: 'from-purple-600/20',
        };
      case 'pharma':
        return {
          gradient: 'from-slate-950 via-teal-950 to-blue-950 border-teal-500/30',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
          accentText: 'text-teal-400',
          icon: Pill,
          watermarkColor: 'text-teal-500/10',
          glow: 'from-teal-600/20',
        };
      case 'agri':
        return {
          gradient: 'from-slate-950 via-emerald-950 to-lime-950/70 border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          accentText: 'text-emerald-400',
          icon: Sprout,
          watermarkColor: 'text-emerald-500/10',
          glow: 'from-emerald-600/20',
        };
      case 'nursing':
        return {
          gradient: 'from-slate-950 via-rose-950/80 to-sky-950 border-rose-500/30',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
          accentText: 'text-rose-400',
          icon: HeartPulse,
          watermarkColor: 'text-rose-500/10',
          glow: 'from-rose-600/20',
        };
      case 'healthcare':
        return {
          gradient: 'from-slate-950 via-cyan-950 to-teal-950 border-cyan-500/30',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
          accentText: 'text-cyan-400',
          icon: Dna,
          watermarkColor: 'text-cyan-500/10',
          glow: 'from-cyan-600/20',
        };
      case 'computing':
      default:
        return {
          gradient: 'from-slate-950 via-indigo-950 to-cyan-950/70 border-indigo-500/30',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
          accentText: 'text-indigo-400',
          icon: Terminal,
          watermarkColor: 'text-indigo-500/10',
          glow: 'from-indigo-600/20',
        };
    }
  }, [branch]);

  const WatermarkIcon = categoryTheme.icon;
  const topicsLabel = branch.topicsCount || '800+ Topics • 4 Years';
  const acronymText = branch.acronym || branch.code;

  return (
    <div
      id={`branch-card-${branch.id}`}
      onClick={() => onOpenModal(branch)}
      className="group relative flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Card Thumbnail / Header Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        {!imgFailed ? (
          <img
            src={`/roadmaps/${branch.id}.png`}
            alt={`${branch.name} Roadmap`}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : null}

        {/* Fallback or Overlay Banner */}
        {imgFailed && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryTheme.gradient} p-4 flex flex-col justify-between border-b border-slate-800`}
          >
            {/* Ambient Glow */}
            <div
              className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${categoryTheme.glow} blur-2xl pointer-events-none`}
            />

            {/* SVG Watermark Icon */}
            <WatermarkIcon
              className={`absolute right-3 bottom-2 w-28 h-28 ${categoryTheme.watermarkColor} pointer-events-none transform rotate-12 transition-transform group-hover:scale-110 duration-300`}
            />

            {/* Top Bar: Code Badge + Topics Pill */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase border ${categoryTheme.badgeBg}`}
              >
                {branch.code}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-xs">
                <Layers className="w-3 h-3 text-indigo-300" />
                <span>{topicsLabel}</span>
              </span>
            </div>

            {/* Center: Prominent Branch Acronym */}
            <div className="relative z-10 my-auto text-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md font-mono">
                {acronymText}
              </span>
            </div>

            {/* Bottom Bar: Discipline Label */}
            <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-slate-200">
              <span className="truncate max-w-[200px]">{branch.categoryLabel}</span>
              <span className="text-[10px] text-slate-200 font-mono font-bold px-1.5 py-0.5 rounded bg-white/20">
                {branch.degreeType || 'B.Tech'}
              </span>
            </div>
          </div>
        )}

        {/* Semi-transparent bottom gradient for text contrast if image was loaded */}
        {!imgFailed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-between p-3.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-black/70 text-white border border-white/20 backdrop-blur-xs">
                {branch.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 text-slate-200 border border-white/20 backdrop-blur-xs">
                {topicsLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-semibold text-slate-100">{branch.categoryLabel}</span>
              <span className="text-[10px] text-slate-200 font-mono font-bold px-1.5 py-0.5 rounded bg-white/25">
                {branch.degreeType || 'B.Tech'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="space-y-2">
          {/* Badge Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
              <Compass className="w-3 h-3" />
              {branch.badge}
            </span>
            {branch.degreeType && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {branch.degreeType}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
            {branch.name}
          </h3>

          {/* Tagline / High-Contrast Description */}
          <p className="text-slate-600 dark:text-slate-300 font-normal text-xs sm:text-sm leading-relaxed line-clamp-2">
            {branch.tagline}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Entry Salary Preview */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Entry Tier:
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
              {branch.strategicOverview.salaryBrackets.entryTier}
            </span>
          </div>

          {/* Target Role preview */}
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 font-medium text-xs truncate">
              {branch.strategicOverview.targetRoles.slice(0, 2).join(' • ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenModal(branch)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
          >
            <span>View {branch.years ? branch.years.length : 4}-Year Blueprint</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            title={`Download ${branch.code} PDF Roadmap`}
            onClick={(e) => onDownloadPdf(e, branch)}
            className="shrink-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label={`Download ${branch.code} PDF`}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
