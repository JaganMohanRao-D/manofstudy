import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Filter,
  GraduationCap,
  IndianRupee,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export interface VerifiedInternship {
  id: string;
  name: string;
  provider: string;
  trackType: 'govt' | 'platform' | 'toptech' | 'research' | 'defense' | 'opensource';
  trackLabel: string;
  stipend: string;
  stipendType: 'Paid' | 'Varies' | 'Unpaid / Credit' | 'Program-specific';
  eligibility: string;
  applicationWindow: string;
  status: 'Open / Rolling' | 'Cycle-based' | 'Check live openings';
  description: string;
  applyUrl: string;
  officialSource: string;
  verifiedBadges: string[];
  selectionProcess: string;
  yearFit: '1st year friendly' | '1st–2nd year friendly' | 'Later-year / role-specific' | 'All years / listing-specific';
}

export const VERIFIED_INTERNSHIPS: VerifiedInternship[] = [
  {
    id: 'aicte-national-internship-portal',
    name: 'AICTE National Internship Portal',
    provider: 'AICTE • Ministry of Education, Government of India',
    trackType: 'govt',
    trackLabel: 'Government & Industry',
    stipend: 'Varies by individual listing',
    stipendType: 'Varies',
    eligibility: 'Students from eligible AICTE / UGC / IGNOU and other recognised institutions; eligibility is defined by each internship listing.',
    applicationWindow: 'Rolling • live opportunities are published on the portal',
    status: 'Open / Rolling',
    description: 'The official National Internship Portal connects students with internships across government missions, public-sector organisations, Smart Cities / TULIP, MSMEs and industry partners. Apply through the central portal rather than an unofficial copycat site.',
    applyUrl: 'https://internship.aicte-india.org/',
    officialSource: 'AICTE National Internship Portal',
    verifiedBadges: ['Government of India', 'AICTE Official', '₹0 Student Registration'],
    selectionProcess: 'Listing-specific: profile screening, assessment and/or interview as specified by the host organisation.',
    yearFit: 'All years / listing-specific',
  },
  {
    id: 'google-student-engineering',
    name: 'Google Careers • Student Engineering Internships',
    provider: 'Google',
    trackType: 'toptech',
    trackLabel: 'Top Tech',
    stipend: 'Role-specific • see the live Google posting',
    stipendType: 'Program-specific',
    eligibility: 'Varies by role, graduation year and location. Google student programs and engineering internships can have different year requirements; check the live posting before applying.',
    applicationWindow: 'Cycle-based • openings appear on Google Careers',
    status: 'Check live openings',
    description: 'Official Google Careers route for engineering and technical student opportunities. STEP and other early-career programs may be offered in particular cycles; do not assume every cycle is open to first-year students.',
    applyUrl: 'https://www.google.com/about/careers/applications/students/engineering-and-technical-internships/',
    officialSource: 'Google Careers',
    verifiedBadges: ['Google Official', 'Student Careers', 'Direct Employer Portal'],
    selectionProcess: 'Role-specific screening and technical assessment/interviews; requirements are stated in each posting.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'microsoft-explore',
    name: 'Microsoft Explore',
    provider: 'Microsoft',
    trackType: 'toptech',
    trackLabel: 'Early Tech',
    stipend: 'Competitive pay • see the live programme posting',
    stipendType: 'Paid',
    eligibility: 'Designed for early undergraduate students. Microsoft states that the India Explore programme is an 8-week summer internship for first- and/or second-year college students, subject to the current application rules.',
    applicationWindow: 'Summer programme • cycle-based',
    status: 'Cycle-based',
    description: 'A Microsoft programme built for students beginning their studies, with software-development exposure, mentoring, community building and a team project covering design, build and quality.',
    applyUrl: 'https://careers.microsoft.com/v2/global/en/exploremicrosoft',
    officialSource: 'Microsoft Careers',
    verifiedBadges: ['Microsoft Official', '1st / 2nd Year Focus', '8-Week India Programme'],
    selectionProcess: 'Application screening followed by programme-specific selection steps.',
    yearFit: '1st–2nd year friendly',
  },
  {
    id: 'niti-aayog-internship',
    name: 'NITI Aayog Internship Scheme',
    provider: 'NITI Aayog • Government of India',
    trackType: 'govt',
    trackLabel: 'Public Policy & Tech',
    stipend: 'Check current scheme guidelines',
    stipendType: 'Program-specific',
    eligibility: 'Undergraduate / postgraduate students and research scholars enrolled in recognised universities or institutions; domain and duration requirements follow NITI Aayog guidelines.',
    applicationWindow: 'Online application window: 1st–10th of every month',
    status: 'Cycle-based',
    description: 'Work with NITI Aayog verticals, divisions and cells across policy and development areas. The official site confirms a monthly online application window from the 1st to the 10th.',
    applyUrl: 'https://www.niti.gov.in/internship',
    officialSource: 'NITI Aayog',
    verifiedBadges: ['Government of India', 'Monthly Window', 'Official Application'],
    selectionProcess: 'Online application and selection by the relevant NITI Aayog vertical; exact criteria are scheme-specific.',
    yearFit: 'All years / listing-specific',
  },
  {
    id: 'isro-student-internship',
    name: 'ISRO Student Internships & Projects',
    provider: 'Indian Space Research Organisation • Department of Space',
    trackType: 'research',
    trackLabel: 'Space Research',
    stipend: 'Centre / programme-specific',
    stipendType: 'Program-specific',
    eligibility: 'ISRO lists internship and academic-project opportunities for undergraduate and postgraduate students in science and technology; individual ISRO centres define their own eligibility and intake.',
    applicationWindow: 'Centre-specific • summer, winter and long-term opportunities may be offered',
    status: 'Check live openings',
    description: 'Official ISRO route for internships, curriculum projects and training in space science and technology. Opportunities differ by centre, programme and academic background.',
    applyUrl: 'https://www.isro.gov.in/Internship.html',
    officialSource: 'ISRO',
    verifiedBadges: ['Government of India', 'ISRO Official', 'Research / Projects'],
    selectionProcess: 'Centre-specific application, academic screening and project availability.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'rbi-summer-internship',
    name: 'RBI Summer Internship',
    provider: 'Reserve Bank of India',
    trackType: 'research',
    trackLabel: 'Banking & Research',
    stipend: 'Check the current RBI notification',
    stipendType: 'Program-specific',
    eligibility: 'Eligibility, disciplines, year of study, location and stipend are governed by the current RBI Summer Internship notification.',
    applicationWindow: 'Annual / notification-based',
    status: 'Cycle-based',
    description: 'A research-oriented student opportunity at India’s central bank. Use the official RBI opportunities portal for the current notification rather than relying on old stipend or eligibility figures circulating online.',
    applyUrl: 'https://opportunities.rbi.org.in/',
    officialSource: 'RBI Opportunities',
    verifiedBadges: ['RBI Official', 'Research Focus', 'Central Bank'],
    selectionProcess: 'Notification-specific screening and selection.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'amazon-student-internships',
    name: 'Amazon University Talent • Student Internships',
    provider: 'Amazon',
    trackType: 'toptech',
    trackLabel: 'Top Tech',
    stipend: 'Role-specific • see the live Amazon.jobs listing',
    stipendType: 'Paid',
    eligibility: 'Varies by role and graduation year. Current India SDE internship examples can require a specific graduation year and age of 18+, so students must read the exact posting.',
    applicationWindow: 'Multiple cycles / live job postings',
    status: 'Check live openings',
    description: 'Official Amazon.jobs student internship route covering software, cloud and other technical roles. Each job posting is the source of truth for graduation year, age, location and technical requirements.',
    applyUrl: 'https://www.amazon.jobs/content/en/teams/amazon-web-services/internships',
    officialSource: 'Amazon Jobs',
    verifiedBadges: ['Amazon Official', 'Direct Employer Portal', 'Role-specific'],
    selectionProcess: 'Application screening, online assessment and technical interviews where required by the role.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'drdo-student-internships',
    name: 'DRDO Student Internships',
    provider: 'Defence Research & Development Organisation • Ministry of Defence',
    trackType: 'defense',
    trackLabel: 'Defence Research',
    stipend: 'Paid or programme-specific • see lab notification',
    stipendType: 'Program-specific',
    eligibility: 'Lab-specific. DRDO publishes individual internship advertisements for engineering UG/PG students and states the eligible disciplines, dates and application process in each notice.',
    applicationWindow: 'Lab-specific • vacancy notifications',
    status: 'Check live openings',
    description: 'Official DRDO labs publish student internship notifications independently. Recent 2026 notices included paid engineering internships at CFEES Delhi, LRDE Bengaluru and DRDL Hyderabad.',
    applyUrl: 'https://drdo.gov.in/drdo/en/careers',
    officialSource: 'DRDO Careers / Vacancy Notices',
    verifiedBadges: ['Government of India', 'DRDO Official', 'Lab-specific'],
    selectionProcess: 'As stated in the individual DRDO laboratory advertisement; academic and document screening may apply.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'ibm-student-internships',
    name: 'IBM Student Internships',
    provider: 'IBM',
    trackType: 'toptech',
    trackLabel: 'Enterprise Tech',
    stipend: 'Role-specific • see the live IBM opening',
    stipendType: 'Paid',
    eligibility: 'Varies by internship. IBM offers student internships across technical and business areas; each opening states its own degree, skills and location requirements.',
    applicationWindow: 'Live openings / cycle-based',
    status: 'Check live openings',
    description: 'Official IBM Careers internship hub with direct employer applications. Technical opportunities can span software, cloud, AI and infrastructure depending on current openings.',
    applyUrl: 'https://www.ibm.com/careers/internships',
    officialSource: 'IBM Careers',
    verifiedBadges: ['IBM Official', 'Direct Employer Portal', 'Multiple Domains'],
    selectionProcess: 'Role-specific application screening and interviews/assessments.',
    yearFit: 'Later-year / role-specific',
  },
  {
    id: 'unstop-internships',
    name: 'Unstop Internship Opportunities',
    provider: 'Unstop',
    trackType: 'platform',
    trackLabel: 'Opportunity Platform',
    stipend: 'Varies by employer / listing',
    stipendType: 'Varies',
    eligibility: 'Varies by listing. Read the employer, eligibility, stipend and work-mode details before applying.',
    applicationWindow: 'Continuous listings',
    status: 'Open / Rolling',
    description: 'A large student opportunity platform for internships, competitions and jobs. This is not a government verification layer: treat each employer listing independently and use the platform as a discovery source.',
    applyUrl: 'https://unstop.com/internship',
    officialSource: 'Unstop',
    verifiedBadges: ['Student Platform', 'Many Employers', 'Verify Each Listing'],
    selectionProcess: 'Employer-specific: resume screening, tests, assignments or interviews.',
    yearFit: 'All years / listing-specific',
  },
  {
    id: 'prosple-india',
    name: 'Prosple India',
    provider: 'Prosple',
    trackType: 'platform',
    trackLabel: 'Opportunity Platform',
    stipend: 'Varies by employer / listing',
    stipendType: 'Varies',
    eligibility: 'Varies by listing. Check the individual employer requirements and application page.',
    applicationWindow: 'Continuous listings',
    status: 'Open / Rolling',
    description: 'Student and graduate opportunity platform with employer listings. Use it for discovery, then verify the employer, role and final application destination.',
    applyUrl: 'https://in.prosple.com/',
    officialSource: 'Prosple',
    verifiedBadges: ['Student Platform', 'Employer Listings', 'Verify Each Listing'],
    selectionProcess: 'Employer-specific.',
    yearFit: 'All years / listing-specific',
  },
  {
    id: 'lfx-mentorship',
    name: 'Linux Foundation LFX Mentorship',
    provider: 'The Linux Foundation',
    trackType: 'opensource',
    trackLabel: 'Open Source',
    stipend: 'Project / term-specific',
    stipendType: 'Program-specific',
    eligibility: 'Depends on the individual mentorship project and term; students and developers should check the current project requirements.',
    applicationWindow: 'Multiple mentorship terms',
    status: 'Cycle-based',
    description: 'Open-source mentorship opportunities across Linux Foundation projects. Strong fit for students who want public code contributions and maintainer mentorship.',
    applyUrl: 'https://lfx.linuxfoundation.org/tools/mentorship/',
    officialSource: 'Linux Foundation LFX',
    verifiedBadges: ['Linux Foundation', 'Open Source', 'Mentor-led'],
    selectionProcess: 'Project-specific proposal, technical evidence and maintainer selection.',
    yearFit: 'All years / listing-specific',
  },
  {
    id: 'gsoc',
    name: 'Google Summer of Code',
    provider: 'Google Open Source Programs Office',
    trackType: 'opensource',
    trackLabel: 'Open Source',
    stipend: 'Project / location-specific',
    stipendType: 'Program-specific',
    eligibility: 'Eligibility and age requirements are defined by the current GSoC programme rules and should be checked for the active cycle.',
    applicationWindow: 'Annual programme cycle',
    status: 'Cycle-based',
    description: 'A global open-source programme where accepted contributors work with participating open-source organisations. Applications, dates and eligibility change by cycle.',
    applyUrl: 'https://summerofcode.withgoogle.com/',
    officialSource: 'Google Summer of Code',
    verifiedBadges: ['Google Official', 'Open Source', 'Global Programme'],
    selectionProcess: 'Organisation selection plus contributor proposal and mentor evaluation.',
    yearFit: 'All years / listing-specific',
  },
];

