(function () {
  'use strict';

  var LOGO = '/MANOFSTUDY_LOGO.png';
  var SITE = 'https://manofstudy.pages.dev';
  var STYLE_ID = 'mos-web-options-brand-fix';

  function textOf(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isPredictorPage() {
    var p = window.location.pathname || '';
    return p === '/ap-eapcet/college-predictor' || p === '/tg-eapcet/college-predictor' || /college-predictor/.test(p);
  }

  function isAp() {
    return /\/ap-eapcet\//.test(window.location.pathname || '');
  }

  function isTg() {
    return /\/tg-eapcet\//.test(window.location.pathname || '');
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      [data-mos-web-options-fallback] { display:inline-flex !important; align-items:center !important; gap:.45rem !important; visibility:visible !important; opacity:1 !important; }
      [data-mos-web-options-pdf-fix] { display:inline-flex !important; align-items:center !important; gap:.45rem !important; }
      [data-mos-web-options-pdf-fix]:disabled { opacity:.55 !important; }
    `;
    document.head.appendChild(s);
  }

  function findBuilderTab() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var t = textOf(buttons[i]);
      if (t.indexOf('web options') !== -1 && (t.indexOf('strategy') !== -1 || t.indexOf('preference') !== -1 || t.indexOf('list') !== -1)) return buttons[i];
    }
    return null;
  }

  function ensureApBuilderTab() {
    if (!isPredictorPage() || !isAp()) return;
    if (findBuilderTab()) return;

    var predictorButtons = document.querySelectorAll('button');
    var anchor = null;
    for (var i = 0; i < predictorButtons.length; i++) {
      var t = textOf(predictorButtons[i]);
      if (t.indexOf('college predictor engine') !== -1 || t === 'college predictor') {
        anchor = predictorButtons[i];
        break;
      }
    }
    if (!anchor || !anchor.parentElement) return;

    var fallback = document.createElement('button');
    fallback.type = 'button';
    fallback.setAttribute('data-mos-web-options-fallback', 'true');
    fallback.className = anchor.className || 'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
    fallback.innerHTML = '<span aria-hidden="true">☷</span><span>Web Options Strategy List (0)</span>';
    fallback.addEventListener('click', function () {
      var real = findBuilderTab();
      if (real) real.click();
    });
    anchor.parentElement.appendChild(fallback);
  }

  function removeCsv() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var t = textOf(buttons[i]);
      if (t.indexOf('export official csv') !== -1 || t === 'export csv') buttons[i].remove();
    }
  }

  function findWebOptionsHeading() {
    var nodes = document.querySelectorAll('h1,h2,h3,h4,span');
    for (var i = 0; i < nodes.length; i++) {
      if (textOf(nodes[i]) === 'web options preference list') return nodes[i];
    }
    return null;
  }

  function getWebOptionsTable() {
    var heading = findWebOptionsHeading();
    if (!heading) return null;
    var parent = heading.parentElement;
    for (var depth = 0; depth < 7 && parent; depth++, parent = parent.parentElement) {
      var table = parent.querySelector('table');
      if (table && table.rows && table.rows.length) return table;
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPdfDocument() {
    var table = getWebOptionsTable();
    if (!table) {
      window.alert('Add at least one Web Option before downloading the PDF.');
      return;
    }

    var popup = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=800');
    if (!popup) {
      window.alert('Please allow pop-ups for Man of Study to download the PDF.');
      return;
    }

    var clone = table.cloneNode(true);
    var rows = clone.querySelectorAll('tr');
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].querySelectorAll('th,td');
      for (var c = 0; c < cells.length; c++) {
        cells[c].removeAttribute('class');
        cells[c].removeAttribute('style');
      }
    }

    var region = isAp() ? 'AP EAPCET' : isTg() ? 'TG EAPCET' : 'EAPCET';
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>Man of Study - Web Options</title>' +
      '<style>' +
      '@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#fff}' +
      '.header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:16px}.logo{width:54px;height:54px;object-fit:contain}.brand{font-size:11px;font-weight:800;letter-spacing:.12em;color:#0284c7}.title{font-size:22px;font-weight:800;margin:2px 0}.sub{font-size:10px;color:#64748b}.card{border:1px solid #cbd5e1;border-radius:10px;padding:12px}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #cbd5e1;padding:7px 6px;text-align:left;vertical-align:top}th{background:#e2e8f0;font-weight:800}a{color:#0f172a;text-decoration:none}.footer{margin-top:14px;font-size:9px;color:#64748b}' +
      '</style></head><body>' +
      '<div class="header"><a href="' + SITE + '"><img class="logo" src="' + LOGO + '" alt="MAN OF STUDY"></a><div><div class="brand">MAN OF STUDY</div><div class="title">' + region + ' Web Options Preference List</div><div class="sub">Prepared from your selected College Predictor options. Final submission must be completed on the official counselling portal.</div></div></div>' +
      '<div class="card">' + clone.outerHTML + '</div>' +
      '<div class="footer"><a href="' + SITE + '">manofstudy.pages.dev</a> · Student planning/reference utility · Generated from the current Web Options Builder.</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},250)};<\/script>' +
      '</body></html>';

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  }

  function ensurePdfButton() {
    var heading = findWebOptionsHeading();
    if (!heading) return;
    var card = heading;
    for (var depth = 0; depth < 6 && card; depth++, card = card.parentElement) {
      if (card.querySelector('button')) break;
    }
    if (!card) return;

    var controls = card.querySelector('button') ? card.querySelector('button').parentElement : null;
    if (!controls) return;
    if (controls.querySelector('[data-mos-web-options-pdf-fix]')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-mos-web-options-pdf-fix', 'true');
    button.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs';
    button.textContent = 'Download PDF';
    button.addEventListener('click', buildPdfDocument);
    controls.insertBefore(button, controls.firstChild);
  }

  function run() {
    injectStyle();
    removeCsv();
    ensureApBuilderTab();
    ensurePdfButton();
  }

  document.addEventListener('DOMContentLoaded', run);
  var root = document.getElementById('root');
  if (root) {
    new MutationObserver(function () { run(); }).observe(root, { childList: true, subtree: true });
  }
  setTimeout(run, 700);
  setTimeout(run, 1800);
  setTimeout(run, 3500);
})();
