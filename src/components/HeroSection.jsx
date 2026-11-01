import React, { useState, useEffect, useMemo } from 'react';

import { motion } from 'motion/react';

import {

 Search,

 ArrowRight,

 ArrowUpRight,

 Compass,

 Building2,

 Award,

 CheckSquare,

 FileSpreadsheet,

 ShieldCheck,

 Calculator,

 FileText,

 Mic,

 BookOpen,

 Sparkles,

 Clock,

 BarChart3,

 CheckCircle2,

 Bot,

 ChevronRight,

 GraduationCap,
 Wrench,

  ListChecks, Route, CalendarCheck, Map,
} from 'lucide-react';

import { ScrollReveal, StaggerGrid } from './motion/ScrollReveal';

import blogArticlesData from '../data/blogArticles.json';
import editorialArticlesData from '../data/editorialBlogArticles.generated.json';
import './NaaDesignFoundation.css';
import { collection, doc, getDoc, getDocs, query as firestoreQuery, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const ADMIN_ICON_MAP = { Compass, Building2, Award, CheckSquare, FileSpreadsheet, ShieldCheck, Calculator, FileText, Mic, BookOpen, Sparkles, Clock, BarChart3, CheckCircle2, Bot, GraduationCap, Wrench, ListChecks, Route, CalendarCheck, Map };

const QUICK_SHORTCUTS = [
  {
    id: 'ap-predictor',
    title: 'AP EAPCET Predictor',
    subtitle: '2025 & 2026 Cutoffs',
    badge: 'AP',
    route: 'ap-eapcet-predictor',
    icon: Compass,
  },
  {
    id: 'tg-predictor',
    title: 'TG EAPCET Predictor',
    subtitle: 'Rank & Branch Insights',
    badge: 'TG',
    route: 'tg-eapcet-predictor',
    icon: Building2,
  },
  {
    id: 'web-options',
    title: 'Web Options Generator',
    subtitle: 'Smart Counseling Lists',
    badge: 'Tool',
    route: 'web-options-generator',
    icon: FileSpreadsheet,
  },
  {
    id: 'autonomous',
    title: 'Autonomous Colleges',
    subtitle: 'NAAC & NBA Accredited',
    badge: 'Directory',
    route: 'autonomous-colleges',
    icon: GraduationCap,
  },
  {
    id: 'scholarships',
    title: 'Scholarship Listings',
    subtitle: 'Govt & Corporate Aid',
    badge: 'Aid',
    route: 'scholarships',
    icon: Award,
  },
  {
    id: 'mock-tests',
    title: 'CBT Mock Tests',
    subtitle: 'AP & TG Practice Hub',
    badge: 'Live',
    route: 'mock-tests',
    icon: CheckSquare,
  },
];

const TICKER_ITEMS = [

 { label: 'AP EAPCET 2026 Phase 1 Cutoff Ranks & Allotment Explorer', route:
'ap-eapcet-predictor' },

 { label: 'TG EAPCET College Predictor & Branch Closing Ranks', route: 'tg-eapcet-predictor' },

 { label: 'National & Corporate Scholarship Listings for B.Tech Students',
route: 'scholarships' },

 { label: 'Full-Length AP & TG EAPCET Computer-Based Mock Tests', route:
'mock-tests' },

 { label: '4-Year CSE, AI/ML, Cyber Security & Mechanical Roadmaps', route:
'engineering-roadmaps' },

 { label: 'Attendance Defender & SGPA/CGPA Calculator Utilities', route:
'attendance-defender' },

];

const STUDENT_UTILITY_TOOLS = [

 {

     id: 'attendance-defender',

     category: 'ACADEMIC TRACKER',

     title: 'Attendance Defender',

     description:

      'Calculate exact classes you can safely skip or must attend to maintain your 75% mandatory attendance threshold.',

     specs: ['Instant 75% Buffer Check', 'Day-by-Day Planner'],

     cta: 'Launch Attendance Tool',

     route: 'attendance-defender',

     icon: ShieldCheck,

 },

 {

     id: 'gpa-calculator',

     category: 'GRADE ANALYTICS',

     title: 'SGPA & CGPA Calculator',

     description:

      'Accurately calculate semester and cumulative grade point averages tailored for JNTUK, JNTUH, JNTUA & autonomous regulations.',

     specs: ['Credit-Weighted', 'Percentage Conversion'],

     cta: 'Calculate GPA',

     route: 'gpa-calculator',

     icon: Calculator,

 },

 {

     id: 'pdf-tools',

     category: 'COUNSELLING UTILITY',

     title: 'PDF Compress & Document Suite',

     description:

      'Compress income certificates, rank cards, and study memos down to portal size limits with browser-based processing where supported.',

     specs: ['100KB–500KB Target', 'Browser-based where supported'],

     cta: 'Open PDF Suite',

     route: 'pdf-tools',

     icon: FileText,

 },

 {

     id: 'video-to-audio',

     category: 'STUDY PRODUCTIVITY',

     title: 'Video-to-Audio Converter',

     description:

      'Convert recorded engineering lectures and revision sessions into lightweight offline audio files right in your browser.',

     specs: ['Fast Local Extraction', 'Local processing where supported'],

     cta: 'Convert Lectures',

     route: 'video-to-audio',

     icon: Mic,

 },

];

export default function HeroSection({

 onNavigate,

 onSelectArticle,

 children,

}) {

 const [searchQuery, setSearchQuery] = useState('');

 const [scholarships, setScholarships] = useState([]);
 const [siteConfig, setSiteConfig] = useState({});
 const [dynamicBlogs, setDynamicBlogs] = useState([]);

 // Load scholarship listings from the existing /indian_scholarships.json dataset

 useEffect(() => {

  let mounted = true;

  fetch('/indian_scholarships.json')

       .then((res) => (res.ok ? res.json() : []))

       .then((data) => {

        if (mounted && Array.isArray(data)) {

            setScholarships(data.slice(0, 4));

        }

       })

       .catch(() => {});

  return () => {

       mounted = false;

  };

 }, []);

 // Public display configuration is read-only for visitors; only the owner
 // dashboard can change these values through authenticated Cloud Functions.
 useEffect(() => {
  let mounted = true;
  Promise.all([
   getDoc(doc(db, 'admin_site_config', 'hero')),
   getDoc(doc(db, 'admin_site_config', 'alerts')),
   getDoc(doc(db, 'admin_site_config', 'featuredTags')),
   getDoc(doc(db, 'admin_site_config', 'tools')),
   getDoc(doc(db, 'admin_site_config', 'contentMigration')),
  ]).then(([heroDoc, alertDoc, tagsDoc, toolsDoc, migrationDoc]) => {
   if (!mounted) return;
   setSiteConfig({
    hero: heroDoc.exists() ? heroDoc.data().value || {} : {},
    alerts: alertDoc.exists() ? alertDoc.data().value || {} : {},
    featuredTags: tagsDoc.exists() ? tagsDoc.data().value || {} : {},
    tools: toolsDoc.exists() ? toolsDoc.data().value || {} : {},
    contentMigration: migrationDoc.exists() ? migrationDoc.data().value || {} : {},
   });
  }).catch((error) => console.warn('[Naa College] Public site configuration unavailable.', error));
  return () => { mounted = false; };
 }, []);

 const configuredTools = Array.isArray(siteConfig.tools?.items) ? siteConfig.tools.items : [];
 const resolveTool = (id) => configuredTools.find((tool) => tool.id === id);
 const configuredQuickShortcuts = QUICK_SHORTCUTS.map((item) => {
  const configId = item.id === 'web-options' ? 'ap-web-options' : item.id;
  const config = resolveTool(configId);
  return { ...item, title: config?.name || item.title, subtitle: config?.description || item.subtitle, icon: ADMIN_ICON_MAP[config?.icon] || item.icon, hidden: config && config.visible === false };
 }).filter((item) => !item.hidden);
 const configuredStudentTools = STUDENT_UTILITY_TOOLS.map((item) => {
  const configId = item.id === 'attendance-defender' ? 'attendance' : item.id;
  const config = resolveTool(configId);
  return { ...item, title: config?.name || item.title, description: config?.description || item.description, icon: ADMIN_ICON_MAP[config?.icon] || item.icon, hidden: config && config.visible === false };
 }).filter((item) => !item.hidden);
 const featuredTagLabels = Array.isArray(siteConfig.featuredTags?.items) ? siteConfig.featuredTags.items : [];
 const featuredTagRoute = (label) => {
  const value = String(label).toLowerCase();
  if (value.includes('scholar')) return 'scholarships';
  if (value.includes('roadmap') || value.includes('career')) return 'engineering-roadmaps';
  if (value.includes('web option')) return 'web-options-generator';
  if (value.includes('tg')) return 'tg-eapcet-predictor';
  return 'ap-eapcet-predictor';
 };

 // Load published CMS articles for the homepage's editorial shortcuts.
 useEffect(() => {
  let mounted = true;
  getDocs(firestoreQuery(collection(db, 'admin_posts'), where('status', '==', 'published')))
   .then((snapshot) => {
    const managed = snapshot.docs.map((entry) => {
     const value = entry.data();
     const updated = value.updatedAt?.toDate?.() || value.createdAt?.toDate?.() || new Date();
     return { slug: value.slug || entry.id, id: entry.id, title: value.title || 'Student guide', category: value.category || 'Student Guides', status: 'published', publishedAt: updated.toISOString(), updatedAt: updated.toISOString() };
    });
    if (mounted) setDynamicBlogs(managed);
   })
   .catch((error) => console.warn('[Naa College] CMS articles could not be loaded for the homepage.', error));
  return () => { mounted = false; };
 }, []);

 // Load real published blog articles
 const publishedBlogs = useMemo(() => {
  const bySlug = new Map();
  [
    ...(siteConfig.contentMigration?.blogs === true ? [] : (Array.isArray(blogArticlesData) ? blogArticlesData : [])),
    ...(siteConfig.contentMigration?.blogs === true ? [] : (Array.isArray(editorialArticlesData) ? editorialArticlesData : [])),
    ...dynamicBlogs,
  ].filter((article) => article && article.status === 'published')
   .forEach((article) => bySlug.set(article.slug || article.id, article));
  return [...bySlug.values()]
    .sort((a, b) =>
      String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) ||
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) ||
      String(a.title || '').localeCompare(String(b.title || ''))
    )
    .slice(0, 6);
}, [dynamicBlogs, siteConfig.contentMigration?.blogs]);

 // Search results filtering

 const filteredSearchItems = useMemo(() => {

  const q = searchQuery.trim().toLowerCase();

  if (!q) return [];

  const pool = [

    ...configuredQuickShortcuts.map((s) => ({ title: s.title, category: s.badge, route:
s.route })),

    ...configuredStudentTools.map((t) => ({ title: t.title, category: t.category,
route: t.route })),

    ...publishedBlogs.map((b) => ({

       title: b.title,

       category: b.category || 'Blog Guide',

       route: `blog:${b.slug || b.id}`,

    })),

  ];

  return pool.filter(

    (item) =>

       item.title.toLowerCase().includes(q) ||
item.category.toLowerCase().includes(q)

  );

 }, [searchQuery, publishedBlogs, configuredQuickShortcuts, configuredStudentTools]);

 const triggerRoute = (route) => {

  if (!route) return;

  if (route.startsWith('blog:') && onSelectArticle) {

      onSelectArticle(route.replace('blog:', ''));

      return;

  }

  if (onNavigate) {

      onNavigate(route);

  }

 };

 return (

  <div className="naa-platform-shell w-full bg-white text-[#172B3B]">
      {siteConfig.alerts?.enabled && siteConfig.alerts?.message && <div role="status" className="border-b border-[#EED690] bg-[#FDF8EB] px-4 py-2.5 text-center text-xs font-bold leading-5 text-[#75551c] sm:text-sm">{siteConfig.alerts.message}</div>}

      {/*
===================================================================
==

         1. PREMIUM HERO SECTION (Preserves /HERO_VEDIO.webm on clean
white)

===================================================================
== */}

      <section className="relative bg-white pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-12 lg:pb-16 border-b border-[#E2E8ED] overflow-hidden">

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">

            {/* Left Column: Headline, Search & AP/TG Cards */}

            <div className="lg:col-span-7 space-y-4 sm:space-y-6">

             <motion.div

         initial={{ opacity: 0, y: 14 }}

         animate={{ opacity: 1, y: 0 }}

         transition={{ duration: 0.45 }}

         className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF8EB] border border-[#EED690] text-[#172B3B] text-xs font-bold"

       >

         <span className="w-2 h-2 rounded-full bg-[#C29316]" />

         <span>ANDHRA PRADESH & TELANGANA STUDENT
PLATFORM</span>

       </motion.div>

       <motion.h1

         initial={{ opacity: 0, y: 18 }}

         animate={{ opacity: 1, y: 0 }}

         transition={{ duration: 0.5, delay: 0.06 }}

         className="naa-hero-title naa-mobile-condensed-heading text-[2rem] leading-none sm:text-5xl lg:text-[3.5rem]"

       >

         {siteConfig.hero?.title || <>Right Guidance.{' '}<span className="block text-[#C29316] mt-1">Brighter Engineering Futures.</span></>}

       </motion.h1>

       <motion.p

         initial={{ opacity: 0, y: 18 }}

         animate={{ opacity: 1, y: 0 }}

           transition={{ duration: 0.5, delay: 0.12 }}

           className="text-sm sm:text-lg text-[#5E6D7D] max-w-2xl leading-snug sm:leading-relaxed"

       >

           {siteConfig.hero?.subtitle || 'Explore EAPCET allotments, compare colleges, find scholarships and access student tools—all in one place.'}

       </motion.p>

       {/* Compact mobile campus video accent */}
       <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="lg:hidden -mt-1">
         <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8ED] bg-white p-2 shadow-sm">
           <div className="h-[76px] w-[36%] min-w-0 shrink-0 overflow-hidden rounded-xl bg-[#F5F8F5]">
             <video src="/HERO_VEDIO.webm" poster="/Vibrant%20Campus%20Life%20Illustration.webp" autoPlay muted loop playsInline className="h-full w-full object-cover pointer-events-none select-none" />
           </div>
           <div className="min-w-0 flex-1 py-1">
             <span className="flex items-center gap-1.5 text-xs font-extrabold leading-snug text-[#172B3B]"><Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C29316]" /> Naa College Interactive Campus</span>
             <span className="mt-1 block text-[11px] font-semibold text-[#2E7658]">100% Free Student Access</span>
           </div>
         </div>
       </motion.div>

       {/* Inline Global Student Search Bar */}

       <motion.div

           initial={{ opacity: 0, y: 18 }}

           animate={{ opacity: 1, y: 0 }}

           transition={{ duration: 0.5, delay: 0.18 }}

           className="relative max-w-2xl"

       >

           <div className="flex min-h-[56px] items-center bg-white border-2 border-[#E2E8ED] focus-within:border-[#C29316] rounded-2xl p-1.5 shadow-sm transition-colors">

            <Search className="w-5 h-5 text-[#5E6D7D] ml-3 mr-2 shrink-0" />

            <input

             type="search"

             value={searchQuery}

             onChange={(e) => setSearchQuery(e.target.value)}

             placeholder="Search colleges or exams..."

           className="w-full min-h-[44px] py-2.5 px-2 text-sm text-[#172B3B] placeholder-[#7A8B99] bg-transparent focus:outline-none"

           aria-label="Search Naa College resources"

          />

          <button

           type="button"

           onClick={() =>

               filteredSearchItems[0]

                ? triggerRoute(filteredSearchItems[0].route)

                : triggerRoute('ap-eapcet-predictor')

           }

           className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-[#C29316] hover:bg-[#a97f11] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-colors"

          >

           <span>Search</span>

           <ArrowRight className="w-4 h-4" />

          </button>

         </div>

         {/* Live Search Dropdown */}

         {searchQuery.trim().length > 0 && (

          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E2E8ED] shadow-xl z-[10001] overflow-hidden">

           {filteredSearchItems.length > 0 ? (

               <div className="divide-y divide-[#EDF2F6] max-h-64 overflow-y-auto">

             {filteredSearchItems.map((item, idx) => (

                 <button

                  key={idx}

                  type="button"

                  onClick={() => {

                     setSearchQuery('');

                     triggerRoute(item.route);

                  }}

                  className="w-full px-4 py-3 text-left hover:bg-[#F5F8F5] flex items-center justify-between gap-3"

                 >

                  <div>

                     <div className="text-xs font-bold text-[#172B3B]">{item.title}
</div>

                     <div className="text-[10px] font-semibold uppercase tracking-wider text-[#2E7658]">

                       {item.category}

                     </div>

                  </div>

                  <ArrowUpRight className="w-4 h-4 text-[#C29316]" />

                 </button>

             ))}

            </div>

           ):(

            <div className="p-4 text-xs text-[#5E6D7D] text-center">

             No direct match found. Try searching "AP EAPCET",
"Scholarships", or "GPA".

              </div>

             )}

         </div>

        )}

        {/* Popular Filter Pills */}

        <div className="flex flex-wrap items-center gap-2 mt-3">

         <span className="text-xs font-semibold text-[#5E6D7D]">Popular:</span>

         {(featuredTagLabels.length ? featuredTagLabels.map((label) => ({ label, route: featuredTagRoute(label) })) : [
             { label: 'AP EAPCET 2026', route: 'ap-eapcet-predictor' },
             { label: 'TG EAPCET', route: 'tg-eapcet-predictor' },
         ]).map((pill) => (

             <button

              key={pill.label}

              type="button"

              onClick={() => triggerRoute(pill.route)}

              className="min-h-[44px] px-3 py-2 rounded-full text-xs font-semibold bg-[#F5F8F5] hover:bg-[#EAF4F0] text-[#172B3B] hover:text-[#2E7658] border border-[#E2E8ED] transition-colors"

             >

              {pill.label}

             </button>

         ))}

         </div>

          {/* Mobile Quick Access: six core student tools. */}
          <div className="relative z-[10000] mt-3 grid grid-cols-2 gap-2.5 pb-16 sm:hidden" aria-label="Quick access student tools">
            {[
              { label: 'Rank / Cutoff Predictor', route: 'ap-eapcet-predictor', icon: BarChart3 },
              { label: 'Branch & Career Roadmaps', route: 'engineering-roadmaps', icon: Compass },
              { label: 'Scholarships & Aid', route: 'scholarships', icon: Award },
              { label: 'College Compare & Details', route: 'autonomous-colleges', icon: Building2 },
              { label: 'Mock Tests / Prep', route: 'mock-tests', icon: CheckSquare },
              { label: 'Video to Audio', route: 'video-to-audio', icon: Mic },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button key={tool.label} type="button" onClick={() => triggerRoute(tool.route)}
                  className="group flex min-h-[68px] min-w-0 items-center gap-2.5 rounded-xl border border-[#E2E8ED] bg-white px-3 py-2.5 text-left shadow-sm transition-all active:scale-[0.97] hover:border-[#C9D8D0] hover:bg-[#FBFDFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C29316]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8F5] text-[#17364A] transition-colors group-hover:bg-[#EAF4F0]">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 whitespace-normal break-words text-[11px] font-bold leading-snug text-[#172B3B]">{tool.label}</span>
                </button>
              );
            })}
          </div>

        </motion.div>

        {/* Dedicated AP & Telangana Resource Cards */}

        <motion.div

         initial={{ opacity: 0, y: 18 }}

         animate={{ opacity: 1, y: 0 }}

         transition={{ duration: 0.5, delay: 0.24 }}

         className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"

        >

         <div

            onClick={() => triggerRoute('ap-eapcet-predictor')}

            role="button"

            tabIndex={0}

            onKeyDown={(e) => e.key === 'Enter' && triggerRoute('ap-eapcet-predictor')}

            className="naa-card p-4 cursor-pointer group border-l-4 border-l-[#C29316]"

         >

            <div className="flex items-center justify-between mb-1.5">

             <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FDF8EB] text-[#C29316] border border-[#EED690]">

               Andhra Pradesh Hub

             </span>

             <ArrowUpRight className="w-4 h-4 text-[#5E6D7D] group-hover:text-[#C29316] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />

          </div>

          <h2 className="text-base font-extrabold text-[#172B3B]">

             AP EAPCET Predictor & Cutoffs

          </h2>

          <p className="text-xs text-[#5E6D7D] mt-1">

             Explore available 2025–2026 historical allotment records and the web options generator.

          </p>

         </div>

         <div

          onClick={() => triggerRoute('tg-eapcet-predictor')}

          role="button"

          tabIndex={0}

          onKeyDown={(e) => e.key === 'Enter' && triggerRoute('tg-eapcet-predictor')}

          className="naa-card p-4 cursor-pointer group border-l-4 border-l-[#2E7658]"

         >

          <div className="flex items-center justify-between mb-1.5">

             <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EAF4F0] text-[#2E7658] border border-[#B6DbcB]">

               Telangana Hub

             </span>

             <ArrowUpRight className="w-4 h-4 text-[#5E6D7D] group-hover:text-[#2E7658] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />

          </div>

           <h2 className="text-base font-extrabold text-[#172B3B]">

            TG EAPCET Predictor & Cutoffs

           </h2>

           <p className="text-xs text-[#5E6D7D] mt-1">

            Explore JNTUH & OU closing ranks, autonomous colleges, and TG
mock tests.

           </p>

          </div>

       </motion.div>

      </div>

      {/* Right Column: Preserved /HERO_VEDIO.webm on Pure White
Background */}

      <motion.div

       initial={{ opacity: 0, y: 20 }}

       animate={{ opacity: 1, y: 0 }}

       transition={{ duration: 0.55, delay: 0.2 }}

       className="hidden lg:block lg:col-span-5"

      >

       <div className="bg-white rounded-3xl border border-[#E2E8ED] p-3 sm:p-4 shadow-lg">

          <div className="bg-white rounded-2xl overflow-hidden flex items-center justify-center">

           <video

            src="/HERO_VEDIO.webm"

            poster="/Vibrant%20Campus%20Life%20Illustration.webp"

            autoPlay

             muted

             loop

             playsInline

             className="w-full h-auto object-contain bg-white pointer-events-none select-none"

            />

        </div>

        <div className="mt-3 pt-3 border-t border-[#EDF2F6] flex items-center justify-between px-2 text-xs text-[#5E6D7D]">

            <span className="font-bold text-[#172B3B] flex items-center gap-1.5">

             <Sparkles className="w-3.5 h-3.5 text-[#C29316]" />

             Naa College Interactive Campus

            </span>

            <span className="text-[#2E7658] font-semibold">100% Free Student
Access</span>

        </div>

       </div>

      </motion.div>

     </div>

     {/* 6-Card Feature Shortcut Dock Beneath Hero (Reference 00:01) */}

     <StaggerGrid className="hidden sm:grid grid-cols-2 lg:grid-cols-6 gap-3 mt-10 pt-8 border-t border-[#EDF2F6]">

      {configuredQuickShortcuts.map((item) => {

       const Icon = item.icon;

       return (

        <button

            key={item.id}

            type="button"

            onClick={() => triggerRoute(item.route)}

            className="naa-card p-3.5 text-left flex items-start gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C29316]"

        >

            <div className="w-9 h-9 rounded-xl bg-[#F5F8F5] group-hover:bg-[#102B3F] text-[#102B3F] group-hover:text-[#C29316] flex items-center justify-center shrink-0 transition-colors">

             <Icon className="w-4 h-4" />

            </div>

            <div className="min-w-0">

             <div className="text-xs font-extrabold text-[#172B3B] whitespace-normal break-words leading-snug group-hover:text-[#102B3F]">

              {item.title}

             </div>

             <div className="text-[11px] text-[#5E6D7D] whitespace-normal break-words leading-snug mt-0.5">

              {item.subtitle}

             </div>

            </div>

        </button>

       );

      })}

     </StaggerGrid>

    </div>

   </section>

     {/*
===================================================================
==

         2. LATEST RESOURCE TICKER STRIP

===================================================================
== */}

     <div className="bg-[#102B3F] text-white py-2.5 border-b border-[#163852] overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">

         <span className="px-2.5 py-0.5 rounded bg-[#C29316] text-[#102B3F] text-[10px] font-extrabold uppercase tracking-wider shrink-0">

           Live Updates

         </span>

         <div className="overflow-hidden flex-1">

           <div className="naa-ticker-track items-center gap-8 text-xs font-medium">

            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (

             <button

              key={idx}

              type="button"

              onClick={() => triggerRoute(item.route)}

              className="inline-flex items-center gap-2 text-white/90 hover:text-[#C29316] whitespace-nowrap transition-colors"

             >

              <span className="w-1.5 h-1.5 rounded-full bg-[#C29316]" />

              <span>{item.label}</span>

             </button>

            ))}

           </div>

         </div>

      </div>

     </div>

     {/*
===================================================================
==

         3. AUTONOMOUS COLLEGES & ADMISSION PATHWAYS

===================================================================
== */}

     <section

      id="autonomous-colleges-section"

      className="py-16 lg:py-20 bg-[#F5F8F5] border-b border-[#E2E8ED]"

     >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">

           <div>

            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7658]">

             HISTORICAL ADMISSION DATA

            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B3B] mt-1">

          Your Future Starts with{' '}

          <span className="text-[#C29316]">The Right College</span>

       </h2>

       <p className="text-sm sm:text-base text-[#5E6D7D] mt-2 max-w-2xl">

          Explore UGC autonomous institutions, review historical phase-wise EAPCET allotment records, and organise your counselling preferences with clearer context.

       </p>

      </div>

      <button

       type="button"

       onClick={() => triggerRoute('autonomous-colleges')}

       className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#102B3F] hover:bg-[#173b56] text-white text-xs font-bold self-start md:self-auto transition-colors"

      >

       <span>Explore Autonomous Directory</span>

       <ArrowUpRight className="w-4 h-4 text-[#C29316]" />

      </button>

     </ScrollReveal>

     <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="naa-card p-6 flex flex-col justify-between">

       <div>

          <div className="flex items-center justify-between mb-4">

           <div className="w-11 h-11 rounded-2xl bg-[#FDF8EB] border border-[#EED690] flex items-center justify-center text-[#C29316]">

             <GraduationCap className="w-5 h-5" />

            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF4F0] text-[#2E7658]">

             NAAC & NBA

            </span>

        </div>

        <h3 className="text-lg font-extrabold text-[#172B3B]">

            Autonomous Engineering Colleges

        </h3>

        <p className="text-xs sm:text-sm text-[#5E6D7D] mt-2 leading-relaxed">

            Filter top autonomous colleges in Andhra Pradesh & Telangana by
accreditation,

            fee structure, and branch-level intake.

        </p>

       </div>

       <button

        type="button"

        onClick={() => triggerRoute('autonomous-colleges')}

        className="mt-6 pt-4 border-t border-[#EDF2F6] flex items-center justify-between text-xs font-bold text-[#102B3F] hover:text-[#C29316]"

       >

        <span>Open Autonomous Explorer</span>

        <ArrowRight className="w-4 h-4" />

       </button>

      </div>

      <div className="naa-card p-6 flex flex-col justify-between">

       <div>

        <div className="flex items-center justify-between mb-4">

            <div className="w-11 h-11 rounded-2xl bg-[#EAF4F0] border border-[#B6DbcB] flex items-center justify-center text-[#2E7658]">

             <BarChart3 className="w-5 h-5" />

            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FDF8EB] text-[#C29316]">

             Historical allotment records

            </span>

        </div>

        <h3 className="text-lg font-extrabold text-[#172B3B]">

            Historical EAPCET Allotment Analytics

        </h3>

        <p className="text-xs sm:text-sm text-[#5E6D7D] mt-2 leading-relaxed">

            Inspect real student allotment records, category-wise closing ranks,
and gender

            reservation cutoffs across AP & TG.

        </p>

       </div>

       <button

        type="button"

        onClick={() => triggerRoute('ap-allotment-explorer')}

        className="mt-6 pt-4 border-t border-[#EDF2F6] flex items-center justify-between text-xs font-bold text-[#102B3F] hover:text-[#2E7658]"

       >

        <span>Inspect Cutoff Ranks</span>

        <ArrowRight className="w-4 h-4" />

       </button>

      </div>

      <div className="naa-card p-6 flex flex-col justify-between">

       <div>

        <div className="flex items-center justify-between mb-4">

            <div className="w-11 h-11 rounded-2xl bg-[#F5F8F5] border border-[#E2E8ED] flex items-center justify-center text-[#102B3F]">

             <FileSpreadsheet className="w-5 h-5" />

            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F5F8F5] text-[#172B3B]">

             Web Options

            </span>

        </div>

        <h3 className="text-lg font-extrabold text-[#172B3B]">

            Counselling Web Options Generator

        </h3>

        <p className="text-xs sm:text-sm text-[#5E6D7D] mt-2 leading-relaxed">

            Automatically generate a downloadable, prioritized college and
branch sequence

                tailored to your rank and preferred districts.

             </p>

            </div>

            <button

             type="button"

             onClick={() => triggerRoute('web-options-generator')}

             className="mt-6 pt-4 border-t border-[#EDF2F6] flex items-center justify-between text-xs font-bold text-[#102B3F] hover:text-[#C29316]"

            >

             <span>Generate Web Options</span>

             <ArrowRight className="w-4 h-4" />

            </button>

           </div>

         </StaggerGrid>

      </div>

     </section>

     {/*
===================================================================
==

         4. RECENT BLOGS (Editorial Portal Presentation -Reference 00:06-00:09)

===================================================================
== */}

     <section id="recent-blogs-section" className="py-16 lg:py-20 bg-white border-b border-[#E2E8ED]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <ScrollReveal className="text-center max-w-3xl mx-auto mb-10">

      <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7658]">

         EDITORIAL GUIDES & ADMISSION UPDATES

      </span>

      <h2 className="text-3xl sm:text-5xl font-extrabold text-[#172B3B] mt-1">

         Recent <span className="text-[#C29316]">Blogs</span>

      </h2>

      <p className="text-sm sm:text-base text-[#5E6D7D] mt-2">

         Admissions information, cutoff analyses, scholarship walkthroughs,
