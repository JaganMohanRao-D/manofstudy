const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function patchScholarshipsHub() {
  const file = path.join(root, 'src', 'components', 'ScholarshipsHub.tsx');
  let source = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Restore the scholarship hero artwork that was used before the recent MOS-logo substitution.
  const heroPattern = /const SCHOLARSHIP_HERO_IMAGE\s*=\s*[^;]+;/;
  const restoredHero = "const SCHOLARSHIP_HERO_IMAGE = 'https://i.ibb.co/BHmrBckm/file-00000000a1a88210b714d6f17401f781.png';";
  if (heroPattern.test(source) && !source.includes(restoredHero)) {
    source = source.replace(heroPattern, restoredHero);
    changed = true;
  }

  // Let the approved scholarship artwork display at its natural full width instead of imposing a short crop.
  const oldHeroClass = 'className="block h-auto max-h-[280px] sm:max-h-[340px] w-full object-contain object-center"';
  const newHeroClass = 'className="block h-auto w-full object-contain object-center"';
  if (source.includes(oldHeroClass)) {
    source = source.replace(oldHeroClass, newHeroClass);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, source, 'utf8');
}

function patchSiteUxFixes() {
  const file = path.join(root, 'src', 'components', 'SiteUxFixes.tsx');
  let source = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regional landmark art belongs only to AP/TG workspaces. Do not infer a region from arbitrary
  // scholarship-page text, which caused the Telangana Charminar image to appear on Scholarships.
  const oldBlock = `\n  const viewportText = document.getElementById('workspace-viewport')?.textContent?.toLowerCase() || '';\n  if (viewportText.includes('tg eapcet') || viewportText.includes('telangana')) return 'tg';\n  if (viewportText.includes('ap eapcet') || viewportText.includes('andhra pradesh')) return 'ap';\n  return null;`;
  const newBlock = `\n  return null;`;
  if (source.includes(oldBlock)) {
    source = source.replace(oldBlock, newBlock);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, source, 'utf8');
}

patchScholarshipsHub();
patchSiteUxFixes();
