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

/* The React Header is the single source of truth for branding. This helper only
   normalizes its existing nodes; it never replaces the Header's JSX/DOM. */
const styleBrand = () => {
  const brand = document.getElementById('brand-logo') as HTMLButtonElement | null;
  if (!brand) return;
  brand.dataset.mosBrandStyled = 'true';
  brand.setAttribute('aria-label', 'Naa College home');
  brand.querySelector('.mos-brand-wordmark')?.setAttribute('data-mos-brand-source', 'react');
  brand.querySelector('.mos-brand-tagline')?.setAttribute('data-mos-tagline-source', 'react');
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

const REGIONAL_WORKSPACES = {
  ap: new Set(['/ap-eapcet/college-predictor', '/ap-eapcet/college-wise-allotments', '/ap-eapcet/top-colleges', '/ap-eapcet/phase-2-vacancy-radar']),
  tg: new Set(['/tg-eapcet/college-predictor', '/tg-eapcet/name-wise-allotments', '/tg-eapcet/top-colleges']),
} as const;

const getRegionalWorkspace = (): 'ap' | 'tg' | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (REGIONAL_WORKSPACES.ap.has(path) || path.startsWith('/ap-eapcet/')) return 'ap';
  if (REGIONAL_WORKSPACES.tg.has(path) || path.startsWith('/tg-eapcet/')) return 'tg';
  return null;
};

const getRegionalImagePath = (region: 'ap' | 'tg') => region === 'tg'
  ? '/AP%26TG_photos/Charminar%20and%20Kakatiya%20Gateway.webp'
  : '/AP%26TG_photos/ambedkar%26budha.webp';

const addRegionalWorkspaceVisual = () => {
  const viewport = document.getElementById('workspace-viewport');
  const region = getRegionalWorkspace();
  if (!viewport || !region) {
    document.getElementById('mos-regional-workspace-visual')?.remove();
    return;
  }

  const heading = viewport.querySelector('h1');
  const titleBlock = heading?.parentElement as HTMLElement | null;
  if (!heading || !titleBlock) return;

  titleBlock.classList.add('mos-regional-title-block');

  let visual = document.getElementById('mos-regional-workspace-visual');
  if (!visual) {
    visual = document.createElement('div');
    visual.id = 'mos-regional-workspace-visual';
    visual.innerHTML = `
      <div class="mos-regional-visual-frame">
        <img class="mos-regional-visual-image" alt="" loading="eager" decoding="async" />
      </div>
    `;
    titleBlock.appendChild(visual);
  } else if (visual.parentElement !== titleBlock) {
    titleBlock.appendChild(visual);
  }

  visual.dataset.region = region;
  visual.setAttribute('role', 'img');
  visual.setAttribute('aria-label', region === 'tg' ? 'Telangana landmark representation' : 'Andhra Pradesh landmark representation');

  const image = visual.querySelector<HTMLImageElement>('.mos-regional-visual-image');
  if (image) {
    const target = getRegionalImagePath(region);
    if (image.src !== `${window.location.origin}${target}`) image.src = target;
  }
};

const syncRegionalTheme = () => {
  if (typeof window === 'undefined') return null;
  const region = getRegionalWorkspace();
  // Naa College uses the bright theme across every route and workspace.
  // Do not let regional navigation re-enable the legacy dark theme.
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.style.colorScheme = 'light';
  document.body.classList.add('mos-regional-light');
  document.body.classList.remove('mos-dark-only');
  return region;
};

