/**
 * Generate route-specific HTML entry points for the public SEO landing pages.
 *
 * Vite's SPA build normally emits only dist/index.html. These copies ensure
 * each supported SEO URL ships its own title, description, canonical, Open
 * Graph and Twitter metadata in the initial HTML response, before React runs.
 * The client application still owns the interactive page UI and routing.
 *
 * This script intentionally includes only routes implemented in src/App.tsx.
 * Do not add a URL here unless it is a real, public, canonical page.
 */
const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(process.cwd(), 'dist');
const sourceHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(sourceHtmlPath)) {
  console.error('[SEO] dist/index.html was not found. Run this script after vite build.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(sourceHtmlPath, 'utf8');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const safeExternalUrl = (value) => {
  try {
    const parsed = new URL(String(value || ''));
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
  } catch { return ''; }
};
const externalLink = (url, label) => {
  const safeUrl = safeExternalUrl(url);
  return safeUrl ? '<a href="' + escapeHtml(safeUrl) + '" rel="noopener noreferrer">' + escapeHtml(label) + '</a>' : '';
};

const routes = [
  {
    path: '/ap-eapcet/college-wise-allotments/',
    title: 'AP EAPCET 2026 College-Wise Allotments | Naa College',
    description: 'Explore AP EAPCET 2026 allotment records by college, branch, rank and available category filters. Review the dataset on Naa College and verify current counselling decisions with the official AP EAPCET portal.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">AP EAPCET 2026 · Engineering Admissions</p><h1 class="mt-3 text-3xl font-bold tracking-tight">AP EAPCET 2026 College-Wise Allotments</h1><p class="mt-4 max-w-3xl text-base leading-7">Explore the AP EAPCET 2026 allotment dataset by college and branch. Use the available filters to review records and observed ranks for the selected dataset. These records are for exploration and do not guarantee a future seat or replace an official counselling result.</p><h2 class="mt-6 text-xl font-semibold">How to use this page</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Select a college to inspect its available allotment records.</li><li>Choose a branch and use the available rank or category filters to narrow the results.</li><li>Check the year and phase shown in the tool before comparing records.</li><li>Confirm deadlines, seat allotments and reporting instructions with the official AP EAPCET counselling authority.</li></ul><p class="mt-6 text-sm leading-6">Naa College is an independent student resource. Dataset coverage may differ by year and phase; always verify important decisions with the official authority.</p><p class="mt-4"><a class="font-semibold underline" href="https://eapcet-sche.aptonline.in/EAPCET/" rel="noopener noreferrer">Visit the AP EAPCET official portal</a></p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/tg-eapcet/name-wise-allotments/',
    title: 'TG EAPCET 2026 Allotment Explorer | Naa College',
    description: 'Explore Telangana EAPCET 2026 final-phase allotment records and understand the limits of historical counselling data.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">Telangana EAPCET · Engineering Admissions</p><h1 class="mt-3 text-3xl font-bold">TG EAPCET 2026 Allotment Explorer</h1><p class="mt-4 leading-7">Use this explorer to understand published Telangana EAPCET allotment information for the specified counselling cycle. Records describe a past allotment process and do not guarantee a seat in a future cycle.</p><h2 class="mt-6 text-xl font-semibold">How to interpret the records</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Confirm the counselling year and phase before comparing records.</li><li>Compare like-for-like branch, college, and category information.</li><li>Use official counselling notices for current eligibility, deadlines, seat matrices, and final allotments.</li><li>A historical record is not a prediction or confirmation of a current student\'s admission.</li></ul><p class="mt-5 leading-7">Naa College is an independent student resource. Verify important decisions with the <a href="https://tgeapcet.nic.in/" rel="noopener noreferrer">official Telangana EAPCET counselling portal</a>.</p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/ap-eapcet/college-predictor/',
    title: 'AP EAPCET College Predictor 2026 | Naa College',
    description: 'Explore AP EAPCET college and branch options using rank and applicable counselling preferences, with clear limits on historical data.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">Andhra Pradesh · Admissions</p><h1 class="mt-3 text-3xl font-bold">AP EAPCET College Predictor</h1><p class="mt-4 leading-7">This tool helps students explore possible college and branch options from the rank, category, region, and preferences entered. Its results depend on the dataset and filters available in Naa College; they are not official seat allotments and cannot guarantee admission.</p><h2 class="mt-6 text-xl font-semibold">Use the predictor carefully</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Enter the correct exam year and rank, then select only applicable category options.</li><li>Compare records from the same counselling phase, branch, and seat category.</li><li>If no results appear, review inputs and dataset coverage rather than assuming no option exists.</li><li>Confirm current rules, fees, deadlines, and final allotments with the official authority.</li></ul><p class="mt-5 leading-7">Official reference: <a href="https://cets.apsche.ap.gov.in/EAPCET/" rel="noopener noreferrer">AP EAPCET counselling portal</a>.</p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/tg-eapcet/college-predictor/',
    title: 'TG EAPCET College Predictor 2026 | Naa College',
    description: 'Explore Telangana EAPCET college and branch options using rank and applicable counselling preferences, with clear limits on historical data.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">Telangana · Admissions</p><h1 class="mt-3 text-3xl font-bold">TG EAPCET College Predictor</h1><p class="mt-4 leading-7">Explore college and branch possibilities using the rank and preferences you enter. Results are based on the data and filters available in this tool; they are informational estimates, not official allotments or guarantees of admission.</p><h2 class="mt-6 text-xl font-semibold">Before relying on a result</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Check the counselling year, phase, branch, and category represented by the data.</li><li>Enter only the category and preferences that apply to your counselling application.</li><li>Review results as options to investigate, not as a promise of a seat.</li><li>Confirm current rules, fees, deadlines, and final allotment with the official authority.</li></ul><p class="mt-5 leading-7">Official reference: <a href="https://tgeapcet.nic.in/" rel="noopener noreferrer">Telangana EAPCET counselling portal</a>.</p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/tools/attendance-calculator/',
    title: 'Attendance Calculator & Bunk Planner | Naa College',
    description: 'Calculate attendance percentage, estimate future attendance, and understand how class counts affect your target.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><h1 class="text-3xl font-bold">Attendance Calculator and Bunk Planner</h1><p class="mt-4 leading-7">Use the calculator to work out attendance from classes attended and total classes held, then explore how future attendance may change if you attend or miss classes.</p><h2 class="mt-6 text-xl font-semibold">Formula</h2><p class="mt-2 leading-7">Attendance percentage = (classes attended ÷ total classes held) × 100. For example, attending 45 of 50 classes gives 90% attendance.</p><h2 class="mt-6 text-xl font-semibold">Important limitations</h2><p class="mt-2 leading-7">The result is a planning estimate. Your college may calculate attendance by subject, academic period, or other rules. Confirm the applicable attendance policy and official attendance record with your institution before making decisions.</p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/tools/gpa-calculator/',
    title: 'CGPA, SGPA & Percentage Calculator | Naa College',
    description: 'Explore CGPA, SGPA, and percentage calculations while checking the grading rules used by your own university.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><h1 class="text-3xl font-bold">CGPA, SGPA and Percentage Calculator</h1><p class="mt-4 leading-7">Use the calculator to organise semester grades and explore CGPA or SGPA scenarios. Results depend on the grading scale and conversion formula selected or supported by the tool.</p><h2 class="mt-6 text-xl font-semibold">Understand the result</h2><p class="mt-2 leading-7">CGPA commonly represents a cumulative grade measure, while SGPA usually represents performance for a single semester. Percentage conversion rules vary by university and programme, so there is no single formula that is correct for every institution.</p><p class="mt-4 leading-7">Before using a calculated value on an application, transcript, or official form, verify the conversion formula and grading regulations published by your university.</p></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/engineering-roadmaps/',
    title: 'Engineering Branch Roadmaps for B.Tech Students | Naa College',
    description: 'Explore engineering learning roadmaps with staged topics, projects, and preparation guidance; adapt the sequence to your degree and goals.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><h1 class="text-3xl font-bold">Engineering Branch Roadmaps</h1><p class="mt-4 leading-7">The roadmaps organise learning topics and project work into stages so students can build foundations before moving to specialised subjects. Use them as planning guides, not as official university syllabi or guaranteed placement paths.</p><h2 class="mt-6 text-xl font-semibold">How to use a roadmap</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Start with programming, mathematics, and core subjects required for your branch.</li><li>Choose a manageable project after learning the concepts it uses.</li><li>Keep coursework, labs, and examinations as priorities alongside independent learning.</li><li>Check current documentation and prerequisites before adopting a tool or framework.</li><li>Adjust the sequence to your available time, interests, and university curriculum.</li></ul></main>',
    renderStaticBodyInRoot: true,
  },
  {
    path: '/about/',
    title: 'About Naa College | Student Education Resources',
    description: 'Learn how Naa College brings student tools, admissions data, study guidance, and scholarship information together, including the limits of each resource.',
    staticBody: '<main class="mx-auto max-w-4xl px-4 py-8"><p class="text-sm font-semibold uppercase tracking-wide">About this independent student resource</p><h1 class="mt-3 text-3xl font-bold">About Naa College</h1><p class="mt-4 leading-7">Naa College is an independent student resource built to make practical academic tools, admissions information, learning guidance, and student opportunities easier to explore in one place. The site focuses especially on the questions students face while comparing engineering colleges, planning their studies, understanding scholarship listings, and building skills outside class.</p><h2 class="mt-7 text-xl font-semibold">What students can use</h2><p class="mt-3 leading-7">The platform includes AP and Telangana EAPCET data explorers and predictors, attendance and grade calculators, engineering roadmaps, a scholarship directory, student guides, and browser-based document utilities. These features have different purposes: calculators help with estimates, roadmaps organise learning, and historical allotment records let students inspect an earlier counselling cycle.</p><h2 class="mt-7 text-xl font-semibold">How to use information responsibly</h2><p class="mt-3 leading-7">A historical allotment record is not a forecast or an official seat offer. A predicted college is not a guarantee of admission. Scholarship listings can contain a recorded status or date that later changes. Always check the latest official counselling notice, university rules, scholarship specification, or provider page before you make a financial or education decision.</p><h2 class="mt-7 text-xl font-semibold">Independence and transparency</h2><p class="mt-3 leading-7">Naa College is not a government counselling authority, university, scholarship-awarding body, or employer. The site aims to identify sources where available and explain limitations rather than imply that a tool is an official service. Third-party services may be involved in selected features; review the privacy policy and the feature description before sharing information.</p><h2 class="mt-7 text-xl font-semibold">Corrections and feedback</h2><p class="mt-3 leading-7">If a page contains a broken link, unclear instruction, outdated scholarship entry, or technical problem, contact the site with the relevant URL and a description of the issue. Please do not include passwords, Aadhaar numbers, hall-ticket numbers, or other sensitive identifiers in a support message.</p><p class="mt-6"><a href="/contact-us/">Contact Naa College</a> · <a href="/privacy-policy/">Privacy Policy</a> · <a href="/legal-safe-harbor/">Disclaimer</a></p></main>',
    renderStaticBodyInRoot: true,
  },
    {
    path: '/contact-us/',
    title: 'Contact Naa College',
    description: 'Contact Naa College about site functionality, data corrections, scholarship listing questions, accessibility, or privacy concerns.',
    staticBody: '<main class="mx-auto max-w-4xl px-4 py-8"><p class="text-sm font-semibold uppercase tracking-wide">Support and feedback</p><h1 class="mt-3 text-3xl font-bold">Contact Naa College</h1><p class="mt-4 leading-7">Contact us if a tool is not working, a page contains a broken link, a scholarship record needs correction, an instruction is unclear, or you have a question about the information shown on the site.</p><h2 class="mt-7 text-xl font-semibold">What to include in a useful report</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Paste the page URL where you noticed the issue.</li><li>Describe what you expected and what happened instead.</li><li>For a data correction, identify the displayed field and provide a public official source link where possible.</li><li>If the issue appears only on a phone or a particular browser, mention the device and browser version.</li></ul><h2 class="mt-7 text-xl font-semibold">Email support</h2><p class="mt-3 leading-7">Write to <a href="mailto:support.jamord@gmail.com">support.jamord@gmail.com</a>. A message form in the website may prepare an email in your mail application; submitting it depends on your email application and does not guarantee immediate delivery or a particular response time.</p><h2 class="mt-7 text-xl font-semibold">Protect your personal information</h2><p class="mt-3 leading-7">Do not send passwords, Aadhaar details, hall-ticket numbers, full marksheets, bank details, or other sensitive identifiers in a support message. Share only the minimum information needed to explain the issue. Read the <a href="/privacy-policy/">Privacy Policy</a> to understand the site features and third-party services.</p><p class="mt-6"><a href="/about/">About Naa College</a> · <a href="/terms-of-service/">Terms of Service</a></p></main>',
    renderStaticBodyInRoot: true,
  },
    {
    path: '/privacy-policy/',
    title: 'Privacy Policy | Naa College',
    description: 'Read how Naa College describes browser-based tools, local preferences, Firebase features, AI-assisted processing, and third-party advertising.',
    staticBody: '<main class="mx-auto max-w-4xl px-4 py-8"><p class="text-sm font-semibold uppercase tracking-wide">Privacy and data use</p><h1 class="mt-3 text-3xl font-bold">Privacy Policy</h1><p class="mt-4 leading-7">Naa College contains different kinds of tools, so the information handled depends on the feature you use. This page is a summary; read the complete Privacy Policy shown on the website for more detail and check the relevant feature description before entering information.</p><h2 class="mt-7 text-xl font-semibold">Browser-based tools and files</h2><p class="mt-3 leading-7">Many calculator and document operations are designed to run in your browser. That does not mean every feature is guaranteed to be local: some features rely on external services. Avoid entering sensitive identifiers or confidential documents into any tool unless the feature genuinely requires them and you understand how the information may be processed.</p><h2 class="mt-7 text-xl font-semibold">Authentication and external services</h2><p class="mt-3 leading-7">Some collaborative features use Firebase authentication and related cloud services. The Student Gap Analyzer may send assessment inputs to an external AI service when that service is configured. The platform cannot make an absolute promise that information is never transmitted; review the disclosure for the feature you are using and the relevant third-party provider terms.</p><h2 class="mt-7 text-xl font-semibold">Local preferences and advertising</h2><p class="mt-3 leading-7">The site may save interface preferences in browser storage. The website may also display Google AdSense or other advertising when configured. Advertising and measurement providers may use cookies or similar technologies according to their settings, your location, and the provider policies. Review the complete policy and available consent or advertising controls applicable to you.</p><h2 class="mt-7 text-xl font-semibold">Questions and data minimisation</h2><p class="mt-3 leading-7">Use only the data needed for a feature, and avoid sharing passwords, Aadhaar numbers, hall-ticket details, bank information, or full identity documents in optional fields. For privacy questions or correction requests, contact <a href="mailto:support.jamord@gmail.com">support.jamord@gmail.com</a>. See also the <a href="/terms-of-service/">Terms of Service</a> and <a href="/contact-us/">Contact page</a>.</p><p class="mt-6 text-sm leading-6">This summary does not replace the complete policy displayed on Naa College. The actual handling of information can depend on the particular feature and any third-party service it uses.</p></main>',
    renderStaticBodyInRoot: true,
  },
    {
    path: '/terms-of-service/',
    title: 'Terms of Service | Naa College',
    description: 'Review the terms, limitations, source checks, and responsible-use guidance for Naa College educational tools and student resources.',
    staticBody: '<main class="mx-auto max-w-4xl px-4 py-8"><p class="text-sm font-semibold uppercase tracking-wide">Responsible use</p><h1 class="mt-3 text-3xl font-bold">Terms of Service</h1><p class="mt-4 leading-7">Naa College provides educational information, planning tools, data explorers, calculators, roadmaps, and student resources for general informational use. By using the site, you remain responsible for checking inputs, interpreting outputs carefully, and deciding whether a resource is appropriate for your situation.</p><h2 class="mt-7 text-xl font-semibold">No official decision or guarantee</h2><p class="mt-3 leading-7">Historical allotment records and college predictors are not official counselling results and do not guarantee admission. Calculator outputs are estimates based on the values entered and may not match a particular university rule. Scholarship summaries may be incomplete or out of date; only the scheme provider can confirm current eligibility, documents, dates, and award decisions.</p><h2 class="mt-7 text-xl font-semibold">Accuracy and availability</h2><p class="mt-3 leading-7">The site may be updated, corrected, or temporarily unavailable. External websites and third-party tools operate under their own terms and privacy practices. Naa College does not control third-party content and cannot guarantee that every external link, deadline, dataset, or feature remains current.</p><h2 class="mt-7 text-xl font-semibold">Safe and lawful use</h2><p class="mt-3 leading-7">Do not misuse the site, attempt to access restricted areas, upload content you have no right to share, or rely on a tool in place of an official decision. Report technical issues through the <a href="/contact-us/">Contact page</a>. Review the <a href="/privacy-policy/">Privacy Policy</a> and <a href="/legal-safe-harbor/">Disclaimer</a> before relying on site information.</p></main>',
    renderStaticBodyInRoot: true,
  },
    {
    path: '/legal-safe-harbor/',
    title: 'Disclaimer | Naa College',
    description: 'Read limitations for historical EAPCET data, college predictions, calculators, scholarship records, learning guides, and third-party resources.',
    staticBody: '<main class="mx-auto max-w-4xl px-4 py-8"><p class="text-sm font-semibold uppercase tracking-wide">Important information</p><h1 class="mt-3 text-3xl font-bold">Disclaimer</h1><p class="mt-4 leading-7">Naa College is an independent educational information resource. It is not a government counselling authority, university, scholarship-awarding organisation, or employer, and does not imply endorsement by those organisations unless an explicit statement says otherwise.</p><h2 class="mt-7 text-xl font-semibold">Admissions and historical data</h2><p class="mt-3 leading-7">Allotment records describe the dataset and counselling period indicated on the relevant page. College predictors are exploratory tools, not guarantees of a future allotment. Categories, seat rules, course lists, fees, and application deadlines can change. Confirm current information on the official counselling portal before submitting options or paying fees.</p><h2 class="mt-7 text-xl font-semibold">Scholarship records</h2><p class="mt-3 leading-7">A scholarship listing does not prove that applications are open, that a person qualifies, or that an award will be granted. Some records describe renewal windows or contain incomplete document details. Read the current scheme guidelines and confirm eligibility, award amount, recognised institutions, required documents, and deadlines with the scheme provider.</p><h2 class="mt-7 text-xl font-semibold">Calculators and learning guides</h2><p class="mt-3 leading-7">Calculator results depend on the inputs and assumptions displayed. University grading and attendance policies can differ. Roadmaps and career articles are educational starting points and are not a promise of a specific academic, placement, or salary outcome.</p><h2 class="mt-7 text-xl font-semibold">Third-party links and services</h2><p class="mt-3 leading-7">Links may lead to websites controlled by other organisations. Their content, security, privacy practices, and availability are their responsibility. Check that a destination is genuine before sharing information. To report a problem with a Naa College page, use the <a href="/contact-us/">Contact page</a>.</p></main>',
    renderStaticBodyInRoot: true,
  }
];

// Generate a dedicated crawlable HTML entry point for every roadmap in the
// same source datasets used by the interactive React roadmap directory.
const roadmapDataFiles = [
  'src/data/engineeringRoadmapsData.ts',
  'src/data/engineeringRoadmapsExtended.ts',
  'src/data/iotRoadmap.ts'
];
const discoveredRoadmaps = new Map();
const roadmapEntryPattern = /\{\s*id:\s*'([^']+)',\s*code:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
for (const relativeFile of roadmapDataFiles) {
  const absoluteFile = path.resolve(process.cwd(), relativeFile);
  if (!fs.existsSync(absoluteFile)) continue;
  const source = fs.readFileSync(absoluteFile, 'utf8');
  for (const match of source.matchAll(roadmapEntryPattern)) {
    const [, id, code, name] = match;
    if (!discoveredRoadmaps.has(id)) discoveredRoadmaps.set(id, { id, code, name });
  }
}
for (const roadmap of discoveredRoadmaps.values()) {
  const pathName = '/engineering-roadmaps/' + encodeURIComponent(roadmap.id) + '/';
  const title = roadmap.name + ' Roadmap | Naa College';
  const description = 'Explore the ' + roadmap.name + ' (' + roadmap.code + ') roadmap on Naa College, with staged learning guidance, skills, project directions, career options and a downloadable guide.';
  const name = escapeHtml(roadmap.name);
  const code = escapeHtml(roadmap.code);
  const staticBody = '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><nav class="text-sm text-slate-500"><a href="/engineering-roadmaps/">All roadmaps</a> / ' + code + '</nav><p class="mt-5 text-sm font-semibold uppercase tracking-wide">Naa College · Career roadmap</p><h1 class="mt-3 text-3xl font-bold tracking-tight">' + name + ' Roadmap</h1><p class="mt-4 max-w-3xl text-base leading-7">Explore the learning roadmap for ' + name + '. The interactive guide includes staged learning areas, skills to develop, project directions, career paths, and a downloadable PDF to help organise your learning.</p><h2 class="mt-7 text-xl font-semibold">How to use this roadmap</h2><ul class="mt-3 list-disc space-y-2 pl-6 leading-7"><li>Review the stages in order and build the foundations before moving to advanced areas.</li><li>Use suggested skills and projects to practise what you learn rather than only reading about it.</li><li>Adapt the sequence to your university syllabus, available time, interests and current skill level.</li><li>Use career and salary information as general context, not as a promise of employment or earnings.</li><li>Open the full interactive roadmap below and download the PDF when you need an offline reference.</li></ul><p class="mt-5 leading-7">This independent learning guide is not an official university syllabus. Course requirements, hiring expectations, tools and compensation vary, so verify important details with current official or employer sources.</p><p class="mt-5"><a class="font-semibold underline" href="/engineering-roadmaps/">Browse all Naa College roadmaps</a></p></main>';
  routes.push({ path: pathName, title, description, staticBody, includeInSitemap: true });
}
console.log('[SEO] Discovered ' + discoveredRoadmaps.size + ' individual roadmap pages from source data.');

