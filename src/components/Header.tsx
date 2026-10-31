import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import {

 Search,

 ChevronDown,

 GraduationCap,

 Compass,

 Award,

 CheckSquare,

 Wrench,

 BookOpen,

 Briefcase,

 HeartHandshake,

 Menu,

 X,

 ArrowUpRight,

 Sparkles,

 Building2,

 FileSpreadsheet,

 Calculator,

 FileText,
<PARSED TEXT FOR PAGE: 15 / 97>
    ShieldCheck,

    Mic,

    Bot,

} from 'lucide-react';

export interface HeaderProps {

    activeWorkspace?: string;

    onNavigate?: (routeOrWorkspace: string) => void;

    onOpenSearch?: () => void;

    onOpenSupport?: () => void;

}

interface MegaMenuItem {

    label: string;

    description: string;

    route: string;

    badge?: string;

    icon: React.ComponentType<{ className?: string }>;

}

interface MegaMenuColumn {

    heading: string;

    items: MegaMenuItem[];

}

interface NavCategory {
<PARSED TEXT FOR PAGE: 16 / 97>
    id: string;

    label: string;

    icon: React.ComponentType<{ className?: string }>;

    columns: MegaMenuColumn[];

}

const NAV_CATEGORIES: NavCategory[] = [

    {

        id: 'ap-hub',

        label: 'For AP',

        icon: Compass,

        columns: [

         {

             heading: 'AP EAPCET Counselling & Cutoffs',

             items: [

              {

                  label: 'AP EAPCET College Predictor',

                  description: 'Predict colleges using official 2025 & 2026 phase allotment cutoffs',

                  route: 'ap-eapcet-predictor',

                  badge: '2026 Ready',

                  icon: Compass,

              },

              {

                  label: 'AP Allotment Explorer',
<PARSED TEXT FOR PAGE: 17 / 97>
              description: 'Inspect college-wise & branch-wise seat allotments across AP',

              route: 'ap-allotment-explorer',

              badge: 'Historical Data',

              icon: Building2,

          },

          {

              label: 'AP Web Options Generator',

              description: 'Build prioritized, risk-balanced counseling web option lists',

              route: 'web-options-generator',

              icon: FileSpreadsheet,

          },

        ],

    },

    {

        heading: 'AP Colleges & Exam Prep',

        items: [

          {

              label: 'AP Autonomous Colleges Hub',

              description: 'Explore UGC autonomous engineering institutions in Andhra Pradesh',

              route: 'autonomous-colleges',

              icon: GraduationCap,

          },

          {

              label: 'AP EAPCET Full Mock Tests',
<PARSED TEXT FOR PAGE: 18 / 97>
               description: 'Practice full-length MPC & BiPC CBT mock exams',

               route: 'mock-tests-ap',

               badge: 'Free CBT',

               icon: CheckSquare,

           },

          ],

      },

     ],

 },

 {

     id: 'tg-hub',

     label: 'For TG',

     icon: Building2,

     columns: [

      {

          heading: 'TG EAPCET Counselling & Cutoffs',

          items: [

           {

               label: 'TG EAPCET College Predictor',

               description: 'Rank-based college & branch prediction for Telangana admissions',

               route: 'tg-eapcet-predictor',

               badge: 'Updated',

               icon: Compass,

           },

           {
<PARSED TEXT FOR PAGE: 19 / 97>
            label: 'TG Allotment & Cutoff Explorer',

            description: 'Search historical closing ranks across OU & JNTUH regions',

            route: 'tg-allotment-explorer',

            icon: Building2,

        },

        {

            label: 'TG Web Options Planner',

            description: 'Generate structured counseling preference sheets for TG EAPCET',

            route: 'web-options-generator',

            icon: FileSpreadsheet,

        },

       ],

   },

   {

       heading: 'TG Colleges & Practice',

       items: [

        {

            label: 'TG Autonomous Colleges Directory',

            description: 'Top accredited autonomous engineering colleges in Telangana',

            route: 'autonomous-colleges',

            icon: GraduationCap,

        },

        {

            label: 'TG EAPCET Mock Test Portal',
<PARSED TEXT FOR PAGE: 20 / 97>
               description: 'Explore available Telangana CBT practice tests and review results',

               route: 'mock-tests-tg',

               badge: 'Live',

               icon: CheckSquare,

           },

          ],

      },

     ],

 },

 {

     id: 'scholarships',

     label: 'Scholarships',

     icon: Award,

     columns: [

      {

          heading: 'Student Scholarship Listings',

          items: [

           {

               label: 'Available Scholarship Listings',

               description: 'Browse national, state & corporate scholarships for B.Tech students',

               route: 'scholarships',

               badge: 'Listed',

               icon: Award,

           },

           {
<PARSED TEXT FOR PAGE: 21 / 97>
              label: 'Government & Post-Matric Schemes',

              description: 'Central Sector, AICTE Pragati, Swanath & state fee reimbursement',

              route: 'scholarships',

              icon: ShieldCheck,

          },

          {

              label: 'Corporate & Merit Grants',

              description: 'Reliance Foundation, LIC Golden Jubilee, Tata Capital & ONGC',

              route: 'scholarships',

              icon: Sparkles,

          },

         ],

     },

    ],

},

{

    id: 'mock-tests',

    label: 'Mock Tests',

    icon: CheckSquare,

    columns: [

     {

         heading: 'Computer-Based Test (CBT) Portals',

         items: [

          {
<PARSED TEXT FOR PAGE: 22 / 97>
               label: 'Full Mock Test Exam Portal',

               description: 'Real exam interface with timer, question palette & solutions',

               route: 'mock-tests',

               badge: 'Popular',

               icon: CheckSquare,

           },

           {

               label: 'AP EAPCET Practice Series',

               description: 'MPC & BiPC chapter-wise and full syllabus practice exams',

               route: 'mock-tests-ap',

               icon: BookOpen,

           },

           {

               label: 'TG EAPCET Practice Series',

               description: 'Timed Telangana EAPCET mock exams with accuracy breakdown',

               route: 'mock-tests-tg',

               icon: BookOpen,

           },

          ],

      },

     ],

 },

 {

     id: 'other-tools',
<PARSED TEXT FOR PAGE: 23 / 97>
  label: 'Other Tools',

  icon: Wrench,

  columns: [

   {

       heading: 'Academic & Attendance Calculators',

       items: [

        {

            label: 'Attendance Defender',

            description: 'Calculate exact classes needed to stay above 75% attendance',

            route: 'attendance-defender',

            badge: 'Student Favorite',

            icon: ShieldCheck,

        },

        {

            label: 'SGPA & CGPA Calculator',

            description: 'Compute semester & cumulative grade points with credit weights',

            route: 'gpa-calculator',

            icon: Calculator,

        },

       ],

   },

   {

       heading: 'Document & Media Utilities',

       items: [
<PARSED TEXT FOR PAGE: 24 / 97>
           {

               label: 'PDF Compress & Counselling Tools',

               description: 'Compress rank cards & certificates for portal uploads in- browser',

               route: 'pdf-tools',

               icon: FileText,

           },

           {

               label: 'Video-to-Audio Lecture Converter',

               description: 'Extract clean audio notes from recorded study lectures',

               route: 'video-to-audio',

               icon: Mic,

           },

          ],

      },

     ],

 },

 {

     id: 'academics',

     label: 'Academics',

     icon: BookOpen,

     columns: [

      {

          heading: 'Engineering Roadmaps & Curriculum',

          items: [

           {
<PARSED TEXT FOR PAGE: 25 / 97>
               label: 'CSE & AI/ML 4-Year Roadmap',

               description: 'Semester-by-semester skills, DSA, projects & internship blueprint',

               route: 'engineering-roadmaps',

               badge: 'PDF + Interactive',

               icon: BookOpen,

           },

           {

               label: 'CSE Cyber Security Roadmap',

               description: 'Network security, ethical hacking & certification pathway',

               route: 'engineering-roadmaps',

               icon: ShieldCheck,

           },

           {

               label: 'Mechanical & Core Engineering Roadmaps',

               description: 'CAD, core manufacturing & interdisciplinary career tracks',

               route: 'engineering-roadmaps',

               icon: Wrench,

           },

          ],

      },

     ],

 },

 {

     id: 'career-resources',

     label: 'Career & Student Resources',
<PARSED TEXT FOR PAGE: 26 / 97>
  icon: Briefcase,

  columns: [

   {

       heading: 'AI Guidance & Editorial Insights',

       items: [

        {

            label: 'NaaCox AI Student Assistant',

            description: 'Ask instant questions on cutoffs, branches, roadmaps & colleges',

            route: '#naacox-ai-section',

            badge: 'AI Powered',

            icon: Bot,

        },

        {

            label: 'Admissions & Career Blogs',

            description: 'In-depth guides on EAPCET counseling, IIT/NIT admissions & skills',

            route: 'blogs',

            icon: FileText,

        },

        {

            label: 'Autonomous Colleges Explorer',

            description: 'Compare NAAC grades, NBA accreditation & placement metrics',

            route: 'autonomous-colleges',

            icon: GraduationCap,

        },
<PARSED TEXT FOR PAGE: 27 / 97>
          ],

      },

     ],

 },

];

