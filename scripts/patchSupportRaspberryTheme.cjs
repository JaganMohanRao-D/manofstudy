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

// Add one stable scope class to the dedicated support page. The replacement is
// intentionally exact so this build-time patch cannot affect unrelated pages.
let page = read(supportPage);
page = page.replace(
  'className="min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light"',
  'className="support-page-root min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light"'
);
page = page.replace('Support Man of Study.</h1>', 'Support Man of Study. 🫶</h1>');
page = page.replace('Keep student tools moving.</span>', 'Keep student tools moving. 💗</span>');
page = page.replace('Your support is gratitude — not a subscription.', 'Your support is kindness — not a subscription. 🫶');
page = page.replace('This support does not unlock paid features or create a recurring subscription.', 'This support does not unlock paid features or create a recurring subscription. ❤️');
writeIfChanged(supportPage, page);

// Keep the existing modal behavior and structure; only add the requested emotional
// wording/emoji and let the scoped CSS below handle the visual theme.
let modal = read(supportModal);
modal = modal.replace('Support MAN OF STUDY Development</h2>', 'Support MAN OF STUDY Development 🫶</h2>');
modal = modal.replace('Every dataset, rank predictor, and student tool on this platform is built independently.', 'Every dataset, rank predictor, and student tool on this platform is built independently. Your kindness helps keep it going. 💗');
modal = modal.replace('మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. ❤️', 'మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. 🫶💗');
writeIfChanged(supportModal, modal);

const marker = '/* MOS SUPPORT RASPBERRY THEME — scoped */';
let css = read(indexCss);
if (!css.includes(marker)) {
  css += `\n\n${marker}\n/* Dedicated support-page palette. Nothing here changes global MOS theme tokens. */\n.support-page-root {\n  --support-pink-50: #fff1f7;\n  --support-pink-100: #ffe4ef;\n  --support-pink-200: #fecddf;\n  --support-pink-400: #f472a8;\n  --support-pink-500: #db2777;\n  --support-pink-600: #c21868;\n  --support-pink-700: #a31557;\n  --support-pink-900: #641033;\n}\n\n.support-page-root > header {\n  border-color: var(--support-pink-200);\n  background: color-mix(in srgb, #ffffff 92%, var(--support-pink-100));\n}\n\n.support-page-root main section:first-child {\n  background: linear-gradient(135deg, #8f124d 0%, #be185d 48%, #db2777 100%);\n  border-color: rgba(255, 255, 255, .20);\n}\n\n.support-page-root main section:first-child .bg-emerald-500\\/20 { background-color: rgba(244, 114, 168, .24); }\n.support-page-root main section:first-child .bg-blue-500\\/20 { background-color: rgba(251, 207, 232, .18); }\n.support-page-root main section:first-child .text-emerald-300 { color: #ffd1e5; }\n.support-page-root main section:first-child .border-emerald-400\\/30 { border-color: rgba(255, 209, 229, .40); }\n.support-page-root main section:first-child .bg-emerald-400\\/10 { background-color: rgba(255, 209, 229, .12); }\n\n.support-page-root main section:not(:first-child) [class*="bg-emerald-50"],\n.support-page-root main section:not(:first-child) [class*="bg-emerald-950"] {\n  background-color: var(--support-pink-50);\n}\n\n.support-page-root main section:not(:first-child) [class*="text-emerald-600"],\n.support-page-root main section:not(:first-child) [class*="text-emerald-700"],\n.support-page-root main section:not(:first-child) [class*="text-emerald-400"],\n.support-page-root main section:not(:first-child) [class*="text-emerald-300"] {\n  color: var(--support-pink-600);\n}\n\n.support-page-root main section:not(:first-child) [class*="border-emerald-200"],\n.support-page-root main section:not(:first-child) [class*="border-emerald-500"],\n.support-page-root main section:not(:first-child) [class*="border-emerald-900"] {\n  border-color: var(--support-pink-200);\n}\n\n.support-page-root main section:not(:first-child) [class*="bg-emerald-600"] {\n  background-color: var(--support-pink-600);\n}\n.support-page-root main section:not(:first-child) [class*="bg-emerald-600"]:hover {\n  background-color: var(--support-pink-700);\n}\n\n.support-page-root main section:not(:first-child) [class*="text-blue-600"],\n.support-page-root main section:not(:first-child) [class*="text-blue-400"] {\n  color: var(--support-pink-600);\n}\n\n/* Support modal: scoped by its existing stable ID. */\n#support-donation-modal-overlay {\n  background: rgba(64, 5, 35, .76);\n}\n#support-donation-modal-card {\n  border-color: var(--support-pink-200);\n  box-shadow: 0 24px 70px rgba(190, 24, 93, .28);\n}\n#support-donation-modal-card > .absolute.top-0 {\n  background-image: linear-gradient(to right, #be185d, #db2777, #f472a8);\n}\n#support-donation-modal-card [class*="bg-emerald-50"],\n#support-donation-modal-card [class*="bg-emerald-950"] {\n  background-color: var(--support-pink-50);\n}\n#support-donation-modal-card [class*="text-emerald-700"],\n#support-donation-modal-card [class*="text-emerald-600"],\n#support-donation-modal-card [class*="text-emerald-400"],\n#support-donation-modal-card [class*="text-emerald-300"] {\n  color: var(--support-pink-600);\n}\n#support-donation-modal-card [class*="border-emerald-500"],\n#support-donation-modal-card [class*="border-emerald-200"],\n#support-donation-modal-card [class*="border-emerald-800"] {\n  border-color: var(--support-pink-400);\n}\n#support-donation-modal-card [class*="ring-emerald-500"] {\n  --tw-ring-color: rgba(219, 39, 119, .20);\n}\n#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"] {\n  background-image: linear-gradient(to right, #be185d, #db2777);\n}\n#support-donation-modal-card [class*="bg-gradient-to-r from-emerald-600"]:hover {\n  background-image: linear-gradient(to right, #a31557, #be185d);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  #support-donation-modal-card .animate-pulse { animation: none !important; }\n}\n`;
  fs.writeFileSync(indexCss, css, 'utf8');
}

console.log('[MOS] Scoped raspberry support theme patch applied.');