// Generate one crawlable static HTML entry point per scholarship record.
// The React detail page reads the same JSON dataset, keeping routes and content aligned.
const scholarshipDataPath = path.resolve(process.cwd(), 'public/indian_scholarships.json');
if (fs.existsSync(scholarshipDataPath)) {
  const scholarshipRecords = JSON.parse(fs.readFileSync(scholarshipDataPath, 'utf8'));
  const slugify = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const usedSlugs = new Set();
  scholarshipRecords.forEach((scholarship) => {
    const slug = slugify(scholarship.title);
    if (!slug || usedSlugs.has(slug)) {
      throw new Error('[SEO] Missing or duplicate scholarship slug for: ' + (scholarship.title || scholarship.id));
    }
    usedSlugs.add(slug);
    const title = scholarship.title + ': Eligibility, Benefits & Application | Naa College';
    const summary = scholarship.target || scholarship.description || '';
    const description = (scholarship.title + ' — ' + summary + ' Check current eligibility, benefits, application dates and official scheme guidance.').slice(0, 158);
    const sourceUrl = safeExternalUrl(scholarship.official_source_url || scholarship.guideline_url || scholarship.apply_link || scholarship.applyLink);
    const fields = [
      ['Provider', scholarship.provider], ['Who it is for', scholarship.target],
      ['Eligibility', scholarship.eligibility], ['Benefit', scholarship.amount],
      ['Application deadline', scholarship.deadline], ['Status shown in source data', scholarship.status],
      ['Geographic scope', scholarship.state], ['Last verified in source data', scholarship.last_verified],
      ['Source note', scholarship.source_note],
    ].filter(([, value]) => value && String(value).trim());
    const fieldHtml = fields.map(([label, value]) => '<section><h2>' + escapeHtml(label) + '</h2><p>' + escapeHtml(value) + '</p></section>').join('');
    const staticBody = '<main class="mx-auto max-w-4xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">Scholarship information · Verify current rules</p><h1 class="mt-3 text-3xl font-bold">' + escapeHtml(scholarship.title) + '</h1>' +
      (summary ? '<p class="mt-4 text-lg leading-7">' + escapeHtml(summary) + '</p>' : '') +
      '<div class="mt-6 space-y-5 leading-7">' + fieldHtml + '</div>' +
      (sourceUrl ? '<p class="mt-6 leading-7">Check the provider\'s current notice: ' + externalLink(sourceUrl, 'Open source page') + '.</p>' : '<p class="mt-6 leading-7">A source link was not available in this record. Verify the scheme with its provider before applying.</p>') +
      '<p class="mt-5 text-sm leading-6">Scholarship terms, eligibility and dates can change. This page summarises the available record; confirm the latest requirements with the scheme provider before making an application decision.</p></main>';
    routes.push({ path: '/scholarships/' + slug + '/', title, description, staticBody, renderStaticBodyInRoot: true });
  });
  const scholarshipListingItems = scholarshipRecords.map((scholarship) => {
    const slug = slugify(scholarship.title);
    const label = escapeHtml(scholarship.title);
    const provider = scholarship.provider ? '<p><strong>Provider:</strong> ' + escapeHtml(scholarship.provider) + '</p>' : '';
    const target = scholarship.target ? '<p><strong>Intended students:</strong> ' + escapeHtml(scholarship.target) + '</p>' : '';
    const eligibility = scholarship.eligibility ? '<p><strong>Eligibility summary:</strong> ' + escapeHtml(scholarship.eligibility) + '</p>' : '';
    const amount = scholarship.amount ? '<p><strong>Listed benefit:</strong> ' + escapeHtml(scholarship.amount) + '</p>' : '';
    const deadline = scholarship.deadline ? '<p><strong>Timeline recorded:</strong> ' + escapeHtml(scholarship.deadline) + '</p>' : '';
    const status = scholarship.status ? '<p><strong>Source status:</strong> ' + escapeHtml(scholarship.status) + '</p>' : '';
    const verified = scholarship.last_verified ? '<p><strong>Last checked in dataset:</strong> ' + escapeHtml(scholarship.last_verified) + '</p>' : '';
    return '<li class="my-6 border-b border-slate-200 pb-5"><article><h2><a href="/scholarships/' + escapeHtml(slug) + '/">' + label + '</a></h2>' + provider + target + eligibility + amount + deadline + status + verified + '<p><a href="/scholarships/' + escapeHtml(slug) + '/">Read record details and source notes</a></p></article></li>';
  }).join('');
  routes.push({
    path: '/scholarships/',
    title: 'Scholarship Directory for Indian Students | Naa College',
    description: 'Browse scholarship records with available eligibility, benefit, deadline, and source details. Confirm current rules with each scheme provider.',
    staticBody: '<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6"><h1 class="text-3xl font-bold">Scholarship Directory for Students</h1><p class="mt-4 leading-7">Browse the scholarship records currently listed on Naa College. Each record may contain eligibility information, listed benefits, application dates, and source notes. Details can change; confirm current rules and deadlines with the scheme provider before applying.</p><h2 class="mt-7 text-xl font-semibold">Available scholarship records</h2><ul class="mt-3 space-y-5 leading-7">' + scholarshipListingItems + '</ul><p class="mt-6 text-sm leading-6">This directory is an independent information resource, not a scholarship provider. A listing does not guarantee eligibility or approval.</p></main>',
    renderStaticBodyInRoot: true,
  });
} else {
  console.warn('[SEO] Scholarship JSON not found; individual scholarship HTML routes were not generated.');
}


