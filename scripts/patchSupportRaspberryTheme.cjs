const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const supportPage = path.join(root, 'src/components/SupportPage.tsx');
const supportModal = path.join(root, 'src/components/SupportModal.tsx');
const indexCss = path.join(root, 'src/index.css');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, next) {
  const current = read(file);
  if (current !== next) fs.writeFileSync(file, next, 'utf8');
}

// Keep the page scope in the actual JSX. This regex tolerates harmless class
// ordering changes and never touches unrelated pages.
let page = read(supportPage);
page = page.replace(
  /className="([^"]*min-h-screen[^"]*tech-grid-pattern-light[^"]*)"/,
  (_, classes) => classes.includes('support-page-root')
    ? `className="${classes}"`
    : `className="support-page-root ${classes}"`
);

// Add the requested warm, caring language once. These replacements are
// idempotent so repeated Cloudflare/Vite builds do not duplicate emojis.
page = page.replace(/Support Man of Study\.((?!🫶)[\s\S]{0,4})/, 'Support Man of Study. 🫶');
page = page.replace(/Keep student tools moving\.((?!💗)[\s\S]{0,4})/, 'Keep student tools moving. 💗');
page = page.replace(
  'Your support is gratitude — not a subscription.',
  'Your support is kindness — not a subscription. 🫶'
);
page = page.replace(
  'This support does not unlock paid features or create a recurring subscription.',
  'This support does not unlock paid features or create a recurring subscription. ❤️'
);
writeIfChanged(supportPage, page);

let modal = read(supportModal);
modal = modal.replace(
  'Support MAN OF STUDY Development</h2>',
  'Support MAN OF STUDY Development 🫶</h2>'
);
modal = modal.replace(
  'Every dataset, rank predictor, and student tool on this platform is built independently. Voluntary contributions help cover practical technical costs.',
  'Every dataset, rank predictor, and student tool on this platform is built independently. Your kindness helps keep it going. 💗 Voluntary contributions help cover practical technical costs.'
);
modal = modal.replace(
  'మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. ❤️',
  'మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. 🫶💗'
);
writeIfChanged(supportModal, modal);

const marker = '/* MOS SUPPORT RASPBERRY THEME — scoped v2 */';
let css = read(indexCss);
if (!css.includes(marker)) {
  css += `\n\n${marker}\n/* Only SupportPage and SupportModal are affected. No global MOS palette changes. */\n.support-page-root {\n  --support-raspberry-50: #fff0f6;\n  --support-raspberry-100: #ffd9e8;\n  --support-raspberry-200: #ffb8d2;\n  --support-raspberry-300: #ff8fba;\n  --support-raspberry-500: #e83e8c;\n  --support-raspberry-600: #d62972;\n  --support-raspberry-700: #b91f60;\n}\n\n/* Bright raspberry hero — deliberately different from the old dark theme. */\n.support-page-root main > section:first-child {\n  background: linear-gradient(135deg, #fff0f6 0%, #ffd9e8 48%, #ffc1d9 100%) !important;\n  color: #5a1232 !important;\n  border-color: #ffb8d2 !important;\n  box-shadow: 0 24px 60px rgba(214, 41, 114, .14) !important;\n}\n.support-page-root main > section:first-child .text-white { color: #5a1232 !important; }\n.support-page-root main > section:first-child .text-slate-300,\n.support-page-root main > section:first-child .text-slate-400 { color: #7d3a57 !important; }\n.support-page-root main > section:first-child .text-emerald-300 { color: #c21f68 !important; }\n.support-page-root main > section:first-child .border-emerald-400\\/30 { border-color: rgba(194, 31, 104, .28) !important; }\n.support-page-root main > section:first-child .bg-emerald-400\\/10,\n.support-page-root main > section:first-child .bg-emerald-500\\/20,\n.support-page-root main > section:first-child .bg-blue-500\\/20 { background-color: rgba(232, 62, 140, .12) !important; }\n.support-page-root main > section:first-child .bg-white\\/\\[0\.06\\] { background-color: rgba(255, 255, 255, .62) !important; }\n.support-page-root main > section:first-child .border-white\\/10 { border-color: rgba(185, 31, 96, .15) !important; }\n\n/* Raspberry accents throughout the dedicated support page. */\n.support-page-root main > section:not(:first-child) [class*="bg-emerald-50"],\n.support-page-root main > section:not(:first-child) [class*="bg-emerald-950"] { background-color: var(--support-raspberry-50) !important; }\n.support-page-root main > section:not(:first-child) [class*="text-emerald-600"],\n.support-page-root main > section:not(:first-child) [class*="text-emerald-700"],\n.support-page-root main > section:not(:first-child) [class*="text-emerald-400"],\n.support-page-root main > section:not(:first-child) [class*="text-emerald-300"] { color: var(--support-raspberry-600) !important; }\n.support-page-root main > section:not(:first-child) [class*="border-emerald-200"],\n.support-page-root main > section:not(:first-child) [class*="border-emerald-500"],\n.support-page-root main > section:not(:first-child) [class*="border-emerald-900"] { border-color: var(--support-raspberry-200) !important; }\n.support-page-root main > section:not(:first-child) [class*="bg-emerald-600"] { background-color: var(--support-raspberry-600) !important; }\n.support-page-root main > section:not(:first-child) [class*="bg-emerald-600"]:hover { background-color: var(--support-raspberry-700) !important; }\n.support-page-root main > section:not(:first-child) [class*="text-blue-600"],\n.support-page-root main > section:not(:first-child) [class*="text-blue-400"] { color: var(--support-raspberry-600) !important; }\n\n/* Support popup. These selectors use its existing stable IDs only. */\n#support-donation-modal-overlay { background: rgba(76, 8, 40, .64) !important; }\n#support-donation-modal-card { border-color: var(--support-raspberry-200) !important; box-shadow: 0 24px 70px rgba(214, 41, 114, .25) !important; }\n#support-donation-modal-card > .absolute.top-0 { background-image: linear-gradient(to right, #d62972, #e83e8c, #ff8fba) !important; }\n#support-donation-modal-card [class*="bg-emerald-50"],\n#support-donation-modal-card [class*="bg-emerald-950"] { background-color: var(--support-raspberry-50) !important; }\n#support-donation-modal-card [class*="text-emerald-700"],\n#support-donation-modal-card [class*="text-emerald-600"],\n#support-donation-modal-card [class*="text-emerald-400"],\n#support-donation-modal-card [class*="text-emerald-300"] { color: var(--support-raspberry-600) !important; }\n#support-donation-modal-card [class*="border-emerald-500"],\n#support-donation-modal-card [class*="border-emerald-200"],\n#support-donation-modal-card [class*="border-emerald-800"] { border-color: var(--support-raspberry-200) !important; }\n#support-donation-modal-card [class*="ring-emerald-500"] { --tw-ring-color: rgba(232, 62, 140, .20) !important; }\n#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"] { background-image: linear-gradient(to right, #d62972, #e83e8c) !important; }\n#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"]:hover { background-image: linear-gradient(to right, #b91f60, #d62972) !important; }\n\n@media (prefers-reduced-motion: reduce) {\n  #support-donation-modal-card .animate-pulse { animation: none !important; }\n}\n`;
  fs.writeFileSync(indexCss, css, 'utf8');
}

console.log('[MOS] Support raspberry theme v2 applied safely.');
