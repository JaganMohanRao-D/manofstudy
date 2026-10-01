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

const OTHER_TOOLS = [
  ['AI Gap Analyzer', '/ai-gap-analyzer'],
  ['Scholarships', '/scholarships'],
  ['Mock Test Series', '/mock-tests'],
  ['Attendance Defender', '/attendancedefender'],
  ['GPA Hub', '/gpa-hub'],
  ['Backlog Planner', '/backlog-planner'],
  ['Roadmaps', '/roadmaps'],
  ['Placement Viva & Code Vault', '/placement-code-vault'],
  ['Major Projects Hub', '/major-projects'],
  ['Internships', '/internships'],
  ['PDF Tools', '/pdftools'],
  ['Image Compressor', '/imagecompressor'],
  ['Student Essentials', '/student-essentials'],
  ['Study Guides', '/study-guides'],
] as const;

const pushCleanRoute = (path: string) => {
  if (typeof window === 'undefined' || !path) return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== path) window.history.pushState({ mosRoute: path }, '', path);
};

const navigateToRoute = (path: string) => {
  if (typeof window === 'undefined') return;
  window.location.assign(path);
};

const findRegionalHeading = (label: string): HTMLElement | null => {
  const nodes = document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,div,span');
  for (const node of nodes) {
    if (node.textContent?.trim() === label) return node;
  }
  return null;
};

const scrollToRegionalSection = (label: string) => {
  const heading = findRegionalHeading(label);
  if (!heading) return false;
  heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
};

const goToRegionalSection = (label: string) => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/') {
    sessionStorage.setItem('mos-header-scroll-target', label);
    window.location.assign('/');
    return;
  }
  if (!scrollToRegionalSection(label)) {
    window.setTimeout(() => scrollToRegionalSection(label), 150);
  }
};

const styleBrand = () => {
  const brand = document.getElementById('brand-logo') as HTMLAnchorElement | null;
  if (!brand || brand.dataset.mosBrandStyled === 'true') return;

  brand.dataset.mosBrandStyled = 'true';
  brand.setAttribute('aria-label', 'MAN OF STUDY home');
  brand.innerHTML = '<span class="mos-brand-wordmark">Man Of Study</span>';
};