and 4-year

         engineering career roadmaps.

      </p>

     </ScrollReveal>

     {/* Browser-Framed Editorial Portal Container */}

     <div className="rounded-3xl border-2 border-[#E2E8ED] bg-[#F5F8F5] shadow-md overflow-hidden">

      {/* Browser Top Bar */}

      <div className="bg-white px-4 py-3 border-b border-[#E2E8ED] flex items-center justify-between gap-4">

         <div className="flex items-center gap-2">

          <span className="w-3 h-3 rounded-full bg-[#E2E8ED]" />

          <span className="w-3 h-3 rounded-full bg-[#C29316]" />

          <span className="w-3 h-3 rounded-full bg-[#2E7658]" />

         </div>

         <div className="px-4 py-1 rounded-full bg-[#F5F8F5] border border-[#E2E8ED] text-[11px] font-medium text-[#5E6D7D] truncate">

           naacollege.in/blogs

          </div>

          <button

           type="button"

           onClick={() => triggerRoute('blogs')}

           className="text-xs font-bold text-[#2E7658] hover:text-[#102B3F] flex items-center gap-1"

          >

           <span>View all articles</span>

           <ArrowUpRight className="w-3.5 h-3.5" />

          </button>

      </div>

      {/* Blog Cards Grid */}

      <div className="p-5 sm:p-8">

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

           {publishedBlogs.map((article, index) => (

              <article

               key={article.id || article.slug || index}

               onClick={() =>

                   onSelectArticle

                    ? onSelectArticle(article.slug || article.id)

                    : triggerRoute('blogs')

               }

               className="naa-card overflow-hidden flex flex-col cursor-pointer group bg-white"

             >

             <div className="aspect-video w-full bg-[#102B3F] overflow-hidden relative">

                 {article.coverImage || article.image ? (

                  <img

                      src={article.coverImage || article.image}

                      alt={article.title}

                      loading="lazy"

                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"

                  />

                 ):(

                  <div className="w-full h-full flex items-center justify-center text-white/80 font-bold text-sm px-6 text-center">

                      {article.title}

                  </div>

                 )}

                 <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#102B3F]/90 text-[#C29316] text-[10px] font-extrabold uppercase tracking-wider">

                  {article.category || 'ADMISSIONS & GUIDANCE'}

                 </span>

             </div>

             <div className="p-5 flex-1 flex flex-col justify-between">

                 <div>

                  <h3 className="text-base font-extrabold text-[#172B3B] group-hover:text-[#2E7658] line-clamp-2 leading-snug transition-colors">

                {article.title}

               </h3>

               <p className="text-xs text-[#5E6D7D] line-clamp-2 mt-2 leading-relaxed">

                {article.summary || article.excerpt || article.description}

               </p>

              </div>

              <div className="mt-4 pt-3 border-t border-[#EDF2F6] flex items-center justify-between text-xs">

               <span className="text-[#7A8B99] font-medium">

                {article.date || article.publishedAt || '2026 Guide'}

               </span>

               <span className="font-bold text-[#C29316] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">

                Read article <ArrowRight className="w-3.5 h-3.5" />

               </span>

              </div>

             </div>

            </article>

        ))}

       </StaggerGrid>

      </div>

     </div>

    </div>

   </section>

     {/*
===================================================================
==

         5. FEATURED SCHOLARSHIPS (Deep Navy Contrast Section -Reference
00:16)

===================================================================
== */}

     <section

      id="featured-scholarships-section"

      className="py-16 lg:py-20 bg-[#102B3F] text-white relative overflow-hidden"

     >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <ScrollReveal className="text-center max-w-3xl mx-auto mb-10">

           <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">

            Explore Scholarship Listings{' '}

            <span className="text-[#C29316]">For Your College Journey</span>

           </h2>

           <p className="text-sm sm:text-base text-white/80 mt-2.5">

            Browse national, state and corporate scholarship listings. Review the listed award details, eligibility information and application timelines before applying.

           </p>

           <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">

            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white">

           ₹10,000 to ₹2,00,000+ Grants

          </span>

          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#2E7658]/30 border border-[#B6DbcB]/30 text-[#B6DbcB]">

           Free student information

          </span>

          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white">

           Engineering, Medical & Degree

          </span>

      </div>

     </ScrollReveal>

     <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

      {scholarships.map((item, idx) => (

          <div

           key={item.id || item.name || idx}

           className="rounded-2xl bg-[#163852] border border-white/10 hover:border-[#C29316]/60 p-5 flex flex-col justify-between transition-all hover:-translate-y-1"

          >

           <div>

              <div className="flex items-center justify-between gap-2 mb-3">

               <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 truncate">

                 {item.provider || item.category || 'SCHOLARSHIP GRANT'}

               </span>

           <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2E7658]/40 text-[#9AE6B4] border border-[#2E7658] shrink-0">

            Listed information

           </span>

         </div>

         <h3 className="text-base font-extrabold text-white line-clamp-2">

           {item.name || item.title}

         </h3>

         <div className="mt-3 pt-3 border-t border-white/10">

           <div className="text-xl font-extrabold text-[#C29316]">

            {item.amount || item.award || 'Merit Financial Aid'}

           </div>

           <p className="text-xs text-white/75 line-clamp-2 mt-1.5">

            {item.eligibility || item.description}

           </p>

         </div>

        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">

         <span className="text-white/60 truncate">

           {item.deadline ? `Deadline: ${item.deadline}` : 'Annual Intake'}

         </span>

         <button

              type="button"

              onClick={() => triggerRoute('scholarships')}

              className="font-bold text-[#C29316] hover:text-white inline-flex items-center gap-1 shrink-0"

             >

              <span>View Details</span>

              <ArrowRight className="w-3.5 h-3.5" />

             </button>

           </div>

        </div>

       ))}

      </StaggerGrid>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">

       <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85">

        <span className="w-2 h-2 rounded-full bg-[#2E7658]" />

        <span>Government & corporate scholarship listings with eligibility details</span>

       </div>

       <button

        type="button"

        onClick={() => triggerRoute('scholarships')}

        className="px-5 py-2.5 rounded-xl bg-[#C29316] hover:bg-[#a97f11] text-[#102B3F] font-extrabold text-xs inline-flex items-center gap-1.5 shrink-0 transition-colors"

       >

            <span>Browse Full Scholarship Directory</span>

            <ArrowUpRight className="w-4 h-4" />

           </button>

         </div>

      </div>

     </section>

     {/*
===================================================================
==

         6. EXAMINATION PREPARATION & CBT MOCK TESTS (Reference 00:18-00:20)

===================================================================
== */}

     <section id="exam-practice-section" className="py-16 lg:py-20 bg-white border-b border-[#E2E8ED]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <div className="rounded-3xl border border-[#E2E8ED] bg-[#F5F8F5] p-6 sm:p-10">

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <ScrollReveal className="lg:col-span-7 space-y-5">

             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E8ED] text-xs font-bold text-[#2E7658]">

              <span className="w-2 h-2 rounded-full bg-[#2E7658]" />

              <span>FULL-LENGTH CBT PRACTICE ZONE</span>

             </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172B3B]">

         Practice Zone @ <span className="text-[#C29316]">Mocktest</span>

        </h2>

        <p className="text-sm sm:text-base text-[#5E6D7D] leading-relaxed">

         Master real exam pressure with Full-Length Computer-Based Tests
