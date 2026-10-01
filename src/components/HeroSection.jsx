import React from 'react';
import { ShieldCheck, Database, Lock, ArrowRight, Map, Trophy, ClipboardCheck, GraduationCap, Sparkles, FileText, Image as ImageIcon, Route, BriefcaseBusiness } from 'lucide-react';
import { FeaturesHub } from './FeaturesHub';

export const HeroSection = ({ activeWorkspace = 'hub', onSelectWorkspace }) => {
  const go = (workspace, tab) => {
    if (tab) {
      window.location.hash = tab;
    }
    onSelectWorkspace?.(workspace);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigatorItems = [
    { label: 'AP EAPCET College Predictor', note: 'Explore colleges around your rank', workspace: 'ap-predictor', icon: Map },
    { label: 'TG EAPCET College Predictor', note: 'Filter Telangana options by rank', workspace: 'tg-predictor', icon: Map },
    { label: 'AP & TG Top B.Tech Colleges', note: 'Branch-wise counselling data', workspace: 'ap-top-colleges', icon: Trophy },
    { label: 'AP / TG Allotments', note: 'Search namewise allotment records', workspace: 'ap-allotments', icon: ClipboardCheck },
    { label: 'Scholarships Directory', note: 'Government, CSR and private schemes', workspace: 'scholarships', icon: GraduationCap },
    { label: 'Mock Test Series', note: 'CBT-style practice for students', workspace: 'mock-tests', icon: ClipboardCheck },
    { label: 'AI Student Gap Analyzer', note: 'Find skills to work on next', workspace: 'gap-analyzer', icon: Sparkles },
    { label: 'Student Utility Toolkit', note: 'PDF, image, resume and study tools', workspace: 'utilities', tab: 'pdf-tools', icon: FileText },
  ];

  return (
    <section id="hero-banner" className="relative overflow-hidden bg-[#030914] text-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.18) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/8 px-3.5 py-1.5 text-xs font-bold text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.8)]" />
              Built around real student workflows
            </div>

            <h1 className="text-[2.55rem] font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.35rem]">
              Your student journey,
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-white bg-clip-text text-transparent">in one place.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Man of Study brings admissions data, college discovery, scholarships, mock tests and everyday academic utilities into one focused student platform.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => go('ap-predictor')} className="group inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/15 transition hover:bg-cyan-300">
                Explore AP tools <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button type="button" onClick={() => go('tg-predictor')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-white">
                Explore TG tools
              </button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/8 py-5">
              <div className="pr-4"><p className="text-2xl font-black text-white">247</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">AP colleges</p></div>
              <div className="border-l border-white/8 px-4"><p className="text-2xl font-black text-white">151</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">TG colleges</p></div>
              <div className="border-l border-white/8 pl-4"><p className="text-2xl font-black text-white">Free</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Student tools</p></div>
            </div>
          </div>

          <div className="relative lg:pl-2">
            <div className="rounded-[26px] border border-cyan-300/12 bg-[#081321]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="rounded-[20px] border border-white/7 bg-[#0b1726]">
                <div className="flex items-center justify-between border-b border-white/7 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Man of Study Navigator</p>
                    <h2 className="mt-1 text-base font-extrabold text-white sm:text-lg">Choose what you need today</h2>
                  </div>
                  <div className="rounded-lg border border-cyan-300/10 bg-cyan-400/8 px-2.5 py-1 text-[10px] font-bold text-cyan-200">FREE</div>
                </div>

                <div className="space-y-1.5 p-2 sm:p-3">
                  {navigatorItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} type="button" onClick={() => go(item.workspace, item.tab)} className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-cyan-300/10 hover:bg-cyan-400/7">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/10 bg-cyan-400/8"><Icon className="h-4 w-4 text-cyan-300" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-200 group-hover:text-white">{item.label}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.note}</span></span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 border-t border-white/7">
                  <div className="px-3 py-4 text-center"><p className="text-lg font-black text-cyan-300">AP</p><p className="text-[9px] uppercase tracking-wider text-slate-600">Admissions</p></div>
                  <div className="border-l border-white/7 px-3 py-4 text-center"><p className="text-lg font-black text-cyan-300">TG</p><p className="text-[9px] uppercase tracking-wider text-slate-600">Admissions</p></div>
                  <div className="border-l border-white/7 px-3 py-4 text-center"><p className="text-lg font-black text-cyan-300">24/7</p><p className="text-[9px] uppercase tracking-wider text-slate-600">Browser tools</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-3 border-t border-white/8 pt-7 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><div><p className="text-sm font-bold text-slate-200">Student-first access</p><p className="mt-1 text-xs leading-5 text-slate-500">Keep the common tasks simple, visible and easy to reach.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4"><Database className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><div><p className="text-sm font-bold text-slate-200">Counselling-focused data</p><p className="mt-1 text-xs leading-5 text-slate-500">AP and Telangana admission tools are grouped by the student journey.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4"><Lock className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><div><p className="text-sm font-bold text-slate-200">Useful beyond admissions</p><p className="mt-1 text-xs leading-5 text-slate-500">Academic, career and document utilities stay one click away.</p></div></div>
        </div>
      </div>

      <div id="features-hub" className="relative border-t border-white/8 bg-[#050d18]">
        <FeaturesHub activeWorkspace={activeWorkspace} onSelectWorkspace={onSelectWorkspace} />
      </div>
    </section>
  );
};

export default HeroSection;