export const Header: React.FC<HeaderProps> = ({

 activeWorkspace = 'hub',

 onNavigate,

 onOpenSearch,

 onOpenSupport,

}) => {

 const [openCategory, setOpenCategory] = useState<string | null>(null);

 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 const [mobileAccordion, setMobileAccordion] = useState<string | null>('ap- hub');

 const headerRef = useRef<HTMLElement | null>(null);

 // Close mega menu on Escape or outside click

 useEffect(() => {

     const handleKeyDown = (e: KeyboardEvent) => {

      if (e.key === 'Escape') {

          setOpenCategory(null);

          setMobileMenuOpen(false);

      }

     };
<PARSED TEXT FOR PAGE: 28 / 97>
 const handleClickOutside = (e: MouseEvent) => {

     if (headerRef.current && !headerRef.current.contains(e.target as Node)) {

         setOpenCategory(null);

     }

 };

 window.addEventListener('keydown', handleKeyDown);

 document.addEventListener('mousedown', handleClickOutside);

 return () => {

     window.removeEventListener('keydown', handleKeyDown);

     document.removeEventListener('mousedown', handleClickOutside);

 };

}, []);

const handleRouteSelect = (route: string) => {

 setOpenCategory(null);

 setMobileMenuOpen(false);

 if (route.startsWith('#')) {

     const target = document.querySelector(route);

     if (target) {

         target.scrollIntoView({ behavior: 'smooth' });

         return;

     }

 }

 if (onNavigate) {

     onNavigate(route);

 }
<PARSED TEXT FOR PAGE: 29 / 97>
 };

 return (

  <header

      ref={headerRef}

      className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-[#E2E8ED]"

  >

      {/* LEVEL 1: TOP UTILITY BAR */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

               {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handleRouteSelect('home')}
          className="flex min-w-0 shrink-0 items-center rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C29316]"
          aria-label="Naa College Home"
        >
          <img src="/Naacollege_fulllogo.webp" alt="Naa College" width="320" height="180" className="block h-auto max-h-12 w-[min(44vw,220px)] object-contain sm:w-[220px]" loading="eager" decoding="async" />
        </button>

        {/* Global Search Bar Trigger (Connected to Command Palette / Search
Index) */}

    <div className="hidden md:flex flex-1 max-w-xl mx-4">

     <button

      type="button"

      onClick={onOpenSearch}

      className="w-full flex items-center justify-between pl-4 pr-2 py-2 rounded-full bg-[#F5F8F5] hover:bg-white border border-[#E2E8ED] hover:border-[#C29316] text-sm text-[#5E6D7D] shadow-inner transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C29316]"

     >

      <span className="flex items-center gap-2.5 truncate">

         <Search className="w-4 h-4 text-[#5E6D7D] group-hover:text-[#C29316] transition-colors" />
<PARSED TEXT FOR PAGE: 31 / 97>
         <span className="truncate">

          Search colleges, EAPCET cutoffs, scholarships, mock tests...

         </span>

      </span>

      <span className="flex items-center gap-2">

         <kbd className="hidden lg:inline-block px-2 py-0.5 text-[11px] font- semibold text-[#5E6D7D] bg-white border border-[#E2E8ED] rounded-full">

          Ctrl K

         </kbd>

         <span className="w-8 h-8 rounded-full bg-[#102B3F] group-hover:bg-[#C29316] text-white flex items-center justify-center transition-colors">

          <Search className="w-3.5 h-3.5" />

         </span>

      </span>

     </button>

    </div>

    {/* Right Action Controls */}

    <div className="flex items-center gap-2.5">

     {/* Mobile Search Icon */}

     <button

      type="button"

      onClick={onOpenSearch}

      className="md:hidden p-2.5 rounded-full bg-[#F5F8F5] text-[#172B3B] hover:bg-[#EAF4F0] border border-[#E2E8ED]"

      aria-label="Search colleges and tools"

     >
<PARSED TEXT FOR PAGE: 32 / 97>
      <Search className="w-5 h-5" />

     </button>

     {/* Support / Community Action */}

     <button

      type="button"

      onClick={onOpenSupport}

      className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-[#172B3B] bg-[#F5F8F5] hover:bg-[#FDF8EB] hover:border-[#C29316] border border-[#E2E8ED] transition-all"

     >

      <HeartHandshake className="w-4 h-4 text-[#2E7658]" />

      <span>Support Us</span>

     </button>

     {/* Quick Predictor CTA */}

     <button

      type="button"

      onClick={() => handleRouteSelect('ap-eapcet-predictor')}

      className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#102B3F] hover:bg-[#173b56] shadow-sm transition-all"

     >

      <span>Predict Colleges</span>

      <ArrowUpRight className="w-3.5 h-3.5 text-[#C29316]" />

     </button>
<PARSED TEXT FOR PAGE: 33 / 97>
       {/* Mobile Hamburger Button */}

       <button

        type="button"

        onClick={() => setMobileMenuOpen((prev) => !prev)}

        className="lg:hidden p-2.5 rounded-xl bg-[#102B3F] text-white hover:bg-[#173b56] transition-colors"

        aria-expanded={mobileMenuOpen}

        aria-label="Toggle navigation menu"

       >

        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu
className="w-5 h-5" />}

       </button>

    </div>

   </div>

   {/* LEVEL 2: SECONDARY DESKTOP NAVIGATION BAR */}

   <nav

    aria-label="Primary platform navigation"

    className="hidden lg:block bg-[#102B3F] text-white relative"

   >

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items- center justify-between h-12">

       <div className="flex items-center gap-1">

        <button

           type="button"

           onClick={() => handleRouteSelect('home')}
<PARSED TEXT FOR PAGE: 34 / 97>
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items- center gap-1.5 transition-colors ${            activeWorkspace === 'hub'             ? 'bg-[#C29316] text-[#102B3F] font-bold'             : 'text-white/90 hover:text-white hover:bg-white/10'          }`}

      >

        <GraduationCap className="w-3.5 h-3.5" />

        <span>Home</span>

      </button>

      {NAV_CATEGORIES.map((category) => {

        const Icon = category.icon;

        const isOpen = openCategory === category.id;

        return (

          <div

           key={category.id}

           className="relative"

           onMouseEnter={() => setOpenCategory(category.id)}

           onMouseLeave={() => setOpenCategory(null)}

          >

           <button

              type="button"

              onClick={() =>

               setOpenCategory((prev) => (prev === category.id ? null :
category.id))
<PARSED TEXT FOR PAGE: 35 / 97>
           }

           aria-expanded={isOpen}

           className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items- center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus- visible:ring-[#C29316] ${                 isOpen                  ? 'bg-white/15 text-[#C29316]'                  : 'text-white/90 hover:text-white hover:bg-white/10'             }`}

          >

           <Icon className="w-3.5 h-3.5 text-[#C29316]" />

           <span>{category.label}</span>

           <ChevronDown

               className={`w-3.5 h-3.5 transition-transform duration-200 ${                  isOpen ? 'rotate-180 text-[#C29316]' : 'text-white/70'                 }`}

           />

          </button>

          {/* Mega Menu Dropdown */}

          <AnimatePresence>

           {isOpen && (

               <motion.div

                initial={{ opacity: 0, y: 8, scale: 0.98 }}

                animate={{ opacity: 1, y: 0, scale: 1 }}

                exit={{ opacity: 0, y: 6, scale: 0.98 }}
<PARSED TEXT FOR PAGE: 36 / 97>
            transition={{ duration: 0.18, ease: 'easeOut' }}

            className={`absolute top-full pt-2 z-50 ${                 category.columns.length > 1                  ? 'left-0 w-[640px] max-w-[calc(100vw-2rem)]'                  : 'left-0 w-[340px] max-w-[calc(100vw-2rem)]'              }`}

           >

            <div className="bg-white text-[#172B3B] rounded-2xl border border-[#E2E8ED] shadow-2xl overflow-hidden p-5">

               <div

                className={`grid gap-6 ${                     category.columns.length > 1 ? 'grid-cols-2' : 'grid-cols-1'                  }`}

               >

                {category.columns.map((col) => (

                   <div key={col.heading} className="space-y-3">

                    <div className="text-[11px] font-bold uppercase tracking- wider text-[#2E7658] border-b border-[#E2E8ED] pb-1.5">

                      {col.heading}

                    </div>

                    <div className="space-y-1.5">

                      {col.items.map((item) => {

                       const ItemIcon = item.icon;

                       return (

                        <button

                         key={item.label}
<PARSED TEXT FOR PAGE: 37 / 97>
                      type="button"

                      onClick={() => handleRouteSelect(item.route)}

                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#F5F8F5] transition-colors flex items-start gap-3 group"

                     >

                      <div className="w-9 h-9 rounded-lg bg-[#F5F8F5] group-hover:bg-[#FDF8EB] border border-[#E2E8ED] group-hover:border-[#EED690] flex items-center justify-center shrink-0 mt-0.5 transition-colors">

                         <ItemIcon className="w-4 h-4 text-[#102B3F] group- hover:text-[#C29316]" />

                      </div>

                      <div className="flex-1 min-w-0">

                         <div className="flex items-center gap-2">

                           <span className="text-xs font-bold text-[#172B3B] group-hover:text-[#102B3F]">

                            {item.label}

                           </span>

                           {item.badge && (

                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-[#FDF8EB] text-[#C29316] border border-[#EED690]">

                                {item.badge}

                            </span>

                           )}

                         </div>

                         <p className="text-[11px] text-[#5E6D7D] line-clamp-2 mt-0.5">

                           {item.description}
<PARSED TEXT FOR PAGE: 38 / 97>
                                  </p>

                                 </div>

                             </button>

                            );

                           })}

                       </div>

                      </div>

                     ))}

                    </div>

                   </div>

               </motion.div>

              )}

              </AnimatePresence>

          </div>

         );

      })}

     </div>

     {/* Right Quick Link in Nav Bar */}

     <button

      type="button"

      onClick={() => handleRouteSelect('blogs')}

      className="text-xs font-semibold text-[#C29316] hover:text-white flex items-center gap-1 transition-colors"

     >

      <span>Editorial Blogs</span>