const TRACKS = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'govt', label: 'Government', icon: Landmark },
  { id: 'toptech', label: 'Top Tech', icon: Code2 },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'defense', label: 'Defence & Space', icon: ShieldCheck },
  { id: 'opensource', label: 'Open Source', icon: Users },
  { id: 'platform', label: 'Platforms', icon: GraduationCap },
] as const;

export const InternshipsRadar: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInternships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VERIFIED_INTERNSHIPS.filter((item) => {
      const trackMatch = selectedTrack === 'all' || item.trackType === selectedTrack;
      if (!trackMatch) return false;
      if (!q) return true;
      return [item.name, item.provider, item.trackLabel, item.description, item.eligibility, item.stipend]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [selectedTrack, searchQuery]);

  const govtCount = VERIFIED_INTERNSHIPS.filter((i) => i.trackType === 'govt').length;
  const firstYearCount = VERIFIED_INTERNSHIPS.filter((i) => i.yearFit === '1st year friendly' || i.yearFit === '1st–2nd year friendly').length;

  return (
    <div id="verified-internships-radar" className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.18),transparent_35%),linear-gradient(135deg,#07121a,#07131d_55%,#061016)] p-5 sm:p-7 lg:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Official-source directory
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300">
              Updated for 2026 discovery
            </span>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Student <span className="text-emerald-400">Internship Radar</span>
            </h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-7 text-slate-300">
              A clean starting point for finding real internship programmes and employer portals.
              Government schemes and company careers are separated from open opportunity platforms so students can judge each listing correctly.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Programmes</p>
              <p className="mt-1 text-xl font-black text-white">{VERIFIED_INTERNSHIPS.length}+</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Government</p>
              <p className="mt-1 text-xl font-black text-white">{govtCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Early-year friendly</p>
              <p className="mt-1 text-xl font-black text-white">{firstYearCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-3.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Direct links</p>
              <p className="mt-1 text-xl font-black text-emerald-300">Official</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[.06] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h2 className="text-sm font-bold text-amber-200">Apply safely</h2>
            <p className="mt-1 text-xs sm:text-sm leading-6 text-amber-100/80">
              Man of Study links to the official programme or platform. Always read the current listing before submitting documents.
              Never pay a recruiter or unknown person to “guarantee” selection, and do not treat an opportunity platform as proof that every employer listing is genuine.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-2 z-20 rounded-2xl border border-slate-200/10 bg-slate-950/90 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Google, AICTE, Microsoft, ISRO, CSE, remote..."
              aria-label="Search internships"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {TRACKS.map((track) => {
              const Icon = track.icon;
              const active = selectedTrack === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrack(track.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${active
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {track.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-bold text-white">{filteredInternships.length} opportunities</p>
          <p className="text-[11px] text-slate-500">Programme details can change; official posting is the final source of truth.</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
          <Filter className="h-3.5 w-3.5" /> Filtered live in the browser
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredInternships.map((intern) => (
          <article key={intern.id} className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-800 bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:shadow-emerald-950/20">
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                  <BadgeCheck className="h-3 w-3" /> {intern.trackLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                  <Clock3 className="h-3 w-3" /> {intern.status}
                </span>
              </div>

              <h3 className="mt-4 text-lg sm:text-xl font-extrabold leading-snug tracking-tight text-white">
                {intern.name}
              </h3>
              <p className="mt-1 flex items-start gap-1.5 text-xs font-semibold leading-5 text-slate-400">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                {intern.provider}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-300">{intern.description}</p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Stipend
                  </div>
                  <p className="mt-1.5 text-xs font-bold leading-5 text-emerald-300">{intern.stipend}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5 text-cyan-400" /> Year fit
                  </div>
                  <p className="mt-1.5 text-xs font-bold leading-5 text-slate-200">{intern.yearFit}</p>
                </div>
              </div>

              <div className="mt-2.5 rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 text-cyan-400" /> Application window
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{intern.applicationWindow}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <ArrowUpRight className="h-3.5 w-3.5 text-amber-300" /> Selection
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{intern.selectionProcess}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Eligibility</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{intern.eligibility}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {intern.verifiedBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-800 bg-slate-950/40 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-slate-500">Source: {intern.officialSource}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Source-linked
                </span>
              </div>
              <a
                href={intern.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
              >
                Visit Official / Application Page
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filteredInternships.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <Search className="mx-auto h-9 w-9 text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-white">No matching opportunities</h3>
          <p className="mt-1 text-xs text-slate-500">Try a company, domain, programme or branch keyword.</p>
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-white">How Man of Study verifies this directory</h2>
            <p className="mt-1 text-xs sm:text-sm leading-6 text-slate-400">
              Entries are linked to an official government, company or programme website. For marketplaces such as Unstop and Prosple,
              the platform itself is separated from government/company programmes and each employer listing should still be checked independently.
              Deadlines, stipend amounts and eligibility can change, so the live source always wins.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InternshipsRadar;
