import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  DollarSign,
  GraduationCap,
  Landmark,
  BadgeCheck,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';

export interface VerifiedInternship {
  id: string;
  name: string;
  provider: string;
  trackType: 'govt' | 'opensource' | 'defense' | 'toptech' | 'research';
  trackLabel: string;
  stipend: string;
  stipendType: 'Paid' | 'High Stipend' | 'Funded Fellow';
  eligibility: string;
  applicationWindow: string;
  status: 'Active / Open' | 'Opening Soon' | 'Annual Cycle';
  description: string;
  applyUrl: string;
  verifiedBadges: string[];
  selectionProcess: string;
}

export const VERIFIED_INTERNSHIPS: VerifiedInternship[] = [
  {
    id: 'aicte-portal',
    name: 'AICTE Official National Internship Portal',
    provider: 'Ministry of Education & All India Council for Technical Education',
    trackType: 'govt',
    trackLabel: 'Government & Municipal',
    stipend: '₹5,000 - ₹15,000 / month (or Govt Certificate)',
    stipendType: 'Paid',
    eligibility: 'B.Tech / B.E / B.Sc / B.Com students from recognized Indian colleges (1st to 4th year)',
    applicationWindow: 'Rolling (New listings published weekly)',
    status: 'Active / Open',
    description: '100% verified non-scam internship portal directly run by AICTE. Connects students to official municipal corporations (TULIP - The Urban Learning Internship Program), NHAI highway planning, smart city projects, and vetted MSMEs.',
    applyUrl: 'https://internship.aicte-india.org/',
    verifiedBadges: ['Ministry of Education Verified', 'TULIP Certified', 'No Application Fee'],
    selectionProcess: 'Profile shortlisting + online assessment/interview conducted by participating civic bodies.',
  },
  {
    id: 'gsoc-2026',
    name: 'Google Summer of Code (GSoC 2026)',
    provider: 'Google Open Source Programs Office',
    trackType: 'opensource',
    trackLabel: 'Global Open Source',
    stipend: '$1,500 – $3,300 USD (based on project size & purchasing power parity in India)',
    stipendType: 'High Stipend',
    eligibility: 'Any university student or open source beginner aged 18+ globally',
    applicationWindow: 'March – April (Annual Spring Cycle)',
    status: 'Active / Open',
    description: 'Premier global program pairing student developers with open-source mentor organizations (Apache, Linux Foundation, Python Software Foundation, Blender, Mozilla). Students complete an 8- to 22-week coding project under expert guidance.',
    applyUrl: 'https://summerofcode.withgoogle.com/',
    verifiedBadges: ['Google Backed', 'Global Elite Resume Item', 'Zero Fee'],
    selectionProcess: 'Proposal submission detailing technical approach, timeline, and prior open-source pull requests to mentor orgs.',
  },
  {
    id: 'drdo-isro-trainee',
    name: 'DRDO & ISRO Student Apprentice & Trainee Programs',
    provider: 'Defense Research & Development Org (DRDO) / ISRO Space Centers',
    trackType: 'defense',
    trackLabel: 'Defense & Space Research',
    stipend: '₹8,000 - ₹12,000 / month (Apprentice Act) / Research Grant',
    stipendType: 'Paid',
    eligibility: 'Pre-final and Final Year B.Tech / M.Sc students in ECE, CSE, Mech, Aero, Physics',
    applicationWindow: 'January – May & July – October cycles',
    status: 'Active / Open',
    description: 'Official student trainee and research project placements at centers like VSSC (Thiruvananthapuram), URSC (Bengaluru), NRSC (Hyderabad), and DRDO labs. Work directly under defense scientists on propulsion, radar, telemetry, and avionics.',
    applyUrl: 'https://www.drdo.gov.in/careers',
    verifiedBadges: ['Govt of India', 'Defense Clearance', 'High Prestige'],
    selectionProcess: 'Academic merit ranking (CGPA 7.5+), College No-Objection Certificate (NOC), and technical interview.',
  },
  {
    id: 'lfx-mentorship',
    name: 'Linux Foundation Mentorship (LFX)',
    provider: 'The Linux Foundation & Cloud Native Computing Foundation (CNCF)',
    trackType: 'opensource',
    trackLabel: 'Global Open Source',
    stipend: '$3,000 – $6,600 USD (full-term stipend based on country PPP)',
    stipendType: 'High Stipend',
    eligibility: 'Undergraduate and graduate students with Git and core systems programming skills',
    applicationWindow: 'Spring (Jan), Summer (May), Fall (Aug) terms',
    status: 'Active / Open',
    description: 'Paid open source apprenticeship program where students contribute directly to mission-critical infrastructure software: Kubernetes, Linux Kernel, Envoy, Hyperledger, RISC-V, and PyTorch.',
    applyUrl: 'https://lfx.linuxfoundation.org/tools/mentorship/',
    verifiedBadges: ['Linux Foundation Official', 'Cloud Native Certified', 'Full Remote'],
    selectionProcess: 'Coding task / pre-requisite pull request + statement of motivation evaluated by maintainers.',
  },
  {
    id: 'internshala-govt-track',
    name: 'Internshala Government & Public Policy Tracks',
    provider: 'Verified Public Sector Undertakings (PSUs) & Ministries',
    trackType: 'govt',
    trackLabel: 'Government & Public Sector',
    stipend: '₹7,000 - ₹20,000 / month',
    stipendType: 'Paid',
    eligibility: 'Undergraduate and postgraduate students across all disciplines',
    applicationWindow: 'Continuous live listings',
    status: 'Active / Open',
    description: 'Curated filter of strictly non-fraudulent government, public sector undertakings, university research centers, and UN-affiliated development programs listed on the national portal with zero upfront security deposits.',
    applyUrl: 'https://internshala.com/internships/government-internship/',
    verifiedBadges: ['Anti-Fraud Screened', 'No Hidden Fees', 'Live Tracking'],
    selectionProcess: 'Resume screening followed by assignment or telephonic interview.',
  },
  {
    id: 'rbi-summer-internship',
    name: 'Reserve Bank of India (RBI) Summer Internship Scheme',
    provider: 'Reserve Bank of India (Central Banking Authority)',
    trackType: 'research',
    trackLabel: 'Economics & Banking Research',
    stipend: '₹45,000 / month + travel allowance',
    stipendType: 'High Stipend',
    eligibility: 'Pre-final year students pursuing B.Tech, Economics, Commerce, Finance, or Data Analytics',
    applicationWindow: 'September – October for following summer',
    status: 'Annual Cycle',
    description: 'Highly competitive and prestigious policy research internship at RBI Central Office (Mumbai) and regional centers. Interns analyze monetary policy, digital payment fraud detection, and banking telemetry.',
    applyUrl: 'https://opportunities.rbi.org.in/',
    verifiedBadges: ['Highest Govt Stipend', 'Central Bank Verified', 'Premier Brand'],
    selectionProcess: 'Online application with research abstract + Regional Office interview in January/February.',
  },
  {
    id: 'microsoft-learn-ambassadors',
    name: 'Microsoft Student Ambassadors & Mentorship Program',
    provider: 'Microsoft Corporation',
    trackType: 'toptech',
    trackLabel: 'Top Tech & Cloud',
    stipend: 'Azure Credits ($150/mo), Free Certifications, Direct Recruiter Access',
    stipendType: 'Paid',
    eligibility: 'Enrolled undergraduate students passionate about AI, Cloud, and Software Development',
    applicationWindow: 'Quarterly intake (January, April, July, October)',
    status: 'Active / Open',
    description: 'Global student leadership program providing access to Microsoft engineers, free Azure cloud resources, technical workshops, and direct fast-track screening for Microsoft SWE summer internship interviews.',
    applyUrl: 'https://studentambassadors.microsoft.com/',
    verifiedBadges: ['Microsoft Official', 'Free Cert Vouchers', 'Direct Recruiter Visibility'],
    selectionProcess: 'Video pitch submission demonstrating passion for coding and community tech teaching.',
  },
  {
    id: 'iit-research-fellowship',
    name: 'Indian Academy of Sciences (IASc-INSA-NASI) Summer Fellowship',
    provider: 'Joint Science Academies (IISc, IITs, TIFR, IISERs)',
    trackType: 'research',
    trackLabel: 'Apex Academic Research',
    stipend: '₹12,500 / month + round-trip train fare + on-campus hostel stay',
    stipendType: 'Funded Fellow',
    eligibility: '1st, 2nd, and 3rd year B.Tech, B.Sc, B.Pharm, Integrated M.Sc students',
    applicationWindow: 'October – November (Annually for next summer)',
    status: 'Annual Cycle',
    description: 'Prestigious national 2-month summer fellowship placed at Indian Institute of Science (IISc Bengaluru), IITs, and Tata Institute of Fundamental Research (TIFR). Interns work on cutting-edge lab research with leading faculty.',
    applyUrl: 'https://web-japps.ias.ac.in/fellowship/',
    verifiedBadges: ['National Academy of Sciences', 'Free On-Campus Housing', 'Research Publication'],
    selectionProcess: 'Academic transcripts evaluation + 2 letters of recommendation and write-up of research interests.',
  },
];