// Blog routes share the same typed editorial JSON used by the React UI.
// Only published articles become public URLs or sitemap entries.
const blogDataPath = path.resolve(process.cwd(), 'src/data/blogArticles.generated.json');
const blogArticles = fs.existsSync(blogDataPath)
  ? JSON.parse(fs.readFileSync(blogDataPath, 'utf8'))
  : [];
const publishedBlogArticles = blogArticles.filter((article) => article.status === 'published');
const slugifyBlogCategory = (value) => String(value || '').toLowerCase()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const htmlEscape = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const inlineStatic = (value) => htmlEscape(value)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
  .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const renderStaticArticle = (article) => {
  const lines = String(article.content || '').trim().split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('## ')) { blocks.push('<h2 class="mt-8 mb-3 text-2xl font-semibold tracking-tight">' + inlineStatic(line.slice(3).trim()) + '</h2>'); i++; continue; }
    if (line.startsWith('### ')) { blocks.push('<h3 class="mt-6 mb-2 text-xl font-semibold">' + inlineStatic(line.slice(4).trim()) + '</h3>'); i++; continue; }
    if (line.startsWith('> ')) {
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) quote.push(lines[i++].trim().replace(/^>\s?/, ''));
      blocks.push('<blockquote class="my-5 border-l-4 border-cyan-500 bg-cyan-50 px-4 py-3 leading-7">' + inlineStatic(quote.join(' ')) + '</blockquote>'); continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) items.push('<li class="mb-2">' + inlineStatic(lines[i++].trim().replace(/^[-*]\s+/, '')) + '</li>');
      blocks.push('<ul class="my-4 list-disc space-y-2 pl-6 leading-7">' + items.join('') + '</ul>'); continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) items.push('<li class="mb-2">' + inlineStatic(lines[i++].trim().replace(/^\d+[.)]\s+/, '')) + '</li>');
      blocks.push('<ol class="my-4 list-decimal space-y-2 pl-6 leading-7">' + items.join('') + '</ol>'); continue;
    }
    const paragraph = [line]; i++;
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>\s|[-*]\s+|\d+[.)]\s+)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push('<p class="my-4 text-base font-normal leading-8 text-slate-700">' + inlineStatic(paragraph.join(' ')) + '</p>');
  }
  return '<article class="mx-auto max-w-4xl px-4 py-6 sm:px-8"><p class="mb-5 text-sm"><a href="/blog/" class="text-cyan-700 underline">Naa College Blog</a> / ' + htmlEscape(article.category) +
    '</p><h1 class="mb-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">' + htmlEscape(article.title) + '</h1><p class="mb-5 text-lg leading-8 text-slate-600">' + htmlEscape(article.summary) +
    '</p><p class="mb-8 text-sm text-slate-500">Updated ' + htmlEscape(article.updatedAt) + ' · By Naa College Editorial Desk · ' +
    Math.max(2, Math.ceil(String(article.content || '').trim().split(/\s+/).filter(Boolean).length / 220)) + ' min read</p><div class="blog-prose">' + blocks.join('\n') + '</div>' +
    (article.sources && article.sources.length ? '<h2 class="mt-10 text-xl font-semibold">Official and reference sources</h2><ul class="my-4 list-disc space-y-2 pl-6">' +
      article.sources.map((source) => '<li><a href="' + htmlEscape(source.url) + '" rel="noopener noreferrer" class="text-cyan-700 underline">' + htmlEscape(source.label) + '</a></li>').join('') + '</ul>' : '') +
    '<p class="mt-10 border-t pt-5 text-sm leading-7 text-slate-500">Educational information only. Verify time-sensitive details with the relevant official authority or product documentation.</p></article>';
};
const blogListingBody = (title, description, list) =>
  '<section><h1>' + htmlEscape(title) + '</h1><p>' + htmlEscape(description) + '</p><nav aria-label="Blog categories"><ul>' +
  Array.from(new Set(publishedBlogArticles.map((article) => article.category))).map((category) =>
    '<li><a href="/blog/category/' + slugifyBlogCategory(category) + '/">' + htmlEscape(category) + '</a></li>').join('') +
  '</ul></nav><h2>Published guides</h2><ul>' + list.map((article) =>
    '<li><article><h3><a href="/blog/' + htmlEscape(article.slug) + '/">' + htmlEscape(article.title) +
    '</a></h3><p>' + htmlEscape(article.summary) + '</p><p>' + htmlEscape(article.category) + ' · ' +
    Math.max(2, Math.ceil(String(article.content || '').trim().split(/\s+/).filter(Boolean).length / 220)) + ' min read</p></article></li>').join('') +
  '</ul></section>';