<PARSED TEXT FOR PAGE: 39 / 97>
      <ArrowUpRight className="w-3.5 h-3.5" />

     </button>

    </div>

   </nav>

   {/* MOBILE ACCORDION NAVIGATION DRAWER */}

   <AnimatePresence>

    {mobileMenuOpen && (

     <motion.div

      initial={{ opacity: 0, height: 0 }}

      animate={{ opacity: 1, height: 'auto' }}

      exit={{ opacity: 0, height: 0 }}

      transition={{ duration: 0.24, ease: 'easeOut' }}

      className="lg:hidden bg-white border-t border-[#E2E8ED] overflow-y- auto max-h-[calc(100vh-4rem)]"

     >

      <div className="px-4 py-4 space-y-2">

         {NAV_CATEGORIES.map((category) => {

         const Icon = category.icon;

         const isExpanded = mobileAccordion === category.id;

         return (

          <div

             key={category.id}

             className="rounded-xl border border-[#E2E8ED] overflow-hidden bg-[#F5F8F5]/50"

          >
<PARSED TEXT FOR PAGE: 40 / 97>
           <button

            type="button"

            onClick={() =>

                setMobileAccordion((prev) => (prev === category.id ? null :
category.id))

            }

            className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-sm text-[#172B3B]"

           >

            <span className="flex items-center gap-2.5">

                <Icon className="w-4 h-4 text-[#2E7658]" />

                <span>{category.label}</span>

            </span>

            <ChevronDown

                className={`w-4 h-4 text-[#5E6D7D] transition-transform ${                   isExpanded ? 'rotate-180 text-[#C29316]' : ''                  }`}

            />

           </button>

           {isExpanded && (

            <div className="px-4 pb-3.5 pt-1 bg-white border-t border-[#E2E8ED] space-y-3">

                {category.columns.map((col) => (

                 <div key={col.heading} className="space-y-1.5">

                  <div className="text-[10px] font-bold uppercase tracking- wider text-[#2E7658] pt-1">

                      {col.heading}
<PARSED TEXT FOR PAGE: 41 / 97>
                  </div>

                  {col.items.map((item) => (

                      <button

                       key={item.label}

                       type="button"

                       onClick={() => handleRouteSelect(item.route)}

                       className="w-full py-2 px-2.5 rounded-lg hover:bg-[#F5F8F5] text-left flex items-center justify-between gap-2"

                      >

                       <div>

                          <div className="text-xs font-semibold text-[#172B3B]">

                           {item.label}

                          </div>

                          <div className="text-[11px] text-[#5E6D7D] line-clamp-1">

                           {item.description}

                          </div>

                       </div>

                       <ArrowUpRight className="w-3.5 h-3.5 text-[#C29316] shrink-0" />

                      </button>

                  ))}

                 </div>

                ))}

               </div>

           )}

          </div>
<PARSED TEXT FOR PAGE: 42 / 97>
           );

          })}

          <div className="pt-2 grid grid-cols-2 gap-2.5">

           <button

            type="button"

            onClick={onOpenSupport}

            className="w-full py-3 rounded-xl font-bold text-xs text-[#172B3B] bg-[#F5F8F5] border border-[#E2E8ED] flex items-center justify-center gap-2"

           >

            <HeartHandshake className="w-4 h-4 text-[#2E7658]" />

            <span>Support Naa College</span>

           </button>

           <button

            type="button"

            onClick={() => handleRouteSelect('ap-eapcet-predictor')}

            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#102B3F] flex items-center justify-center gap-1.5"

           >

            <span>College Predictor</span>

            <ArrowUpRight className="w-4 h-4 text-[#C29316]" />

           </button>

          </div>

         </div>

     </motion.div>

    )}
<PARSED TEXT FOR PAGE: 43 / 97>
      </AnimatePresence>

     </header>

 );

};

export default Header;