/*
 * MAN OF STUDY clean-route bridge.
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
    'ap-top-colleges': '/ap-eapcet/top-colleges',
    'tg-allotments': '/tg-eapcet/name-wise-allotments',
    'tg-top-colleges': '/tg-eapcet/top-colleges',
    'tg-predictor': '/tg-eapcet/college-predictor',
    'roadmaps': '/roadmaps',
    'scholarships': '/scholarships',
    'utilities': '/pdftools',
    'pdf-tools': '/pdftools',
    'resizer': '/imagecompressor',
    'resume-checker': '/resume-checker',
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
    'humanizer': '/ai-humanizer',
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
      'ai-humanizer': 'humanizer',
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
      // Critical: allow React's hashchange listener to run first. Removing the
      // hash synchronously makes React read an empty hash and return to Home.
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

  function watchTopCollegeViews() {
    addTopCollegeScopeNote(document.querySelector('.mos-ap-top'));
    addTopCollegeScopeNote(document.querySelector('#top-btech-colleges-telangana'));
  }

  var currentPath = normalizePath(window.location.pathname);
  var initialHash = window.location.hash;

  // For a direct clean workspace URL, temporarily provide the legacy hash to
  // the existing React state reader. It is removed after React has mounted.
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
    watchTopCollegeViews();
    var root = document.getElementById('root') || document.body;
    var observer = new MutationObserver(watchTopCollegeViews);
    observer.observe(root, { childList: true, subtree: true });
  });
})();
