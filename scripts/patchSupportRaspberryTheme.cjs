const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const supportPage = path.join(root, 'src/components/SupportPage.tsx');
const supportModal = path.join(root, 'src/components/SupportModal.tsx');
const staticSupportPage = path.join(root, 'public/support/index.html');
const indexCss = path.join(root, 'src/index.css');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, next) {
  const current = read(file);
  if (current !== next) fs.writeFileSync(file, next, 'utf8');
}

let page = read(supportPage);
page = page.replace(
  /className="([^"]*min-h-screen[^"]*tech-grid-pattern-light[^"]*)"/,
  (_, classes) => classes.includes('support-page-root') ? `className="${classes}"` : `className="support-page-root ${classes}"`
);
page = page.replace(/Support Naa College\.(?!\s*🫶)/, 'Support Naa College. 🫶');
page = page.replace(/Keep student tools moving\.(?!\s*💗)/, 'Keep student tools moving. 💗');
page = page.replace('Your support is gratitude — not a subscription.', 'Your support is kindness — not a subscription. 🫶');
page = page.replace(
  'This support does not unlock paid features or create a recurring subscription.',
  'This support does not unlock paid features or create a recurring subscription. ❤️'
);
writeIfChanged(supportPage, page);

let modal = read(supportModal);
modal = modal.replace('Support Naa College Development</h2>', 'Support Naa College Development 🫶</h2>');
modal = modal.replace(
  'Every dataset, rank predictor, and student tool on this platform is built independently. Voluntary contributions help cover practical technical costs.',
  'Every dataset, rank predictor, and student tool on this platform is built independently. Your kindness helps keep it going. 💗 Voluntary contributions help cover practical technical costs.'
);
modal = modal.replace(
  'మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. ❤️',
  'మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. 🫶💗'
);
writeIfChanged(supportModal, modal);