(CBT). Simulate

         the exact test interface for AP EAPCET (MPC & BiPC), TG EAPCET, and
JEE Main with

         live countdown timers and step-by-step explanations.

        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">

         <div className="bg-white p-3.5 rounded-xl border border-[#E2E8ED] flex items-center gap-3">

          <Clock className="w-5 h-5 text-[#C29316] shrink-0" />

          <div>

            <div className="text-xs font-extrabold text-[#172B3B]">Real Exam
Timer</div>

            <div className="text-[11px] text-[#5E6D7D]">180 Min CBT
Palette</div>

          </div>

         </div>

         <div className="bg-white p-3.5 rounded-xl border border-[#E2E8ED] flex items-center gap-3">

          <BarChart3 className="w-5 h-5 text-[#2E7658] shrink-0" />

          <div>

              <div className="text-xs font-extrabold text-[#172B3B]">Accuracy
Analytics</div>

              <div className="text-[11px] text-[#5E6D7D]">Subject-wise
score</div>

             </div>

          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E2E8ED] flex items-center gap-3">

             <CheckCircle2 className="w-5 h-5 text-[#102B3F] shrink-0" />

             <div>

              <div className="text-xs font-extrabold text-[#172B3B]">Answer Review</div>

              <div className="text-[11px] text-[#5E6D7D]">Solutions where available</div>

             </div>

          </div>

         </div>

         <div className="flex flex-wrap items-center gap-3 pt-2">

          <button

             type="button"

             onClick={() => triggerRoute('mock-tests')}

             className="px-5 py-3 rounded-xl bg-[#102B3F] hover:bg-[#173b56] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"

          >

             <span>Browse All Mock Tests</span>

             <ArrowRight className="w-4 h-4 text-[#C29316]" />

          </button>

          <button

           type="button"

           onClick={() => triggerRoute('mock-tests-ap')}

           className="px-5 py-3 rounded-xl bg-[#2E7658] hover:bg-[#235c44] text-white font-bold text-xs sm:text-sm transition-colors"

          >

           AP EAPCET Free Demo

          </button>

          <button

           type="button"

           onClick={() => triggerRoute('mock-tests-tg')}

           className="px-5 py-3 rounded-xl bg-white hover:bg-[#FDF8EB] text-[#172B3B] border border-[#E2E8ED] font-bold text-xs sm:text-sm transition-colors"

          >

           TG EAPCET Practice

          </button>

         </div>

       </ScrollReveal>

       {/* Illustrated CBT Interface Preview */}

       <ScrollReveal delay={0.12} className="lg:col-span-5">

         <div className="bg-white rounded-2xl border border-[#E2E8ED] p-5 shadow-sm space-y-4">

          <div className="flex items-center justify-between border-b border-[#EDF2F6] pb-3">

          <span className="text-xs font-extrabold text-[#102B3F]">

           STUDENT CBT PRACTICE

          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF4F0] text-[#2E7658]">

           Timed practice • Score review

          </span>

         </div>

         <div className="space-y-2.5">

          {[

           {

               title: 'AP EAPCET (MPC -Engineering) Full Mock Test',

               meta: '80 Maths • 40 Physics • 40 Chemistry',

               route: 'mock-tests-ap',

           },

           {

               title: 'AP EAPCET (BiPC -Agriculture & Pharmacy) Mock',

               meta: '80 Biology • 40 Physics • 40 Chemistry',

               route: 'mock-tests-ap',

           },

           {

               title: 'TG EAPCET (MPC & BiPC) Full-Length CBT Series',

               meta: 'Telangana State Council Syllabus',

               route: 'mock-tests-tg',

           },

          ].map((test) => (

              <div

                  key={test.title}

                  onClick={() => triggerRoute(test.route)}

                  role="button"

                  tabIndex={0}

                  onKeyDown={(e) => e.key === 'Enter' && triggerRoute(test.route)}

                  className="p-3.5 rounded-xl bg-[#F5F8F5] hover:bg-[#FDF8EB] border border-[#E2E8ED] hover:border-[#EED690] flex items-center justify-between gap-3 cursor-pointer transition-colors"

              >

                  <div>

                   <div className="text-xs font-bold text-[#172B3B]">{test.title}</div>

                   <div className="text-[11px] text-[#5E6D7D] mt-0.5">{test.meta}
</div>

                  </div>

                  <span className="text-xs font-extrabold text-[#C29316] shrink-0">

                   Start →

                  </span>

              </div>

             ))}

            </div>

           </div>

          </ScrollReveal>

         </div>

     </div>

      </div>

     </section>

     {/*
===================================================================
==

         7. STUDENT UTILITY ENGINE ("TOOLS" Section -Reference 00:21-00:22)

===================================================================
== */}

     <section id="student-tools-section" className="py-16 lg:py-20 bg-[#F5F8F5] border-b border-[#E2E8ED]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

         <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">

           <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8ED] text-[11px] font-bold uppercase tracking-wider text-[#2E7658]">

            <Wrench className="w-3.5 h-3.5" />

            <span>STUDENT UTILITY ENGINE</span>

           </span>

           <h2 className="text-4xl sm:text-6xl font-black tracking-[0.28em] text-[#102B3F] mt-3 pl-[0.28em]">

            TOOLS

           </h2>

           <p className="text-sm sm:text-base text-[#5E6D7D] mt-3">

            Free, high-performance browser utilities crafted for engineering
students — track

            attendance, calculate CGPA, and prepare counseling documents with
zero server upload.

         </p>

        </ScrollReveal>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

         {configuredStudentTools.map((tool) => {

          const Icon = tool.icon;

          return (

           <div

            key={tool.id}

            className="naa-card p-6 flex flex-col justify-between bg-white"

           >

            <div>

                <div className="flex items-center justify-between gap-2 mb-4">

                 <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EAF4F0] text-[#2E7658]">

                  {tool.category}

                 </span>

                 <div className="w-9 h-9 rounded-xl bg-[#F5F8F5] flex items-center justify-center text-[#102B3F]">

                  <Icon className="w-4 h-4" />

                 </div>

                </div>

                <h3 className="text-lg font-extrabold text-[#172B3B]">{tool.title}
</h3>

                <p className="text-xs text-[#5E6D7D] mt-2 leading-relaxed">

            {tool.description}

           </p>

           <div className="flex flex-wrap gap-1.5 mt-4">

            {tool.specs.map((spec) => (

             <span

              key={spec}

              className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#F5F8F5] text-[#172B3B] border border-[#E2E8ED]"

             >

              {spec}

             </span>

            ))}

           </div>

          </div>

          <div className="mt-6 pt-4 border-t border-[#EDF2F6] flex items-center justify-between">

           <span className="text-[11px] font-semibold text-[#5E6D7D]">

            Student utility

           </span>

           <button

            type="button"

            onClick={() => triggerRoute(tool.route)}

            className="px-3.5 py-2 rounded-xl bg-[#102B3F] hover:bg-[#C29316] text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"

                   >

                    <span>Launch</span>

                    <ArrowRight className="w-3.5 h-3.5" />

                   </button>

                  </div>

              </div>

             );

            })}

           </StaggerGrid>

       </div>

      </section>

      {/*
===================================================================
==

           8. NAACOX AI ASSISTANT & LOWER EDUCATIONAL GUIDES (Preserved)

===================================================================
== */}

      {children && (

       <section id="naacox-ai-section" className="py-12 bg-white">

           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>

       </section>

      )}

  </div>

 );

}

export { HeroSection };
