// Lightweight module preloading for faster tool navigation.
// Keep code-splitting, but start fetching a tool chunk before React switches
// the workspace when the student presses/touches a tool control.

const loaders: Record<string, () => Promise<unknown>> = {
  'AP EAPCET College Predictor': () => import('./components/ApCollegePredictor'),
  'TG EAPCET College Predictor': () => import('./components/TgCollegePredictor'),
  'AP EAPCET Top B.Tech Colleges': () => import('./components/ApTopColleges'),
  'Top B.Tech Colleges in Telangana': () => import('./components/TgTopColleges'),
  'AP Allotments (Namewise)': () => import('./components/ApEapcet2025AllotmentExplorer'),
  'TG EAPCET 2026 Final Phase Seat Allotments Name Wise': () => import('./components/TgAllotmentExplorer'),
  'Scholarships Radar': () => import('./components/ScholarshipsHub'),
  'Engineering Branch Roadmaps': () => import('./components/EngineeringRoadmaps'),
  'Attendance Defender': () => import('./components/AttendanceDefender'),
  'Global GPA Hub': () => import('./components/GlobalGpaHub'),
  'Internal Cutoff Estimator': () => import('./components/InternalExamEstimator'),
  'free pdf tools for students': () => import('./components/PdfPowerTools'),
  'ATS Resume Matcher': () => import('./components/AtsResumeMatcher'),
  'Exam Image Resizer': () => import('./components/ImageResizer'),
  'Verified Student Internships Radar': () => import('./components/InternshipsRadar'),
  'Campus Placement Major Projects Hub': () => import('./components/MajorProjectsHub'),
  'AI Student Gap Analyzer': () => import('./components/StudentGapAnalyzer/StudentGapAnalyzer'),
  'Placement Viva Flashcards & Practical Code Vault': () => import('./components/PlacementCodeVault'),
  'Smart Backlog Recovery Planner': () => import('./components/BacklogPlanner'),
  'DSA & Coding Placement Tracker': () => import('./components/DsaPlacementTracker'),
  'Mock Test Series': () => import('./components/MockTestSeriesHub'),
  'Student Essentials': () => import('./components/StudentEssentialsStore'),
};

const started = new Set<string>();
const preload = (key: string) => {
  const loader = loaders[key];
  if (!loader || started.has(key)) return;
  started.add(key);
  void loader().catch(() => started.delete(key));
};

const findLoaderKey = (target: Element | null) => {
  const control = target?.closest('button, a');
  if (!control) return null;
  const text = (control.textContent || '').replace(/\s+/g, ' ').trim();
  return Object.keys(loaders).find((key) => text.includes(key)) || null;
};

if (typeof window !== 'undefined') {
  const startPreload = (event: Event) => preload(findLoaderKey(event.target as Element | null) || '');
  document.addEventListener('pointerdown', startPreload, { capture: true, passive: true });
  document.addEventListener('touchstart', startPreload, { capture: true, passive: true });

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const canWarm = !connection?.saveData && connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g';
  if (canWarm) {
    const warm = () => [
      'AP EAPCET College Predictor',
      'TG EAPCET College Predictor',
      'AP EAPCET Top B.Tech Colleges',
      'Top B.Tech Colleges in Telangana',
      'AP Allotments (Namewise)',
      'TG EAPCET 2026 Final Phase Seat Allotments Name Wise',
    ].forEach(preload);
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(warm, { timeout: 3500 });
    } else {
      globalThis.setTimeout(warm, 1800);
    }
  }

  const updateLoadingText = (root: ParentNode) => {
    root.querySelectorAll('span').forEach((span) => {
      if (span.textContent?.trim() === 'Loading module...') span.textContent = "Hold on student, it's loading";
    });
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      updateLoadingText(element.matches('span') ? element.parentNode || element : element);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  updateLoadingText(document.body);
}
