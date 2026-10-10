const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function patchRoadmapGenerator() {
  const file = path.join(root, 'src', 'utils', 'roadmapPdfGenerator.ts');
  let source = fs.readFileSync(file, 'utf8');

  if (source.includes('MOS_BRANDED_ROADMAP_PDF_V1')) return false;

  source = source.replace(
    "import { BranchRoadmap } from '../types';\n",
    "import { BranchRoadmap } from '../types';\n\n/* MOS_BRANDED_ROADMAP_PDF_V1 */\nconst MOS_ROADMAP_LOGO_URL = '/Naa%20College%20logo.webp';\nconst MOS_ROADMAP_SITE_URL = 'https://naacollege.in/';\n\nasync function loadMosRoadmapLogo(): Promise<string | null> {\n  try {\n    const response = await fetch(MOS_ROADMAP_LOGO_URL);\n    if (!response.ok) return null;\n    const blob = await response.blob();\n    return await new Promise((resolve) => {\n      const reader = new FileReader();\n      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);\n      reader.onerror = () => resolve(null);\n      reader.readAsDataURL(blob);\n    });\n  } catch {\n    return null;\n  }\n}\n"
  );

  source = source.replace(
    'export function generateRoadmapPdf(roadmap: BranchRoadmap, returnDocOnly = false): jsPDF {',
    'export async function generateRoadmapPdf(roadmap: BranchRoadmap, returnDocOnly = false): Promise<jsPDF> {'
  );

  source = source.replace(
    "  const TARGET_URL = 'https://naacollege.in/';",
    "  const TARGET_URL = MOS_ROADMAP_SITE_URL;"
  );

  source = source.replace(
    "  let currentY = minY;",
    "  const mosLogoDataUrl = await loadMosRoadmapLogo();\n\n  let currentY = minY;"
  );

  source = source.replace(
    "  // Cyan dot\n  doc.setFillColor(6, 182, 212);\n  doc.circle(marginLeft + 4.0, coverY + 3.5, 1.2, 'F');",
    "  // Canonical Naa College logo — loaded from public/Naa%20College%20logo.webp.\n  // The logo itself is a clickable PDF link to the live Naa College website.\n  if (mosLogoDataUrl) {\n    doc.addImage(mosLogoDataUrl, 'PNG', marginLeft + 1.2, coverY + 0.75, 5.5, 5.5, undefined, 'FAST');\n    doc.link(marginLeft + 1.0, coverY + 0.5, 6.0, 6.0, { url: TARGET_URL });\n  } else {\n    doc.setFillColor(6, 182, 212);\n    doc.circle(marginLeft + 4.0, coverY + 3.5, 1.2, 'F');\n  }"
  );

  fs.writeFileSync(file, source, 'utf8');
  return true;
}

function patchRoadmapCaller() {
  const file = path.join(root, 'src', 'components', 'EngineeringRoadmaps.tsx');
  let source = fs.readFileSync(file, 'utf8');

  if (!source.includes('await generateRoadmapPdf(branch);')) {
    source = source.replace('      generateRoadmapPdf(branch);', '      await generateRoadmapPdf(branch);');
    fs.writeFileSync(file, source, 'utf8');
    return true;
  }
  return false;
}

patchRoadmapGenerator();
patchRoadmapCaller();
