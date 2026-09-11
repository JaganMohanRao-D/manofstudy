/**
 * JAVISAK - Roadmap PDF & Printable Blueprint Generator (TypeScript)
 * Implements 3 distinct non-overlapping responsive columns (58mm width, 4mm gap)
 * with strict auto-wrapping, zero collision & 0.04 opacity security watermark.
 */

import { generateRoadmapPdf } from './roadmapPdfGenerator';

export { generateRoadmapPdf };
export default generateRoadmapPdf;

export const PDF_COMPENSATION_GRID_STYLES = {
  container: 'width: 100%; display: flex; justify-content: space-between; margin-bottom: 12px;',
  column: 'width: 58mm; margin-right: 4mm; display: inline-block; vertical-align: top; box-sizing: border-box; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px;',
  tierTitle: 'font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; line-height: 1.2;',
  lpaValue: 'font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.3;',
  subtext: 'font-size: 8px; font-weight: 500; color: #64748b; line-height: 1.2;',
  columns: [
    { title: 'ENTRY TIER (0-2 YRS)', defaultValue: '₹7 - ₹14 LPA', subtext: 'Campus Hiring & Junior Roles' },
    { title: 'MID TIER (3-6 YRS)', defaultValue: '₹18 - ₹35 LPA', subtext: 'Senior Tech / Domain Lead' },
    { title: 'PEAK / GLOBAL TIER', defaultValue: '₹45 - ₹90+ LPA', subtext: 'Principal / Tier-1 Global AI Labs' },
  ],
  watermark: {
    text: 'JAVISAK',
    opacity: 0.04,
    angle: -45,
    zIndex: 0,
  },
  banner: {
    text: '👉 Click here to explore & download other 24+ Engineering & Degree Roadmaps on JAVISAK',
    url: 'https://javisak.vercel.app/#career-blueprints',
  },
};

