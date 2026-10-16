import React from 'react';
import { Heart, Sparkles, GraduationCap, Compass, ShieldCheck, ArrowLeft, Mail, Award, Users } from 'lucide-react';

export interface AboutUsProps {
  onBack?: () => void;
  onOpenSupport?: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onBack, onOpenSupport }) => {
  const supportEmail = 'support.jamord@gmail.com';

  return (
    <div id="about-us-view" className="mos-about-view max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-200">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </button>
      )}

      {/* Hero Header */}
      <div className="mos-about-hero relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-10 space-y-4 shadow-xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Grassroots Educational Mission</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            About NAA COLLEGE
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Built from the ground up by <strong>JAGAN MOHAN RAO DUNNA</strong>, NAA COLLEGE is an open, client-side academic and career launchpad created to empower students across Andhra Pradesh, Telangana, and Pan-India to bridge the gap between tier-3 engineering classrooms and high-growth global technology careers.
          </p>
        </div>
      </div>

      {/* Founder Story & Purpose */}
      <div className="mos-about-content bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>The Origin Story: Solving Real Student Pain</span>
          </h2>
          <p>
            Every year, hundreds of thousands of Telugu students step out of intermediate colleges and into technical education. What they encounter on the internet is a frustrating landscape:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Predatory Web Tools:</strong> PDF tools and image resizers saturated with deceptive ads, popup malware, and mandatory file uploads that store sensitive student hall tickets and identity documents on unverified remote servers.
            </li>
            <li>
              <strong>Opaque Counselling Information:</strong> AP EAPCET Phase-2 leftover vacancies and college fee schedules buried across fragmented government PDF notifications, leaving students anxious during crucial web option selections.
            </li>
            <li>
              <strong>The Tier-3 Mentorship Void:</strong> Students in rural and semi-urban engineering campuses struggling with outdated curricula, 75% attendance detention stress, fear of backlogs, and zero guidance on building modern software portfolios.
            </li>
          </ul>
          <p>
            NAA COLLEGE was created by <strong>JAGAN MOHAN RAO DUNNA</strong> to eliminate this chaos. We set out to build a clean, blazing-fast, and 100% private platform where students can calculate bunks with mathematical certainty, analyze live EAPCET vacancies, access 24+ semester-by-semester degree roadmaps, and convert exam documents without uploading a single byte to a server.
          </p>
        </section>

        {/* Founder & Leadership Section */}
        <section className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/50">
                Founder &amp; Lead Architect
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              JAGAN MOHAN RAO DUNNA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Dedicated to empowering engineering scholars across India with zero-compromise, client-side academic tools.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <a href={`mailto:${supportEmail}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium underline underline-offset-2">
                {supportEmail}
              </a>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">•</span>
              <a
                href="https://jagan-me.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
              >
                Personal Portfolio ↗
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://www.linkedin.com/in/jagan-mohan-rao-dunna-546b72423"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#084e96] rounded-lg transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>Connect on LinkedIn</span>
            </a>
            <a
              href="https://jagan-me.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg border border-blue-200 dark:border-blue-900 transition-colors"
            >
              <span>View Portfolio ↗</span>
            </a>
          </div>
        </section>

        {/* Our 4 Guiding Commitments */}
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Our Core Operating Principles</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">1. 100% Free Forever</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Education tools should never be gated behind paywalls. Every calculator, PDF tool, branch roadmap, and scholarship listing on NAA COLLEGE is free for every student.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">2. In-Browser Privacy By Design</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero server-side file uploads. Everything runs locally in WebAssembly and JavaScript in your device's memory. Your personal documents never leave your hands.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">3. Rigorous Empirical Accuracy</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We calibrate formulas against official university ordinances (JNTUK, JNTUA, AU, VTU, Anna University) and verified public government datasets.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-xs block">4. Practical Tier-3 Empowerment</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Actionable advice that acknowledges real-world constraints: building verifiable public GitHub proof-of-work, winning off-campus referrals, and mastering problem-solving patterns.
              </p>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Keep NAA COLLEGE Independent &amp; Ad-Clean</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              NAA COLLEGE is maintained independently. If our tools saved your attendance or helped you plan admissions, consider buying a coffee.
            </p>
          </div>
          {onOpenSupport && (
            <button
              type="button"
              onClick={onOpenSupport}
              aria-label="Support Naa College"
              title="Support Naa College"
              className="inline-flex items-center justify-center gap-2 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full sm:rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Heart className="w-4 h-4 fill-current sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Support Naa College ☕</span>
            </button>
          )}
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
