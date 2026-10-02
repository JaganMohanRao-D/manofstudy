const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/roadmaps/RoadmapModal.tsx');
if (!fs.existsSync(filePath)) {
  console.error(`[MOS] Roadmap modal file not found: ${filePath}`);
  process.exit(1);
}

let source = fs.readFileSync(filePath, 'utf8');
let changed = false;

if (!source.includes("import { createPortal } from 'react-dom';")) {
  const marker = "import React, { useState, useEffect, useCallback } from 'react';";
  if (!source.includes(marker)) {
    console.error('[MOS] Roadmap modal React import marker not found.');
    process.exit(1);
  }
  source = source.replace(marker, `${marker}\nimport { createPortal } from 'react-dom';`);
  changed = true;
}

if (!source.includes('const roadmapModalContent = (')) {
  const marker = `  return (\n    <div\n      id="roadmap-modal-overlay"`;
  if (!source.includes(marker)) {
    console.error('[MOS] Roadmap modal render marker not found.');
    process.exit(1);
  }
  source = source.replace(marker, `  const roadmapModalContent = (\n    <div\n      id="roadmap-modal-overlay"`);
  changed = true;
}

if (!source.includes('return createPortal(roadmapModalContent, document.body);')) {
  const endMarker = '\n  );\n};\n';
  const endIndex = source.lastIndexOf(endMarker);
  if (endIndex === -1) {
    console.error('[MOS] Roadmap modal component end marker not found.');
    process.exit(1);
  }
  source = source.slice(0, endIndex) + `\n  );\n\n  return createPortal(roadmapModalContent, document.body);\n};\n`;
  changed = true;
}

// The share dialog is rendered inside the roadmap modal portal, so it does not need an unused isOpen prop.
if (source.includes('          isOpen={showShareDialog}\n')) {
  source = source.replace('          isOpen={showShareDialog}\n', '');
  changed = true;
}

// Use the dynamic viewport height on mobile so the modal fits the visible browser viewport reliably.
if (source.includes('max-h-[92vh]')) {
  source = source.replace('max-h-[92vh]', 'max-h-[92dvh]');
  changed = true;
}

if (changed) {
  fs.writeFileSync(filePath, source, 'utf8');
  console.log('[MOS] Roadmap modal portal fix applied.');
} else {
  console.log('[MOS] Roadmap modal portal fix already present.');
}