// The deployed /support/ route is also a static public page. Keep it in the
// same raspberry visual language so Cloudflare serves the intended design.
if (fs.existsSync(staticSupportPage)) {
  let staticPage = read(staticSupportPage);
  staticPage = staticPage.replace(
    /linear-gradient\(135deg,#210914 0%,#4a1028 48%,#70163d 100%\)/,
    'linear-gradient(135deg,#c2185b 0%,#d81b60 48%,#ec407a 100%)'
  );
  staticPage = staticPage.replace('color:#f9a8d4', 'color:#ffd0e2');
  staticPage = staticPage.replace('Support Naa College.<span>', 'Support Naa College. 🫶<span>');
  staticPage = staticPage.replace('Keep student tools moving.</span>', 'Keep student tools moving. 💗</span>');
  staticPage = staticPage.replace('Your support is a gesture of gratitude.', 'Your support is an act of kindness. 🫶');
  staticPage = staticPage.replace('♥ Student-built • Voluntary support', '🫶 Student-built • Voluntary support');
  writeIfChanged(staticSupportPage, staticPage);
}

const marker = '/* MOS SUPPORT RASPBERRY THEME — scoped v3 */';
let css = read(indexCss);
const oldMarkerPattern = /\/\* MOS SUPPORT RASPBERRY THEME — scoped v2 \*\/[\s\S]*$/;
const newCss = `
${marker}
/* Dedicated SupportPage + SupportModal palette. Deliberately scoped; no global MOS theme changes. */
.support-page-root {
  --support-raspberry-50: #fff5f8;
  --support-raspberry-100: #ffe4ee;
  --support-raspberry-200: #ffc5da;
  --support-raspberry-300: #ff9fc2;
  --support-raspberry-500: #ec407a;
  --support-raspberry-600: #d81b60;
  --support-raspberry-700: #c2185b;
  --support-raspberry-800: #9c1648;
}

/* Fresh raspberry hero: visibly replaces the old dark wine/maroon treatment. */
.support-page-root main > section:first-child {
  background: linear-gradient(135deg, #c2185b 0%, #d81b60 45%, #ec407a 100%) !important;
  color: #ffffff !important;
  border-color: rgba(255, 159, 194, .65) !important;
  box-shadow: 0 26px 70px rgba(194, 24, 91, .22) !important;
}
.support-page-root main > section:first-child .text-white { color: #ffffff !important; }
.support-page-root main > section:first-child .text-slate-300,
.support-page-root main > section:first-child .text-slate-400 { color: #ffe7f0 !important; }
.support-page-root main > section:first-child .text-emerald-300 { color: #ffd0e2 !important; }
.support-page-root main > section:first-child .text-emerald-400 { color: #ffd0e2 !important; }
.support-page-root main > section:first-child .border-emerald-400\\/30 { border-color: rgba(255, 208, 226, .42) !important; }
.support-page-root main > section:first-child .bg-emerald-400\\/10,
.support-page-root main > section:first-child .bg-emerald-500\\/20,
.support-page-root main > section:first-child .bg-blue-500\\/20 { background-color: rgba(255, 255, 255, .11) !important; }
.support-page-root main > section:first-child .bg-white\\/\\[0\.06\\] { background-color: rgba(255, 255, 255, .13) !important; }
.support-page-root main > section:first-child .border-white\\/10 { border-color: rgba(255, 255, 255, .20) !important; }

/* Gentle raspberry accents on the rest of the page. */
.support-page-root main > section:not(:first-child) [class*="bg-emerald-50"],
.support-page-root main > section:not(:first-child) [class*="bg-emerald-950"] { background-color: var(--support-raspberry-50) !important; }
.support-page-root main > section:not(:first-child) [class*="text-emerald-600"],
.support-page-root main > section:not(:first-child) [class*="text-emerald-700"],
.support-page-root main > section:not(:first-child) [class*="text-emerald-400"],
.support-page-root main > section:not(:first-child) [class*="text-emerald-300"] { color: var(--support-raspberry-700) !important; }
.support-page-root main > section:not(:first-child) [class*="border-emerald-200"],
.support-page-root main > section:not(:first-child) [class*="border-emerald-500"],
.support-page-root main > section:not(:first-child) [class*="border-emerald-900"] { border-color: var(--support-raspberry-200) !important; }
.support-page-root main > section:not(:first-child) [class*="bg-emerald-600"] { background-color: var(--support-raspberry-600) !important; }
.support-page-root main > section:not(:first-child) [class*="bg-emerald-600"]:hover { background-color: var(--support-raspberry-700) !important; }
.support-page-root main > section:not(:first-child) [class*="text-blue-600"],
.support-page-root main > section:not(:first-child) [class*="text-blue-400"] { color: var(--support-raspberry-700) !important; }

/* Support popup/modal: same raspberry language without becoming visually aggressive. */
#support-donation-modal-overlay { background: rgba(74, 7, 38, .68) !important; }
#support-donation-modal-card {
  border-color: var(--support-raspberry-200) !important;
  box-shadow: 0 24px 72px rgba(194, 24, 91, .30) !important;
}
#support-donation-modal-card > .absolute.top-0 {
  background-image: linear-gradient(to right, #c2185b, #d81b60, #ec407a) !important;
}
#support-donation-modal-card [class*="bg-emerald-50"],
#support-donation-modal-card [class*="bg-emerald-950"] { background-color: var(--support-raspberry-50) !important; }
#support-donation-modal-card [class*="text-emerald-700"],
#support-donation-modal-card [class*="text-emerald-600"],
#support-donation-modal-card [class*="text-emerald-400"],
#support-donation-modal-card [class*="text-emerald-300"] { color: var(--support-raspberry-700) !important; }
#support-donation-modal-card [class*="border-emerald-500"],
#support-donation-modal-card [class*="border-emerald-200"],
#support-donation-modal-card [class*="border-emerald-800"] { border-color: var(--support-raspberry-200) !important; }
#support-donation-modal-card [class*="ring-emerald-500"] { --tw-ring-color: rgba(236, 64, 122, .22) !important; }
#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"] { background-image: linear-gradient(to right, #c2185b, #ec407a) !important; }
#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"]:hover { background-image: linear-gradient(to right, #9c1648, #c2185b) !important; }

@media (prefers-reduced-motion: reduce) {
  #support-donation-modal-card .animate-pulse { animation: none !important; }
}
`;

if (oldMarkerPattern.test(css)) {
  css = css.replace(oldMarkerPattern, newCss.trimStart());
} else if (!css.includes(marker)) {
  css = css.trimEnd() + '\n\n' + newCss.trimStart();
}
fs.writeFileSync(indexCss, css, 'utf8');

console.log('[MOS] Support raspberry theme v3 applied safely.');
