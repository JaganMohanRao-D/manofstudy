import React, { useEffect } from 'react';

const ROUTES: Record<string, string> = {
  'hero-gap-analyzer-trigger': '/ai-gap-analyzer',
  'hero-gap-analyzer-btn': '/ai-gap-analyzer',
  'hero-pdf-tools-btn': '/pdftools',
  'hero-image-tools-btn': '/imagecompressor',
  'hero-mock-test-btn': '/mock-tests',
  'hero-ap-allotments-btn': '/ap-eapcet/college-wise-allotments',
  'hero-tg-allotments-btn': '/tg-eapcet/name-wise-allotments',
  'hero-scholarships-btn': '/scholarships',
  'tier2-gap-analyzer': '/ai-gap-analyzer',
  'tier2-pdf-tools': '/pdftools',
  'tier2-image-tools': '/imagecompressor',
  'tier2-tg-allotments': '/tg-eapcet/name-wise-allotments',
  'header-gap-analyzer-trigger': '/ai-gap-analyzer',
};

const WORKSPACE_ROUTES: Record<string, string> = {
  'ws-tg-top-colleges': '/tg-eapcet/top-colleges',
  'ws-tg-predictor': '/tg-eapcet/college-predictor',
  'ws-tg-allotments': '/tg-eapcet/name-wise-allotments',
  'ws-ap-allotments': '/ap-eapcet/college-wise-allotments',
  'ws-ap-predictor': '/ap-eapcet/college-predictor',
  'ws-eapcet': '/ap-eapcet/phase-2-vacancy-radar',
  'ws-attendance': '/attendancedefender',
  'ws-gpa': '/gpa-hub',
  'ws-backlog': '/backlog-planner',
  'ws-roadmaps': '/roadmaps',
  'ws-vault': '/placement-code-vault',
  'ws-projects': '/major-projects',
  'ws-internships': '/internships',
  'ws-scholarships': '/scholarships',
  'ws-pdf': '/pdftools',
  'ws-essentials': '/student-essentials',
};

const pushCleanRoute = (path: string) => {
  if (typeof window === 'undefined' || !path) return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== path) window.history.pushState({ mosRoute: path }, '', path);
};

const hideMockTestCards = () => {
  const ids = ['ws-mock-tests', 'ws-eapcet-cbt'];
  ids.forEach((id) => {
    const node = document.getElementById(id);
    if (node) {
      node.setAttribute('data-mos-hidden-mock-test', 'true');
      (node as HTMLElement).style.display = 'none';
    }
  });
};

const addMockTestShortcut = () => {
  const hub = document.getElementById('features-hub');
  if (!hub || document.getElementById('mos-featurehub-mock-shortcut')) return;

  const shortcut = document.createElement('button');
  shortcut.type = 'button';
  shortcut.id = 'mos-featurehub-mock-shortcut';
  shortcut.setAttribute('aria-label', 'Open Mock Test Series');
  shortcut.innerHTML = `
    <span class="mos-fh-mock-icon" aria-hidden="true">🎯</span>
    <span class="mos-fh-mock-copy">
      <strong>Mock Test Series</strong>
      <small>Open the CBT workspace</small>
    </span>
    <span class="mos-fh-mock-arrow" aria-hidden="true">→</span>
  `;
  shortcut.addEventListener('click', () => {
    const launcher = document.getElementById('hero-mock-test-btn') as HTMLButtonElement | null;
    if (launcher) launcher.click();
    pushCleanRoute('/mock-tests');
  });

  hub.insertBefore(shortcut, hub.firstChild);
};

const addNavigationListener = () => {
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button');
    if (!button) return;

    const id = button.id;
    const directRoute = ROUTES[id];
    if (directRoute) {
      window.setTimeout(() => pushCleanRoute(directRoute), 0);
      return;
    }

    if (button.closest('#features-hub')) {
      const workspaceRoute = WORKSPACE_ROUTES[id];
      if (workspaceRoute) window.setTimeout(() => pushCleanRoute(workspaceRoute), 0);
    }
  };

  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
};

const SiteUxFixes: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.classList.add('mos-dark-only');

    const style = document.createElement('style');
    style.id = 'mos-site-ux-fixes';
    style.textContent = `
      /* Dark-only presentation */
      html.light { color-scheme: dark !important; }
      html.light, html.light body { background:#060b16 !important; color:#f8fafc !important; }
      html.light .dark\\:bg-slate-950 { background-color:#020617 !important; }
      [title^="Switch to "] { display:none !important; }
      
      /* Keep mock-test execution out of the long homepage scroll. */
      #ws-mock-tests[data-mos-hidden-mock-test="true"],
      #ws-eapcet-cbt[data-mos-hidden-mock-test="true"] { display:none !important; }
      
      /* Compact Feature Hub shortcut for Mock Tests. */
      #mos-featurehub-mock-shortcut {
        width:100%; display:flex; align-items:center; gap:12px; margin:0 0 16px;
        padding:14px 16px; border:1px solid rgba(96,165,250,.28); border-radius:18px;
        background:linear-gradient(135deg,rgba(30,64,175,.28),rgba(15,23,42,.88));
        color:#f8fafc; text-align:left; cursor:pointer; box-shadow:0 10px 30px rgba(2,6,23,.22);
        transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
      }
      #mos-featurehub-mock-shortcut:hover { transform:translateY(-1px); border-color:rgba(96,165,250,.55); box-shadow:0 14px 36px rgba(2,6,23,.32); }
      .mos-fh-mock-icon { width:38px; height:38px; display:grid; place-items:center; border-radius:12px; background:rgba(59,130,246,.16); font-size:19px; flex:none; }
      .mos-fh-mock-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
      .mos-fh-mock-copy strong { font-size:14px; font-weight:800; }
      .mos-fh-mock-copy small { font-size:11px; color:#94a3b8; }
      .mos-fh-mock-arrow { font-size:20px; color:#60a5fa; flex:none; }
      
      /* Reduce FAQ vertical density without making answers unreadable. */
      #student-faq-section button { min-height:52px !important; padding-top:11px !important; padding-bottom:11px !important; }
      #student-faq-section h2 { font-size:clamp(1.35rem,2.5vw,1.8rem) !important; }
      #student-faq-section p { line-height:1.45 !important; }
      #student-faq-section .text-sm { font-size:.82rem !important; }
      
      /* Prevent decorative layers from ever sitting above readable content. */
      .mos-hero-ambient, .mos-hero-grid, .mos-hero-orb, .mos-hero-dot, .mos-hero-book { pointer-events:none !important; }
      .mos-hero-content, .mos-hero-title, .mos-hero-subtitle, #features-hub { position:relative; z-index:2; }
      
      @media (max-width:640px) {
        #mos-featurehub-mock-shortcut { margin-bottom:12px; padding:12px 13px; border-radius:16px; }
        .mos-fh-mock-copy strong { font-size:13px; }
        #student-faq-section button { min-height:48px !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        #mos-featurehub-mock-shortcut { transition:none !important; }
      }
    `;
    document.head.appendChild(style);

    hideMockTestCards();
    addMockTestShortcut();
    const removeNavigationListener = addNavigationListener();

    const observer = new MutationObserver(() => {
      hideMockTestCards();
      addMockTestShortcut();
    });
    observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });

    return () => {
      observer.disconnect();
      removeNavigationListener();
      style.remove();
    };
  }, []);

  return null;
};

export default SiteUxFixes;