export const InternshipsRadar: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tracks = [
    { id: 'all', label: 'All Verified Tracks' },
    { id: 'govt', label: 'Govt & Municipal' },
    { id: 'opensource', label: 'Global Open Source' },
    { id: 'defense', label: 'Defense & ISRO' },
    { id: 'research', label: 'Research & Banking' },
    { id: 'toptech', label: 'Top Tech MNCs' },
  ];

  const filteredInternships = VERIFIED_INTERNSHIPS.filter((item) => {
    if (selectedTrack !== 'all' && item.trackType !== selectedTrack) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.provider.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.stipend.toLowerCase().includes(q) ||
      item.eligibility.toLowerCase().includes(q)
    );
  });

  return (
    <div id="verified-internships-radar" className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white border border-emerald-500/25 p-5 sm:p-7 shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b98118_1px,transparent_1px),linear-gradient(to_bottom,#10b98118_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Non-Scam • Zero Registration Fees • Official Portals</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Verified Student <span className="text-emerald-400">Internships Radar</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Direct portal links to trusted, non-scam opportunities: AICTE National Portal, Google Summer of Code, DRDO/ISRO Research Apprenticeships, and Linux Foundation Mentorship.
          </p>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300 text-sm">
            MAN OF STUDY Anti-Fraud Student Guarantee
          </p>
          <p className="leading-relaxed opacity-90">
            Never pay any fee for an internship training certificate or HR registration. Genuine companies pay you for your talent; they never demand "training deposits". Every link below routes strictly to official, authenticated government and corporate portals.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by program, agency (e.g. AICTE, GSoC, ISRO, Linux, RBI)..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTrack(t.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTrack === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInternships.map((intern) => (
          <div
            key={intern.id}
            id={`internship-card-${intern.id}`}
            className="group relative flex flex-col justify-between bg-slate-900 text-white rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 p-5 space-y-4"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <BadgeCheck className="w-3 h-3" />
                  {intern.trackLabel}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {intern.status}
                </span>
              </div>

              {/* Title & Provider */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                  {intern.name}
                </h3>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{intern.provider}</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-200 font-medium text-xs leading-relaxed opacity-95">
                {intern.description}
              </p>

              {/* Stipend Card Box */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    Compensation / Stipend:
                  </span>
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">
                    {intern.stipend}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-start gap-1">
                  <span className="font-semibold text-slate-400">Eligibility:</span>
                  <span className="truncate">{intern.eligibility}</span>
                </div>
              </div>

              {/* Verified Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {intern.verifiedBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700/80 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Official Apply Action */}
            <div className="pt-2 border-t border-slate-800">
              <a
                href={intern.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
              >
                <span>Visit Official Application Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InternshipsRadar;
