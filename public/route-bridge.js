/*
 * MAN OF STUDY clean-route bridge.
 *
 * The app currently uses its existing hash-based workspace state internally.
 * This bridge keeps that behavior stable while exposing clean, shareable
 * pathname URLs such as /scholarships and /attendancedefender.
 *
 * Cloudflare Pages serves this React SPA shell for deep navigation paths, so
 * no server-side router dependency is required here.
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
      'contact-us': 'contact',
      'privacy': 'privacy',
      'terms': 'terms',
      'disclaimer': 'disclaimer',
      'contact': 'contact',
      'about': 'about'
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
      window.history.replaceState(null, '', target + search);
    }
  }

  var currentPath = normalizePath(window.location.pathname);
  var initialHash = window.location.hash;

  // Direct clean URLs need to be visible to the existing app's initial state
  // reader before the React bundle executes. Do not touch the already-clean
  // SEO landing paths because App.tsx handles those directly.
  if (!initialHash && currentPath !== '/' && !seoPaths[currentPath]) {
    var initialRoute = Object.keys(routes).some(function (key) {
      return normalizePath(routes[key]) === currentPath;
    });
    if (initialRoute) {
      var hashKey = null;
      Object.keys(routes).some(function (key) {
        if (normalizePath(routes[key]) === currentPath) {
          hashKey = key;
          return true;
        }
        return false;
      });
      if (hashKey) {
        window.history.replaceState(null, '', currentPath + (window.location.search || '') + '#' + hashKey);
      }
    }
  }

  // App.tsx installs its own hash listener during React startup. Waiting for
  // DOMContentLoaded ensures this cleanup listener runs after it, so the app
  // consumes the legacy hash internally while users only see the clean path.
  window.addEventListener('DOMContentLoaded', function () {
    cleanCurrentHash();
    window.addEventListener('hashchange', cleanCurrentHash);
  });
})();
