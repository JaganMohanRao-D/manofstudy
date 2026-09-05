/**
 * StudyMacha - Roadmap PDF & Printable Blueprint Generator
 * Implements 3-column structured grid compensation metrics box
 * with zero overlap & 0.08 opacity security watermark.
 */

import { generateRoadmapPdf } from './roadmapPdfGenerator';

export { generateRoadmapPdf };
export default generateRoadmapPdf;

/**
 * 3-Column Structured Grid Compensation Box Styles:
 * Explicit column widths (width: 31%; margin-right: 2%; display: inline-block; vertical-align: top; box-sizing: border-box; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;)
 */
export const PDF_COMPENSATION_GRID_STYLES = {
  container: 'width: 100%; display: flex; justify-content: space-between; margin-bottom: 12px;',
  column: 'width: 31%; margin-right: 2%; display: inline-block; vertical-align: top; box-sizing: border-box; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;',
  tierTitle: 'font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; line-height: 1.2;',
  lpaValue: 'font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.3;',
  subtext: 'font-size: 9px; font-weight: 500; color: #64748b; line-height: 1.2;',
  watermark: {
    text: 'STUDYMACHA • studymacha.pages.dev',
    opacity: 0.08,
    angle: 40,
    zIndex: 0,
  },
};