routes.push({
  path: '/blog/',
  title: 'Student Blog & Knowledge Hub | Naa College',
  description: 'Practical guides for EAPCET counselling, student tools, scholarships, programming, and responsible AI-assisted development.',
  staticBody: blogListingBody('Naa College Blog & Student Knowledge Hub', 'Practical, student-focused guides for admissions, tools, scholarships, programming, and responsible AI-assisted development.', publishedBlogArticles),
  schema: { '@context': 'https://schema.org', '@type': 'Blog', name: 'Naa College Blog', url: 'https://naacollege.in/blog/' }
});
const blogCategories = Array.from(new Set(publishedBlogArticles.map((article) => article.category)));
blogCategories.forEach((category) => {
  const slug = slugifyBlogCategory(category);
  const categoryArticles = publishedBlogArticles.filter((article) => article.category === category);
  // Category archives with very few published entries stay usable for readers but
  // should not be promoted as search landing pages until the category has depth.
  // This is an editorial threshold, not a Google word-count policy.
  const indexable = categoryArticles.length >= 3;
  routes.push({
    path: '/blog/category/' + slug + '/',
    title: category + ' Guides | Naa College Blog',
    description: ('Practical student-focused guides in ' + category + ' from Naa College.').slice(0, 158),
    staticBody: blogListingBody(category + ' Guides', 'Published Naa College articles in ' + category + '.', categoryArticles),
    noindex: !indexable,
    includeInSitemap: indexable,
    schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: category + ' Guides', url: 'https://naacollege.in/blog/category/' + slug + '/' }
  });
});
publishedBlogArticles.forEach((article) => {
  const canonical = 'https://naacollege.in/blog/' + article.slug + '/';
  routes.push({
    path: '/blog/' + article.slug + '/',
    title: (article.seoTitle || article.title) + ' | Naa College',
    description: String(article.seoDescription || article.summary || '').slice(0, 158),
    staticBody: renderStaticArticle(article),
    schema: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title,
      description: article.summary, datePublished: article.publishedAt, dateModified: article.updatedAt,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'Naa College Editorial Desk', url: 'https://naacollege.in/' },
      publisher: { '@type': 'Organization', name: 'Naa College', url: 'https://naacollege.in/' }
    }
  });
});

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMeta(html, attribute, key, content) {
  const safeContent = escapeAttribute(content);
  const tagPattern = new RegExp(
    "<meta\\b(?=[^>]*\\b" + attribute + "=[\"']" + key + "[\"'])[^>]*>",
    "i"
  );
  const existing = html.match(tagPattern);
  const replacement = existing
    ? existing[0].replace(/\bcontent=(["'])[^"']*\1/i, 'content="' + safeContent + '"')
    : '<meta ' + attribute + '="' + key + '" content="' + safeContent + '" />';
  return existing
    ? html.replace(tagPattern, replacement)
    : html.replace('</head>', '    ' + replacement + '\n  </head>');
}

function setCanonical(html, url) {
  const safeUrl = escapeAttribute(url);
  const pattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  const replacement = '<link rel="canonical" href="' + safeUrl + '" />';
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', '    ' + replacement + '\n  </head>');
}

function buildRouteHtml(route) {
  const canonical = 'https://naacollege.in' + route.path;
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>' + escapeAttribute(route.title) + '</title>');
  html = setMeta(html, 'name', 'description', route.description);
  if (route.noindex) html = setMeta(html, 'name', 'robots', 'noindex,follow');
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:url', canonical);
  if (route.schema && route.schema['@type'] === 'BlogPosting') html = setMeta(html, 'property', 'og:type', 'article');
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);
  html = setMeta(html, 'name', 'twitter:url', canonical);
  html = setCanonical(html, canonical);
  if (route.schema) {
    const schemaTag = '<script type="application/ld+json" data-generated-blog-schema>' + JSON.stringify(route.schema).replace(/</g, '\\u003c') + '</script>';
    html = html.replace('</head>', '    ' + schemaTag + '\n  </head>');
  }
  if (route.staticBody) {
    // Put route-specific content in the actual application root so it is
    // available in the initial HTML response. React replaces this initial
    // markup when the interactive application mounts; no hidden SEO text.
    const rootMarker = '<div id="root"></div>';
    if (!html.includes(rootMarker)) {
      throw new Error('[SEO] Expected empty React root before prerendering ' + route.path);
    }
    html = html.replace(rootMarker, '<div id="root">' + route.staticBody + '</div>');
  }

  const routeDir = path.join(distDir, route.path.replace(/^\/+|\/+$/g, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');

  const titleOk = html.includes('<title>' + escapeAttribute(route.title) + '</title>');
  const canonicalOk = html.includes('<link rel="canonical" href="' + canonical + '" />');
  if (!titleOk || !canonicalOk) {
    throw new Error('Could not write expected metadata for ' + route.path);
  }
  console.log('[SEO] Generated route-specific metadata: ' + route.path);
}

const homepageBody = '<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6"><p class="text-sm font-semibold uppercase tracking-wide">Student tools and education resources</p><h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Naa College — tools and guidance for students</h1><p class="mt-4 max-w-3xl text-base leading-7">Explore admission data, EAPCET college predictors, attendance and grade calculators, scholarship information, engineering learning roadmaps, and practical student resources. Use these tools to understand options and plan next steps; verify important decisions with the relevant official authority.</p><h2 class="mt-8 text-xl font-semibold">Explore student tools</h2><ul class="mt-3 grid gap-3 sm:grid-cols-2 leading-7"><li><a href="/ap-eapcet/college-predictor/">AP EAPCET College Predictor</a> — explore options using available historical data.</li><li><a href="/tg-eapcet/college-predictor/">TG EAPCET College Predictor</a> — review options and check data year and category.</li><li><a href="/ap-eapcet/college-wise-allotments/">AP EAPCET Allotment Explorer</a> — filter published records by college and branch.</li><li><a href="/tg-eapcet/name-wise-allotments/">TG EAPCET Allotment Explorer</a> — explore historical counselling information.</li><li><a href="/tools/attendance-calculator/">Attendance Calculator</a> — calculate attendance and plan future class counts.</li><li><a href="/tools/gpa-calculator/">CGPA and SGPA Calculator</a> — explore grade calculations and university-specific rules.</li><li><a href="/engineering-roadmaps/">Engineering Roadmaps</a> — organise learning topics and project milestones.</li><li><a href="/blog/">Student Guides</a> — read practical guides and tool instructions.</li></ul><h2 class="mt-8 text-xl font-semibold">Use information responsibly</h2><p class="mt-3 leading-7">Admission and scholarship rules, deadlines, and seat availability can change. Historical data and predictions are not official decisions. Confirm current requirements with official sources before submitting applications or making payments.</p><p class="mt-5 leading-7"><a href="/scholarships/">Scholarship resources</a> · <a href="/about">About Naa College</a> · <a href="/privacy-policy">Privacy Policy</a> · <a href="/contact-us">Contact</a></p></main>';
const homepageHtml = baseHtml.replace('<div id="root"></div>', '<div id="root">' + homepageBody + '</div>');
if (homepageHtml === baseHtml) throw new Error('[SEO] Could not inject homepage content into the React root.');
fs.writeFileSync(sourceHtmlPath, homepageHtml, 'utf8');

for (const route of routes) buildRouteHtml(route);

// Keep the deployed sitemap aligned with the exact static routes generated above.
const xmlEscape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url><loc>https://naacollege.in/</loc></url>',
  ...routes.filter((route) => route.includeInSitemap !== false).map((route) => '  <url><loc>' + xmlEscape('https://naacollege.in' + route.path) + '</loc></url>'),
  '</urlset>',
].join('\n') + '\n';
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log('[SEO] Generated ' + routes.length + ' static SEO route entry points and refreshed sitemap.xml.');