const addCompactHeaderNav = () => {
  const header = document.getElementById('main-header');
  const headerRow = header?.firstElementChild as HTMLElement | null;
  const brand = document.getElementById('brand-logo');
  if (!header || !headerRow || !brand) return;

  styleBrand();
  if (document.getElementById('mos-compact-header-nav')) return;

  const nav = document.createElement('nav');
  nav.id = 'mos-compact-header-nav';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.innerHTML = `
    <button type="button" class="mos-header-link" data-mos-regional="FOR AP STUDENTS">For AP</button>
    <button type="button" class="mos-header-link" data-mos-regional="FOR TELANGANA STUDENTS">For TG</button>
    <div class="mos-tools-menu">
      <button type="button" class="mos-header-link mos-tools-trigger" aria-haspopup="true" aria-expanded="false">
        Other Tools <span class="mos-tools-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="mos-tools-dropdown" role="menu" aria-label="Other tools">
        ${OTHER_TOOLS.map(([label, route]) => `<a href="${route}" data-mos-tool-route="${route}" role="menuitem">${label}</a>`).join('')}
      </div>
    </div>
  `;

  headerRow.insertBefore(nav, headerRow.children[1] || null);

  const rightControls = headerRow.children[2] as HTMLElement | undefined;
  if (rightControls) rightControls.classList.add('mos-header-secondary-controls');

  const regionalButtons = nav.querySelectorAll<HTMLButtonElement>('[data-mos-regional]');
  regionalButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      goToRegionalSection(button.dataset.mosRegional || '');
    });
  });

  const menu = nav.querySelector('.mos-tools-menu') as HTMLElement | null;
  const trigger = nav.querySelector('.mos-tools-trigger') as HTMLButtonElement | null;
  if (menu && trigger) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const open = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll<HTMLAnchorElement>('[data-mos-tool-route]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const route = link.dataset.mosToolRoute;
        closeMenu();
        if (route) navigateToRoute(route);
      });
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target as Node)) closeMenu();
    });
  }
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
  shortcut.addEventListener('click', () => navigateToRoute('/mock-tests'));
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
      html.light { color-scheme: dark !important; }
      html.light, html.light body { background:#060b16 !important; color:#f8fafc !important; }
      html.light .dark\\:bg-slate-950 { background-color:#020617 !important; }
      [title^="Switch to "] { display:none !important; }

      /* Clean desktop/mobile header: MAN OF STUDY + AP + TG + Other Tools. */
      #mos-compact-header-nav {
        display:flex; align-items:center; gap:3px; min-width:0; flex:1 1 auto;
        overflow:visible; padding:0 8px; position:relative;
      }
      .mos-brand-wordmark {
        display:block; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        font-size:clamp(15px,1.5vw,20px); line-height:1; font-weight:900; letter-spacing:-0.045em;
        white-space:nowrap; color:#f8fafc; text-shadow:0 0 20px rgba(56,189,248,.10);
      }
      #brand-logo { text-decoration:none !important; flex:none !important; min-width:max-content; }
      #brand-logo:hover .mos-brand-wordmark { color:#67e8f9; }
      .mos-header-link {
        appearance:none; border:0; background:transparent; color:#cbd5e1; font:inherit;
        font-size:12px; line-height:1; font-weight:800; white-space:nowrap; padding:9px 10px;
        border-radius:10px; cursor:pointer; transition:background .16s ease,color .16s ease;
      }
      .mos-header-link:hover { color:#67e8f9; background:rgba(34,211,238,.09); }
      .mos-header-link:focus-visible { outline:2px solid #22d3ee; outline-offset:2px; }
      .mos-tools-menu { position:relative; flex:none; }
      .mos-tools-trigger { display:inline-flex; align-items:center; gap:5px; }
      .mos-tools-chevron { font-size:14px; line-height:10px; transition:transform .16s ease; }
      .mos-tools-menu.is-open .mos-tools-chevron { transform:rotate(180deg); }
      .mos-tools-dropdown {
        position:absolute; z-index:100; top:calc(100% + 8px); right:0; width:245px; max-height:min(70vh,520px);
        overflow-y:auto; padding:7px; border:1px solid rgba(71,85,105,.75); border-radius:15px;
        background:rgba(9,15,28,.98); box-shadow:0 20px 50px rgba(0,0,0,.45); backdrop-filter:blur(16px);
        opacity:0; visibility:hidden; transform:translateY(-5px); pointer-events:none;
        transition:opacity .14s ease,transform .14s ease,visibility .14s ease;
      }
      .mos-tools-menu.is-open .mos-tools-dropdown { opacity:1; visibility:visible; transform:translateY(0); pointer-events:auto; }
      .mos-tools-dropdown a {
        display:block; padding:10px 11px; border-radius:10px; color:#cbd5e1; text-decoration:none;
        font-size:12px; line-height:1.25; font-weight:700;
      }
      .mos-tools-dropdown a:hover { color:#f8fafc; background:rgba(34,211,238,.10); }
      .mos-tools-dropdown a:focus-visible { outline:2px solid #22d3ee; outline-offset:-2px; }
      .mos-header-secondary-controls { display:none !important; }
      #tier2-secondary-feature-strip { display:none !important; }

      #ws-mock-tests[data-mos-hidden-mock-test="true"],
      #ws-eapcet-cbt[data-mos-hidden-mock-test="true"] { display:none !important; }

      #mos-featurehub-mock-shortcut {
        width:100%; display:flex; align-items:center; gap:12px; margin:0 0 16px; padding:14px 16px;
        border:1px solid rgba(96,165,250,.28); border-radius:18px;
        background:linear-gradient(135deg,rgba(30,64,175,.28),rgba(15,23,42,.88)); color:#f8fafc;
        text-align:left; cursor:pointer; box-shadow:0 10px 30px rgba(2,6,23,.22);
        transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
      }
      #mos-featurehub-mock-shortcut:hover { transform:translateY(-1px); border-color:rgba(96,165,250,.55); box-shadow:0 14px 36px rgba(2,6,23,.32); }
      .mos-fh-mock-icon { width:38px; height:38px; display:grid; place-items:center; border-radius:12px; background:rgba(59,130,246,.16); font-size:19px; flex:none; }
      .mos-fh-mock-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
      .mos-fh-mock-copy strong { font-size:14px; font-weight:800; }
      .mos-fh-mock-copy small { font-size:11px; color:#94a3b8; }
      .mos-fh-mock-arrow { font-size:20px; color:#60a5fa; flex:none; }

      #student-faq-section button { min-height:52px !important; padding-top:11px !important; padding-bottom:11px !important; }
      #student-faq-section h2 { font-size:clamp(1.35rem,2.5vw,1.8rem) !important; }
      #student-faq-section p { line-height:1.45 !important; }
      #student-faq-section .text-sm { font-size:.82rem !important; }

      .mos-hero-ambient, .mos-hero-grid, .mos-hero-orb, .mos-hero-dot, .mos-hero-book { pointer-events:none !important; }
      .mos-hero-content, .mos-hero-title, .mos-hero-subtitle, #features-hub { position:relative; z-index:2; }

      @media (max-width:900px) {
        #mos-compact-header-nav { gap:1px; padding:0 4px; }
        .mos-header-link { font-size:11px; padding:8px 7px; }
        .mos-tools-dropdown { width:225px; }
      }
      @media (max-width:640px) {
        #brand-logo { max-width:125px; }
        .mos-brand-wordmark { font-size:15px; letter-spacing:-0.055em; }
        #mos-compact-header-nav { gap:0; padding:0 2px; }
        .mos-header-link { font-size:10px; padding:8px 5px; }
        .mos-tools-dropdown { position:fixed; top:58px; right:8px; width:min(270px,calc(100vw - 16px)); max-height:65vh; }
        #mos-featurehub-mock-shortcut { margin-bottom:12px; padding:12px 13px; border-radius:16px; }
        .mos-fh-mock-copy strong { font-size:13px; }
        #student-faq-section button { min-height:48px !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        #mos-featurehub-mock-shortcut,.mos-header-link,.mos-tools-dropdown { transition:none !important; }
      }
    `;
    document.head.appendChild(style);

    hideMockTestCards();
    addMockTestShortcut();
    addCompactHeaderNav();
    const removeNavigationListener = addNavigationListener();

    const pendingRegionalTarget = sessionStorage.getItem('mos-header-scroll-target');
    if (pendingRegionalTarget) {
      sessionStorage.removeItem('mos-header-scroll-target');
      window.setTimeout(() => scrollToRegionalSection(pendingRegionalTarget), 500);
    }

    const observer = new MutationObserver(() => {
      hideMockTestCards();
      addMockTestShortcut();
      addCompactHeaderNav();
    });
    observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });

    return () => {
      observer.disconnect();
      removeNavigationListener();
      style.remove();
      document.getElementById('mos-compact-header-nav')?.remove();
    };
  }, []);

  return null;
};

export default SiteUxFixes;
