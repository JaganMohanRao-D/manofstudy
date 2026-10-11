/*
 * NAA COLLEGE clean-route bridge.
 *
 * The React app still uses its existing hash-based workspace state internally.
 * This bridge exposes clean pathname URLs without removing the hash until
 * React has received the hashchange event and updated its workspace state.
 */
(function () {
  'use strict';

  var routes = {
    'hub': '/',
    'eapcet': '/ap-eapcet/phase-2-vacancy-radar',
    'ap-allotments': '/ap-eapcet/college-wise-allotments',
    'ap-predictor': '/ap-eapcet/college-predictor',
    'ap-rank-predictor': '/ap-eapcet/rank-predictor',
    'ap-top-colleges': '/ap-eapcet/top-colleges',
    'tg-allotments': '/tg-eapcet/name-wise-allotments',
    'tg-top-colleges': '/tg-eapcet/top-colleges',
    'tg-predictor': '/tg-eapcet/college-predictor',
    'roadmaps': '/roadmaps',
    'scholarships': '/scholarships',
    'utilities': '/pdftools',
    'pdf-tools': '/pdftools',
    'resizer': '/imagecompressor',
    'vault': '/placement-code-vault',
    'backlog': '/backlog-planner',
    'compiler': '/code-studio',
    'dsa': '/dsa-placement-tracker',
    'academics': '/academics',
    'attendance': '/attendancedefender',
    'gpa': '/gpa-hub',
    'essentials': '/student-essentials',
    'store': '/student-store',
    'guides': '/study-guides',
    'projects': '/major-projects',
    'internships': '/internships',
    'cbt-mock-test': '/mock-test',
    'eapcet-cbt': '/eapcet-mock-test',
    'mock-tests': '/mock-tests',
    'gap-analyzer': '/ai-gap-analyzer',
    'privacy': '/privacy',
    'terms': '/terms',
    'disclaimer': '/disclaimer',
    'contact': '/contact',
    'about': '/about'
  };

  var seoPaths = {
    '/ap-eapcet/college-wise-allotments': true,
    '/tg-eapcet/name-wise-allotments': true,
    '/ap-eapcet/college-predictor': true,
    '/tg-eapcet/college-predictor': true
  };

  function normalizePath(path) {
    if (!path) return '/';
    var clean = path.replace(/\/+$/, '');
    return clean || '/';
  }

  function routeForHash(hash) {
    var value = (hash || '').replace(/^#/, '').toLowerCase();
    if (!value) return '/';

    var aliases = {
      'scholarship': 'scholarships',
      'tg-college-predictor': 'tg-predictor',
      'college-predictor': 'tg-predictor',
      'rank-predictor': 'tg-predictor',
      'buffer-radar': 'tg-predictor',
      'top-colleges': 'tg-top-colleges',
      'telangana-top-colleges': 'tg-top-colleges',
      'rankings': 'tg-top-colleges',
      'top-btech': 'tg-top-colleges',
      'tg-allotment': 'tg-allotments',
      'tg-cutoff': 'tg-allotments',
      'tg-eapcet': 'tg-allotments',
      'tgeapcet': 'tg-allotments',
      'ap-college-predictor': 'ap-predictor',
      'ap-intelligence': 'ap-predictor',
      'ap-cutoff': 'ap-predictor',
      'ap-top-btech': 'ap-top-colleges',
      'ap-rankings': 'ap-top-colleges',
      'ap-eapcet-2025': 'ap-allotments',
      'ap-allotment-explorer': 'ap-allotments',
      'eapcet-radar': 'eapcet',
      'eapcet': 'eapcet',
      'phase1': 'eapcet',
      'phase2': 'eapcet',
      'radar': 'eapcet',
      'vacancy': 'eapcet',
      'predictor': 'eapcet',
      'major-projects': 'projects',
      'majorprojects': 'projects',
      'internship': 'internships',
      'internships-radar': 'internships',
      'bunk': 'attendance',
      'bunk-planner': 'attendance',
      'cgpa': 'gpa',
      'sgpa': 'gpa',
      'gpa-hub': 'gpa',
      'internal': 'gpa',
      'internal-calc': 'gpa',
      'utilities': 'utilities',
      'pdf': 'utilities',
      'image-tools': 'resizer',
      'photo-resizer': 'resizer',
      'test-series': 'mock-tests',
      'cbt-series': 'mock-tests',
      'mock-tests': 'mock-tests',
      'mock-test': 'cbt-mock-test',
      'eapcet-test': 'eapcet-cbt',
      'ap-cbt': 'eapcet-cbt',
      'tg-cbt': 'eapcet-cbt',
      'gap': 'gap-analyzer',
      'analyzer': 'gap-analyzer',
      'student-gap': 'gap-analyzer',
      'career-gap': 'gap-analyzer',
      'backlogs': 'backlog',
      'backlog-planner': 'backlog',
      'code-vault': 'vault',
      'viva': 'vault',
      'compiler': 'vault',
      'code': 'vault',
      'codestudio': 'vault',
      'student-gear': 'essentials',
      'academic-store': 'essentials',
      'store': 'essentials',
      'gear': 'essentials',
      'curriculum': 'roadmaps',
      'branch': 'roadmaps',
      'editorial': 'guides',
      'survival': 'guides',
      'privacy-policy': 'privacy',
      'about-us': 'about',
      'contact-us': 'contact'
    };

    var key = aliases[value] || value;
    if (routes[key]) return routes[key];
    if (value.indexOf('roadmap') === 0) return routes.roadmaps;
    if (value.indexOf('guide-') === 0) return routes.guides;
    if (value.indexOf('tg-') === 0) return routes['tg-allotments'];
    return null;
  }

  function cleanCurrentHash() {
    if (!window.location.hash) return;
    var target = routeForHash(window.location.hash);
    if (!target) return;

    var pathname = normalizePath(window.location.pathname);
    var search = window.location.search || '';
    if (pathname !== target || window.location.hash) {
      window.setTimeout(function () {
        if (window.location.hash) {
          window.history.replaceState(null, '', target + search);
        }
      }, 0);
    }
  }

  function addTopCollegeScopeNote(container) {
    if (!container || container.querySelector('[data-mos-top-college-scope-note]')) return;
    var note = document.createElement('div');
    note.setAttribute('data-mos-top-college-scope-note', 'true');
    note.setAttribute('role', 'note');
    note.style.cssText = 'margin:0 auto 1rem;max-width:80rem;padding:.65rem .9rem;border:1px solid rgba(148,163,184,.22);border-radius:.75rem;background:rgba(148,163,184,.06);color:#64748b;font-size:11px;line-height:1.55;text-align:center;';
    note.textContent = 'Note: Only colleges covered by the respective EAPCET counselling/allotment data are included. Deemed universities and institutions outside the EAPCET counselling process are excluded.';
    container.appendChild(note);
  }

  function injectScholarshipPolish() {
    if (document.getElementById('mos-scholarship-polish')) return;
    var style = document.createElement('style');
    style.id = 'mos-scholarship-polish';
    style.textContent = `
      .mos-scholarships-hub { position: relative; isolation: isolate; }
      .mos-scholarships-hub::before { content:""; position:absolute; inset:2rem 0 auto; height:34rem; z-index:-1; pointer-events:none; background:radial-gradient(circle at 15% 15%, rgba(16,185,129,.10), transparent 32%), radial-gradient(circle at 85% 10%, rgba(59,130,246,.10), transparent 30%); }
      .mos-scholarship-hero { box-shadow:0 18px 60px rgba(15,23,42,.10); }
      .mos-scholarship-hero > div:first-child { background:linear-gradient(135deg,#07111f,#0f172a); }
      .mos-scholarship-hero > div:first-child img { max-height:none !important; aspect-ratio:16/5; object-fit:cover !important; object-position:center; }
      .mos-scholarships-hub article { box-shadow:0 8px 28px rgba(15,23,42,.06); transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
      .mos-scholarships-hub article:hover { transform:translateY(-4px); box-shadow:0 18px 42px rgba(15,23,42,.12); }
      .mos-scholarships-hub article img { transition:transform .35s ease; }
      .mos-scholarships-hub article:hover img { transform:scale(1.025); }
      .mos-scholarships-hub article > div:first-child { background:#f8fafc; }
      .dark .mos-scholarships-hub article > div:first-child { background:#020617; }
      .mos-scholarships-hub .sticky { box-shadow:0 12px 34px rgba(15,23,42,.10); }
      #scholarship-details-backdrop { animation:mosScholarshipBackdrop .18s ease-out both; }
      #scholarship-details-card { animation:mosScholarshipModal .22s cubic-bezier(.2,.8,.2,1) both; }
      @keyframes mosScholarshipBackdrop { from { opacity:0; } to { opacity:1; } }
      @keyframes mosScholarshipModal { from { opacity:0; transform:translateY(12px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
      @media (max-width:640px) {
        .mos-scholarships-hub { padding-left:.75rem !important; padding-right:.75rem !important; }
        .mos-scholarship-hero { border-radius:22px !important; }
        .mos-scholarship-hero > div:first-child img { aspect-ratio:16/7; }
        .mos-scholarships-hub article:hover { transform:none; }
        #scholarship-details-card { border-radius:22px !important; max-height:calc(100dvh - .75rem) !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        .mos-scholarships-hub article, .mos-scholarships-hub article img, #scholarship-details-backdrop, #scholarship-details-card { animation:none !important; transition:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function watchTopCollegeViews() {
    addTopCollegeScopeNote(document.querySelector('.mos-ap-top'));
    addTopCollegeScopeNote(document.querySelector('#top-btech-colleges-telangana'));
  }

  /* ================================================================
     NAA COLLEGE BRAND SYSTEM
     Use only public/Naa%20College%20logo.webp as the canonical brand asset.
     ================================================================ */
  var MOS_LOGO_PATH = '/Naa%20College%20logo.webp';
  var MOS_SITE_URL = 'https://naacollege.in/';

  function replaceLegacyLogoImages(root) {
    var scope = root || document;
    var images = scope.querySelectorAll ? scope.querySelectorAll('img') : [];
    Array.prototype.forEach.call(images, function (img) {
      var src = img.getAttribute('src') || '';
      var alt = (img.getAttribute('alt') || '').toLowerCase();
      if (src.indexOf('Naa%20College%20logo.webp') !== -1 || alt.indexOf('Naa College') !== -1 || alt.indexOf('mos logo') !== -1) {
        if (img.getAttribute('src') !== MOS_LOGO_PATH) img.setAttribute('src', MOS_LOGO_PATH);
        img.setAttribute('data-mos-canonical-logo', 'true');
        img.setAttribute('decoding', 'async');
        img.style.objectFit = 'contain';
      }
    });

    var brand = document.getElementById('brand-logo');
    if (brand) {
      brand.setAttribute('href', MOS_SITE_URL);
      brand.setAttribute('target', '_self');
      brand.setAttribute('aria-label', 'NAA COLLEGE home');
      brand.onclick = function (event) {
        event.preventDefault();
        window.location.assign(MOS_SITE_URL);
      };
    }
  }

  function makeStandaloneLogoClickable() {
    var images = document.querySelectorAll('img[data-mos-canonical-logo]');
    Array.prototype.forEach.call(images, function (img) {
      if (img.closest('a')) return;
      var parent = img.parentElement;
      if (!parent || parent.getAttribute('data-mos-logo-link') === 'true') return;
      parent.setAttribute('data-mos-logo-link', 'true');
      parent.style.cursor = 'pointer';
      parent.addEventListener('click', function () {
        window.location.assign(MOS_SITE_URL);
      });
    });
  }

  function removeWebOptionsCsvExport() {
    var buttons = document.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (button) {
      var text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'export official csv' || text.indexOf('export official csv') !== -1) {
        button.remove();
      }
    });
  }

  function createPrintStyles() {
    if (document.getElementById('mos-brand-print-styles')) return;
    var style = document.createElement('style');
    style.id = 'mos-brand-print-styles';
    style.textContent = `
      #mos-print-root { display:none; }
      @media print {
        body.mos-print-document > *:not(#mos-print-root) { display:none !important; }
        body.mos-print-document #mos-print-root { display:block !important; position:static !important; width:100% !important; min-height:100vh !important; background:#fff !important; color:#0f172a !important; padding:14mm !important; box-sizing:border-box !important; }
        body.mos-print-document #mos-print-root * { box-sizing:border-box !important; }
        body.mos-print-document #mos-print-root table { width:100% !important; border-collapse:collapse !important; font-size:10px !important; }
        body.mos-print-document #mos-print-root th, body.mos-print-document #mos-print-root td { border:1px solid #cbd5e1 !important; padding:7px 6px !important; color:#0f172a !important; background:#fff !important; }
        body.mos-print-document #mos-print-root th { background:#f1f5f9 !important; font-weight:800 !important; }
        body.mos-print-document #mos-print-root .mos-print-logo { width:42px !important; height:42px !important; object-fit:contain !important; display:block !important; }
        body.mos-print-document #mos-print-root .mos-print-title { font-size:20px !important; font-weight:900 !important; margin:0 !important; }
        body.mos-print-document #mos-print-root .mos-print-muted { color:#475569 !important; font-size:10px !important; }
        body.mos-print-document #mos-print-root .mos-print-card { border:1px solid #e2e8f0 !important; border-radius:12px !important; padding:14px !important; margin-bottom:14px !important; }
        body.mos-print-document #mos-print-root a { color:#0f172a !important; text-decoration:none !important; }
        @page { size:A4; margin:10mm; }
      }
    `;
    document.head.appendChild(style);
  }

  function getPrintRoot() {
    var root = document.getElementById('mos-print-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'mos-print-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function addPrintBrandHeader(root, title, subtitle) {
    var header = document.createElement('div');
    header.className = 'mos-print-card';
    header.innerHTML = `
      <a href="${MOS_SITE_URL}" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:#0f172a;">
        <img class="mos-print-logo" src="${MOS_LOGO_PATH}" alt="NAA COLLEGE logo" />
        <div>
          <div style="font-size:11px;font-weight:900;letter-spacing:.12em;color:#0284c7;">NAA COLLEGE</div>
          <h1 class="mos-print-title">${title}</h1>
          <div class="mos-print-muted">${subtitle || 'Student utility generated by Naa College'}</div>
        </div>
      </a>
    `;
    root.appendChild(header);
  }

  function prepareWebOptionsPrint() {
    var heading = null;
    var nodes = document.querySelectorAll('h1,h2,h3');
    Array.prototype.some.call(nodes, function (node) {
      var text = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'web options preference list') {
        heading = node;
        return true;
      }
      return false;
    });
    if (!heading) return false;

    var builder = heading.closest('.space-y-5') || heading.closest('div');
    if (!builder) return false;
    var table = builder.querySelector('table');
    if (!table) return false;

    createPrintStyles();
    var root = getPrintRoot();
    root.innerHTML = '';
    addPrintBrandHeader(root, 'Web Options Preference List', 'Prepared from the selected AP/TG College Predictor results. Final submission must be completed on the official counselling portal.');

    var tableCard = document.createElement('div');
    tableCard.className = 'mos-print-card';
    tableCard.appendChild(table.cloneNode(true));
    root.appendChild(tableCard);

    var footer = document.createElement('div');
    footer.className = 'mos-print-muted';
    footer.textContent = 'Generated by Naa College • For student planning and reference only.';
    root.appendChild(footer);

    document.body.classList.add('mos-print-document');
    window.setTimeout(function () {
      window.print();
      window.setTimeout(function () {
        document.body.classList.remove('mos-print-document');
        root.innerHTML = '';
      }, 500);
    }, 80);
    return true;
  }

  function addWebOptionsPdfButton() {
    var headings = document.querySelectorAll('h1,h2,h3');
    Array.prototype.forEach.call(headings, function (heading) {
      var text = (heading.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text !== 'web options preference list') return;
      var card = heading.closest('.bg-slate-900') || heading.closest('div');
      if (!card || card.querySelector('[data-mos-web-options-pdf]')) return;
      var controls = card.querySelector('div.flex.items-center.gap-2');
      if (!controls) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-mos-web-options-pdf', 'true');
      button.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs';
      button.innerHTML = '<span aria-hidden="true">▣</span><span>Download PDF</span>';
      button.addEventListener('click', function () { prepareWebOptionsPrint(); });
      controls.insertBefore(button, controls.firstChild);
    });
  }

  function addScorecardBrand() {
    var container = document.getElementById('cbt-scorecard-container');
    if (!container || container.querySelector('[data-mos-scorecard-brand]')) return;
    var card = container.firstElementChild;
    if (!card) return;
    var brand = document.createElement('div');
    brand.setAttribute('data-mos-scorecard-brand', 'true');
    brand.style.cssText = 'display:flex;align-items:center;gap:14px;padding:8px 0 16px;border-bottom:1px solid #e2e8f0;margin-bottom:4px;';
    brand.innerHTML = `
      <a href="${MOS_SITE_URL}" aria-label="NAA COLLEGE home" style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;text-decoration:none;color:inherit;max-width:100%;">
        <img src="${MOS_LOGO_PATH}" alt="NAA COLLEGE logo" width="78" height="78" style="width:78px;height:78px;object-fit:contain;display:block;flex:0 0 auto;" />
        <span style="min-width:0;overflow-wrap:anywhere;"><strong style="display:block;font-size:22px;line-height:1.2;letter-spacing:.02em;">NAA COLLEGE</strong><small style="display:block;color:#64748b;font-size:12px;line-height:1.35;">Student Practice Scorecard · naacollege.in</small></span>
      </a>
    `;
    card.insertBefore(brand, card.firstChild);
  }

  function addRoadmapPrintBranding() {
    if (!window.location.pathname.startsWith('/roadmaps')) return;
    var buttons = document.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (button) {
      var text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text.indexOf('download') === -1 || text.indexOf('pdf') === -1) return;
      if (button.getAttribute('data-mos-roadmap-brand-listener') === 'true') return;
      button.setAttribute('data-mos-roadmap-brand-listener', 'true');
      /* The real jsPDF roadmap generator remains authoritative. The print-only
         brand is also applied to any roadmap preview/print surface. */
      var preview = document.getElementById('roadmap-modal-container');
      if (preview && !preview.querySelector('[data-mos-roadmap-brand]')) {
        var brand = document.createElement('a');
        brand.setAttribute('data-mos-roadmap-brand', 'true');
        brand.href = MOS_SITE_URL;
        brand.style.cssText = 'display:flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:14px;color:#0f172a;';
        brand.innerHTML = `<img src="${MOS_LOGO_PATH}" alt="NAA COLLEGE logo" width="46" height="46" style="width:46px;height:46px;object-fit:contain;" /><strong style="font-size:14px;">NAA COLLEGE</strong>`;
        preview.insertBefore(brand, preview.firstChild);
      }
    });
  }

  function handleBrandClicks(event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var button = target.closest('button');
    if (!button) return;
    var text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    /* Print a standalone copy of the dedicated scorecard sheet so the browser can
       paginate the full report instead of clipping an absolutely positioned page. */
    if (text.indexOf('scorecard') !== -1 && text.indexOf('download pdf') !== -1) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();

      var sourceSheet = document.getElementById('certificate-print-sheet');
      var originalTitle = document.title;
      document.title = 'naacollege-mocktest_scorecard';

      if (!sourceSheet) {
        /* Keep the legacy browser-print fallback for scorecards without a dedicated sheet. */
        window.print();
        document.title = originalTitle;
        return;
      }

      var printSheet = sourceSheet.cloneNode(true);
      printSheet.id = 'certificate-print-sheet';
      printSheet.setAttribute('data-mos-scorecard-print-clone', 'true');
      printSheet.style.display = 'block';
      document.body.classList.add('mos-scorecard-print-document');
      document.body.appendChild(printSheet);

      var cleanedUp = false;
      var cleanupScorecardPrint = function () {
        if (cleanedUp) return;
        cleanedUp = true;
        window.removeEventListener('afterprint', cleanupScorecardPrint);
        if (printSheet.parentNode) printSheet.parentNode.removeChild(printSheet);
        document.body.classList.remove('mos-scorecard-print-document');
        document.title = originalTitle;
      };

      window.addEventListener('afterprint', cleanupScorecardPrint);
      /* Fallback for browsers that do not dispatch afterprint reliably. */
      window.setTimeout(cleanupScorecardPrint, 60000);
      try {
        window.print();
      } catch (error) {
        cleanupScorecardPrint();
        throw error;
      }
      return;
    }

    if (text.indexOf('download pdf') !== -1 && text.indexOf('web options') !== -1) {
      event.preventDefault();
      event.stopPropagation();
      prepareWebOptionsPrint();
    }
  }

  var currentPath = normalizePath(window.location.pathname);
  var initialHash = window.location.hash;

  if (!initialHash && currentPath !== '/' && !seoPaths[currentPath]) {
    var initialKey = null;
    Object.keys(routes).some(function (key) {
      if (normalizePath(routes[key]) === currentPath) {
        initialKey = key;
        return true;
      }
      return false;
    });
    if (initialKey) {
      window.history.replaceState(null, '', currentPath + (window.location.search || '') + '#' + initialKey);
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    cleanCurrentHash();
    window.addEventListener('hashchange', cleanCurrentHash);
    injectScholarshipPolish();
    watchTopCollegeViews();
    createPrintStyles();
    document.addEventListener('click', handleBrandClicks, true);

    var root = document.getElementById('root') || document.body;
    var observer = new MutationObserver(function () {
      watchTopCollegeViews();
      injectScholarshipPolish();
      replaceLegacyLogoImages(root);
      makeStandaloneLogoClickable();
      removeWebOptionsCsvExport();
      addWebOptionsPdfButton();
      addScorecardBrand();
      addRoadmapPrintBranding();
    });
    observer.observe(root, { childList: true, subtree: true });

    replaceLegacyLogoImages(root);
    makeStandaloneLogoClickable();
    removeWebOptionsCsvExport();
    addWebOptionsPdfButton();
    addScorecardBrand();
    addRoadmapPrintBranding();
  });
})();