const SiteUxFixes: React.FC = () => {
  useEffect(() => {
    syncRegionalTheme();

    const style = document.createElement('style');
    style.id = 'mos-site-ux-fixes';
    style.textContent = `
      html.light { color-scheme: light !important; }
      [title^="Switch to "] { display:none !important; }

      #mos-compact-header-nav {
        display:flex; align-items:center; justify-content:center; gap:4px; min-width:0; flex:1 1 auto;
        overflow:visible; padding:0 8px; position:relative;
      }
      .mos-brand-mark {
        width:36px; height:36px; display:grid; place-items:center; flex:none; overflow:hidden;
        border-radius:10px; background:#0b1220; border:1px solid rgba(71,85,105,.6);
      }
      .mos-brand-mark img { width:100%; height:100%; object-fit:contain; display:block; }
      .mos-brand-wordmark {
        display:block; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        font-size:clamp(15px,1.55vw,21px); line-height:1; font-weight:900; letter-spacing:-0.055em;
        white-space:nowrap; color:#f8fafc; text-shadow:0 0 20px rgba(34,211,238,.12);
      }
      .mos-brand-tagline {
        display:block; white-space:nowrap; font-size:9px; line-height:1; font-weight:600;
        letter-spacing:.08em; text-transform:uppercase; color:#94a3b8;
      }
      #brand-logo { text-decoration:none !important; flex:none !important; min-width:max-content; display:flex !important; align-items:center !important; gap:9px !important; }
      #brand-logo:hover .mos-brand-wordmark { color:#67e8f9; }
      .mos-header-link {
        appearance:none; border:0; background:transparent; color:#22d3ee; font:inherit;
        font-size:12px; line-height:1; font-weight:850; white-space:nowrap; padding:9px 10px;
        border-radius:10px; cursor:pointer; transition:background .16s ease,color .16s ease,transform .16s ease;
      }
      .mos-header-link:hover { color:#a5f3fc; background:rgba(34,211,238,.10); transform:translateY(-1px); }
      .mos-header-link:focus-visible { outline:2px solid #22d3ee; outline-offset:2px; }
      .mos-tools-menu { position:relative; flex:none; }
      .mos-tools-trigger { display:inline-flex; align-items:center; gap:5px; }
      .mos-tools-chevron { font-size:14px; line-height:10px; transition:transform .16s ease; }
      .mos-tools-menu.is-open .mos-tools-chevron { transform:rotate(180deg); }
      .mos-tools-dropdown {
        position:absolute; z-index:100; top:calc(100% + 8px); right:0; width:245px; max-height:min(70vh,520px);
        overflow-y:auto; padding:7px; border:1px solid rgba(34,211,238,.30); border-radius:15px;
        background:rgba(6,11,22,.98); box-shadow:0 20px 50px rgba(0,0,0,.45); backdrop-filter:blur(16px);
        opacity:0; visibility:hidden; transform:translateY(-5px); pointer-events:none;
        transition:opacity .14s ease,transform .14s ease,visibility .14s ease;
      }
      .mos-tools-menu.is-open .mos-tools-dropdown { opacity:1; visibility:visible; transform:translateY(0); pointer-events:auto; }
      .mos-tools-dropdown a { display:block; padding:10px 11px; border-radius:10px; color:#a5f3fc; text-decoration:none; font-size:12px; line-height:1.25; font-weight:750; }
      .mos-tools-dropdown a:hover { color:#ecfeff; background:rgba(34,211,238,.11); }
      .mos-tools-dropdown a:focus-visible { outline:2px solid #22d3ee; outline-offset:-2px; }
      .mos-header-secondary-controls { display:flex !important; align-items:center; gap:6px; }
      #header-gap-analyzer-trigger { display:none !important; }
      #header-command-palette-trigger { display:none !important; }
      #header-support-btn { display:flex !important; }
      @media (min-width:1024px) {
        #header-command-palette-trigger { display:flex !important; }
      }
      #tier2-secondary-feature-strip { display:none !important; }
      #ws-mock-tests[data-mos-hidden-mock-test="true"], #ws-eapcet-cbt[data-mos-hidden-mock-test="true"] { display:none !important; }
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

      /* Regional artwork stays beside the heading and uses the asset's natural aspect ratio. */
      body.mos-regional-light #workspace-viewport { background:#fff !important; color:#172033 !important; }
      body.mos-regional-light #main-header { background:rgba(255,255,255,.96) !important; color:#172033 !important; border-bottom-color:#e2e8f0 !important; box-shadow:0 4px 18px rgba(15,23,42,.06) !important; }
      body.mos-regional-light #brand-logo { color:#172033 !important; }
      body.mos-regional-light #brand-logo .mos-brand-mark { background:#fff !important; border-color:#dbe3ec !important; box-shadow:0 2px 8px rgba(15,23,42,.06) !important; }
      body.mos-regional-light #brand-logo .mos-brand-mark img { content:url('/MANOFSTUDY_LOGO.png') !important; }
      body.mos-regional-light #brand-logo .mos-brand-wordmark { color:#0f172a !important; text-shadow:none !important; }
      body.mos-regional-light #brand-logo .mos-brand-tagline { color:#64748b !important; opacity:1 !important; }
      body.mos-regional-light #brand-logo:hover .mos-brand-wordmark { color:#0e7490 !important; }
      body.mos-regional-light #mos-compact-header-nav .mos-header-link { color:#334155 !important; }
      body.mos-regional-light #mos-compact-header-nav .mos-header-link:hover { color:#0e7490 !important; background:rgba(14,116,144,.08) !important; }
      body.mos-regional-light .mos-tools-dropdown { background:#fff !important; border-color:#d7dee8 !important; box-shadow:0 18px 42px rgba(15,23,42,.12) !important; }
      body.mos-regional-light .mos-tools-dropdown a { color:#334155 !important; }
      body.mos-regional-light .mos-tools-dropdown a:hover { color:#0e7490 !important; background:rgba(14,116,144,.08) !important; }
      body.mos-regional-light #header-command-palette-trigger,
      body.mos-regional-light #header-support-btn { color:#334155 !important; background:#fff !important; border-color:#d7dee8 !important; }
      body.mos-regional-light #header-command-palette-trigger:hover,
      body.mos-regional-light #header-support-btn:hover { color:#0e7490 !important; background:#f0f9ff !important; }
      body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) header { position:relative !important; overflow:visible !important; background:#fff !important; color:#172033 !important; }
      body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block { position:relative !important; min-height:184px !important; padding-right:250px !important; padding-top:42px !important; box-sizing:border-box !important; }
      body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual {
        position:absolute !important; z-index:5 !important; top:50% !important; right:0 !important; transform:translateY(-50%) !important;
        width:228px !important; max-width:30vw !important; height:auto !important; margin:0 !important; padding:0 !important;
        box-sizing:border-box !important; border:0 !important; border-radius:0 !important; background:#fff !important;
        overflow:visible !important; box-shadow:none !important; backdrop-filter:none !important; pointer-events:none !important;
      }
      body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-visual-frame { width:100% !important; height:auto !important; min-height:0 !important; overflow:visible !important; display:block !important; border-radius:0 !important; background:#fff !important; }
      body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-visual-image { display:block !important; width:100% !important; height:auto !important; max-width:100% !important; max-height:none !important; object-fit:contain !important; object-position:center !important; opacity:1 !important; border-radius:0 !important; filter:none !important; }

      body.mos-regional-light #workspace-viewport [class*="bg-slate-950"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-900"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-800"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-700"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-950"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-900"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-800"],
      body.mos-regional-light #workspace-viewport [class*="bg-black"] { background:#fff !important; }
      body.mos-regional-light #workspace-viewport [class*="text-white"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-50"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-100"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-200"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-300"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-50"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-100"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-200"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-300"] { color:#172033 !important; }
      body.mos-regional-light #workspace-viewport [class*="text-slate-400"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-500"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-400"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-500"] { color:#526071 !important; }
      body.mos-regional-light #workspace-viewport [class*="border-slate-"],
      body.mos-regional-light #workspace-viewport [class*="border-gray-"],
      body.mos-regional-light #workspace-viewport [class*="border-white"] { border-color:#d7dee8 !important; }
      body.mos-regional-light #workspace-viewport input,
      body.mos-regional-light #workspace-viewport select,
      body.mos-regional-light #workspace-viewport textarea { background:#fff !important; color:#172033 !important; border-color:#cbd5e1 !important; caret-color:#172033 !important; }
      body.mos-regional-light #workspace-viewport input::placeholder,
      body.mos-regional-light #workspace-viewport textarea::placeholder { color:#64748b !important; opacity:1 !important; }
      body.mos-regional-light #workspace-viewport select option { background:#fff !important; color:#172033 !important; }
      body.mos-regional-light #workspace-viewport button { color:#172033; }
      body.mos-regional-light #workspace-viewport a { color:#075985; }
      body.mos-regional-light #workspace-viewport [aria-selected="false"] { color:#334155 !important; }
      body.mos-regional-light #workspace-viewport [aria-selected="true"] { color:#0f172a !important; }
      body.mos-regional-light #workspace-viewport table { color:#172033 !important; }
      body.mos-regional-light #workspace-viewport th,
      body.mos-regional-light #workspace-viewport td { border-color:#e2e8f0 !important; }

      @media (max-width:1000px) and (min-width:641px) {
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block { min-height:165px !important; padding-right:195px !important; }
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual { width:175px !important; max-width:32vw !important; }
      }
      @media (max-width:640px) {
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block { min-height:0 !important; padding-right:0 !important; padding-top:42px !important; padding-bottom:132px !important; }
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual { top:auto !important; bottom:0 !important; right:50% !important; transform:translateX(50%) !important; width:132px !important; max-width:52vw !important; height:auto !important; }
      }
      @media (max-width:390px) {
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block { padding-bottom:122px !important; }
        body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual { width:112px !important; max-width:48vw !important; }
      }

      #student-faq-section button { min-height:52px !important; padding-top:11px !important; padding-bottom:11px !important; }
      #student-faq-section h2 { font-size:clamp(1.35rem,2.5vw,1.8rem) !important; }
      #student-faq-section p { line-height:1.45 !important; }
      #student-faq-section .text-sm { font-size:.82rem !important; }
      .mos-hero-ambient, .mos-hero-grid, .mos-hero-orb, .mos-hero-dot, .mos-hero-book { pointer-events:none !important; }
      .mos-hero-content, .mos-hero-title, .mos-hero-subtitle, #features-hub { position:relative; z-index:2; }
      @media (max-width:1100px) {
        #mos-compact-header-nav { gap:1px; padding:0 4px; }
        .mos-header-link { font-size:11px; padding:8px 7px; }
        .mos-brand-wordmark { font-size:16px; }
        .mos-brand-mark { width:34px; height:34px; }
      }
      @media (max-width:760px) {
        #main-header > div:first-child { min-height:60px !important; height:auto !important; padding-top:7px !important; padding-bottom:7px !important; }
        #brand-logo { flex:0 1 auto !important; min-width:0 !important; max-width:calc(100% - 78px) !important; gap:6px !important; }
        #brand-logo > span:last-child { min-width:0 !important; }
        .mos-brand-mark { width:30px; height:30px; border-radius:8px; }
        .mos-brand-wordmark { max-width:100%; overflow:hidden; text-overflow:ellipsis; font-size:clamp(11px,3.5vw,14px); letter-spacing:-0.06em; }
        .mos-brand-tagline { max-width:100%; overflow:hidden; text-overflow:clip; font-size:clamp(6px,1.8vw,7px); letter-spacing:.06em; }
        #mos-compact-header-nav { display:none !important; }
        #main-header > div:first-child { gap:8px !important; }
        #main-header > div:first-child > div:last-child { flex:0 0 auto !important; flex-shrink:0 !important; gap:6px !important; }
        #header-hamburger-drawer-btn, #header-support-btn { width:34px !important; height:34px !important; min-width:34px !important; flex:0 0 34px !important; padding:0 !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; }
        #header-command-palette-trigger { display:none !important; }
        #header-support-btn span { display:none !important; }
        #header-hamburger-drawer-btn { padding:7px !important; }
        #mos-mobile-navigation-panel { max-height:calc(100dvh - 60px) !important; overflow-y:auto !important; overflow-x:hidden !important; overscroll-behavior-y:contain; -webkit-overflow-scrolling:touch; touch-action:pan-y; }
        #mos-featurehub-mock-shortcut { margin-bottom:12px; padding:12px 13px; border-radius:16px; }
        .mos-fh-mock-copy strong { font-size:13px; }
        #student-faq-section button { min-height:48px !important; }
      }
      @media (max-width:520px) {
        #brand-logo { max-width:calc(100% - 78px) !important; }
        .mos-brand-mark { width:28px; height:28px; }
        #header-command-palette-trigger { display:none !important; }
        #header-support-btn { display:inline-flex !important; width:34px !important; height:34px !important; padding:0 !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        #mos-featurehub-mock-shortcut,.mos-header-link,.mos-tools-dropdown { transition:none !important; }
      }
    `;
    document.head.appendChild(style);

    styleBrand();
    hideMockTestCards();
    addMockTestShortcut();
    addCompactHeaderNav();
    addRegionalWorkspaceVisual();
    const removeNavigationListener = addNavigationListener();

    const pendingRegionalTarget = sessionStorage.getItem('mos-header-scroll-target');
    if (pendingRegionalTarget) {
      sessionStorage.removeItem('mos-header-scroll-target');
      window.setTimeout(() => scrollToRegionalSection(pendingRegionalTarget), 500);
    }

    const observer = new MutationObserver(() => {
      syncRegionalTheme();
      styleBrand();
      hideMockTestCards();
      addMockTestShortcut();
      addCompactHeaderNav();
      addRegionalWorkspaceVisual();
    });
    observer.observe(document.getElementById('root') || document.body, { childList:true, subtree:true });

    return () => {
      observer.disconnect();
      removeNavigationListener();
      style.remove();
      document.getElementById('mos-compact-header-nav')?.remove();
      document.getElementById('mos-regional-workspace-visual')?.remove();
      document.body.classList.remove('mos-regional-light', 'mos-dark-only');
    };
  }, []);

  return null;
};

export default SiteUxFixes;
